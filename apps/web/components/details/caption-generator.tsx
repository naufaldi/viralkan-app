"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { RefreshCw, Copy, Check } from "lucide-react";
import { ToneType } from "./tone-selector";

interface CaptionGeneratorProps {
  tone: ToneType;
  reportData: {
    streetName: string;
    district: string;
    city: string;
    province: string;
    category: string;
    createdAt: string;
  };
  value: string;
  onChange: (caption: string) => void;
  platform?: "twitter" | "facebook" | "instagram" | "whatsapp" | "telegram";
  disabled?: boolean;
}

export function CaptionGenerator({
  tone,
  reportData,
  value,
  onChange,
  platform = "twitter",
  disabled = false,
}: CaptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const getPlatformCharacterLimit = (platformType: string): number => {
    switch (platformType) {
      case "twitter":
        return 280;
      case "instagram":
        return 2200;
      case "facebook":
        return 63206;
      case "whatsapp":
        return 1000;
      case "telegram":
        return 4096;
      default:
        return 280;
    }
  };

  const characterLimit = getPlatformCharacterLimit(platform);
  const remainingChars = characterLimit - value.length;
  const isOverLimit = remainingChars < 0;

  const getCategoryLabel = (category: string): string => {
    const categories = {
      berlubang: "jalan berlubang",
      retak: "jalan retak",
      lainnya: "kerusakan jalan",
    };
    return categories[category as keyof typeof categories] || "kerusakan jalan";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generateCaption = (): string => {
    const { streetName, district, city, province, category, createdAt } =
      reportData;
    const categoryLabel = getCategoryLabel(category);
    const formattedDate = formatDate(createdAt);
    const location = `${streetName}, ${district}, ${city}, ${province}`;

    const templates = {
      formal: `Ditemukan ${categoryLabel} di ${location}. Mohon perhatian pemerintah daerah untuk segera melakukan perbaikan infrastruktur jalan. Laporan telah dibuat melalui aplikasi Viralkan pada ${formattedDate}. #ViralkanJalan #InfrastrukturJalan #${city.replace(/\s+/g, "")}`,

      urgent: `🚨 URGENT! ${categoryLabel.toUpperCase()} di ${streetName}, ${district} membahayakan pengendara! Sudah berapa lama kondisi seperti ini dibiarkan? Kapan diperbaiki? @pemkot @dinas_pu #DaruriatJalan #FixOurRoads #${city.replace(/\s+/g, "")}`,

      community: `Warga ${district} butuh bantuan! ${categoryLabel} di ${streetName} mengganggu aktivitas sehari-hari. Mari bersama-sama meminta perbaikan kepada pemerintah daerah 🙏 #CommunityAction #GotongRoyong #ViralkanJalan #${city.replace(/\s+/g, "")}`,

      sarcastic: `${streetName} di ${district} sudah seperti kubangan. Mungkin pemerintah lagi sibuk yang lain ya? 😅 Semoga jalan ini masuk prioritas perbaikan tahun ini... atau tahun depan... atau entah kapan 🤷‍♂️ #IroniInfrastruktur #${city.replace(/\s+/g, "")}`,

      informative: `📊 DATA KERUSAKAN JALAN:\n📍 Lokasi: ${location}\n🚧 Kategori: ${categoryLabel}\n📅 Dilaporkan: ${formattedDate}\n\nButuh tindakan segera dari pihak berwenang untuk keselamatan pengguna jalan. #DataTransparency #ViralkanJalan #OpenData #${city.replace(/\s+/g, "")}`,
    };

    return templates[tone] || templates.formal;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Simulate generation delay for better UX
    setTimeout(() => {
      const generated = generateCaption();
      onChange(generated);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy caption:", error);
    }
  };

  // Auto-generate when tone changes
  useEffect(() => {
    if (value === "" || value === generateCaption()) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tone]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label
            htmlFor="caption-generator"
            className="text-sm font-medium text-neutral-900"
          >
            Caption Media Sosial
          </Label>
          <p className="text-xs text-neutral-600 mt-1">
            Caption otomatis berdasarkan gaya bahasa yang dipilih
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || disabled}
            className="text-xs"
          >
            <RefreshCw
              className={`h-3 w-3 mr-1 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "Membuat..." : "Buat Ulang"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!value || disabled}
            className="text-xs"
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3 mr-1 text-green-600" />
                Tersalin
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Salin
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Textarea
          id="caption-generator"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Caption akan dibuat otomatis berdasarkan gaya bahasa..."
          className={`min-h-[120px] text-sm ${
            isOverLimit ? "border-red-300 focus:border-red-500" : ""
          }`}
        />

        <div className="flex justify-between items-center text-xs">
          <span
            className={`${isOverLimit ? "text-red-600" : "text-neutral-500"}`}
          >
            {remainingChars} karakter tersisa untuk{" "}
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </span>

          {isOverLimit && (
            <span className="text-red-600 font-medium">
              Melebihi batas {Math.abs(remainingChars)} karakter
            </span>
          )}
        </div>
      </div>

      {/* Platform-specific tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800 font-medium mb-1">
          Tips untuk {platform.charAt(0).toUpperCase() + platform.slice(1)}:
        </p>
        <p className="text-xs text-blue-700">
          {platform === "twitter" &&
            "Gunakan hashtag yang relevan dan mention akun pemerintah untuk jangkauan lebih luas."}
          {platform === "facebook" &&
            "Caption panjang diperbolehkan. Tambahkan pertanyaan untuk meningkatkan engagement."}
          {platform === "instagram" &&
            "Gunakan hashtag populer dan emoji untuk meningkatkan visibilitas."}
          {platform === "whatsapp" &&
            "Pesan singkat dan jelas lebih efektif untuk sharing grup."}
          {platform === "telegram" &&
            "Format markdown didukung untuk styling teks yang lebih menarik."}
        </p>
      </div>
    </div>
  );
}
