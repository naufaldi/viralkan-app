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
      <div className="text-center max-w-md">
        <p className="text-sm text-neutral-600 mb-2">
          📍 <strong>Lokasi tidak ditemukan dalam foto</strong>
        </p>
        <p className="text-xs text-neutral-500">
          Klik tombol di bawah untuk menggunakan lokasi perangkat Anda secara otomatis
        </p>
      </div>

      {/* Primary Location Button */}
      <Button
        type="button"
        onClick={onGetLocation}
        disabled={disabled || !isFormActivated}
        className={`h-12 px-8 font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
          isFormActivated
            ? "bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900 hover:border-neutral-800"
            : "bg-neutral-200 text-neutral-400 border-neutral-200 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        <p className="text-xs text-neutral-500 text-center">
          Atau isi koordinat secara manual di bawah ini
        </p>
      )}
    </div>
  );
};
