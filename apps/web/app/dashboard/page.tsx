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
import Header from "../../components/layout/header";
import { getUserReportsAction } from "../../lib/auth-actions";
import { ReportsTable } from "../../components/dashboard/reports-table";

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


  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-16">
          <div className="flex items-center gap-8 mb-6">
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl font-semibold bg-neutral-100">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                Selamat datang, {user.name}!
              </h1>
              <p className="text-lg text-neutral-600 mb-4">
                Dashboard untuk memantau kontribusi Anda di Viralkan
              </p>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-neutral-100 text-neutral-800 px-3 py-1"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Kontributor Aktif
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Bergabung{" "}
                  {new Date(user.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                  })}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                  Total Laporan
                </CardTitle>
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <FileText className="h-5 w-5 text-neutral-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-neutral-900 mb-2">
                  {stats.total_reports}
                </div>
                <p className="text-sm text-neutral-500">
                  Laporan yang telah Anda buat
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                  Bulan Ini
                </CardTitle>
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-neutral-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-neutral-900 mb-2">
                  {stats.reports_this_month}
                </div>
                <p className="text-sm text-neutral-500">
                  Laporan di bulan{" "}
                  {new Date().toLocaleDateString("id-ID", { month: "long" })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                  Terakhir Lapor
                </CardTitle>
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-neutral-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-4xl font-bold text-neutral-900 mb-2">
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
                <p className="text-sm text-neutral-500">
                  {stats.last_report_date
                    ? `${Math.floor((Date.now() - new Date(stats.last_report_date).getTime()) / (1000 * 60 * 60 * 24))} hari lalu`
                    : "Buat laporan pertama Anda"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-neutral-900 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Buat Laporan Baru
                  </h3>
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    Laporkan kerusakan jalan yang Anda temukan
                  </p>
                  <Button
                    asChild
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2"
                  >
                    <Link href="/laporan/buat">Mulai Lapor</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Eye className="h-8 w-8 text-neutral-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Lihat Laporan Anda
                  </h3>
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    Pantau status dan respons dari laporan Anda
                  </p>
                  <Button asChild variant="outline" className="border-neutral-300 px-6 py-2">
                    <Link href="/laporan?filter=my-reports">Lihat Laporan</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-neutral-900">
                  Laporan Terbaru Saya
                </CardTitle>
                <CardDescription className="text-lg text-neutral-600 mt-2">
                  Kelola dan pantau status laporan yang telah Anda buat
                </CardDescription>
              </div>
              <Button variant="outline" asChild className="border-neutral-300 px-6">
                <Link href="/laporan?filter=my-reports">Lihat Semua</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <ReportsTable data={userReports} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
