import { Button } from "@repo/ui/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

interface GetCoordinatesButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  isValidAddress: boolean;
}

export function GetCoordinatesButton({
  onClick,
  isLoading,
  disabled = false,
  isValidAddress,
}: GetCoordinatesButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading || !isValidAddress}
      className="w-full sm:w-auto border-neutral-300 text-neutral-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <MapPin className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Mencari Koordinat..." : "Dapatkan Koordinat"}
    </Button>
  );
} 