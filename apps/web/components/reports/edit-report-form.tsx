"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Form } from "@repo/ui/components/ui/form";
import {
  ReportFormError,
  ReportFormFields,
  LocationButton,
  ReportFormActions,
} from "./report-form";
import { useEditReportForm } from "../../hooks/reports/use-edit-report-form";
import EditImageUpload from "./edit-image-upload";
import type { ReportWithUser } from "../../lib/types/api";

interface EditReportFormProps {
  report: ReportWithUser | undefined;
  onSuccess?: (reportId: string) => void;
}

export default function EditReportForm({
  report,
  onSuccess,
}: EditReportFormProps) {
  const { form, onSubmit, isLoading } = useEditReportForm({
    report,
    onSuccess,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Set existing image URL when report data is available
  useEffect(() => {
    if (report?.image_url) {
      setExistingImageUrl(report.image_url);
    }
  }, [report]);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setImageUploadFailed(false);
    const dummyUrl = "https://picsum.photos/800/600?random=1";
    form.setValue("image_url", dummyUrl);
    setUploadError(undefined);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImageUploadFailed(false);
    form.setValue("image_url", "");
    setUploadError(undefined);
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
    setImageUploadFailed(true);
  };

  const handleImageUploadSuccess = () => {
    setUploadError(undefined);
    setImageUploadFailed(false);
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    // Check if we're in the browser environment
    if (typeof window === "undefined") {
      setUploadError("Geolokasi tidak tersedia di server");
      setIsGettingLocation(false);
      return;
    }

    if (!navigator.geolocation) {
      setUploadError("Geolokasi tidak didukung di browser ini");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("lat", latitude, { shouldValidate: true });
        form.setValue("lon", longitude, { shouldValidate: true });
        setIsGettingLocation(false);
      },
      (error) => {
        setUploadError("Gagal mendapatkan lokasi: " + error.message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  return (
    <Card className="overflow-hidden rounded-xl border-neutral-200 shadow-lg hover:translate-0">
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Edit Laporan
            </h2>
            <p className="text-neutral-600">
              Perbarui informasi laporan kerusakan jalan
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 lg:p-8">
        <ReportFormError error={form.formState.errors.root?.message} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("❌ Form validation errors:", errors);
            })}
            className="space-y-6"
          >
            <EditImageUpload
              existingImageUrl={existingImageUrl}
              selectedImage={selectedImage}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              onUploadError={handleImageUploadError}
              onUploadSuccess={handleImageUploadSuccess}
              isUploading={isUploadingImage}
              error={uploadError}
              disabled={isLoading}
            />

            <ReportFormFields form={form} disabled={isLoading} />

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
