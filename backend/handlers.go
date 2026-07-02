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

	log.Println("WS connecting:", sport)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	markSportAccessed(sport)
	registerClient(sport, conn)

	log.Println("WS connected:", sport)

	defer func() {
		unregisterClient(sport, conn)
		log.Println("WS disconnected:", sport)
	}()

	payload, err := getCachedOdds(sport)
	if err != nil {
		log.Println("Error getting cached odds:", err)
		return
	}

	if err := conn.WriteJSON(payload); err != nil {
		log.Println("WS initial write error:", err)
		log.Println(err)
		return
	}

	//client stays connected until a disconnect occurs and is detected by the socket
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
