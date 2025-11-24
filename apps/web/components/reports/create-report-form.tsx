"use client";

import { useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
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
  mode: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
}

function CreateReportFormContent({
  isEditing = false,
  initialImageUrl,
  mode,
  onModeChange,
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
    <Card className="hover:translate-0 overflow-hidden rounded-xl border-neutral-200 shadow-lg">
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
            <Tabs
              value={mode}
              onValueChange={(value) =>
                onModeChange(value as "auto" | "manual")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="auto">Foto & Lokasi Otomatis</TabsTrigger>
                <TabsTrigger value="manual">Foto & Alamat Manual</TabsTrigger>
              </TabsList>

              <div className="mt-6">
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

                {/* EXIF Warning - Shows when GPS metadata is missing (Only in Auto mode) */}
                <div className={mode === "auto" ? "block" : "hidden"}>
                  <ExifWarning isVisible={hasExifWarning} />
                </div>

                <TabsContent value="auto" className="mt-4">
                  <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
                    <p>
                      Mode ini akan mencoba mengambil lokasi dari GPS foto atau
                      lokasi perangkat Anda secara otomatis.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="mt-4">
                  <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-700">
                    <p>
                      Mode ini memungkinkan Anda mengisi alamat secara manual.
                      Koordinat akan dicari berdasarkan alamat yang Anda
                      masukkan.
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

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
  const [activeTab, setActiveTab] = useState<"auto" | "manual">("auto");

  return (
    <ReportForm
      onSuccess={onSuccess}
      initialData={initialData}
      isEditing={isEditing}
      mode={activeTab}
    >
      <CreateReportFormContent
        isEditing={isEditing}
        initialImageUrl={initialData?.image_url}
        mode={activeTab}
        onModeChange={(mode) => setActiveTab(mode)}
      />
    </ReportForm>
  );
}
