import { MapPin } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

interface LocationButtonProps {
  onGetLocation: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const LocationButton = ({
  onGetLocation,
  isLoading,
  disabled,
}: LocationButtonProps) => {
  return (
    <div className="flex justify-center pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onGetLocation}
        disabled={disabled}
        className="h-12 px-6 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-900"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-600 mr-2"></div>
            Mendapatkan Lokasi...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Gunakan Lokasi Saat Ini
          </>
        )}
      </Button>
    </div>
  );
};
