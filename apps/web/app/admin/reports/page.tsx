import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { AdminReportsTableWrapper } from "@/components/admin";

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-neutral-900">
            Kelola Laporan
          </h1>
          <p className="text-lg text-neutral-600">
            Verifikasi dan kelola semua laporan kerusakan jalan
          </p>
        </div>

        {/* Reports Table */}
        <Card className="border border-neutral-200 bg-white shadow-md">
          <CardHeader className="border-b border-neutral-200 bg-neutral-50">
            <CardTitle className="text-xl font-semibold text-neutral-900">
              Semua Laporan
            </CardTitle>
            <CardDescription className="text-neutral-600">
              Kelola dan verifikasi laporan kerusakan jalan dari masyarakat
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <AdminReportsTableWrapper />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
