"use client";

import { useAuthContext } from "../../contexts/AuthContext";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import {
  FileText,
  Users,
  Plus,
  MapPin,
  Calendar,
  BarChart3,
} from "lucide-react";
import { StatusCard } from "../../components/dashboard/StatusCard";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface Report {
  id: number;
  title: string;
  category: string;
  status: string;
  created_at: string;
  image_url?: string;
  street_name?: string;
}

interface DashboardStats {
  user_total_reports: number;
  platform_total_reports: number;
  user_reports_this_month: number;
  platform_reports_this_month: number;
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading, backendUser, apiCall } = useAuthContext();
  const router = useRouter();
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [loadingReports, setLoadingReports] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      setLoadingReports(true);

      // Fetch user reports
      const reportsResponse = await apiCall("/api/me/reports");
      if (reportsResponse.ok) {
        const reports = await reportsResponse.json();
        setUserReports(reports);
      }

      // Fetch dashboard stats (user + platform totals)
      const statsResponse = await apiCall("/api/dashboard/stats");
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingReports(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && backendUser) {
      fetchUserData();
    }
  }, [isAuthenticated, isLoading, backendUser, router, fetchUserData]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Menunggu
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Ditinjau
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Selesai
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "berlubang":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Berlubang
          </Badge>
        );
      case "retak":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Retak
          </Badge>
        );
      case "lainnya":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Lainnya
          </Badge>
        );
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading || !backendUser) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Memuat dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={backendUser.avatar_url || undefined}
              alt={backendUser.name}
            />
            <AvatarFallback className="text-lg">
              {backendUser.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Selamat datang, {backendUser.name}!
            </h1>
            <p className="text-neutral-600">
              Dashboard laporan dan kontribusi komunitas
            </p>
          </div>
        </div>

        <Button asChild className="bg-primary-600 hover:bg-primary-700">
          <Link href="/laporan/buat">
            <Plus className="mr-2 h-4 w-4" />
            Buat Laporan Baru
          </Link>
        </Button>
      </div>

      {/* Stats Section */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Laporan Saya"
            value={dashboardStats.user_total_reports}
            description="Total laporan yang telah Anda buat"
            icon={FileText}
            iconColor="text-blue-600"
            trend={{
              value: dashboardStats.user_reports_this_month,
              label: "bulan ini",
              isPositive: dashboardStats.user_reports_this_month > 0,
            }}
          />

          <StatusCard
            title="Total Platform"
            value={dashboardStats.platform_total_reports}
            description="Total laporan di seluruh platform"
            icon={BarChart3}
            iconColor="text-green-600"
            trend={{
              value: dashboardStats.platform_reports_this_month,
              label: "bulan ini",
              isPositive: dashboardStats.platform_reports_this_month > 0,
            }}
          />

          <StatusCard
            title="Kontribusi Saya"
            value={
              dashboardStats.platform_total_reports > 0
                ? `${Math.round(
                    (dashboardStats.user_total_reports /
                      dashboardStats.platform_total_reports) *
                      100,
                  )}%`
                : "0%"
            }
            description="Persentase kontribusi Anda"
            icon={Users}
            iconColor="text-purple-600"
          />

          <StatusCard
            title="Aktivitas Bulan Ini"
            value={dashboardStats.user_reports_this_month}
            description="Laporan baru yang Anda buat"
            icon={Calendar}
            iconColor="text-orange-600"
          />
        </div>
      )}

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Laporan Saya</CardTitle>
              <CardDescription>
                Daftar semua laporan yang telah Anda buat
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/laporan">Lihat Semua</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingReports ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : userReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada laporan
              </h3>
              <p className="text-gray-600 mb-4">
                Anda belum membuat laporan apapun. Mari mulai dengan membuat
                laporan pertama!
              </p>
              <Button asChild>
                <Link href="/laporan/buat">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Laporan Pertama
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userReports.slice(0, 6).map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    {report.image_url && (
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                        <Image
                          src={report.image_url}
                          alt={report.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {report.title || "Laporan Kerusakan Jalan"}
                        </h3>
                        {getStatusBadge(report.status)}
                      </div>

                      <div className="flex items-center gap-2">
                        {getCategoryBadge(report.category)}
                      </div>

                      {report.street_name && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {report.street_name}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.created_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
