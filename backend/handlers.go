package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
)

// scale to have a background cache refreshing where the websocket handler pulls from cached sports data
func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println(err)
		return
	}

	defer conn.Close()

	for {
		data, err := fetchUpcomingPayload()

		if err != nil {
			log.Println("Error fetching odds:", err)
		} else {
			err = conn.WriteJSON(data)

			if err != nil {
				log.Println(err)
				break
			}
		}
		// can adjust frequency of odds being pulled in later
		time.Sleep(10 * time.Minute)
	}
}

// Search handler for finding teams/players in odds
func searchHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	query := strings.ToLower(r.URL.Query().Get("q"))

	// Fetch current odds data
	// Fetch current odds data for homepage (upcoming)
	payload, err := fetchUpcomingPayload()
	if err != nil {
		log.Println("Error fetching odds:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch odds"})
		return
	}

	// Create a map to store unique teams and events
	uniqueResults := make(map[string]interface{})
	resultOrder := []string{} // To maintain insertion order

	// Search through events (teams)
	for _, event := range payload.Events {
		homeTeamLower := strings.ToLower(event.HomeTeam)
		awayTeamLower := strings.ToLower(event.AwayTeam)

		if query == "" || strings.Contains(homeTeamLower, query) {
			key := event.HomeTeam
			if _, exists := uniqueResults[key]; !exists { //dont care about value so we just check if key exists in map to ensure uniqueness
				uniqueResults[key] = map[string]string{
					"id":    event.ID + "_home",
					"label": event.HomeTeam,
					"type":  "team",
				}
				resultOrder = append(resultOrder, key)
			}
		}

		if query == "" || strings.Contains(awayTeamLower, query) {
			key := event.AwayTeam
			if _, exists := uniqueResults[key]; !exists {
				uniqueResults[key] = map[string]string{
					"id":    event.ID + "_away",
					"label": event.AwayTeam,
					"type":  "team",
				}
				resultOrder = append(resultOrder, key)
			}
		}
	}

	// Build results array in order
	results := []interface{}{}
	for _, key := range resultOrder {
		results = append(results, uniqueResults[key])
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// Odds handler returns the odds payload for a given sport key (query param `sport`).
// remove this handler later to just have the websocket endpoint filter by sport key when rendering data
func oddsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	sport := r.URL.Query().Get("sport")

	payload, err := fetchSportPayload(sport)
	if err != nil {
		log.Println("Error fetching odds:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch odds"}) //map[key type]value type, in this case both are strings
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payload)
}
