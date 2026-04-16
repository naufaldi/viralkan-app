// DEV ONLY — 5 hotspot centers for Bekasi geographic clustering

export interface Hotspot {
  name: string;
  district: string;
  lat: number;
  lon: number;
  sigma: number;
}

export const bekasiHotspots: Hotspot[] = [
  {
    name: "Harapan Indah",
    district: "Medan Satria",
    lat: -6.1661,
    lon: 107.0108,
    sigma: 0.008,
  },
  {
    name: "Bekasi Timur",
    district: "Bekasi Timur",
    lat: -6.2349,
    lon: 107.0017,
    sigma: 0.008,
  },
  {
    name: "Bekasi Utara",
    district: "Bekasi Utara",
    lat: -6.1862,
    lon: 106.9804,
    sigma: 0.008,
  },
  {
    name: "Cikarang",
    district: "Cikarang Pusat",
    lat: -6.2646,
    lon: 107.1421,
    sigma: 0.008,
  },
  {
    name: "Summarecon",
    district: "Bekasi Selatan",
    lat: -6.2146,
    lon: 106.9833,
    sigma: 0.008,
  },
];

// Bekasi bounding box for scattered reports
export const bekasiBoundingBox = {
  latMin: -6.35,
  latMax: -6.1,
  lonMin: 106.85,
  lonMax: 107.2,
};
