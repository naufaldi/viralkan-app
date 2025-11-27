import {
  useReportFormContext,
  useLocationContext,
  useReportFormActionsContext,
} from "../report-form-context";
import { AdministrativeSelect } from "../../administrative-select";
import type { UseFormReturn } from "react-hook-form";
import type { CreateReportInput } from "@/lib/types/api";

interface ReportAddressFieldsProps {
  form?: UseFormReturn<CreateReportInput>;
}

export const ReportAddressFields = ({
  form: formProp,
}: ReportAddressFieldsProps) => {
  const context = useReportFormContext();
  const form = formProp || context.form;
  const { isLoading, isFormActivated } = context;
  const {
    isGeocodingFromCoords,
    lastGeocodingSource,
    syncStatus,
    hasValidMatch,
    confidenceLevel,
    canAutoSelect,
    isProcessingAdminSync,
  } = useLocationContext();
  const { clearGeocodingError } = useReportFormActionsContext();
  const disabled = isLoading;

  return (
    <AdministrativeSelect
      form={form}
      disabled={disabled}
      isFormActivated={isFormActivated}
      isGeocodingFromCoords={isGeocodingFromCoords}
      lastGeocodingSource={lastGeocodingSource}
      onClearGeocodingError={clearGeocodingError}
      enableAutoSync={true}
      showSyncStatus={true}
      syncStatus={syncStatus}
      hasValidMatch={hasValidMatch}
      confidenceLevel={confidenceLevel}
      canAutoSelect={canAutoSelect}
      isProcessingAdminSync={isProcessingAdminSync}
    />
  );
};
