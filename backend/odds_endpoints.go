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

	// fetch without a commenceTime filter so the API returns both upcoming and live games
	nowUTC := time.Now().UTC()

	url := fmt.Sprintf(
		"https://api.the-odds-api.com/v4/sports/%s/odds/?apiKey=%s&regions=us&markets=h2h&oddsFormat=american",
		sportKey,
		apiKey,
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

	err = json.NewDecoder(resp.Body).Decode(&apiGames) //puts the decoded JSON response into the apiGames variable using the pointer

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

					// determine if the game is live by comparing commence time to now
					//might need to alter later if API doesn't update status adequately
					isLive := false
					if t, err := time.Parse(time.RFC3339, game.CommenceTime); err == nil {
						if !t.After(nowUTC) {
							isLive = true
						}
					}

					payload.TopOdds = append(payload.TopOdds, OddsBet{
						ID:           oddsID,
						Event:        eventName,
						Team:         outcome.Name,
						Bookmaker:    bookmaker.Title,
						Market:       "H2H",
						Odds:         outcome.Price,
						LastUpdate:   bookmaker.LastUpdate,
						CommenceTime: game.CommenceTime,
						Live:         isLive,
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

func fetchSportsList() ([]ApiSport, error) {
	apiKey := os.Getenv("ODDS_API_KEY")
	url := fmt.Sprintf("https://api.the-odds-api.com/v4/sports/?apiKey=%s", apiKey)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Sports API returned status: %s", resp.Status)
	}

	var apiSports []ApiSport
	if err := json.NewDecoder(resp.Body).Decode(&apiSports); err != nil {
		return nil, err
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

	return filteredSports, nil
}
