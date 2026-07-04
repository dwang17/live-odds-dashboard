package main

import (
	"log"
	"sync"
	"time"

	"golang.org/x/sync/singleflight"
)

type CachedSportOdds struct {
	Payload    OddsPayload
	FetchedAt  time.Time
	LastAccess time.Time
}

var (
	// mutex to protect access to the oddsCache (prevents goroutines from interfering with each other when reading/writing to the cache)
	cacheMu = sync.RWMutex{}

	oddsCache = map[string]CachedSportOdds{}

	// singleflight group to prevent multiple concurrent fetches for the same sport key
	refreshGroup singleflight.Group

	//how long the cache is considered valid before a refresh is needed
	// cacheTTL = 30 * time.Minute
	//may need to use this in production to save api credits lol
	cacheTTL = 2 * time.Hour
	// how long the cache is considered active before it can be evicted (cases of deleted unsued entries)
	activeWindow = 2 * time.Hour
)

func markSportAccessed(sportKey string) {
	if sportKey == "" {
		sportKey = "upcoming"
	}

	//lock and defer unlock the cache mutex to ensure thread-safe access to the cache
	cacheMu.Lock()
	defer cacheMu.Unlock()

	// write the last access time for the sport key in the cache
	// use temp entry variable to avoid overwriting the entire struct in the map, which would lose the FetchedAt timestamp
	entry := oddsCache[sportKey]
	entry.LastAccess = time.Now()
	oddsCache[sportKey] = entry

	log.Println("Cache access marked:", sportKey)
}

func getCachedOdds(sportKey string) (OddsPayload, error) {
	if sportKey == "" {
		sportKey = "upcoming"
	}

	now := time.Now()

	cacheMu.RLock()
	// check if the sport key exists in the cache and if it's still fresh
	entry, exists := oddsCache[sportKey]
	isFresh := exists && now.Sub(entry.FetchedAt) < cacheTTL
	cacheMu.RUnlock()

	//cache hit and still fresh, return the cached payload
	if isFresh {
		log.Println("Cache hit:", sportKey, "age:", now.Sub(entry.FetchedAt))
		return entry.Payload, nil
	}

	if !exists {
		log.Println("Cache miss:", sportKey)
	} else {
		log.Println("Cache stale:", sportKey, "age:", now.Sub(entry.FetchedAt))
	}

	//cache miss or stale, fetch new data using singleflight to prevent duplicate fetches for the same sport key
	result, err, _ := refreshGroup.Do(sportKey, func() (interface{}, error) {
		//fetch fresh data
		log.Println("Refreshing cache/API call (1 CREDIT USED):", sportKey)
		payload, err := fetchSportPayload(sportKey)
		if err != nil {
			return OddsPayload{}, err
		}

		//update the cache with the new payload and timestamps, but preserve the last access time if it already exists
		cacheMu.Lock()
		oldEntry := oddsCache[sportKey]
		//only real user visits should update the last access time, so we preserve the old last access time here
		oddsCache[sportKey] = CachedSportOdds{
			Payload:    payload,
			FetchedAt:  time.Now(),
			LastAccess: oldEntry.LastAccess,
		}
		cacheMu.Unlock()

		log.Println("Cache refreshed:", sportKey)

		return payload, nil
	})

	if err != nil {
		return OddsPayload{}, err
	}

	return result.(OddsPayload), nil
}
