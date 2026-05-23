import { OddsBet } from "@/types/odds";

interface OddsCardProps {
  bet: OddsBet;
}

export default function OddsCard({ bet }: OddsCardProps) {
  return (
    <div className="w-full max-w-sm rounded-3xl border-2 border-black bg-white p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {/* live icon */}
        {bet.live && (
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
        )}

        <span className="text-sm font-semibold">
          {bet.live ? "LIVE" : "LOADING"}
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-600">
          {bet.bookmaker}
        </p>

        <h2 className="mt-2 text-xl font-bold">
          {bet.event}
        </h2>

        <p className="mt-2 text-lg">
          {bet.team}
        </p>

        <p className="mt-1 text-sm uppercase text-gray-500">
          {bet.market}
        </p>
      </div>

      <p className="text-center text-4xl font-bold">
        {bet.odds === 0 ? "..." : bet.odds > 0 ? `+${bet.odds}` : bet.odds}
      </p>
    </div>
  );
}