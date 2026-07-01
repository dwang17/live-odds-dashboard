package main

import (
	"encoding/json"
	"log"
	"net/http"
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
		sport := r.URL.Query().Get("sport")

		data, err := fetchSportPayload(sport)

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

// Odds handler returns the odds payload for a given sport key (query param `sport`).
// remove this handler later to just have the websocket endpoint filter by sport key when rendering data
// func oddsHandler(w http.ResponseWriter, r *http.Request) {
// 	enableCORS(w)

// 	sport := r.URL.Query().Get("sport")

// 	payload, err := fetchSportPayload(sport)
// 	if err != nil {
// 		log.Println("Error fetching odds:", err)
// 		w.Header().Set("Content-Type", "application/json")
// 		w.WriteHeader(http.StatusInternalServerError)
// 		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch odds"}) //map[key type]value type, in this case both are strings
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(payload)
// }

func sportsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	list, err := fetchSportsList()
	if err != nil {
		log.Println("Error fetching sports list:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch sports list"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}
