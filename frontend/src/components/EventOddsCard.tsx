import { EventOdds } from "@/types/odds";

interface EventOddsCardProps {
  event: EventOdds;
}

function formatOdds(price: number) {
  if (price > 0) {
    return `+${price}`;
  }

  return price.toString();
}

function formatCommenceTime(commenceTime: string) {
  const eventDate = new Date(commenceTime);

  const now = new Date();

  const isToday =
    eventDate.getDate() === now.getDate() &&
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getFullYear() === now.getFullYear();

  const timeString = eventDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) {
    return `Today, ${timeString}`;
  }

  const weekday = eventDate.toLocaleDateString([], {
    weekday: "long",
  });

  return `${weekday}, ${timeString}`;
}

function isLiveGame(commenceTime: string) {
  const startTime = new Date(commenceTime).getTime();
  const now = Date.now();

  return startTime <= now; // can change later to account for current time being in a 3 hour range of commence time
}

export default function EventOddsCard({ event }: EventOddsCardProps) {
  const topBookmakers = event.bookmakers.slice(0, 4);

  return (
    <div className="rounded-3xl border-2 border-black bg-white p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{event.sportTitle}</p>

          <h3 className="mt-1 text-xl font-bold">
            {event.awayTeam} @ {event.homeTeam}
          </h3>
        </div>

        {isLiveGame(event.commenceTime) && (
          <span className="flex items-center gap-2 text-xs font-bold text-red-500">
            <span className="h-3 w-3 rounded-full bg-red-400 animate-pulse" />
            LIVE
          </span>
        )}

        <p className="shrink-0 rounded-full border border-black px-3 py-1 text-sm font-bold">
          {formatCommenceTime(event.commenceTime)}
        </p>
      </div>

      <div className="space-y-3">
        {topBookmakers.map((bookmaker) => (
          <div
            key={bookmaker.title}
            className="rounded-2xl border border-slate-300 p-4"
          >
            <p className="mb-3 text-sm font-bold">{bookmaker.title}</p>

            <div className="grid gap-2 md:grid-cols-2">
              {bookmaker.outcomes.map((outcome) => (
                <div
                  key={`${bookmaker.title}-${outcome.name}`}
                  className="rounded-xl border border-blue-400 px-4 py-3"
                >
                  <p className="text-sm text-slate-600">{outcome.name}</p>

                  <p className="mt-1 text-xl font-bold">
                    {formatOdds(outcome.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
