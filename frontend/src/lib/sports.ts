
export interface SportConfig {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

function filterSports(sports: SportConfig[]) {
  return sports.filter((sport) => {
    const lowerKey = sport.key.toLowerCase();
    return (
      sport.active &&
      !sport.has_outrights &&
      !lowerKey.includes("outrights") &&
      !lowerKey.includes("winner")
    );
  });
}

export async function getSportsList(): Promise<SportConfig[]> {
  const response = await fetch(`${backendUrl}/sports`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sports metadata");
  }

  const data = (await response.json()) as SportConfig[];
  return filterSports(data);
}

