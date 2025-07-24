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
import { AdminReportsTableWrapper } from "@/components/admin";

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

// Mock admin reports data for table
const mockAdminReports = [
  {
    id: "1",
    category: "berlubang" as const,
    streetName: "Jl. Ahmad Yani",
    locationText: "Depan RSUD Bekasi",
    userName: "Ahmad Rizki",
    submittedAt: "2024-01-24T10:30:00Z",
    imageUrl: "/placeholder-road-damage.jpg",
    status: "pending" as const
  },
  {
    id: "2", 
    category: "retak" as const,
    streetName: "Jl. Raya Kalimalang",
    locationText: "Persimpangan Kalimalang",
    userName: "Siti Nurhaliza",
    submittedAt: "2024-01-24T09:15:00Z",
    imageUrl: "/placeholder-road-damage.jpg",
    status: "pending" as const
  },
  {
    id: "3",
    category: "lainnya" as const,
    streetName: "Jl. Cut Meutia",
    locationText: "Dekat Pasar Baru",
    userName: "Budi Santoso",
    submittedAt: "2024-01-24T08:45:00Z",
    imageUrl: "/placeholder-road-damage.jpg",
    status: "pending" as const
  },
  {
    id: "4",
    category: "berlubang" as const,
    streetName: "Jl. Sudirman",
    locationText: "Depan Mall Bekasi",
    userName: "Dewi Sartika",
    submittedAt: "2024-01-24T07:30:00Z",
    imageUrl: "/placeholder-road-damage.jpg",
    status: "verified" as const
  },
  {
    id: "5",
    category: "retak" as const,
    streetName: "Jl. Veteran",
    locationText: "Dekat Terminal Bekasi",
    userName: "Rudi Hartono",
    submittedAt: "2024-01-24T06:15:00Z",
    imageUrl: "/placeholder-road-damage.jpg",
    status: "rejected" as const
  }
];

// Enhanced Stat Card component with luxury design
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
    default: "border-neutral-200 bg-white hover:border-neutral-300 shadow-md",
    warning: "border-neutral-300 bg-white hover:bg-neutral-25 hover:border-neutral-400 shadow-md", 
    success: "border-neutral-200 bg-white hover:border-neutral-300 shadow-md",
    danger: "border-neutral-200 bg-white hover:border-neutral-300 shadow-md"
  };

  const iconColors = {
    default: "text-neutral-600",
    warning: "text-neutral-700",
    success: "text-neutral-600",
    danger: "text-neutral-600"
  };

  return (
    <Card className={`${variantStyles[variant]} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-neutral-600 tracking-wide uppercase">
          {title}
        </CardTitle>
        <div className="p-2 bg-neutral-100 rounded-lg">
          <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold text-neutral-900 tracking-tight mb-1">
          {value}
        </div>
        <p className="text-sm text-neutral-500 leading-relaxed">
          {description}
          {trend && (
            <span className={`ml-2 inline-flex items-center font-medium ${trend.isPositive ? 'text-neutral-700' : 'text-neutral-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
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

  console.log(`Admin dashboard accessed by user: ${user.email} with role: ${user.role}`);

  const stats = mockAdminStats;

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-neutral-900 mb-2">Server-Side Auth Debug:</h3>
          <p className="text-sm text-neutral-700">
            User Role: {user.role}
          </p>
          <p className="text-sm text-neutral-700">
            User Email: {user.email}
          </p>
          <p className="text-sm text-neutral-700">
            User ID: {user.id}
          </p>
          <p className="text-sm text-neutral-700">
            Auth Method: Server-side verification ✅
          </p>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
          Dashboard Admin
        </h1>
        <p className="text-lg text-neutral-600 leading-relaxed">
          Kelola dan pantau laporan kerusakan jalan untuk Kota Bekasi
        </p>
      </div>

      {/* Enhanced Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

      {/* Enhanced Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
      <div className="grid grid-cols-1  gap-8">
        {/* Enhanced Reports Table */}
        <div className="w-full">
          <Card className="border border-neutral-200 bg-white shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center text-neutral-900 mb-2">
                  <div className="p-2 bg-neutral-100 rounded-lg mr-3">
                    <ClipboardList className="w-5 h-5 text-neutral-600" />
                  </div>
                  Semua Laporan
                </CardTitle>
                <CardDescription className="text-neutral-600 font-medium">
                  Kelola dan verifikasi laporan kerusakan jalan
                </CardDescription>
              </div>
              <Link href="/admin/reports">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 text-neutral-700 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-800 transition-all duration-200 font-medium"
                >
                  Lihat Semua
                  <Eye className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <AdminReportsTableWrapper 
                data={mockAdminReports}
              />
            </CardContent>
          </Card>
        </div>

       
      </div>
    </div>
  );
} 