"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Label } from "@repo/ui/components/ui/label";

export type ToneType =
  | "formal"
  | "urgent"
  | "community"
  | "sarcastic"
  | "informative";

interface ToneSelectorProps {
  value: ToneType;
  onChange: (tone: ToneType) => void;
  disabled?: boolean;
}

const toneOptions = [
  {
    value: "formal" as ToneType,
    label: "Formal",
    description: "Bahasa resmi dan sopan untuk pemerintah",
    example: "Mohon perhatian pemerintah daerah untuk perbaikan...",
  },
  {
    value: "urgent" as ToneType,
    label: "Mendesak",
    description: "Menekankan urgensi dan bahaya",
    example: "🚨 URGENT! Jalan rusak parah membahayakan pengendara!",
  },
  {
    value: "community" as ToneType,
    label: "Komunitas",
    description: "Mengajak partisipasi warga sekitar",
    example: "Warga butuh bantuan! Mari bersama minta perbaikan 🙏",
  },
  {
    value: "sarcastic" as ToneType,
    label: "Sarkastik",
    description: "Sindiran halus untuk menarik perhatian",
    example: "Jalan sudah seperti kubangan. Pemerintah sibuk ya? 😅",
  },
  {
    value: "informative" as ToneType,
    label: "Informatif",
    description: "Menyajikan data dan fakta objektif",
    example: "Data kerusakan: Kategori berlubang - Dilaporkan: [tanggal]",
  },
];

export function ToneSelector({
  value,
  onChange,
  disabled = false,
}: ToneSelectorProps) {
  const selectedTone = toneOptions.find((option) => option.value === value);

  return (
    <div className="space-y-3">
      <div>
        <Label
          htmlFor="tone-selector"
          className="text-sm font-medium text-neutral-900"
        >
          Gaya Bahasa
        </Label>
        <p className="text-xs text-neutral-600 mt-1">
          Pilih gaya komunikasi untuk caption media sosial
        </p>
      </div>

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="tone-selector" className="w-full">
          <SelectValue placeholder="Pilih gaya bahasa..." />
        </SelectTrigger>
        <SelectContent>
          {toneOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected tone preview - Enhanced information display */}
      {selectedTone && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-neutral-900 mb-1">
              {selectedTone.label}
            </h4>
            <p className="text-xs text-neutral-600">
              {selectedTone.description}
            </p>
          </div>
          
          <div className="pt-2 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 mb-2 font-medium">
              Contoh caption:
            </p>
            <p className="text-sm text-neutral-800 italic bg-white rounded border border-neutral-200 p-3">
              &ldquo;{selectedTone.example}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
