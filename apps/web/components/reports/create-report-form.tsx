"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { AlertCircle, MapPin, Send, FileText } from "lucide-react";
import ImageUpload from "../forms/image-upload";
import { useCreateReport } from "../../hooks/use-create-report";
import {
  CreateReportSchema,
  CreateReportInput,
  REPORT_CATEGORIES,
} from "../../lib/types/api";

interface CreateReportFormProps {
  onSuccess?: (reportId: number) => void;
}

export default function CreateReportForm({ onSuccess }: CreateReportFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);

  console.log("CreateReportForm rendered, selectedImage:", selectedImage);

  const {
    submitReport,
    isSubmitting,
    isUploading,
    error: submitError,
    clearError,
  } = useCreateReport({
    onSuccess,
  });

  const form = useForm<CreateReportInput>({
    resolver: zodResolver(CreateReportSchema),
    mode: "onChange",
    defaultValues: {
      street_name: "",
      category: undefined,
      location_text: "",
      image_url: "",
    },
  });

  console.log("Form state:", form.formState);
  console.log("Form errors:", form.formState.errors);

  const handleImageSelect = (file: File) => {
    console.log("handleImageSelect called with file:", file);
    setSelectedImage(file);
    // Set a valid dummy image URL for form validation (same as our uploadImage service)
    const dummyUrl = "https://picsum.photos/800/600?random=1";
    form.setValue("image_url", dummyUrl);
    console.log("Set form image_url to:", dummyUrl);
    setUploadError(undefined);
    clearError();
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    form.setValue("image_url", "");
    setUploadError(undefined);
  };

  const onSubmit = async (data: CreateReportInput) => {
    console.log("🎉 onSubmit function called with data:", data);
    console.log("selectedImage in onSubmit:", selectedImage);

    if (!selectedImage) {
      console.log("No image selected, showing error");
      setUploadError("Silakan pilih foto jalan rusak terlebih dahulu");
      return;
    }

    console.log("About to submit report with actual API call");
    await submitReport(data, selectedImage);
  };

  // Get current location (optional)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("lat", position.coords.latitude);
          form.setValue("lon", position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Silently fail - geolocation is optional
        },
      );
    }
  };

  const isLoading = isSubmitting || isUploading;

  console.log("About to render CreateReportForm");

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Buat Laporan Jalan Rusak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("❌ Form validation errors:", errors);
              })}
              className="space-y-6"
            >
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900">
                  Foto Jalan Rusak *
                </label>
                <ImageUpload
                  selectedImage={selectedImage}
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  isUploading={isUploading}
                  error={uploadError}
                  disabled={isLoading}
                />
              </div>

              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Kerusakan *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori kerusakan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REPORT_CATEGORIES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-neutral-600">
                                {option.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih jenis kerusakan jalan yang paling sesuai
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Street Name */}
              <FormField
                control={form.control}
                name="street_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Jalan *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Jl. Sudirman"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nama jalan atau area tempat kerusakan berada (maksimal 255
                      karakter)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Description */}
              <FormField
                control={form.control}
                name="location_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Lokasi *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: Depan Mall Tunjungan Plaza, sebelah kiri arah Surabaya"
                        rows={3}
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Deskripsi detail lokasi kerusakan jalan (maksimal 500
                      karakter)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional Location Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Gunakan Lokasi Saat Ini
                </Button>
              </div>

              {/* Submit Error */}
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !selectedImage}
                onClick={() =>
                  console.log(
                    "Submit button clicked, selectedImage:",
                    selectedImage,
                    "isLoading:",
                    isLoading,
                  )
                }
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isUploading ? "Mengunggah..." : "Membuat Laporan..."}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Buat Laporan
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
