# live-odds-dashboard

Goals:
Mock live odd updates first, then replace with api data

To do:
-create websocket server that sends odds maybe once every few seconds
-update cards live on front end with this
-replace with real data

Backend Go Setup:
go mod init backend (in backend folder)
go get github.com/gorilla/websocket (install websocket pkg)

Run backend:
go run main.go

Build into native program:
go build