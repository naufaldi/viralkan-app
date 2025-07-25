import { AlertTriangle, Camera, MapPin } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";

interface ExifWarningProps {
  isVisible: boolean;
}

/**
 * EXIF Warning Component following the monochrome design system
 * Shows user-friendly warnings when GPS metadata is missing from images
 */
export const ExifWarning = ({ isVisible }: ExifWarningProps) => {
  if (!isVisible) return null;

  return (
    <Alert variant="warning" className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-yellow-800 font-semibold">
        Info: Tidak Ada Data GPS
      </AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p className="mb-3">
          Gambar tidak memiliki data lokasi GPS. Ini normal untuk foto yang
          dikirim melalui WhatsApp, Instagram, atau aplikasi lainnya karena
          metadata GPS dihapus otomatis untuk privasi.
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-yellow-600" />
            <span>
              <strong>Gunakan tombol lokasi:</strong> Klik &quot;Gunakan Lokasi
              Saat Ini&quot; di bawah untuk mengisi koordinat otomatis
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Camera className="h-4 w-4 mt-0.5 text-yellow-600" />
            <span>
              <strong>Tips:</strong> Untuk foto dengan GPS otomatis, ambil foto
              langsung dari kamera dengan lokasi aktif
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
