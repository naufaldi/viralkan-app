"use client";

import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Form } from "@repo/ui/components/ui/form";
import {
  ReportFormHeader,
  ReportFormError,
  ReportImageUpload,
  ReportFormFields,
  LocationButton,
  ReportFormActions,
  ExifWarning,
  useReportForm,
} from "./report-form";

interface CreateReportFormProps {
  onSuccess?: (reportId: number) => void;
}

export default function CreateReportForm({ onSuccess }: CreateReportFormProps) {
  const {
    form,
    selectedImage,
    uploadError,
    formError,
    imageUploadFailed,
    isLoading,
    isGettingLocation,
    isUploadingImage,
    isExtractingExif,
    hasExifWarning,
    submitError,
    // Geocoding states
    isGeocodingFromCoords,
    isGeocodingFromAddress,
    lastGeocodingSource,
    geocodingError,
    // Handlers
    handleImageSelect,
    handleImageRemove,
    handleImageUploadError,
    handleImageUploadSuccess,
    getCurrentLocation,
    handleGetAddressFromCoordinates,
    handleGetCoordinatesFromAddress,
    clearGeocodingError,
    onSubmit,
  } = useReportForm({ onSuccess });

  const displayError = formError || submitError || undefined;

  return (
    <Card className="border-neutral-200 shadow-lg rounded-xl overflow-hidden hover:translate-0">
      <ReportFormHeader />

      <CardContent className="p-6 lg:p-8">
        <ReportFormError error={displayError} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("❌ Form validation errors:", errors);
            })}
            className="space-y-6"
          >
            <ReportImageUpload
              selectedImage={selectedImage}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              onUploadError={handleImageUploadError}
              onUploadSuccess={handleImageUploadSuccess}
              isUploading={isUploadingImage || isExtractingExif}
              error={uploadError}
              disabled={isLoading}
            />

            {/* EXIF Warning - Shows when GPS metadata is missing */}
            <ExifWarning isVisible={hasExifWarning} />

            <ReportFormFields
              form={form}
              disabled={isLoading}
              isGeocodingFromCoords={isGeocodingFromCoords}
              isGeocodingFromAddress={isGeocodingFromAddress}
              lastGeocodingSource={lastGeocodingSource}
              geocodingError={geocodingError}
              onGetAddress={handleGetAddressFromCoordinates}
              onGetCoordinates={handleGetCoordinatesFromAddress}
              onClearGeocodingError={clearGeocodingError}
            />

            <LocationButton
              onGetLocation={getCurrentLocation}
              isLoading={isGettingLocation}
              disabled={isLoading}
            />

            <ReportFormActions
              isLoading={isLoading}
              isUploadingImage={isUploadingImage}
              isUploading={false}
              imageUploadFailed={imageUploadFailed}
              selectedImage={selectedImage}
              disabled={isLoading}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
