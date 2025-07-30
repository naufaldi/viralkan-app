import { MapPin } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

interface LocationButtonProps {
  onGetLocation: () => void;
  isLoading: boolean;
  disabled?: boolean;
  isFormActivated?: boolean;
}

export const LocationButton = ({
  onGetLocation,
  isLoading,
  disabled,
  isFormActivated = true,
}: LocationButtonProps) => {
  return (
    <div className="flex flex-col items-center space-y-3 pt-4">
      {/* Contextual Help Text */}
      <div className="max-w-md text-center">
        <p className="mb-2 text-sm text-neutral-600">
          📍 <strong>Lokasi tidak ditemukan dalam foto</strong>
        </p>
        <p className="text-xs text-neutral-500">
          Klik tombol di bawah untuk menggunakan lokasi perangkat Anda secara
          otomatis
        </p>
      </div>

      {/* Primary Location Button */}
      <Button
        type="button"
        onClick={onGetLocation}
        disabled={disabled || !isFormActivated}
        className={`h-12 px-8 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
          isFormActivated
            ? "border-neutral-900 bg-neutral-900 text-white hover:border-neutral-800 hover:bg-neutral-800"
            : "cursor-not-allowed border-neutral-200 bg-neutral-200 text-neutral-400"
        }`}
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            Mendapatkan Lokasi...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Gunakan Lokasi Saat Ini
          </>
        )}
      </Button>

      {/* Fallback Hint */}
      {isFormActivated && !isLoading && (
        <p className="text-center text-xs text-neutral-500">
          Atau isi koordinat secara manual di bawah ini
        </p>
      )}
    </div>
  );
};
