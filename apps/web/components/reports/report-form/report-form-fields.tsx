import { MapPin } from "lucide-react";
import { ReportCategoryField } from "./fields/report-category-field";
import { ReportStreetNameField } from "./fields/report-street-name-field";
import { ReportAddressFields } from "./fields/report-address-fields";
import { ReportLocationFields } from "./fields/report-location-fields";
import { useReportFormContext } from "./report-form-context";

export const ReportFormFields = () => {
  const { isFormActivated } = useReportFormContext();
  return (
    <>
      {/* Progressive Activation Notice */}
      {!isFormActivated && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200">
              <MapPin className="h-6 w-6 text-neutral-500" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-neutral-700">
                Formulir akan aktif setelah foto diunggah
              </h3>
              <p className="mx-auto max-w-md text-sm text-neutral-600">
                Unggah foto jalan rusak terlebih dahulu. Sistem akan mengekstrak
                informasi lokasi dari foto untuk mempermudah pengisian formulir.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Row 1: Category and Street Name */}
        <div
          className={`grid grid-cols-1 gap-6 transition-all duration-300 lg:grid-cols-2 ${
            !isFormActivated ? "pointer-events-none opacity-40" : "opacity-100"
          }`}
        >
          <ReportCategoryField />
          <ReportStreetNameField />
        </div>

        {/* Row 2: Administrative Fields (Province, City, District) */}
        <div
          className={`transition-all duration-300 ${
            !isFormActivated ? "pointer-events-none opacity-40" : "opacity-100"
          }`}
        >
          <ReportAddressFields />
        </div>

        {/* Row 3: Location Description and Coordinates */}
        <ReportLocationFields />
      </div>
    </>
  );
};
