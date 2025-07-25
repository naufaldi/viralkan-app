import { Button } from "@repo/ui/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

interface GetAddressButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  isValidCoordinates: boolean;
}

export function GetAddressButton({
  onClick,
  isLoading,
  disabled = false,
  isValidCoordinates,
}: GetAddressButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading || !isValidCoordinates}
      className="w-full sm:w-auto border-neutral-300 text-neutral-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <MapPin className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Mencari Alamat..." : "Dapatkan Alamat"}
    </Button>
  );
} 