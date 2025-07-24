import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  Users,
  AlertTriangle,
  Eye,
  UserCheck,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-server";

// Admin statistics interface
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

// Mock admin statistics - would be fetched from API
const mockAdminStats: AdminStats = {
  totalReports: 1247,
  pendingReports: 23,
  verifiedReports: 1089,
  rejectedReports: 127,
  deletedReports: 8,
  totalUsers: 342,
  adminUsers: 3,
  verificationRate: 87.4,
  averageResponseTime: "4.2 jam",
  todayActivity: {
    verified: 12,
    rejected: 3,
    submitted: 8
  }
};

// Mock pending reports for queue preview
const mockPendingReports = [
  {
    id: "1",
    category: "berlubang" as const,
    streetName: "Jl. Ahmad Yani",
    locationText: "Depan RSUD Bekasi",
    userName: "Ahmad Rizki",
    submittedAt: "2024-01-24T10:30:00Z",
    imageUrl: "/placeholder-road-damage.jpg"
  },
  {
    id: "2", 
    category: "retak" as const,
    streetName: "Jl. Raya Kalimalang",
    locationText: "Persimpangan Kalimalang",
    userName: "Siti Nurhaliza",
    submittedAt: "2024-01-24T09:15:00Z",
    imageUrl: "/placeholder-road-damage.jpg"
  },
  {
    id: "3",
    category: "lainnya" as const,
    streetName: "Jl. Cut Meutia",
    locationText: "Dekat Pasar Baru",
    userName: "Budi Santoso",
    submittedAt: "2024-01-24T08:45:00Z",
    imageUrl: "/placeholder-road-damage.jpg"
  }
];

// Stat card component
function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = "default"
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; isPositive: boolean };
  variant?: "default" | "warning" | "success" | "danger";
}) {
  const variantStyles = {
    default: "border-neutral-200 hover:border-neutral-300",
    warning: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
    success: "border-green-200 bg-green-50 hover:bg-green-100", 
    danger: "border-red-200 bg-red-50 hover:bg-red-100"
  };

  return (
    <Card className={`${variantStyles[variant]} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-neutral-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-900">{value}</div>
        <p className="text-xs text-neutral-500 mt-1">
          {description}
          {trend && (
            <span className={`ml-2 inline-flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
              {Math.abs(trend.value)}%
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

// Pending report item component
function PendingReportItem({ report }: { report: typeof mockPendingReports[0] }) {
  const categoryColors = {
    berlubang: "bg-red-100 text-red-800 border-red-200",
    retak: "bg-orange-100 text-orange-800 border-orange-200", 
    lainnya: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const categoryLabels = {
    berlubang: "Lubang",
    retak: "Retak",
    lainnya: "Lainnya"
  };

  const timeAgo = new Date().getTime() - new Date(report.submittedAt).getTime();
  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));

  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-all duration-150 group">
      <div className="w-14 h-14 bg-neutral-200 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:bg-neutral-300 transition-colors">
        <ClipboardList className="w-6 h-6 text-neutral-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <Badge variant="outline" className={`text-xs font-medium ${categoryColors[report.category]}`}>
            {categoryLabels[report.category]}
          </Badge>
          <span className="text-sm text-neutral-500">
            {hoursAgo} jam yang lalu
          </span>
        </div>
        <p className="text-sm font-medium text-neutral-900 truncate mb-1">
          {report.streetName}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          {report.locationText} • oleh {report.userName}
        </p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300">
          <CheckCircle className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Setujui</span>
        </Button>
        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
          <XCircle className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Tolak</span>
        </Button>
      </div>
    </div>
  );
}

// Recent activity component
function RecentActivity() {
  const activities = [
    { action: "verified", label: "Disetujui", count: 12, time: "hari ini", color: "bg-green-500" },
    { action: "rejected", label: "Ditolak", count: 3, time: "hari ini", color: "bg-red-500" },
    { action: "submitted", label: "Laporan Baru", count: 8, time: "hari ini", color: "bg-blue-500" }
  ];

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Aktivitas Hari Ini
        </CardTitle>
        <CardDescription>Ringkasan verifikasi dan laporan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.action} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${activity.color}`} />
              <span className="text-sm font-medium">
                {activity.label}
              </span>
            </div>
            <Badge variant="secondary" className="font-semibold">{activity.count}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboard() {
  // Auth check is handled by admin layout, just get user data for display
  const user = await requireAuth();

  console.log(`Admin dashboard accessed by user: ${user.email} with role: ${user.role}`);

  const stats = mockAdminStats;

  return (
    <div>
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Server-Side Auth Debug:</h3>
          <p className="text-sm text-green-800">
            User Role: {user.role}
          </p>
          <p className="text-sm text-green-800">
            User Email: {user.email}
          </p>
          <p className="text-sm text-green-800">
            User ID: {user.id}
          </p>
          <p className="text-sm text-green-800">
            Auth Method: Server-side verification ✅
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Dashboard Admin
        </h1>
        <p className="text-neutral-600">
          Kelola dan pantau laporan kerusakan jalan untuk Kota Bekasi
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          value={stats.totalReports.toLocaleString('id-ID')}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Reports Queue */}
        <div className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Antrian Verifikasi
                </CardTitle>
                <CardDescription>
                  Laporan yang memerlukan verifikasi admin
                </CardDescription>
              </div>
              <Link href="/admin/reports?status=pending">
                <Button variant="outline" size="sm" className="hover:bg-neutral-50">
                  Lihat Semua
                  <Eye className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPendingReports.length > 0 ? (
                mockPendingReports.map((report) => (
                  <PendingReportItem key={report.id} report={report} />
                ))
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Tidak ada laporan pending</p>
                  <p className="text-sm">Semua laporan telah diverifikasi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/reports" className="block">
                <Button variant="outline" className="w-full justify-start hover:bg-neutral-50 transition-colors">
                  <ClipboardList className="w-4 h-4 mr-3" />
                  Kelola Semua Laporan
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-start hover:bg-neutral-50 transition-colors">
                  <Users className="w-4 h-4 mr-3" />
                  Manajemen Pengguna
                </Button>
              </Link>
              <Link href="/admin/analytics" className="block">
                <Button variant="outline" className="w-full justify-start hover:bg-neutral-50 transition-colors">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Lihat Analitik
                </Button>
              </Link>
              <Link href="/laporan" className="block">
                <Button variant="ghost" className="w-full justify-start hover:bg-neutral-50 transition-colors">
                  <Eye className="w-4 h-4 mr-3" />
                  Lihat Laporan Publik
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivity />

          {/* System Stats */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Info Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-b-0">
                <span className="text-sm text-neutral-600">Total Pengguna</span>
                <Badge variant="secondary" className="font-semibold">{stats.totalUsers}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-b-0">
                <span className="text-sm text-neutral-600">Admin Aktif</span>
                <Badge variant="secondary" className="font-semibold">{stats.adminUsers}</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-neutral-600">Rata-rata Respons</span>
                <Badge variant="secondary" className="font-semibold">{stats.averageResponseTime}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
      </div>
    
  );
} 