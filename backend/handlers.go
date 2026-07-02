package main

import (
	"encoding/json"
	"log"
	"net/http"
)

// scale to have a background cache refreshing where the websocket handler pulls from cached sports data
func wsHandler(w http.ResponseWriter, r *http.Request) {
	sport := r.URL.Query().Get("sport")
	if sport == "" {
		sport = "upcoming"
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	markSportAccessed(sport)
	registerClient(sport, conn)
	defer unregisterClient(sport, conn)

	payload, err := getCachedOdds(sport)
	if err != nil {
		log.Println("Error getting cached odds:", err)
		return
	}

	if err := conn.WriteJSON(payload); err != nil {
		log.Println(err)
		return
	}

	//loop keeps the connection open and listens for messages from the client, but we don't expect any messages from the client in this case
	//therefore since we are blocked while waiting for the client message that never comes, we can just break the loop and close the connection when the client disconnects
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}

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
