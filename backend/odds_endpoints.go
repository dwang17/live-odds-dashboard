package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type ApiSport struct {
	Key          string `json:"key"`
	Group        string `json:"group"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	Active       bool   `json:"active"`
	HasOutrights bool   `json:"has_outrights"`
}

// fetchSportPayload fetches odds for a specific sport key.
func fetchSportPayload(sportKey string) (OddsPayload, error) {
	apiKey := os.Getenv("ODDS_API_KEY")

	// default to the generic upcoming endpoint when no sport key is provided
	if sportKey == "" {
		sportKey = "upcoming"
	}

	// can add commence time specifics later
	nowUTC := time.Now().UTC()

	// endUTC := nowUTC.Add(24 * time.Hour)

	commenceTimeFrom := nowUTC.Format(time.RFC3339)
	//end at next 24 hours, comment out for now
	// commenceTimeTo := endUTC.Format(time.RFC3339)

	//add later possibly: &commenceTimeTo=%s to url
	url := fmt.Sprintf(
		"https://api.the-odds-api.com/v4/sports/%s/odds/?apiKey=%s&regions=us&markets=h2h&oddsFormat=american&commenceTimeFrom=%s",
		sportKey,
		apiKey,
		commenceTimeFrom,
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

// fetchUpcomingPayload is the original homepage data fetcher and returns upcoming odds.
func fetchUpcomingPayload() (OddsPayload, error) {
	return fetchSportPayload("upcoming")
}

func sportsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	apiKey := os.Getenv("ODDS_API_KEY")
	url := fmt.Sprintf("https://api.the-odds-api.com/v4/sports/?apiKey=%s", apiKey)

	resp, err := http.Get(url)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch sports list"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Sports API returned status: %s", resp.Status)})
		return
	}

	var apiSports []ApiSport
	if err := json.NewDecoder(resp.Body).Decode(&apiSports); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode sports list"})
		return
	}

	filteredSports := []ApiSport{}
	for _, sport := range apiSports {
		if !sport.Active {
			continue
		}
		lowerKey := strings.ToLower(sport.Key)
		if sport.HasOutrights || strings.Contains(lowerKey, "outrights") || strings.Contains(lowerKey, "winner") {
			continue
		}
		filteredSports = append(filteredSports, sport)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(filteredSports)
}
