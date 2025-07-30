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
    <section className="to-background border-b border-neutral-200 bg-gradient-to-b from-neutral-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* Top Bar */}
          <div className="mb-10 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="rounded-md border-neutral-200 bg-neutral-100 px-3 py-1 text-neutral-700"
              >
                <Users className="mr-2 h-3 w-3" />
                Laporan Komunitas
              </Badge>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative h-12 flex-1 sm:w-80">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-neutral-500" />
                <Input
                  placeholder="Cari berdasarkan lokasi atau nama jalan..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="bg-background rounded-md border-neutral-200 pl-10 focus:border-neutral-800 focus:ring-neutral-800/12"
                  size="lg"
                />
              </div>
              <Button
                size="lg"
                className="rounded-md bg-neutral-800 px-6 text-white hover:bg-neutral-900"
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
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                  Laporan Jalan Rusak
                  <span className="mt-2 block text-xl font-normal text-neutral-600 sm:text-2xl lg:text-3xl">
                    dari Masyarakat Bekasi
                  </span>
                </h1>
                <p className="text-base leading-relaxed text-neutral-600 sm:text-lg">
                  &ldquo;Dari masyarakat, untuk masyarakat&rdquo; — Platform
                  komunitas untuk melaporkan dan berbagi informasi kerusakan
                  jalan di seluruh Indonesia.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-neutral-900 sm:text-2xl">
                    {isLoading ? "..." : `${stats.totalReports}+`}
                  </div>
                  <div className="text-xs text-neutral-600 sm:text-sm">
                    Total Laporan
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-neutral-900 sm:text-2xl">
                    {isLoading ? "..." : stats.thisWeek}
                  </div>
                  <div className="text-xs text-neutral-600 sm:text-sm">
                    Minggu Ini
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-neutral-900 sm:text-2xl">
                    {isLoading ? "..." : stats.today}
                  </div>
                  <div className="text-xs text-neutral-600 sm:text-sm">
                    Hari Ini
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="rounded-lg border-neutral-200 p-4 text-center shadow-sm sm:p-6">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 sm:h-12 sm:w-12">
                  <AlertTriangle className="h-5 w-5 text-red-600 sm:h-6 sm:w-6" />
                </div>
                <div className="mb-1 text-xl font-bold text-neutral-900 sm:text-2xl">
                  {isLoading ? "..." : stats.byCategory.berlubang}
                </div>
                <div className="text-xs text-neutral-600 sm:text-sm">
                  Jalan Berlubang
                </div>
              </Card>

              <Card className="rounded-lg border-neutral-200 p-4 text-center shadow-sm sm:p-6">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-12 sm:w-12">
                  <TrendingUp className="h-5 w-5 text-neutral-600 sm:h-6 sm:w-6" />
                </div>
                <div className="mb-1 text-xl font-bold text-neutral-900 sm:text-2xl">
                  {isLoading ? "..." : stats.byCategory.retak}
                </div>
                <div className="text-xs text-neutral-600 sm:text-sm">
                  Jalan Retak
                </div>
              </Card>

              <Card className="col-span-2 rounded-lg border-neutral-200 p-4 text-center shadow-sm sm:p-6">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-12 sm:w-12">
                  <MapPin className="h-5 w-5 text-neutral-600 sm:h-6 sm:w-6" />
                </div>
                <div className="mb-1 text-xl font-bold text-neutral-900 sm:text-2xl">
                  {isLoading ? "..." : stats.byCategory.lainnya}
                </div>
                <div className="text-xs text-neutral-600 sm:text-sm">
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
