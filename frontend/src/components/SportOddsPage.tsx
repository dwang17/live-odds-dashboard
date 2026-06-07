"use client";

import { useEffect, useState } from "react";
import TodayGamesSection from "@/components/TodayGamesSection";
import { EventOdds, OddsPayload } from "@/types/odds";

interface SportOddsPageProps {
  sportKey: string;
  sportTitle: string;
  description?: string;
}

export default function SportOddsPage({
  sportKey,
  sportTitle,
  description,
}: SportOddsPageProps) {
  const [events, setEvents] = useState<EventOdds[]>([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchSportOdds() {
      try {
        setStatus("loading");

        const response = await fetch(
          `http://localhost:8080/odds?sport=${sportKey}`
        );

        if (!response.ok) {
          setStatus("error");
          return;
        }

        const data = (await response.json()) as OddsPayload;

        setEvents(data.events);
        setStatus("loaded");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    }

    fetchSportOdds();
  }, [sportKey]);

  return (
    <main className="min-h-screen bg-neutral-100 px-8 py-10">
      <section className="mx-auto max-w-7xl space-y-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Sport Odds
          </p>

          <h1 className="mt-2 text-5xl font-bold text-slate-950">
            {sportTitle}
          </h1>

          <p className="mt-3 max-w-3xl text-lg text-slate-600">
            {description ??
              `Browse upcoming ${sportTitle} moneyline odds across sportsbooks.`}
          </p>
        </div>

        {status === "loading" && (
          <div className="rounded-2xl border border-slate-400 bg-white p-8">
            <p className="text-slate-600">
              Loading {sportTitle} odds...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-8">
            <p className="font-semibold text-red-700">
              Unable to load {sportTitle} odds.
            </p>
          </div>
        )}

        {status === "loaded" && events.length === 0 && (
          <div className="rounded-2xl border border-slate-400 bg-white p-8">
            <p className="text-slate-600">
              No upcoming {sportTitle} odds found right now.
            </p>
          </div>
        )}

        {events.length > 0 && <TodayGamesSection events={events} />}
      </section>
    </main>
  );
}