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
    <div className="w-full overflow-hidden rounded-[28px] border border-slate-500 bg-white p-6 flex flex-col justify-between min-h-[220px] transition duration-200 hover:border-red-500 hover:-translate-y-0.5 hover:shadow-lg transition duration-200">
      <div>
        <p className="flex justify-center">
          <span className="inline-flex max-w-full flex-wrap items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-base text-center font-semibold tracking-[0.08em] shadow-sm whitespace-normal break-words">
            {bet.sport}
          </span>
        </p>

        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
          {bet.bookmaker}
        </p>

        <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-900">
          {bet.event}
        </h3>

        <p className="mt-3 text-base text-slate-700">{bet.team}</p>

        <p className="mt-2 text-sm uppercase tracking-[0.08em] text-slate-500">
          {bet.market}
        </p>
      </div>

      <p className="mt-6 text-center text-4xl font-bold text-slate-900">
        {bet.odds === 0 ? "..." : formatOdds(bet.odds)}
      </p>
    </div>
  );
}
