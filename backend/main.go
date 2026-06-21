package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

type OddsPayload struct {
	TopOdds []OddsBet   `json:"topOdds"`
	Events  []EventOdds `json:"events"`
}

type OddsBet struct {
	ID           int    `json:"id"`
	Sport        string `json:"sport"`
	Event        string `json:"event"`
	Team         string `json:"team"`
	Bookmaker    string `json:"bookmaker"`
	Market       string `json:"market"`
	Odds         int    `json:"odds"`
	LastUpdate   string `json:"lastUpdate"`
	CommenceTime string `json:"commenceTime"`
	Live         bool   `json:"live"`
}

type EventOdds struct {
	ID           string          `json:"id"`
	SportTitle   string          `json:"sportTitle"`
	CommenceTime string          `json:"commenceTime"`
	HomeTeam     string          `json:"homeTeam"`
	AwayTeam     string          `json:"awayTeam"`
	Bookmakers   []BookmakerOdds `json:"bookmakers"`
}

type BookmakerOdds struct {
	Title    string        `json:"title"`
	Outcomes []OutcomeOdds `json:"outcomes"`
}

type OutcomeOdds struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
}

type ApiOutcome struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
}

type ApiMarket struct {
	Key        string       `json:"key"`
	LastUpdate string       `json:"last_update"`
	Outcomes   []ApiOutcome `json:"outcomes"`
}

type ApiBookmaker struct {
	Title      string      `json:"title"`
	LastUpdate string      `json:"last_update"`
	Markets    []ApiMarket `json:"markets"`
}

type ApiGame struct {
	ID           string         `json:"id"`
	SportKey     string         `json:"sport_key"`
	SportTitle   string         `json:"sport_title"`
	CommenceTime string         `json:"commence_time"`
	HomeTeam     string         `json:"home_team"`
	AwayTeam     string         `json:"away_team"`
	Bookmakers   []ApiBookmaker `json:"bookmakers"`
}

// change later to make stricter to have allowedOrigins of frontend domain only; currently allows all origins for testing purposes
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Enable CORS headers for all responses
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*") //adjust later when deployed to only allow frontend domain; currently allows all origins
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// Handle CORS preflight requests
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)

		// verifies that if the request is an HTTP request it will respond to preflight OPTIONS requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Println("No .env file found")
	}

	http.HandleFunc("/ws", wsHandler)
	// http.HandleFunc("/search", corsMiddleware(searchHandler))
	http.HandleFunc("/odds", corsMiddleware(oddsHandler))
	http.HandleFunc("/sports", corsMiddleware(sportsHandler))

	log.Println("Server running on :8080")

	err = http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal(err)
	}
}
