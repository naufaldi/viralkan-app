import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  AlertTriangle,
  Eye,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-server";
import { AdminReportsTableWrapper } from "@/components/admin";
import { cookies } from "next/headers";

// API Response interface (matches the backend AdminStatsResponseSchema)
interface AdminStatsApiResponse {
  totalReports: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  deletedCount: number;
  totalUsers: number;
  adminUsers: number;
  verificationRate: number; // reports per day
  averageVerificationTime: number; // in hours
  recentActivity: Array<{
    action: string;
    timestamp: string;
    adminUser: string;
  }>;
}

// Frontend Admin statistics interface (current interface)
interface AdminStats {
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  rejectedReports: number;
  deletedReports: number;
  totalUsers: number;
  adminUsers: number;
  verificationRate: number;
  averageResponseTime: string;
  todayActivity: {
    verified: number;
    rejected: number;
    submitted: number;
  };
}

// Helper function to get authentication token from cookies
const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("firebase-token")?.value || null;
};

// Function to call the real admin stats API
const fetchAdminStats = async (): Promise<AdminStatsApiResponse> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store", // Always fetch fresh data
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return response.json();
};

// Function to map API response to frontend interface
const mapApiResponseToFrontend = (
  apiResponse: AdminStatsApiResponse,
): AdminStats => {
  // Calculate today's activity from recent activity
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayActivity = {
    verified: 0,
    rejected: 0,
    submitted: 0,
  };

  // Count today's activities from recent activity
  apiResponse.recentActivity.forEach((activity) => {
    const activityDate = new Date(activity.timestamp);
    if (activityDate >= today) {
      if (activity.action.includes("verify")) {
        todayActivity.verified++;
      } else if (activity.action.includes("reject")) {
        todayActivity.rejected++;
      } else if (activity.action.includes("create")) {
        todayActivity.submitted++;
      }
    }
  });

  return {
    totalReports: apiResponse.totalReports,
    pendingReports: apiResponse.pendingCount,
    verifiedReports: apiResponse.verifiedCount,
    rejectedReports: apiResponse.rejectedCount,
    deletedReports: apiResponse.deletedCount,
    totalUsers: apiResponse.totalUsers,
    adminUsers: apiResponse.adminUsers,
    verificationRate: apiResponse.verificationRate,
    averageResponseTime: `${apiResponse.averageVerificationTime} jam`,
    todayActivity,
  };
};

// Enhanced getAdminStats function that uses real API
const getAdminStats = async (): Promise<AdminStats> => {
  try {
    console.log("Fetching admin stats from API...");
    const apiResponse = await fetchAdminStats();
    console.log("API Response:", apiResponse);

    const mappedStats = mapApiResponseToFrontend(apiResponse);
    console.log("Mapped Stats:", mappedStats);

    return mappedStats;
  } catch (error) {
    console.error("Error fetching admin stats:", error);

    // Log more details for debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Return fallback data on error
    return {
      totalReports: 0,
      pendingReports: 0,
      verifiedReports: 0,
      rejectedReports: 0,
      deletedReports: 0,
      totalUsers: 0,
      adminUsers: 0,
      verificationRate: 0,
      averageResponseTime: "0 jam",
      todayActivity: {
        verified: 0,
        rejected: 0,
        submitted: 0,
      },
    };
  }
};

// Enhanced Stat Card component with luxury design
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; isPositive: boolean };
  variant?: "default" | "warning" | "success" | "danger";
}) {
  const variantStyles = {
    default: "border-neutral-200 bg-white hover:border-neutral-300 shadow-md",
    warning:
      "border-neutral-300 bg-white hover:bg-neutral-25 hover:border-neutral-400 shadow-md",
    success: "border-neutral-200 bg-white hover:border-neutral-300 shadow-md",
    danger: "border-neutral-200 bg-white hover:border-neutral-300 shadow-md",
  };

  const iconColors = {
    default: "text-neutral-600",
    warning: "text-neutral-700",
    success: "text-neutral-600",
    danger: "text-neutral-600",
  };

  return (
    <Card
      className={`${variantStyles[variant]} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium tracking-wide text-neutral-600 uppercase">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-neutral-100 p-2">
          <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-1 text-3xl font-bold tracking-tight text-neutral-900">
          {value}
        </div>
        <p className="text-sm leading-relaxed text-neutral-500">
          {description}
          {trend && (
            <span
              className={`ml-2 inline-flex items-center font-medium ${trend.isPositive ? "text-neutral-700" : "text-neutral-600"}`}
            >
              <TrendingUp
                className={`mr-1 h-3 w-3 ${!trend.isPositive ? "rotate-180" : ""}`}
              />
              {Math.abs(trend.value)}%
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboard() {
  // Auth check is handled by admin layout, just get user data for display
  const user = await requireAuth();

  console.log(
    `Admin dashboard accessed by user: ${user.email} with role: ${user.role}`,
  );

  // Fetch real admin statistics
  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-semibold text-neutral-900">
            Server-Side Auth Debug:
          </h3>
          <p className="text-sm text-neutral-700">User Role: {user.role}</p>
          <p className="text-sm text-neutral-700">User Email: {user.email}</p>
          <p className="text-sm text-neutral-700">User ID: {user.id}</p>
          <p className="text-sm text-neutral-700">
            Auth Method: Server-side verification ✅
          </p>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="mb-12">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-neutral-900">
          Dashboard Admin
        </h1>
        <p className="text-lg leading-relaxed text-neutral-600">
          Kelola dan pantau laporan kerusakan jalan untuk Kota Bekasi
        </p>
      </div>

      {/* Enhanced Quick Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Menunggu Verifikasi"
          value={stats.pendingReports}
          description="Laporan menunggu persetujuan"
          icon={Clock}
          variant={stats.pendingReports > 20 ? "warning" : "default"}
          trend={{ value: 12, isPositive: false }}
        />
        <StatCard
          title="Terverifikasi"
          value={stats.verifiedReports}
          description="Laporan yang disetujui"
          icon={CheckCircle}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Laporan"
          value={stats.totalReports.toLocaleString("id-ID")}
          description="Semua laporan masuk"
          icon={ClipboardList}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Tingkat Persetujuan"
          value={`${stats.verificationRate}%`}
          description="Laporan yang disetujui"
          icon={BarChart3}
          variant="success"
        />
      </div>

      {/* Enhanced Additional Stats Row */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Laporan Ditolak"
          value={stats.rejectedReports}
          description="Laporan yang tidak disetujui"
          icon={XCircle}
          variant="danger"
        />
        <StatCard
          title="Laporan Dihapus"
          value={stats.deletedReports}
          description="Laporan yang dihapus sementara"
          icon={AlertTriangle}
        />
        <StatCard
          title="Admin Aktif"
          value={stats.adminUsers}
          description="Pengguna dengan akses admin"
          icon={UserCheck}
        />
      </div>

      {/* Enhanced Main Content Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Enhanced Reports Table */}
        <div className="w-full">
          <Card className="border border-neutral-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle className="mb-2 flex items-center text-xl font-semibold text-neutral-900">
                  <div className="mr-3 rounded-lg bg-neutral-100 p-2">
                    <ClipboardList className="h-5 w-5 text-neutral-600" />
                  </div>
                  Semua Laporan
                </CardTitle>
                <CardDescription className="font-medium text-neutral-600">
                  Kelola dan verifikasi laporan kerusakan jalan
                </CardDescription>
              </div>
              <Link href="/admin/reports">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-neutral-300 px-4 font-medium text-neutral-700 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-800"
                >
                  Lihat Semua
                  <Eye className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <AdminReportsTableWrapper />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
