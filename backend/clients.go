package main

import (
	"sync"

	"github.com/gorilla/websocket"
)

var (
	clientsMu = sync.Mutex{}

	// 	clientsBySport = {
	//   "nba": {
	//     conn_A: true,
	//     conn_B: true,
	//   },
	//   "nfl": {
	//     conn_C: true,
	//   },
	// }
	// map of sport keys to a set of websocket connections (represented as a map of *websocket.Conn to bool)
	clientsBySport = map[string]map[*websocket.Conn]bool{}
)

func registerClient(sportKey string, conn *websocket.Conn) {
	if sportKey == "" {
		sportKey = "upcoming"
	}

	clientsMu.Lock()
	defer clientsMu.Unlock()

	if clientsBySport[sportKey] == nil {
		//create the map for the sport key if it doesn't exist yet
		clientsBySport[sportKey] = map[*websocket.Conn]bool{}
	}

	//add the connection to the set of clients for the sport key
	clientsBySport[sportKey][conn] = true
}

func unregisterClient(sportKey string, conn *websocket.Conn) {
	if sportKey == "" {
		sportKey = "upcoming"
	}

	clientsMu.Lock()
	defer clientsMu.Unlock()

	if clientsBySport[sportKey] != nil {
		delete(clientsBySport[sportKey], conn)
	}

	//if set is empty after deletion, remove the sport key from the map to free up memory
	if len(clientsBySport[sportKey]) == 0 {
		delete(clientsBySport, sportKey)
	}
}

// can refactor if needed to unlock the lock before broadcasting to avoid holding the lock while sending data to clients, which could block other operations
func broadcastToSport(sportKey string, payload OddsPayload) {
	clientsMu.Lock()
	defer clientsMu.Unlock()

	// iterate over the set of clients for the sport key and send the payload to each client
	for conn := range clientsBySport[sportKey] {
		err := conn.WriteJSON(payload)
		if err != nil {
			conn.Close()
			delete(clientsBySport[sportKey], conn)
		}
	}
}
