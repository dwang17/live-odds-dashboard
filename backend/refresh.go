package main

import (
	"log"
	"time"
)

// startRefreshLoop starts a background goroutine on server startup that periodically refreshes the odds for recently accessed sports.
func startRefreshLoop() {
	ticker := time.NewTicker(1 * time.Minute)

	// start a goroutine that runs the refresh loop every minute
	go func() {
		for range ticker.C {
			refreshRecentlyAccessedSports()
		}
	}()
}

func refreshRecentlyAccessedSports() {
	now := time.Now()

	//lock and unlock the cache mutex to ensure thread-safe access to the cache while checking for recently accessed sports
	cacheMu.RLock()
	sportsToCheck := []string{}

	// iterate over the cache and find sports that have been accessed within the active window (past 2 hours)
	for sportKey, entry := range oddsCache {
		if now.Sub(entry.LastAccess) < activeWindow {
			sportsToCheck = append(sportsToCheck, sportKey)
		}
	}

	//unlock the mutex before fetching from cache to avoid holding the lock while doing network requests
	cacheMu.RUnlock()

	log.Println("Refresh loop checking sports:", len(sportsToCheck))
	//for every sport that has been accessed recently, refresh the cache and broadcast the new odds to connected clients
	for _, sportKey := range sportsToCheck {
		payload, err := getCachedOdds(sportKey)
		if err != nil {
			log.Println("Error refreshing sport:", sportKey, err)
			continue
		}

		broadcastToSport(sportKey, payload)
	}
}
