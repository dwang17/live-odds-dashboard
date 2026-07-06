"use client";

import { useEffect, useRef, useState } from "react";
import EventOddsCard from "@/components/EventOddsCard";
import { EventOdds, OddsPayload } from "@/types/odds";
import { WatchlistLeague } from "@/app/watchlist/page";

const WS_BASE = "ws://localhost:8080/ws";

interface WatchlistLiveClientProps {
    leagues: WatchlistLeague[];
}

export default function WatchlistLiveClient({
    leagues,
}: WatchlistLiveClientProps) {
    const [groupedEvents, setGroupedEvents] = useState<
        Record<string, EventOdds[]>
    >({});

    const [status, setStatus] = useState("loading");

    useEffect(() => {
        if (leagues.length === 0) {
            setStatus("loaded");
            return;
        }

        setStatus("loading");

        const sockets: WebSocket[] = [];
        const loadedSports = new Set<string>();

        leagues.forEach((league) => {
            const socket = new WebSocket(
                `${WS_BASE}?sport=${encodeURIComponent(league.sport_key)}`
            );

            sockets.push(socket);

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as OddsPayload;

                    setGroupedEvents((prev) => ({
                        ...prev,
                        [league.sport_title]: data.events ?? [],
                    }));

                    if (!loadedSports.has(league.sport_key)) {
                        loadedSports.add(league.sport_key);

                        if (loadedSports.size === leagues.length) {
                            setStatus("loaded");
                        }
                    }
                } catch (error) {
                    console.error("Failed to parse watchlist odds:", error);
                    setStatus("error");
                }
            };

            socket.onerror = () => {
                console.debug("Watchlist WS error event:", league.sport_key);
            };

            socket.onclose = () => {
                if (!loadedSports.has(league.sport_key)) {
                    setStatus("error");
                    return;
                }

                console.debug("Watchlist WS closed after data loaded:", league.sport_key);
            };
        });

        return () => {
            sockets.forEach((socket) => socket.close());
        };
    }, [leagues]);

    if (status === "loading") {
        return (
            <div className="rounded-3xl border border-slate-300 bg-white p-6 text-slate-600">
                Loading watchlist odds...
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="rounded-3xl border border-red-300 bg-red-50 p-6 font-semibold text-red-700">
                Unable to load watchlist odds.
            </div>
        );
    }

    return (
        <>
            {leagues.map((league) => {
                const sportEvents = groupedEvents[league.sport_title] ?? [];

                return (
                    <div key={league.sport_key} className="space-y-5">
                        <h3 className="border-b-2 border-black pb-3 text-3xl font-bold">
                            {league.sport_title}
                        </h3>

                        {sportEvents.length === 0 ? (
                            <div className="rounded-3xl border border-slate-300 bg-white p-6 text-slate-600">
                                League is currently not showing any odds or the league is
                                inactive.
                            </div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-2">
                                {sportEvents.map((event) => (
                                    <EventOddsCard key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}