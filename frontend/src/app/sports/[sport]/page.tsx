
import { notFound } from "next/navigation";
import SportOddsPage from "@/components/SportOddsPage";
import { getSportsList } from "@/lib/sports";

interface SportPageProps {
  params: Promise<{
    sport: string;
  }>;
}

export async function generateStaticParams() {
  const sportsList = await getSportsList();
  return sportsList.map((sport) => ({ sport: sport.key }));
}

export default async function SportPage({ params }: SportPageProps) {
  const resolvedParams = await params;
  const sportsList = await getSportsList();
  const sport = sportsList.find((item) => item.key === resolvedParams.sport);

  if (!sport) {
    return notFound();
  }

  return (
    <SportOddsPage
      sportKey={sport.key}
      sportTitle={sport.title}
      description={sport.description}
    />
  );
}
