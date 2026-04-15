// DEV ONLY — generates ~400 reports with realistic distribution

import { faker } from "@faker-js/faker";
import { bekasiStreets } from "./bekasi-streets";
import { bekasiHotspots, bekasiBoundingBox } from "./bekasi-hotspots";
import type { Hotspot } from "./bekasi-hotspots";

export interface SeedReport {
  user_id: string;
  image_url: string;
  category: string;
  street_name: string;
  location_text: string;
  lat: number;
  lon: number;
  status: string;
  verified_at: Date | null;
  verified_by: string | null;
  rejection_reason: string | null;
  deleted_at: Date | null;
  created_at: Date;
}

type ReportCategory = "berlubang" | "retak" | "lainnya";
type ReportStatus = "verified" | "pending" | "rejected" | "deleted";

const rejectionReasons = [
  "Foto tidak jelas",
  "Lokasi sudah diperbaiki",
  "Laporan duplikat",
  "Lokasi tidak ditemukan",
  "Foto tidak menunjukkan kerusakan jalan",
  "Koordinat tidak sesuai lokasi laporan",
];

/** Box-Muller transform for Gaussian random number with zero mean, unit variance */
const gaussianRandom = (): number => {
  const u1 = faker.number.float({ min: Number.EPSILON, max: 1 });
  const u2 = faker.number.float({ min: 0, max: 1 });
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

/** Generate a lat/lon near a hotspot center using Gaussian spread */
const hotspotCoord = (hotspot: Hotspot): { lat: number; lon: number } => ({
  lat: hotspot.lat + gaussianRandom() * hotspot.sigma,
  lon: hotspot.lon + gaussianRandom() * hotspot.sigma,
});

/** Generate a scattered coordinate within Bekasi bounding box */
const scatteredCoord = (): { lat: number; lon: number } => ({
  lat: faker.number.float({
    min: bekasiBoundingBox.latMin,
    max: bekasiBoundingBox.latMax,
  }),
  lon: faker.number.float({
    min: bekasiBoundingBox.lonMin,
    max: bekasiBoundingBox.lonMax,
  }),
});

/** Pick a category based on 60/30/10 distribution */
const pickCategory = (): ReportCategory => {
  const roll = faker.number.float({ min: 0, max: 1 });
  if (roll < 0.6) return "berlubang";
  if (roll < 0.9) return "retak";
  return "lainnya";
};

/** Pick a status based on 55/25/15/5 distribution */
const pickStatus = (): ReportStatus => {
  const roll = faker.number.float({ min: 0, max: 1 });
  if (roll < 0.55) return "verified";
  if (roll < 0.8) return "pending";
  if (roll < 0.95) return "rejected";
  return "deleted";
};

/**
 * Generate a created_at date: 70% in last 90 days, 30% in days 91–365.
 * Also ensures ~15–25 reports are in the current month.
 */
const pickCreatedAt = (forceCurrentMonth: boolean): Date => {
  if (forceCurrentMonth) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return faker.date.between({ from: startOfMonth, to: now });
  }

  const now = new Date();
  const roll = faker.number.float({ min: 0, max: 1 });

  if (roll < 0.7) {
    // Last 90 days
    const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return faker.date.between({ from, to: now });
  } else {
    // Days 91–365
    const from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const to = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return faker.date.between({ from, to });
  }
};

// Report counts per user based on Zipf-style distribution
// Admin user (index 0) gets 0 reports
// Users 1–5: 30–40 each
// Users 6–10: 15–25 each
// Users 11–20: 5–12 each
// Users 21–29: 1–3 each
const getReportCountForUser = (userIndex: number): number => {
  if (userIndex === 0) return 0;
  if (userIndex <= 5) return faker.number.int({ min: 30, max: 40 });
  if (userIndex <= 10) return faker.number.int({ min: 15, max: 25 });
  if (userIndex <= 20) return faker.number.int({ min: 5, max: 12 });
  return faker.number.int({ min: 1, max: 3 });
};

/**
 * Generates seed reports distributed across users.
 * @param userIds - Array of 30 user UUIDs (index 0 = admin)
 * @param adminId - The admin user UUID for verified_by references
 */
export const generateReports = (
  userIds: string[],
  adminId: string,
): SeedReport[] => {
  const reports: SeedReport[] = [];
  let reportIndex = 0;

  // Assign each user a "home" hotspot (deterministic via index)
  const userHotspots = userIds.map(
    (_, i) => bekasiHotspots[i % bekasiHotspots.length],
  );

  // Track how many reports we need in the current month
  // We'll force ~20 reports (middle of 15–25 range) into current month
  const currentMonthTarget = 20;
  let currentMonthCount = 0;

  for (let userIndex = 0; userIndex < userIds.length; userIndex++) {
    const userId = userIds[userIndex];
    if (!userId) continue;

    const count = getReportCountForUser(userIndex);
    const userHotspot = userHotspots[userIndex];

    for (let j = 0; j < count; j++) {
      reportIndex++;
      const shortId = reportIndex;

      const category = pickCategory();
      const status = pickStatus();

      // Determine geographic location
      const useHotspot = faker.number.float({ min: 0, max: 1 }) < 0.85;
      const coords =
        useHotspot && userHotspot
          ? hotspotCoord(userHotspot)
          : scatteredCoord();

      // Pick street name
      const streetName =
        bekasiStreets[
          faker.number.int({ min: 0, max: bekasiStreets.length - 1 })
        ] ?? "Jl. Raya Bekasi";

      // Build location_text
      const districtName =
        useHotspot && userHotspot ? userHotspot.district : "Bekasi";
      const locationText = `${streetName}, ${districtName}, Kota Bekasi`;

      // Force some into current month to meet dashboard stats requirement
      const forceCurrentMonth =
        currentMonthCount < currentMonthTarget &&
        faker.number.float({ min: 0, max: 1 }) < 0.08;

      if (forceCurrentMonth) currentMonthCount++;

      const createdAt = pickCreatedAt(forceCurrentMonth);

      // Verified fields
      let verifiedAt: Date | null = null;
      let verifiedBy: string | null = null;
      if (status === "verified") {
        const hoursOffset = faker.number.int({ min: 1, max: 7 * 24 });
        verifiedAt = new Date(
          createdAt.getTime() + hoursOffset * 60 * 60 * 1000,
        );
        verifiedBy = adminId;
      }

      // Rejection reason
      const rejectionReason =
        status === "rejected"
          ? (rejectionReasons[
              faker.number.int({ min: 0, max: rejectionReasons.length - 1 })
            ] ?? "Laporan duplikat")
          : null;

      // Deleted fields
      const deletedAt = status === "deleted" ? new Date() : null;

      reports.push({
        user_id: userId,
        image_url: `https://picsum.photos/seed/${shortId}/800/600`,
        category,
        street_name: streetName,
        location_text: locationText,
        lat: coords.lat,
        lon: coords.lon,
        status,
        verified_at: verifiedAt,
        verified_by: verifiedBy,
        rejection_reason: rejectionReason,
        deleted_at: deletedAt,
        created_at: createdAt,
      });
    }
  }

  return reports;
};
