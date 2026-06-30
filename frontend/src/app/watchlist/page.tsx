import Link from "next/link";
import EventOddsCard from "@/components/EventOddsCard";
import { EventOdds, OddsPayload } from "@/types/odds";
// later: import { getWatchlistEvents } from "@/lib/watchlist";
import { createServerClientForApp } from "@/lib/supabase/server"


//add redirect later? example:
// import { redirect } from "next/navigation";

// if (!user) {
//   redirect("/signin");
// }

type WatchlistLeague = {
    id: string;
    user_id: string;
    sport_key: string;
    sport_title: string;
    sport_group: string | null;
    created_at: string;
};

export default async function WatchlistPage() {
    const supabase = await createServerClientForApp();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main className="min-h-screen bg-neutral-100 px-8 py-10">
                <section className="mx-auto max-w-7xl">
                    <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                        Watchlist
                    </p>
                    <h1 className="mt-2 text-5xl font-bold text-slate-950">
                        Sign in to view your watchlist
                    </h1>

                    <Link
                        href="/signin"
                        className="mt-6 inline-block rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Sign in
                    </Link>
                </section>
            </main>
        );
    }

    const { data: watchlistLeagues, error } = await supabase
        .from("user_league_watchlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading watchlist:", error);
    }

    const leagues = (watchlistLeagues ?? []) as WatchlistLeague[];
    console.log("Watchlist leagues:", leagues);
    const watchlistCount = leagues.length;

    const groupedEvents: Record<string, EventOdds[]> = {};

    // takes the favorited sports from db and fetches real events for each sport_key using backend API
    for (const league of leagues) {
        try {
            const response = await fetch(`http://localhost:8080/odds?sport=${league.sport_key}`);
            const data = (await response.json()) as OddsPayload;
            groupedEvents[league.sport_title] = Array.isArray(data.events) ? data.events : [];
        } catch (error) {
            console.error(`Error fetching events for ${league.sport_title}:`, error);
            groupedEvents[league.sport_title] = [];
        }
    }

    return (
        <main className="min-h-screen bg-neutral-100 px-8 py-10">
            <section className="mx-auto max-w-7xl space-y-10">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                        Suggested for you
                    </p>

                    <h1 className="mt-2 text-5xl font-bold text-slate-950">
                        Your Watchlist Picks
                    </h1>

                    <p className="mt-3 max-w-3xl text-lg text-slate-600">
                        Following {watchlistCount} leagues
                    </p>

                    <p className="mt-3 max-w-3xl text-lg text-slate-600">
                        Track odds from the leagues you care about most.
                    </p>
                </div>

                {watchlistCount === 0 ? (
                    <div className="rounded-3xl border border-slate-400 bg-white p-10 text-center shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-950">
                            No watchlist right now
                        </h2>

                        <p className="mt-3 text-slate-600">
                            Add leagues to build your watchlist.
                        </p>

                        <Link
                            href="/leagues"
                            className="mt-6 inline-block rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Browse leagues
                        </Link>
                    </div>
                ) : (
                    Object.entries(groupedEvents).map(([sportTitle, sportEvents]) => (
                        <div key={sportTitle} className="space-y-5">
                            <h3 className="border-b-2 border-black pb-3 text-3xl font-bold">
                                {sportTitle}
                            </h3>

                            {sportEvents.length === 0 ? (
                                <div className="rounded-3xl border border-slate-300 bg-white p-6 text-slate-600">
                                    League is currently not showing any odds or the league is inactive.
                                </div>
                            ) : (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {sportEvents.map((event) => (
                                        <EventOddsCard key={event.id} event={event} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}