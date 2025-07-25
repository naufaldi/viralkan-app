import { AlertTriangle, Camera, MapPin } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";

interface ExifWarningProps {
  error: string;
  isVisible: boolean;
}

/**
 * EXIF Warning Component following the monochrome design system
 * Shows user-friendly warnings when GPS metadata is missing from images
 */
export const ExifWarning = ({ error, isVisible }: ExifWarningProps) => {
  if (!isVisible) return null;

  return (
    <Alert variant="warning" className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-yellow-800 font-semibold">
        Tidak Ada Data Lokasi
      </AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p className="mb-3">{error}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Camera className="h-4 w-4 mt-0.5 text-yellow-600" />
            <span>
              <strong>Ambil foto langsung:</strong> Gunakan kamera untuk foto baru dengan GPS aktif
            </span>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-yellow-600" />
            <span>
              <strong>Atau gunakan tombol lokasi:</strong> Klik "Gunakan Lokasi Saat Ini" di bawah untuk mengisi koordinat secara manual
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};