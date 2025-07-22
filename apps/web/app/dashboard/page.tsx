import { requireAuth, getUserStats } from "../../lib/auth-server";
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
  Plus,
  MapPin,
  Calendar,
  TrendingUp,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/layout/header";
import { getUserReportsAction } from "../../lib/auth-actions";

interface Report {
  id: number;
  title: string;
  category: string;
  status: string;
  created_at: string;
  image_url?: string;
  street_name?: string;
}

// interface DashboardStats {
//   user_total_reports: number;
//   platform_total_reports: number;
//   user_reports_this_month: number;
//   platform_reports_this_month: number;
// }

export default async function DashboardPage() {
  // Server-side auth check using Hono /verify
  const user = await requireAuth();
  const stats = await getUserStats();

  // Fetch user reports with server action
  let userReports: Report[] = [];
  try {
    userReports = await getUserReportsAction(new URLSearchParams("limit=6"));
  } catch (error) {
    console.error("Error fetching user reports:", error);
    userReports = [];
  }

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Selamat datang, {user.name}!
              </h1>
              <p className="text-neutral-600">
                Dashboard untuk memantau kontribusi Anda di Viralkan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary-100 text-primary-700"
            >
              <MapPin className="mr-1 h-3 w-3" />
              Kontributor Aktif
            </Badge>
            <Badge variant="outline">
              Bergabung{" "}
              {new Date(user.created_at).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
              })}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Laporan
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary-600">
                  {stats.total_reports}
                </div>
                <p className="text-xs text-muted-foreground">
                  Laporan yang telah Anda buat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {stats.reports_this_month}
                </div>
                <p className="text-xs text-muted-foreground">
                  Laporan di bulan{" "}
                  {new Date().toLocaleDateString("id-ID", { month: "long" })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Terakhir Lapor
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neutral-700">
                  {stats.last_report_date
                    ? new Date(stats.last_report_date).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )
                    : "Belum ada"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.last_report_date
                    ? `${Math.floor((Date.now() - new Date(stats.last_report_date).getTime()) / (1000 * 60 * 60 * 24))} hari lalu`
                    : "Buat laporan pertama Anda"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    Buat Laporan Baru
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    Laporkan kerusakan jalan yang Anda temukan
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <Link href="/laporan/buat">Mulai Lapor</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-neutral-50 to-neutral-100 border-neutral-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-600 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    Lihat Laporan Anda
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    Pantau status dan respons dari laporan Anda
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/laporan?filter=my-reports">Lihat Laporan</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Laporan Terbaru Saya</CardTitle>
                <CardDescription>
                  Daftar 6 laporan terbaru yang telah Anda buat
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/laporan?filter=my-reports">Lihat Semua</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {userReports.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Belum ada laporan</p>
                <p className="text-sm mb-4">
                  Mulai buat laporan untuk melihat aktivitas Anda disini
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
      </main>
    </div>
  );
}
