package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
)

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println(err)
		return
	}

	defer conn.Close()

	for {
		data, err := fetchOddsPayload()

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
	payload, err := fetchOddsPayload()
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
			if _, exists := uniqueResults[key]; !exists {
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
