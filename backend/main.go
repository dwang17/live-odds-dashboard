package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

type Odds struct {
	Event      string `json:"event"`
	Team       string `json:"team"`
	Bookmaker  string `json:"bookmaker"`
	Market     string `json:"market"`
	Odds       int    `json:"odds"`
	LastUpdate string `json:"lastUpdate"`
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
	HomeTeam   string         `json:"home_team"`
	AwayTeam   string         `json:"away_team"`
	Bookmakers []ApiBookmaker `json:"bookmakers"`
}

// initialize websocket upgrader to keep socket open with default options
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// sample fetch odds for now, h2h/moneyline data
func fetchOdds() ([]Odds, error) {
	//get API key from env file
	apiKey := os.Getenv("ODDS_API_KEY")

	//format URL with API key from env file
	url := fmt.Sprintf(
		"https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=%s&regions=us&oddsFormat=american",
		apiKey,
	)

	resp, err := http.Get(url)

	if err != nil {
		log.Println("Error fetching odds:", err)
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status: %s", resp.Status)
	}

	var games []ApiGame

	err = json.NewDecoder(resp.Body).Decode(&games)

	if err != nil {
		return nil, err
	}

	var odds []Odds

	for _, game := range games {
		eventName := game.AwayTeam + " @ " + game.HomeTeam

		for _, bookmaker := range game.Bookmakers {
			for _, market := range bookmaker.Markets {
				for _, outcome := range market.Outcomes {
					odds = append(odds, Odds{
						Event:      eventName,
						Team:       outcome.Name,
						Bookmaker:  bookmaker.Title,
						Market:     market.Key,
						Odds:       outcome.Price,
						LastUpdate: bookmaker.LastUpdate,
					})
				}
			}
		}
	}

	return odds, nil
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
		data, err := fetchOdds()

		if err != nil {
			log.Println("Error fetching odds:", err)
		} else {
			//send odds data as JSON to frontend
			err = conn.WriteJSON(data)

			if err != nil {
				log.Println(err)
				break
			}
		}

		time.Sleep(5 * time.Minute) //update live odds every 5 mins for limit purposes
	}
}

func main() {
	err := godotenv.Load() //load environment variables from .env file

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	//websocket endpoint /ws to handle connections and send odds
	http.HandleFunc("/ws", wsHandler)

	log.Println("Server running on :8080")

	//start server on port 8080 and log any errors
	err = http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal(err)
	}
}
