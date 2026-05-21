"use client";

import { useEffect, useState } from "react";
import OddsCard from "@/components/OddsCard";
import { OddsBet } from "@/types/odds";

interface BackendOdds {
  player: string;
  market: string;
  odds: number;
}

const WS_URL = process.env.NEXT_PUBLIC_ODDS_WS_URL ?? "ws://localhost:8080/ws";

function mapBackendOdds(data: BackendOdds[]): OddsBet[] {
  return data.map((item, index) => ({
    id: index + 1,
    player: item.player,
    market: item.market,
    odds: item.odds.toString(),
    live: true,
  }));
}

export default function LiveOdds() {
  const [odds, setOdds] = useState<OddsBet[]>([]);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    //listen for connection opening
    socket.onopen = () => {
      setStatus("live");
    };

    //listen for incoming message
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as BackendOdds[];
        setOdds(mapBackendOdds(data));
      } catch (error) {
        console.error("Failed to parse odds payload:", error);
        setStatus("error");
      }
    };

    socket.onerror = () => {
      setStatus("error");
    };

    socket.onclose = () => {
      setStatus((prev) => (prev === "live" ? "disconnected" : "closed"));
    };

    return () => {
      socket.close();
    };
  }, []);

  const displayOdds =
    odds.length > 0
      ? odds
      : [
          {
            id: 0,
            player: "Connecting...",
            market: "Waiting for backend odds",
            odds: "...",
            live: false,
          },
        ];

  return (
    <section>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayOdds.map((bet) => (
          <OddsCard key={bet.id} bet={bet} />
        ))}
      </div>
      <p className="mt-6 text-sm text-gray-600">
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
