
import Link from "next/link";
import { getSportsList } from "@/lib/sports";

export default async function SportsIndexPage() {
  const sportsList = await getSportsList();

  return (
    <main className="min-h-screen bg-neutral-100 px-8 py-10">
      <section className="mx-auto max-w-7xl space-y-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Sports Leagues
          </p>
          <h1 className="mt-2 text-5xl font-bold text-slate-950">Sports</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">
            Browse available league odds by sport and region.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sportsList.map((sport) => (
            <Link
              key={sport.key}
              href={`/sports/${sport.key}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {sport.title}
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{sport.description}</p>
              <p className="mt-4 text-sm text-slate-600">View latest odds for {sport.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
