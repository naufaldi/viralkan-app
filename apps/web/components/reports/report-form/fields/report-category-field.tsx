import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { CreateReportInput, REPORT_CATEGORIES } from "../../../../lib/types/api";

interface ReportCategoryFieldProps {
  form: UseFormReturn<CreateReportInput>;
  disabled?: boolean;
  isFormActivated?: boolean;
}

export const ReportCategoryField = ({
  form,
  disabled,
  isFormActivated = false,
}: ReportCategoryFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base font-semibold text-neutral-900">
            Kategori Kerusakan *
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value || undefined}
            disabled={disabled || !isFormActivated}
          >
            <FormControl>
              <SelectTrigger
                size="lg"
                className="border-neutral-300 bg-white focus:border-neutral-600 focus:ring-neutral-600/20"
              >
                <SelectValue placeholder="Pilih kategori kerusakan">
                  {field.value && (
                    <div className="flex flex-col items-start text-left">
                      <div className="font-medium text-neutral-900">
                        {
                          REPORT_CATEGORIES.find(
                            (cat) => cat.value === field.value,
                          )?.label
                        }
                      </div>
                      <div className="text-sm text-neutral-600">
                        {
                          REPORT_CATEGORIES.find(
                            (cat) => cat.value === field.value,
                          )?.description
                        }
                      </div>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent className="border-neutral-200 bg-white shadow-lg">
              {REPORT_CATEGORIES.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="py-3"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-neutral-900">
                      {option.label}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {option.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription className="text-sm text-neutral-600">
            Pilih jenis kerusakan jalan yang paling sesuai dengan kondisi
            yang Anda temukan.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
