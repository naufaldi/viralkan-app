import {
  AlertTriangle,
  Camera,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";
import { Card, CardContent } from "@repo/ui/components/ui/card";

interface ExifWarningProps {
  isVisible: boolean;
  hasGpsData?: boolean;
  isExtracting?: boolean;
}

/**
 * EXIF Status Component following the civic monochrome design system
 * Shows professional status indicators for GPS metadata processing
 */
export const ExifWarning = ({
  isVisible,
  hasGpsData = false,
  isExtracting = false,
}: ExifWarningProps) => {
  if (!isVisible) return null;

  // Success state - GPS data found
  if (hasGpsData) {
    return (
      <Card className="border-green-200 bg-green-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-700" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800">
                Data Lokasi GPS Ditemukan
              </h4>
              <p className="text-sm text-green-700">
                Koordinat lokasi telah diekstrak dari foto dan akan mengisi form
                secara otomatis. Data GPS membantu akurasi lokasi laporan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processing state
  if (isExtracting) {
    return (
      <Card className="border-neutral-200 bg-neutral-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-neutral-600"></div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-neutral-800">
                Mengekstrak Data Lokasi...
              </h4>
              <p className="text-sm text-neutral-600">
                Memproses metadata foto untuk mencari informasi GPS dan lokasi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Warning state - No GPS data
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <XCircle className="h-4 w-4 text-amber-700" />
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="mb-1 font-semibold text-amber-800">
                Tidak Ada Data GPS
              </h4>
              <p className="text-sm text-amber-700">
                Foto tidak memiliki data lokasi GPS. Ini normal untuk foto yang
                dikirim melalui aplikasi atau media sosial karena metadata GPS
                dihapus otomatis.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <span className="text-amber-700">
                  <strong className="font-medium">
                    Gunakan tombol lokasi:
                  </strong>{" "}
                  Klik "Gunakan Lokasi Saat Ini" untuk mengisi koordinat
                  otomatis
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Camera className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <span className="text-amber-700">
                  <strong className="font-medium">Tips:</strong> Untuk GPS
                  otomatis, ambil foto langsung dari kamera dengan lokasi aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
