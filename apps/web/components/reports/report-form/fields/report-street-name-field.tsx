import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import {
  useReportFormContext,
  useLocationContext,
  useReportFormActionsContext,
} from "../report-form-context";

export const ReportStreetNameField = () => {
  const { form, isLoading, isFormActivated } = useReportFormContext();
  const { isGeocodingFromCoords, lastGeocodingSource } = useLocationContext();
  const { clearGeocodingError } = useReportFormActionsContext();
  const disabled = isLoading;

  return (
    <FormField
      control={form.control}
      name="street_name"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="flex items-center gap-2 text-base font-semibold text-neutral-900">
            Nama Jalan *
            {isGeocodingFromCoords && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
            {lastGeocodingSource === "coordinates" && (
              <MapPin className="h-4 w-4 text-green-600" />
            )}
          </FormLabel>
          <FormControl>
            <Input
              placeholder="Contoh: Jl. Sudirman"
              disabled={disabled || isGeocodingFromCoords || !isFormActivated}
              size="lg"
              className={`border-neutral-300 transition-all duration-200 focus:border-neutral-600 focus:ring-neutral-600/20 ${
                lastGeocodingSource === "coordinates"
                  ? "border-green-300 bg-green-50/30"
                  : isFormActivated
                    ? "bg-white hover:border-neutral-400"
                    : "cursor-not-allowed bg-neutral-100"
              }`}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                clearGeocodingError();
              }}
            />
          </FormControl>
          <FormDescription className="text-sm text-neutral-600">
            Nama jalan atau area tempat kerusakan berada (maksimal 255
            karakter).
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
