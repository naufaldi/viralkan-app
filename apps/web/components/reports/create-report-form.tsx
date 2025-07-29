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
  onSuccess?: (reportId: number) => void;
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
  console.log('🔍 Form Activation Debug:', {
    isFormActivated,
    hasSelectedImage: !!selectedImage,
    selectedImageName: selectedImage?.name,
  });

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
            />

            <div className={`transition-all duration-300 ${
              !isFormActivated ? 'opacity-40 pointer-events-none' : 'opacity-100'
            }`}>
              <LocationButton
                onGetLocation={getCurrentLocation}
                isLoading={isGettingLocation}
                disabled={isLoading || !isFormActivated}
              />
            </div>

            <div className={`transition-all duration-300 ${
              !isFormActivated ? 'opacity-40 pointer-events-none' : 'opacity-100'
            }`}>
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
