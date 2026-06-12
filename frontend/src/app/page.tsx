import LiveOdds from "@/components/LiveOdds";

export default function HomePage() {
  return (
    <main className="min-h-screen flex-1 px-8 py-10">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-bold">Today&apos;s Top Odds</h1>

        <p className="mt-4 text-xl font-bold">
          Live odds updating in real time
        </p>

        <div className="mt-12">
          <LiveOdds />
        </div>
      </section>
    </main>
  );
}
