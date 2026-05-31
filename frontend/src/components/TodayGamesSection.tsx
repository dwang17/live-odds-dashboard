import EventOddsCard from "@/components/EventOddsCard";
import { EventOdds } from "@/types/odds";

interface TodayGamesSectionProps {
  events: EventOdds[];
}

function groupEventsBySport(events: EventOdds[]) {
  const grouped: Record<string, EventOdds[]> = {};

  for (const event of events) {
    if (!grouped[event.sportTitle]) {
      grouped[event.sportTitle] = [];
    }

    grouped[event.sportTitle].push(event);
  }

  return grouped;
}

export default function TodayGamesSection({
  events,
}: TodayGamesSectionProps) {
  const groupedEvents = groupEventsBySport(events);

  return (
    <section className="space-y-10">
      <div>
        <h2 className="text-4xl font-bold">
          Today&apos;s Games
        </h2>

        <p className="mt-2 text-slate-600">
          Moneyline odds grouped by sport
        </p>
      </div>

      {Object.entries(groupedEvents).map(([sportTitle, sportEvents]) => (
        <div key={sportTitle} className="space-y-5">
          <h3 className="border-b-2 border-black pb-3 text-3xl font-bold">
            {sportTitle}
          </h3>

          <div className="grid gap-6 lg:grid-cols-2">
            {sportEvents.map((event) => (
              <EventOddsCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}