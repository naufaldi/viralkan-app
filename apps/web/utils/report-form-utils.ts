import { CreateReportInput } from "../lib/types/api";

export const cleanFormData = (data: CreateReportInput): CreateReportInput => {
  const normalizeCoordinate = (value: unknown): number | null => {
    if (typeof value !== "number") return null;
    if (!Number.isFinite(value)) return null;
    return value;
  };

  return {
    ...data,
    lat: normalizeCoordinate(data.lat),
    lon: normalizeCoordinate(data.lon),
  };
};

export const getLocationErrorMessage = (
  error: GeolocationPositionError,
): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Izin lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.";
    case error.POSITION_UNAVAILABLE:
      return "Informasi lokasi tidak tersedia.";
    case error.TIMEOUT:
      return "Waktu permintaan lokasi habis.";
    default:
      return "Gagal mendapatkan lokasi";
  }
};

export const geolocationOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};
