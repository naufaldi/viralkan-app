import {
  useReportFormContext,
  useLocationContext,
  useReportFormActionsContext,
} from "../report-form-context";
import { AdministrativeSelect } from "../../administrative-select";

export const ReportAddressFields = () => {
  const { form, isLoading, isFormActivated } = useReportFormContext();
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
