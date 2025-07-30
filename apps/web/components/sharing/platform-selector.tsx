"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { MessageCircle, Twitter, Facebook, AtSign, Send } from "lucide-react";

export const PLATFORMS = [
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    color: "text-green-600",
    supportsPrefill: true,
  },
  {
    value: "twitter",
    label: "Twitter/X",
    icon: Twitter,
    color: "text-blue-500",
    supportsPrefill: true,
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    supportsPrefill: false,
  },
  {
    value: "threads",
    label: "Threads",
    icon: AtSign,
    color: "text-purple-600",
    supportsPrefill: false,
  },
  {
    value: "telegram",
    label: "Telegram",
    icon: Send,
    color: "text-blue-400",
    supportsPrefill: true,
  },
] as const;

export type Platform = (typeof PLATFORMS)[number]["value"];

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

export function PlatformSelector({
  selectedPlatform,
  onPlatformChange,
}: PlatformSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-neutral-900">
        Pilih Platform Media Sosial
      </Label>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.value;

          return (
            <Button
              key={platform.value}
              variant={isSelected ? "default" : "outline"}
              className={`flex h-auto flex-col items-center gap-2 px-3 py-4 transition-all duration-200 ${
                isSelected
                  ? "border-neutral-800 bg-neutral-800 text-white"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
              onClick={() => onPlatformChange(platform.value)}
            >
              <Icon
                className={`h-6 w-6 ${isSelected ? "text-white" : platform.color}`}
              />
              <span className="text-sm font-medium">{platform.label}</span>
              {!platform.supportsPrefill && (
                <span className="text-xs opacity-75">Copy-paste</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
