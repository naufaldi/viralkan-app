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
import { ReportsTable } from "../../components/dashboard/reports-table";
import { requireAuth, getUserStats } from "../../lib/auth-server";
import { getUserReportsAction } from "../../lib/auth-actions";

export default async function DashboardPage() {
  // Server-side authentication check
  const user = await requireAuth();

  // Server-side data fetching
  let userReports: any[] = [];
  let stats: any = null;

  try {
    // Fetch user reports with limit for dashboard
    const searchParams = new URLSearchParams("limit=6");
    const reportsData = await getUserReportsAction(searchParams);

    // Transform API data to match ReportsTable expected format
    userReports = (reportsData?.items || []).map((report: any) => ({
      ...report,
      title: report.street_name, // Use street_name as title
      status: report.status || "pending", // Use actual status from API
    }));
  } catch (error) {
    console.error("Error fetching user reports:", error);
    userReports = []; // Fallback to empty array
  }

  try {
    // Fetch user stats
    stats = await getUserStats();
  } catch (error) {
    console.error("Error fetching user stats:", error);
    stats = null; // Fallback to null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="container mx-auto max-w-7xl px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-16">
          <div className="mb-6 flex items-center gap-8">
            <Avatar className="h-24 w-24 shadow-lg ring-4 ring-white">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="bg-neutral-100 text-2xl font-semibold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-bold text-neutral-900">
                Selamat datang, {user.name}!
              </h1>
              <p className="mb-4 text-lg text-neutral-600">
                Dashboard untuk memantau kontribusi Anda di Viralkan
              </p>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-neutral-100 px-3 py-1 text-neutral-800"
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
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="border-0 shadow-md transition-shadow duration-200 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold tracking-wide text-neutral-600 uppercase">
                Total Laporan
              </CardTitle>
              <div className="rounded-lg bg-neutral-100 p-2">
                <FileText className="h-5 w-5 text-neutral-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-2 text-4xl font-bold text-neutral-900">
                {stats?.total_reports || 0}
              </div>
              <p className="text-sm text-neutral-500">
                Laporan yang telah Anda buat
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md transition-shadow duration-200 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold tracking-wide text-neutral-600 uppercase">
                Bulan Ini
              </CardTitle>
              <div className="rounded-lg bg-neutral-100 p-2">
                <TrendingUp className="h-5 w-5 text-neutral-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-2 text-4xl font-bold text-neutral-900">
                {stats?.reports_this_month || 0}
              </div>
              <p className="text-sm text-neutral-500">
                Laporan di bulan{" "}
                {new Date().toLocaleDateString("id-ID", { month: "long" })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md transition-shadow duration-200 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold tracking-wide text-neutral-600 uppercase">
                Terakhir Lapor
              </CardTitle>
              <div className="rounded-lg bg-neutral-100 p-2">
                <Calendar className="h-5 w-5 text-neutral-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-2 text-4xl font-bold text-neutral-900">
                {stats?.last_report_date
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
                {stats?.last_report_date
                  ? `${Math.floor((Date.now() - new Date(stats.last_report_date).getTime()) / (1000 * 60 * 60 * 24))} hari lalu`
                  : "Buat laporan pertama Anda"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="border-0 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-900 shadow-lg">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-neutral-900">
                    Buat Laporan Baru
                  </h3>
                  <p className="mb-4 leading-relaxed text-neutral-600">
                    Laporkan kerusakan jalan yang Anda temukan
                  </p>
                  <Button
                    asChild
                    className="bg-neutral-900 px-6 py-2 text-white hover:bg-neutral-800"
                  >
                    <Link href="/laporan/buat">Mulai Lapor</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100 shadow-sm">
                  <Eye className="h-8 w-8 text-neutral-700" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-neutral-900">
                    Lihat Laporan Anda
                  </h3>
                  <p className="mb-4 leading-relaxed text-neutral-600">
                    Pantau status dan respons dari laporan Anda
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-neutral-300 px-6 py-2"
                  >
                    <Link href="#my-reports">Lihat Laporan</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports Section */}
        <Card className="border-0 shadow-lg" id="my-reports">
          <CardHeader className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-neutral-900">
                  Laporan Terbaru Saya
                </CardTitle>
                <CardDescription className="mt-2 text-lg text-neutral-600">
                  Kelola dan pantau status laporan yang telah Anda buat
                </CardDescription>
              </div>
              <Button
                variant="outline"
                asChild
                className="border-neutral-300 px-6"
              >
                <Link href="/laporan">Lihat Semua</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {userReports.length > 0 ? (
              <ReportsTable data={userReports} />
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <p className="mb-4 text-neutral-600">Belum ada laporan</p>
                <Button asChild>
                  <Link href="/laporan/buat">Buat Laporan Pertama</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
