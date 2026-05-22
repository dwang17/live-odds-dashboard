# live-odds-dashboard
Realtime sports odds analytics platform

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
-track heaviest favorites and underdogs in homepage
-create seperate pages for the dashboard and analytics graphs

Backend Go Setup:
go mod init backend (in backend folder)
go get github.com/gorilla/websocket (install websocket pkg)

Run backend:
go run main.go

Build into native program:
go build

API endpoints:
All sports
https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=us&markets=h2h&apiKey={API_KEY}

NBA:
https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey={API_KEY}&regions=us&markets=h2h&oddsFormat=american

(player props)
https://api.the-odds-api.com/v4/sports/basketball_nba/events/{EVENT_ID}/odds/?apiKey={API_KEY}&regions=us&markets=h2h