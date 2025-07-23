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
import { AlertCircle, MapPin, Send, FileText, CheckCircle, Upload } from "lucide-react";
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
      lat: undefined,
      lon: undefined,
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

      // Clean up form data - convert empty strings to undefined for optional fields
      const cleanedData = {
        ...data,
        image_url: uploadResult.data.imageUrl,
        lat: data.lat || undefined, // Convert 0, null, empty string to undefined
        lon: data.lon || undefined,
      };

      console.log("Submitting report with cleaned data:", cleanedData);
      await submitReport(cleanedData, selectedImage);
      
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
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      // Show loading state
      toast.loading("Mendapatkan lokasi...", {
        id: "location",
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          form.setValue("lat", lat);
          form.setValue("lon", lon);
          
          // Show success message
          toast.success("Lokasi berhasil diperoleh", {
            id: "location",
            description: `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`,
            duration: 3000,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          
          // Show error message
          let errorMessage = "Gagal mendapatkan lokasi";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Izin lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Informasi lokasi tidak tersedia.";
              break;
            case error.TIMEOUT:
              errorMessage = "Waktu permintaan lokasi habis.";
              break;
          }
          
          toast.error(errorMessage, {
            id: "location",
            duration: 5000,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      toast.error("Browser Anda tidak mendukung geolokasi", {
        duration: 3000,
      });
    }
    
    setIsGettingLocation(false);
  };

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const isLoading = isSubmitting || isUploading || isUploadingImage || isGettingLocation;

  console.log("About to render CreateReportForm");

  return (
    <Card className="border-neutral-200 shadow-lg rounded-xl overflow-hidden hover:translate-0 ">
      <CardHeader className="bg-neutral-25 border-b border-neutral-200 px-6 py-6">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-neutral-900 tracking-tight">
          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center border border-neutral-200">
            <FileText className="h-5 w-5 text-neutral-700" />
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">Bagikan Kondisi Jalan Rusak</div>
            <div className="text-sm font-normal text-neutral-600 mt-1">
              Bantu komunitas menghindari jalan rusak dan tingkatkan kesadaran publik
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 lg:p-8">
        {/* Form Error Alert - shown at top */}
        {(formError || submitError) && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800 font-medium">
              {formError || submitError}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("❌ Form validation errors:", errors);
            })}
            className="space-y-6"
          >
            {/* Image Upload Section - Full Width */}
            <div className="space-y-3">
              <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <Upload className="h-4 w-4 text-neutral-600" />
                Foto Jalan Rusak *
              </FormLabel>
              <ImageUpload
                selectedImage={selectedImage}
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                isUploading={isUploadingImage}
                error={uploadError}
                disabled={isLoading}
              />
              <p className="text-sm text-neutral-600">
                Unggah foto yang jelas untuk membantu komunitas mengidentifikasi lokasi jalan rusak.
              </p>
            </div>

            {/* Form Fields Grid - Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-neutral-900">
                      Kategori Kerusakan *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger size="lg" className="border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 bg-white">
                          <SelectValue placeholder="Pilih kategori kerusakan">
                            {field.value && (
                              <div className="flex flex-col items-start text-left">
                                <div className="font-medium text-neutral-900">
                                  {REPORT_CATEGORIES.find(cat => cat.value === field.value)?.label}
                                </div>
                                <div className="text-sm text-neutral-600">
                                  {REPORT_CATEGORIES.find(cat => cat.value === field.value)?.description}
                                </div>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-neutral-200 shadow-lg bg-white">
                        {REPORT_CATEGORIES.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="py-3">
                            <div className="space-y-1">
                              <div className="font-medium text-neutral-900">{option.label}</div>
                              <div className="text-sm text-neutral-600">
                                {option.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm text-neutral-600">
                      Pilih jenis kerusakan jalan yang paling sesuai dengan kondisi yang Anda temukan.
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
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-neutral-900">
                      Nama Jalan *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Jl. Sudirman"
                        disabled={isLoading}
                        size="lg"
                        className="border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-neutral-600">
                      Nama jalan atau area tempat kerusakan berada (maksimal 255 karakter).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Description - Full Width */}
            <FormField
              control={form.control}
              name="location_text"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold text-neutral-900">
                    Deskripsi Lokasi *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Depan Mall Tunjungan Plaza, sebelah kiri arah Surabaya"
                      rows={4}
                      disabled={isLoading}
                      className="border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 resize-none bg-white min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-neutral-600">
                    Deskripsi detail lokasi kerusakan jalan untuk memudahkan komunitas menemukan lokasi (maksimal 500 karakter).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Latitude and Longitude Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-neutral-900">
                      Latitude
                    </FormLabel>
                    <FormControl>
                                             <Input
                         type="number"
                         step="any"
                         placeholder="Contoh: -7.260000"
                         disabled={isLoading}
                         size="lg"
                         className="border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 bg-white"
                         {...field}
                         onChange={(e) => {
                           const value = e.target.value;
                           // Convert empty string to undefined, otherwise parse as number
                           field.onChange(value === "" ? undefined : parseFloat(value));
                         }}
                         value={field.value || ""}
                       />
                    </FormControl>
                    <FormDescription className="text-sm text-neutral-600">
                      Koordinat latitude lokasi kerusakan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lon"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold text-neutral-900">
                      Longitude
                    </FormLabel>
                    <FormControl>
                                             <Input
                         type="number"
                         step="any"
                         placeholder="Contoh: 112.780000"
                         disabled={isLoading}
                         size="lg"
                         className="border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 bg-white"
                         {...field}
                         onChange={(e) => {
                           const value = e.target.value;
                           // Convert empty string to undefined, otherwise parse as number
                           field.onChange(value === "" ? undefined : parseFloat(value));
                         }}
                         value={field.value || ""}
                       />
                    </FormControl>
                    <FormDescription className="text-sm text-neutral-600">
                      Koordinat longitude lokasi kerusakan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Location Button - Centered */}
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="h-12 px-6 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-900"
              >
                {isGettingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-600 mr-2"></div>
                    Mendapatkan Lokasi...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Gunakan Lokasi Saat Ini
                  </>
                )}
              </Button>
            </div>

            {/* Submit Button - Full Width */}
            <Button
              type="submit"
              size="default"
              className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-base rounded-lg transition-all duration-150 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
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
                  Bagikan Laporan
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
