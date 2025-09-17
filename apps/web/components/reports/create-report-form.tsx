"use client";

import { useState, useEffect } from "react";
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
  onSuccess?: (reportId: string) => void;
}

export default function CreateReportForm({ onSuccess }: CreateReportFormProps) {
  // Start with form explicitly disabled
  const [isFormActivated, setIsFormActivated] = useState(false);

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
    hasExifData,
    submitError,
    // Geocoding states
    isGeocodingFromCoords,
    isGeocodingFromAddress,
    lastGeocodingSource,
    geocodingError,
    // Administrative sync states
    syncStatus,
    hasValidMatch,
    confidenceLevel,
    canAutoSelect,
    isProcessingAdminSync,
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

  const handleFormActivation = () => {
    setIsFormActivated(true);
  };

  // Reset form activation when image is removed
  const handleImageRemoveWithReset = () => {
    setIsFormActivated(false);
    handleImageRemove();
  };

  // Set form activation based on existing selected image
  useEffect(() => {
    if (selectedImage && !isFormActivated) {
      setIsFormActivated(true);
    } else if (!selectedImage && isFormActivated) {
      setIsFormActivated(false);
    }
  }, [selectedImage, isFormActivated]);

  const displayError = formError || submitError || undefined;

  // Debug log to see the form activation state
  console.log("🔍 Form Activation Debug:", {
    isFormActivated,
    hasSelectedImage: !!selectedImage,
    selectedImageName: selectedImage?.name,
  });

  return (
    <Card className="overflow-hidden rounded-xl border-neutral-200 shadow-lg hover:translate-0">
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
              onImageRemove={handleImageRemoveWithReset}
              onUploadError={handleImageUploadError}
              onUploadSuccess={handleImageUploadSuccess}
              isUploading={isUploadingImage || isExtractingExif}
              error={uploadError}
              disabled={isLoading}
              onFormActivation={handleFormActivation}
            />

            {/* EXIF Warning - Shows when GPS metadata is missing */}
            <ExifWarning isVisible={hasExifWarning} />

            <ReportFormFields
              form={form}
              disabled={isLoading}
              isFormActivated={isFormActivated}
              selectedImage={selectedImage}
              isGeocodingFromCoords={isGeocodingFromCoords}
              isGeocodingFromAddress={isGeocodingFromAddress}
              lastGeocodingSource={lastGeocodingSource}
              geocodingError={geocodingError}
              onGetAddress={handleGetAddressFromCoordinates}
              onGetCoordinates={handleGetCoordinatesFromAddress}
              onClearGeocodingError={clearGeocodingError}
              hasExifData={hasExifData}
              onGetLocation={getCurrentLocation}
              isGettingLocation={isGettingLocation}
              // Administrative sync props
              syncStatus={syncStatus}
              hasValidMatch={hasValidMatch}
              confidenceLevel={confidenceLevel}
              canAutoSelect={canAutoSelect}
              isProcessingAdminSync={isProcessingAdminSync}
            />

            {/* Primary Action - Following Fitts's Law */}
            <div
              className={`transition-all duration-300 ${
                !isFormActivated
                  ? "pointer-events-none opacity-40"
                  : "opacity-100"
              }`}
            >
              <ReportFormActions
                isLoading={isLoading}
                isUploadingImage={isUploadingImage}
                isUploading={false}
                imageUploadFailed={imageUploadFailed}
                selectedImage={selectedImage}
                disabled={isLoading || !isFormActivated}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
