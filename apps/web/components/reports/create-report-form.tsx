"use client";

import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Form } from "@repo/ui/components/ui/form";
import {
  ReportFormHeader,
  ReportFormError,
  ReportImageUpload,
  ReportFormActions,
  ExifWarning,
} from "./report-form";
import { ReportForm } from "./report-form/report-form";
import { ReportResponse } from "@/lib/types/api";
import {
  useReportFormContext,
  useImageContext,
  useReportFormActionsContext,
} from "./report-form/report-form-context";

interface CreateReportFormProps {
  onSuccess?: (reportId: string) => void;
  initialData?: ReportResponse;
  isEditing?: boolean;
}

interface CreateReportFormContentProps {
  isEditing?: boolean;
  initialImageUrl?: string;
}

function CreateReportFormContent({
  isEditing = false,
  initialImageUrl,
}: CreateReportFormContentProps) {
  const { form, formError, isLoading, isFormActivated, submitError } =
    useReportFormContext();
  const {
    selectedImage,
    uploadError,
    imageUploadFailed,
    isUploadingImage,
    isExtractingExif,
    hasExifWarning,
    hasExifData,
  } = useImageContext();
  const {
    handleImageSelect,
    handleImageRemove,
    handleImageUploadError,
    handleImageUploadSuccess,
    onSubmit,
  } = useReportFormActionsContext();

  const displayError = formError || submitError || undefined;

  const handleFormActivation = () => {
    // Form activation is now handled in context
  };

  return (
    <Card className="overflow-hidden rounded-xl border-neutral-200 shadow-lg hover:translate-0">
      <ReportFormHeader
        title={isEditing ? "Edit Laporan" : "Buat Laporan Baru"}
      />

      <CardContent className="p-6 lg:p-8">
        <ReportFormError error={displayError} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("❌ Form validation errors:", errors);
            })}
            className="space-y-6"
          >
            <div className="space-y-3">
              <p className="text-sm font-semibold text-neutral-900">
                Unggah Foto
              </p>
              <ReportImageUpload
                selectedImage={selectedImage}
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                onUploadError={handleImageUploadError}
                onUploadSuccess={handleImageUploadSuccess}
                isUploading={isUploadingImage || isExtractingExif}
                error={uploadError}
                disabled={isLoading}
                onFormActivation={handleFormActivation}
                initialImageUrl={initialImageUrl}
              />
              <ExifWarning
                isVisible={hasExifWarning || hasExifData || isExtractingExif}
                hasGpsData={hasExifData}
                isExtracting={isExtractingExif}
              />
            </div>

            <ReportForm.Fields />

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

export default function CreateReportForm({
  onSuccess,
  initialData,
  isEditing = false,
}: CreateReportFormProps) {
  return (
    <ReportForm
      onSuccess={onSuccess}
      initialData={initialData}
      isEditing={isEditing}
    >
      <CreateReportFormContent
        isEditing={isEditing}
        initialImageUrl={initialData?.image_url}
      />
    </ReportForm>
  );
}
