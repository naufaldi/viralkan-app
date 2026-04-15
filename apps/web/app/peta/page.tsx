import Header from "components/layout/header";
import { MapClientWrapper } from "./map-client-wrapper";
import type { MapReport } from "../../lib/maps/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const isValidMapReport = (
  item: unknown,
): item is {
  id: string;
  lat: number;
  lon: number;
  category: "berlubang" | "retak" | "lainnya";
  street_name: string;
  image_url: string;
  created_at: string;
} =>
  item !== null &&
  typeof item === "object" &&
  "lat" in item &&
  "lon" in item &&
  item.lat !== null &&
  item.lon !== null &&
  typeof (item as Record<string, unknown>).lat === "number" &&
  typeof (item as Record<string, unknown>).lon === "number";

const toMapReport = (item: {
  id: string;
  lat: number;
  lon: number;
  category: "berlubang" | "retak" | "lainnya";
  street_name: string;
  image_url: string;
  created_at: string;
}): MapReport => ({
  id: item.id,
  lat: item.lat,
  lon: item.lon,
  category: item.category,
  street_name: item.street_name,
  image_url: item.image_url,
  created_at: item.created_at,
});

const fetchMapReports = async (): Promise<MapReport[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports?limit=1000`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = await response.json();
    const items: unknown[] = Array.isArray(data?.items) ? data.items : [];
    return items.filter(isValidMapReport).map(toMapReport);
  } catch {
    return [];
  }
};

export default async function PetaPage() {
  const reports = await fetchMapReports();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main>
        <MapClientWrapper reports={reports} />
      </main>
    </div>
  );
}
