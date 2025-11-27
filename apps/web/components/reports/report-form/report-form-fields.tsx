import { ReportCategoryField } from "./fields/report-category-field";
import { ReportStreetNameField } from "./fields/report-street-name-field";
import { ReportAddressFields } from "./fields/report-address-fields";
import { ReportLocationFields } from "./fields/report-location-fields";
import { useReportFormContext } from "./report-form-context";
import type { UseFormReturn } from "react-hook-form";
import type { CreateReportInput } from "../../../lib/types/api";

interface ReportFormFieldsProps {
  form?: UseFormReturn<CreateReportInput>;
  disabled?: boolean;
}

export const ReportFormFields = ({
  form,
  disabled = false,
}: ReportFormFieldsProps) => {
  const context = useReportFormContext();
  const isFormActivated = form ? !disabled : context.isFormActivated;

  return (
    <div className="space-y-6">
      {/* Row 1: Category and Street Name */}
      <div
        className={`grid grid-cols-1 gap-6 transition-all duration-300 lg:grid-cols-2 ${
          !isFormActivated ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        <ReportCategoryField form={form} />
        <ReportStreetNameField form={form} />
      </div>

      {/* Row 2: Administrative Fields (Province, City, District) */}
      <div
        className={`transition-all duration-300 ${
          !isFormActivated ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        <ReportAddressFields form={form} />
      </div>

      {/* Row 3: Location Description and Coordinates */}
      <ReportLocationFields form={form} />
    </div>
  );
};
