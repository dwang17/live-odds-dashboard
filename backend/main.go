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

type OddsPayload struct {
	TopOdds []OddsBet   `json:"topOdds"`
	Events  []EventOdds `json:"events"`
}

type OddsBet struct {
	ID           int    `json:"id"`
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

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func fetchOddsPayload() (OddsPayload, error) {
	apiKey := os.Getenv("ODDS_API_KEY")

	// can add commence time specifics later
	nowUTC := time.Now().UTC()

	// endUTC := nowUTC.Add(24 * time.Hour)

	commenceTimeFrom := nowUTC.Format(time.RFC3339)
	//end at next 24 hours, comment out for now
	// commenceTimeTo := endUTC.Format(time.RFC3339)

	//add later possibly: &commenceTimeTo=%s to url
	url := fmt.Sprintf(
		"https://api.the-odds-api.com/v4/sports/upcoming/odds/?apiKey=%s&regions=us&markets=h2h&oddsFormat=american&commenceTimeFrom=%s",
		apiKey,
		commenceTimeFrom,
		// commenceTimeTo,
	)

	resp, err := http.Get(url)

	if err != nil {
		return OddsPayload{}, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return OddsPayload{}, fmt.Errorf("API returned status: %s", resp.Status)
	}

	var apiGames []ApiGame

	err = json.NewDecoder(resp.Body).Decode(&apiGames)

	if err != nil {
		return OddsPayload{}, err
	}

	payload := OddsPayload{
		TopOdds: []OddsBet{},
		Events:  []EventOdds{},
	}

	oddsID := 1

	for _, game := range apiGames {
		if len(game.Bookmakers) == 0 {
			continue
		}

		eventName := game.AwayTeam + " @ " + game.HomeTeam

		event := EventOdds{
			ID:           game.ID,
			SportTitle:   game.SportTitle,
			CommenceTime: game.CommenceTime,
			HomeTeam:     game.HomeTeam,
			AwayTeam:     game.AwayTeam,
			Bookmakers:   []BookmakerOdds{},
		}

		for _, bookmaker := range game.Bookmakers {
			for _, market := range bookmaker.Markets {
				if market.Key != "h2h" {
					continue
				}

				bookmakerOdds := BookmakerOdds{
					Title:    bookmaker.Title,
					Outcomes: []OutcomeOdds{},
				}

				for _, outcome := range market.Outcomes {
					bookmakerOdds.Outcomes = append(bookmakerOdds.Outcomes, OutcomeOdds{
						Name:  outcome.Name,
						Price: outcome.Price,
					})

					payload.TopOdds = append(payload.TopOdds, OddsBet{
						ID:           oddsID,
						Event:        eventName,
						Team:         outcome.Name,
						Bookmaker:    bookmaker.Title,
						Market:       "H2H",
						Odds:         outcome.Price,
						LastUpdate:   bookmaker.LastUpdate,
						CommenceTime: game.CommenceTime,
						Live:         true,
					})

					oddsID++
				}

				event.Bookmakers = append(event.Bookmakers, bookmakerOdds)
			}
		}

		payload.Events = append(payload.Events, event)
	}

	return payload, nil
}

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

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Println("No .env file found")
	}

	http.HandleFunc("/ws", wsHandler)

	log.Println("Server running on :8080")

	err = http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal(err)
	}
}
