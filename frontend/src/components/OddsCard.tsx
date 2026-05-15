import { OddsBet } from "@/types/odds"

interface OddsCardProps {
  bet: OddsBet
}

export default function OddsCard({
  bet,
}: OddsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div>
        <div className="flex items-center gap-2 mb-3">
          {bet.live && (
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          )}

          <span className="font-semibold">
            LIVE
          </span>
        </div>

        <h2 className="text-2xl font-bold">
          {bet.player}
        </h2>

        <p className="text-lg mt-2">
          {bet.market}
        </p>
      </div>

      <p className="text-4xl font-bold text-center">
        {bet.odds}
      </p>
    </div>
  )
}