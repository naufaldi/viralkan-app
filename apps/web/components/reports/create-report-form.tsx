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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { ReportResponse } from "@/lib/types/api";

interface CreateReportFormProps {
  onSuccess?: (reportId: string) => void;
  initialData?: ReportResponse;
  isEditing?: boolean;
}

export default function CreateReportForm({ onSuccess, initialData, isEditing = false }: CreateReportFormProps) {
  // Start with form explicitly disabled
  const [isFormActivated, setIsFormActivated] = useState(isEditing);
  const [activeTab, setActiveTab] = useState("auto"); // "auto" or "manual"

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
  } = useReportForm({ onSuccess, initialData, isEditing });

  const handleFormActivation = () => {
    setIsFormActivated(true);
  };

  // Reset form activation when image is removed
  const handleImageRemoveWithReset = () => {
    setIsFormActivated(false);
    handleImageRemove();
  };

  // Set form activation based on existing selected image or editing mode
  useEffect(() => {
    if (isEditing) {
      setIsFormActivated(true);
    } else if (selectedImage && !isFormActivated) {
      setIsFormActivated(true);
    } else if (!selectedImage && !isEditing && isFormActivated) {
      setIsFormActivated(false);
    }
  }, [selectedImage, isFormActivated, isEditing]);

  const displayError = formError || submitError || undefined;

  // Debug log to see the form activation state
  console.log("🔍 Form Activation Debug:", {
    isFormActivated,
    hasSelectedImage: !!selectedImage,
    selectedImageName: selectedImage?.name,
  });

  return (
    <Card className="overflow-hidden rounded-xl border-neutral-200 shadow-lg hover:translate-0">
      <ReportFormHeader title={isEditing ? "Edit Laporan" : "Buat Laporan Baru"} />

      <CardContent className="p-6 lg:p-8">
        <ReportFormError error={displayError} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("❌ Form validation errors:", errors);
            })}
            className="space-y-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="auto">Foto & Lokasi Otomatis</TabsTrigger>
                <TabsTrigger value="manual">Foto & Alamat Manual</TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
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
                  initialImageUrl={initialData?.image_url}
                />

                {/* EXIF Warning - Shows when GPS metadata is missing (Only in Auto mode) */}
                <div className={activeTab === "auto" ? "block" : "hidden"}>
                  <ExifWarning isVisible={hasExifWarning} />
                </div>

                <TabsContent value="auto" className="mt-4">
                  <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
                    <p>Mode ini akan mencoba mengambil lokasi dari GPS foto atau lokasi perangkat Anda secara otomatis.</p>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="mt-4">
                  <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-700">
                    <p>Mode ini memungkinkan Anda mengisi alamat secara manual. Koordinat akan dicari berdasarkan alamat yang Anda masukkan.</p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

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
              // Pass active tab to control field visibility/behavior if needed
              mode={activeTab as "auto" | "manual"}
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
                isEditing={isEditing}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
