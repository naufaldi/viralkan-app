"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useTones, type Tone } from "@/hooks/use-tones";

// Re-export for backward compatibility
export type { Tone };

interface ToneSelectorProps {
  selectedTone: Tone;
  onToneChange: (tone: Tone) => void;
}

export function ToneSelector({
  selectedTone,
  onToneChange,
}: ToneSelectorProps) {
  const { data: tones, isLoading, error, isError } = useTones();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-neutral-900">
          Pilih Nada Caption
        </Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !tones) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-neutral-900">
          Pilih Nada Caption
        </Label>
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div className="text-sm text-red-700">
            Gagal memuat pilihan tone. Silakan refresh halaman.
            {error && (
              <div className="mt-1 text-xs text-red-600">
                Error:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-neutral-900">
        Pilih Nada Caption
      </Label>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {tones.map((tone) => {
          const isSelected = selectedTone === tone.value;

          return (
            <Button
              key={tone.value}
              variant={isSelected ? "default" : "outline"}
              className={`flex h-auto flex-col items-start gap-1 px-4 py-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-neutral-800 bg-neutral-800 text-white"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
              onClick={() => onToneChange(tone.value as Tone)}
            >
              <span className="font-medium">{tone.label}</span>
              <span
                className={`text-xs ${isSelected ? "text-neutral-200" : "text-neutral-500"}`}
              >
                {tone.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
