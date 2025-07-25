"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Card } from "@repo/ui/components/ui/card";
import {
  Search,
  Plus,
  Users,
  AlertTriangle,
  TrendingUp,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface ReportsHeroProps {
  stats: {
    totalReports: number;
    thisWeek: number;
    today: number;
    byCategory: {
      berlubang: number;
      retak: number;
      lainnya: number;
    };
  };
  searchQuery: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
}

export function ReportsHero({
  stats,
  searchQuery,
  onSearchChange,
  isLoading = false,
}: ReportsHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      // Handle search with URL params when no handler provided
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to first page when searching
      router.push(`/laporan?${params.toString()}`);
    }
  };
  return (
    <section className="bg-gradient-to-b from-neutral-50 to-background border-b border-neutral-200">
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 lg:mb-12 gap-4 lg:gap-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-neutral-100 text-neutral-700 border-neutral-200 px-3 py-1 rounded-md"
              >
                <Users className="mr-2 h-3 w-3" />
                Laporan Komunitas
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1 sm:w-80 h-12">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Cari berdasarkan lokasi atau nama jalan..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-background border-neutral-200 focus:border-neutral-800 focus:ring-neutral-800/12 rounded-md "
                  size="lg"
                />
              </div>
              <Button
                size="lg"
                className="px-6 bg-neutral-800 hover:bg-neutral-900 text-white rounded-md"
                asChild
              >
                <Link href="/laporan/buat">
                  <Plus className="mr-2 h-4 w-4" />
                  Laporkan Jalan Rusak
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
                  Laporan Jalan Rusak
                  <span className="block text-neutral-600 text-xl sm:text-2xl lg:text-3xl font-normal mt-2">
                    dari Masyarakat Bekasi
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                  &ldquo;Dari masyarakat, untuk masyarakat&rdquo; — Platform
                  komunitas untuk melaporkan dan berbagi informasi kerusakan
                  jalan di seluruh Indonesia.
                </p>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 pt-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-neutral-900">
                    {isLoading ? "..." : `${stats.totalReports}+`}
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-600">
                    Total Laporan
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-neutral-900">
                    {isLoading ? "..." : stats.thisWeek}
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-600">
                    Minggu Ini
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-neutral-900">
                    {isLoading ? "..." : stats.today}
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-600">
                    Hari Ini
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-4 sm:p-6 text-center border-neutral-200 rounded-lg shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">
                  {isLoading ? "..." : stats.byCategory.berlubang}
                </div>
                <div className="text-xs sm:text-sm text-neutral-600">
                  Jalan Berlubang
                </div>
              </Card>

              <Card className="p-4 sm:p-6 text-center border-neutral-200 rounded-lg shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-600" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">
                  {isLoading ? "..." : stats.byCategory.retak}
                </div>
                <div className="text-xs sm:text-sm text-neutral-600">
                  Jalan Retak
                </div>
              </Card>

              <Card className="p-4 sm:p-6 text-center col-span-2 border-neutral-200 rounded-lg shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-600" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">
                  {isLoading ? "..." : stats.byCategory.lainnya}
                </div>
                <div className="text-xs sm:text-sm text-neutral-600">
                  Masalah Lainnya
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
