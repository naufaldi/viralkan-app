"use client";

import { useState, useEffect } from "react";
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
import { AlertCircle, MapPin, Send, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "../forms/image-upload";
import { useCreateReport } from "../../hooks/use-create-report";
import { uploadImage } from "../../services/upload";
import { useAuth } from "../../hooks/useAuth";
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const { getToken, isAuthenticated } = useAuth();

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

  // Clear form errors when user starts typing
  const watchedValues = form.watch();
  useEffect(() => {
    if (formError) {
      setFormError(undefined);
    }
  }, [watchedValues, formError]);

  const handleImageSelect = (file: File) => {
    console.log("handleImageSelect called with file:", file);
    setSelectedImage(file);
    // Set a valid dummy image URL for form validation (same as our uploadImage service)
    const dummyUrl = "https://picsum.photos/800/600?random=1";
    form.setValue("image_url", dummyUrl);
    console.log("Set form image_url to:", dummyUrl);
    setUploadError(undefined);
    setFormError(undefined);
    clearError();
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    form.setValue("image_url", "");
    setUploadError(undefined);
    setFormError(undefined);
  };

  const onSubmit = async (data: CreateReportInput) => {
    console.log("🎉 onSubmit function called with data:", data);
    console.log("selectedImage in onSubmit:", selectedImage);

    // Clear any previous errors
    setFormError(undefined);
    setUploadError(undefined);

    if (!selectedImage) {
      console.log("No image selected, showing error");
      setFormError("Silakan pilih foto jalan rusak terlebih dahulu");
      return;
    }

    if (!isAuthenticated) {
      setFormError("Silakan login terlebih dahulu");
      return;
    }

    try {
      // Upload image first
      setIsUploadingImage(true);
      clearError();

      console.log("Starting image upload...");
      const token = await getToken();
      if (!token) {
        setFormError("Gagal mendapatkan token autentikasi");
        return;
      }
      
      const uploadResult = await uploadImage(selectedImage, token);

      if (!uploadResult.success || !uploadResult.data) {
        console.error("Upload failed:", uploadResult.error);
        setFormError(uploadResult.error?.message || "Gagal mengunggah foto");
        return;
      }

      console.log("Image uploaded successfully:", uploadResult.data);

      // Show success toast for image upload
      toast.success("Foto berhasil diunggah", {
        description: "Sedang membuat laporan...",
        icon: <CheckCircle className="h-4 w-4" />,
      });

      // Update form data with uploaded image URL
      const reportData = {
        ...data,
        image_url: uploadResult.data.imageUrl,
      };

      console.log("Submitting report with uploaded image:", reportData);
      await submitReport(reportData, selectedImage);
      
      // Show success toast for report creation
      toast.success("Laporan berhasil dibuat!", {
        description: "Terima kasih telah melaporkan kerusakan jalan",
        icon: <CheckCircle className="h-4 w-4" />,
        duration: 5000,
      });

    } catch (error) {
      console.error("Submit error:", error);
      setFormError("Terjadi kesalahan saat membuat laporan");
      
      // Show error toast as well
      toast.error("Gagal membuat laporan", {
        description: "Silakan coba lagi beberapa saat",
      });
    } finally {
      setIsUploadingImage(false);
    }
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

  const isLoading = isSubmitting || isUploading || isUploadingImage;

  console.log("About to render CreateReportForm");

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-neutral-200 shadow-card rounded-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-neutral-900 tracking-tight">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center border border-primary-100">
              <FileText className="h-5 w-5 text-primary-600" />
            </div>
            Buat Laporan Jalan Rusak
          </CardTitle>
          <p className="text-base text-neutral-600 mt-2">
            Laporkan kondisi jalan rusak untuk membantu perbaikan infrastruktur
          </p>
        </CardHeader>
        <CardContent>
          {/* Form Error Alert - shown at top */}
          {(formError || submitError) && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError || submitError}</AlertDescription>
            </Alert>
          )}

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
                  isUploading={isUploadingImage}
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

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-md transition-all duration-150 shadow-sm hover:shadow-md"
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
                    {isUploadingImage
                      ? "Mengunggah Foto..."
                      : isUploading
                        ? "Mengunggah..."
                        : "Membuat Laporan..."}
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
