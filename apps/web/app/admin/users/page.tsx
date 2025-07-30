import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { AdminUsersTableWrapper } from "@/components/admin";

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-neutral-900">
            Kelola Pengguna
          </h1>
          <p className="text-lg text-neutral-600">
            Kelola dan pantau semua pengguna platform Viralkan
          </p>
        </div>

        {/* Users Table */}
        <Card className="border border-neutral-200 bg-white shadow-md">
          <CardHeader className="border-b border-neutral-200 bg-neutral-50">
            <CardTitle className="text-xl font-semibold text-neutral-900">
              Semua Pengguna
            </CardTitle>
            <CardDescription className="text-neutral-600">
              Daftar lengkap pengguna yang terdaftar di platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <AdminUsersTableWrapper />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
