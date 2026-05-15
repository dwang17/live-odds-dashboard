import Navbar from "@/components/Navbar";
import OddsCard from "@/components/OddsCard";
import { topOdds } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-gray-50 px-6 py-10">

            <h1 className="text-5xl font-bold">Today&apos;s Top Odds</h1>

            <p className="mt-4 text-xl font-semibold mb-10">
              Live odds updating in real time
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topOdds.map((bet) => (
                <OddsCard key={bet.id} bet={bet} />
              ))}
            </div>


      </main>
    </div>
  );
}
