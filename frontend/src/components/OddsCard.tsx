import { OddsBet } from "@/types/odds";

interface OddsCardProps {
  bet: OddsBet;
}

function formatOdds(odds: number) {
  if (odds > 0) {
    return `+${odds}`;
  }

  return odds.toString();
}

export default function OddsCard({ bet }: OddsCardProps) {
  return (
    <div className="w-full rounded-3xl border-2 border-black bg-white p-6 flex flex-col justify-between min-h-[220px]">
      <div>

        <p className="mt-3 text-sm font-bold text-slate-600">
          {bet.bookmaker}
        </p>

        <h3 className="mt-3 text-xl font-bold leading-snug">
          {bet.event}
        </h3>

        <p className="mt-3 text-base">
          {bet.team}
        </p>

        <p className="mt-1 text-sm uppercase text-slate-500">
          {bet.market}
        </p>
      </div>

      <p className="mt-6 text-center text-4xl font-bold">
        {bet.odds === 0 ? "..." : formatOdds(bet.odds)}
      </p>
    </div>
  );
}