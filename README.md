# live-odds-dashboard
Realtime sports odds analytics platform

**DISCLAIMER: Current State of Application has up to date data but is not fully "live" and only updates periodically on the page without refresh due to limited free API credits**

Motivation:
Current sports dashboards are either extremely hard to navigate or provide sportsbooks that are unknown/sketchy and don't show the heaviest favorites/underdogs

Goals:
Mock live odd updates first, then replace with api data
Track the heaviest favorites and underdogs odds of the day in the frontpage
Add filters/UI features to make the site look clean
Add Odds movement tracking to track odds over time for the present day like biggest movers today, fastest moving lines (most volatile odds) and sharp movement alerts so users know ot maybe avoid the line or choose it if the line suddenly swings in one team's favor
Favorites/watchlists system with login and db features

maybe an arbitrage finder and some AI features after this stuff is implemented


To do:
-create websocket server that sends odds maybe once every few seconds (done)
-update cards live on front end with this (done)
-replace with real data (done)
-redesign frontend to look cleaner
-track heaviest favorites and underdogs in homepage (change to best favorite/underdog per team later instead of duplicate sportsbook entries.)
-create seperate pages for the dashboard and analytics graphs

Backend Go Setup:
go mod init backend (in backend folder)
go get github.com/gorilla/websocket (install websocket pkg)

Local commands:
go mod download/go mod tidy



Run backend:
go run main.go
go run . (to run the whole package)

Build into native program:
go build
./backend.exe (or whatever the build executable is called)

API endpoints:
All sports
https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=us&markets=h2h&apiKey={API_KEY}

NBA:
https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey={API_KEY}&regions=us&markets=h2h&oddsFormat=american

(player props)
https://api.the-odds-api.com/v4/sports/basketball_nba/events/{EVENT_ID}/odds/?apiKey={API_KEY}&regions=us&markets=h2h

To do:
-background cache infrastructure to save api credits, something like where we only have one goroutine, and the cache is only refreshed if at least one websocket client is connected (check notes)
-rate limiting
-highlight the "best" odd with some radiating effect for each game from each sports book

More advanced features in future:
-live scores if it doesnt consume too many credits
-alert on line movement
-ai features (open ai api to start but then add in some of my own modeling stuff)
-arbitrage betting
-could add account features of tracking odds taken over time

Infrastructure:
Supabase Auth for accounts
Supabase Postgres for favorites
Go backend for odds/data API logic (will expand with goroutine and cache)
Next.js frontend for UI

Application Flow:
1. Frontend connects to /ws?sport={sport_key}
2. wsHandler marks sport_key accessed
3. registers connection in clientsBySport
4. getCachedOdds checks cache
5. fresh cache: return immediately
6. stale/missing cache: fetch once with singleflight
7. send payload to frontend

Seperately:
1. refresh goroutine runs every 1 minute
2. finds sports accessed within last 2 hours
3. calls getCachedOdds
4. if stale, fetches fresh data
5. broadcasts payload to connected clients for that sport


Diagram:
Main server
│
├── Handles HTTP/WebSocket requests
│
└── Background goroutine
      Every 1 minute:
      • Look for active sports
      • Refresh stale cache
      • Broadcast updates

The goroutine is a background worker that periodically refreshes stale cache entries and pushes fresh odds to connected WebSocket clients without waiting for user requests