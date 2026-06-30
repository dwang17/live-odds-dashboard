"use client";

import { useEffect, useState } from "react";
import OddsCard from "@/components/OddsCard";
import TodayGamesSection from "@/components/TodayGamesSection";
import { EventOdds, OddsBet, OddsPayload } from "@/types/odds";

const WS_URL = process.env.NEXT_PUBLIC_ODDS_WS_URL ?? "ws://localhost:8080/ws";

//function that returns the strongest favorite for each unique pick (event + team + market)
function getStrongestFavoritePerPick(odds: OddsBet[]): OddsBet[] {
  const bestFavoriteMap = new Map<string, OddsBet>();

  for (const bet of odds) {
    const key = `${bet.event}-${bet.team}-${bet.market}`;

    const existing = bestFavoriteMap.get(key);

    if (!existing || bet.odds < existing.odds) {
      bestFavoriteMap.set(key, bet);
    }
  }

  return Array.from(bestFavoriteMap.values());
}

//function that returns the strongest underdog for each unique pick (event + team + market)
function getBiggestUnderdogPerPick(odds: OddsBet[]): OddsBet[] {
  const bestUnderdogMap = new Map<string, OddsBet>();

  for (const bet of odds) {
    const key = `${bet.event}-${bet.team}-${bet.market}`;

    const existing = bestUnderdogMap.get(key);

    if (!existing || bet.odds > existing.odds) {
      bestUnderdogMap.set(key, bet);
    }
  }

  return Array.from(bestUnderdogMap.values());
}

export default function LiveOdds() {
  const [topOdds, setTopOdds] = useState<OddsBet[]>([]);
  const [events, setEvents] = useState<EventOdds[]>([]);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      setStatus("live");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as OddsPayload;

        setTopOdds(data.topOdds ?? []);
        setEvents(data.events ?? []);
      } catch (error) {
        console.error("Failed to parse odds payload:", error);
        setStatus("error");
      }
    };

    socket.onerror = () => {
      setStatus("error");
    };

    socket.onclose = () => {
      setStatus((prev) => {
        if (prev === "live") {
          return "disconnected";
        }

        return "closed";
      });
    };

    return () => {
      socket.close();
    };
  }, []);

  //filter to show top upcoming odds for today (otherwise if the game is live it can be heavily skewed)
  const upcomingOdds = topOdds.filter((bet) => {
    return new Date(bet.commenceTime).getTime() > Date.now();
  });

  //select favorite and underdog per pick to avoid showing multiple bets for the same pick
  //this makes it so multiple bookmakers offering odds on the same team in the same game aren't shown again
  const favoritePool = getStrongestFavoritePerPick(
    upcomingOdds.filter((bet) => bet.odds < 0),
  );

  const underdogPool = getBiggestUnderdogPerPick(
    upcomingOdds.filter((bet) => bet.odds > 0),
  );

  const favorites = favoritePool.sort((a, b) => a.odds - b.odds).slice(0, 5);

  const underdogs = underdogPool.sort((a, b) => b.odds - a.odds).slice(0, 5);

  const loadingCard: OddsBet = {
    id: 0,
    sport: "Connecting...",
    event: "Connecting...",
    team: "Waiting for backend odds",
    bookmaker: "Backend",
    market: "H2H",
    odds: 0,
    lastUpdate: "",
    commenceTime: "",
    live: false,
  };

  return (
    <section className="space-y-20">
      <div>
        <div className="mb-6">
          <h2 className="text-4xl font-bold">Top Upcoming Favorites</h2>

          <p className="mt-2 text-slate-600 border-b-2 border-black pb-3">
            Strongest moneyline favorites across upcoming games
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {(favorites.length > 0 ? favorites : [loadingCard]).map((bet) => (
            <OddsCard key={`favorite-${bet.id}`} bet={bet} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-6">
          <h2 className="text-4xl font-bold">Top Upcoming Underdogs</h2>

          <p className="mt-2 text-slate-600 border-b-2 border-black pb-3">
            Biggest plus-money underdogs across upcoming games
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {(underdogs.length > 0 ? underdogs : [loadingCard]).map((bet) => (
            <OddsCard key={`underdog-${bet.id}`} bet={bet} />
          ))}
        </div>
      </div>

      {events.length > 0 && <TodayGamesSection events={events} />}

      <p className="text-sm text-slate-600">
        {status === "live"
          ? "Live backend odds streaming via websocket."
          : status === "connecting"
            ? "Connecting to backend websocket..."
            : status === "error"
              ? "Unable to connect to backend. Check backend is running at ws://localhost:8080/ws."
              : "Backend connection closed."}
      </p>
    </section>
  );
}
