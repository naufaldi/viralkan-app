import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { AdminActivityTable } from "@/components/admin/admin-activity-table";

export default function AdminActivityPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-neutral-900">
            Log Aktivitas
          </h1>
          <p className="text-lg text-neutral-600">
            Pantau semua aksi admin pada laporan dan pengguna
          </p>
        </div>

        {/* Activity Table */}
        <Card className="border border-neutral-200 bg-white shadow-md">
          <CardHeader className="border-b border-neutral-200 bg-neutral-50">
            <CardTitle className="text-xl font-semibold text-neutral-900">
              Riwayat Aktivitas
            </CardTitle>
            <CardDescription className="text-neutral-600">
              Log lengkap semua aksi verifikasi, penolakan, dan pengelolaan
              laporan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <AdminActivityTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
