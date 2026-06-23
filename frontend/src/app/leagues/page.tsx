import Link from "next/link";
import { getSportsList } from "@/lib/sports";
import FavoriteLeagueButton from "@/components/FavoriteLeagueButton";
import { createServerClientForApp } from "@/lib/supabase/server";

export default async function LeaguesPage() {
  const sportsList = await getSportsList();

  const supabase = await createServerClientForApp();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let favoritedSportKeys: string[] = [];

  if (user) {
    const { data } = await supabase
      .from("user_league_watchlist")
      .select("sport_key")
      .eq("user_id", user.id);

    favoritedSportKeys = data?.map((item) => item.sport_key) ?? [];
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-8 py-10">
      <section className="mx-auto max-w-7xl space-y-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Active Leagues
          </p>
          <h1 className="mt-2 text-5xl font-bold text-slate-950">Leagues</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">
            Browse all active leagues powered by the sports endpoint.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sportsList.map((sport) => (
            <Link
              key={sport.key}
              href={`/sports/${sport.key}`}
              className="rounded-3xl border border-slate-500 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {sport.group}
                </p>

                {user && (
                  <FavoriteLeagueButton
                    sportKey={sport.key}
                    sportTitle={sport.title}
                    sportGroup={sport.group}
                    userId={user.id}
                    initiallyFavorited={favoritedSportKeys.includes(sport.key)}
                  />
                )}
              </div>

              <p className="mt-3 text-lg font-semibold text-slate-900">
                {sport.title}
              </p>

              <p className="mt-4 text-sm text-slate-600">
                {sport.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}