package main

import (
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

// initialize global random number generator with current time as seed to ensure different odds each time server starts
var r = rand.New(rand.NewSource(time.Now().UnixNano()))

// create odds struct to send to frontend
type Odds struct {
	Player string `json:"player"`
	Market string `json:"market"`
	Odds   int    `json:"odds"`
}

// initialize websocket upgrader to keep socket open with default options
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// simulate random odds to change every 3 seconds and send to frontend
func randomOdds() []Odds {
	return []Odds{
		{
			Player: "LeBron James",
			Market: "Over 6.5 Rebounds",
			Odds:   -230 + r.Intn(20),
		},
		{
			Player: "Stephen Curry",
			Market: "Over 5.5 Assists",
			Odds:   -200 + r.Intn(20),
		},
		{
			Player: "Alperen Sengun",
			Market: "Over 20.5 Points",
			Odds:   -215 + r.Intn(20),
		},
	}
}

// handle websocket connection and send random odds every 3 seconds
func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println(err)
		return
	}

	defer conn.Close() //run before function exits to ensure connection is closed

	// continuously send random odds to frontend every 3 seconds until connection is closed
	for {
		data := randomOdds()

		// send odds data as JSON to frontend
		err := conn.WriteJSON(data)

		if err != nil {
			log.Println(err)
			break
		}

		time.Sleep(3 * time.Second)
	}
}

func main() {
	//websocket endpoint /ws to handle connections and send odds
	http.HandleFunc("/ws", wsHandler)

	log.Println("Server running on :8080")

	//start server on port 8080 and log any errors
	err := http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal(err)
	}
}
