import { CreateReportInput } from "../lib/types/api";

export const cleanFormData = (data: CreateReportInput): CreateReportInput => {
  return {
    ...data,
    lat: data.lat || undefined,
    lon: data.lon || undefined,
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
