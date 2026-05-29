"use client";

import { useEffect, useState } from "react";
import OddsCard from "@/components/OddsCard";
import TodayGamesSection from "@/components/TodayGamesSection";
import { EventOdds, OddsBet, OddsPayload } from "@/types/odds";

const WS_URL = process.env.NEXT_PUBLIC_ODDS_WS_URL ?? "ws://localhost:8080/ws";

function getFavorites(odds: OddsBet[]): OddsBet[] {
  return [...odds]
    .filter((bet) => bet.odds < 0)
    .sort((a, b) => a.odds - b.odds)
    .slice(0, 5);
}

function getUnderdogs(odds: OddsBet[]): OddsBet[] {
  return [...odds]
    .filter((bet) => bet.odds > 0)
    .sort((a, b) => b.odds - a.odds)
    .slice(0, 5);
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

        setTopOdds(data.topOdds);
        setEvents(data.events);
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

  const favorites = getFavorites(topOdds);
  const underdogs = getUnderdogs(topOdds);

  const loadingCard: OddsBet = {
    id: 0,
    event: "Connecting...",
    team: "Waiting for backend odds",
    bookmaker: "Backend",
    market: "H2H",
    odds: 0,
    lastUpdate: "",
    live: false,
  };

  return (
    <section className="space-y-20">
      <div>
        <h2 className="mb-6 text-3xl font-bold">
          Top Favorites for Today
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {(favorites.length > 0 ? favorites : [loadingCard]).map((bet) => (
            <OddsCard key={`favorite-${bet.id}`} bet={bet} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-6 text-3xl font-bold">
          Top Underdogs for Today
        </h2>

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