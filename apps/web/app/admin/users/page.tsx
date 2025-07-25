import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { AdminUsersTableWrapper } from "@/components/admin";

// Mock data for users - in real app this would come from API
const mockAdminUsers = [
  {
    id: "1",
    name: "Ahmad Rizki",
    email: "ahmad.rizki@example.com",
    role: "user" as const,
    status: "active" as const,
    joinedAt: "2024-01-10T08:30:00Z",
    lastActive: "2024-01-15T14:20:00Z",
    reportsCount: 5,
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@example.com",
    role: "user" as const,
    status: "active" as const,
    joinedAt: "2024-01-08T12:15:00Z",
    lastActive: "2024-01-15T16:45:00Z",
    reportsCount: 3,
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    role: "admin" as const,
    status: "active" as const,
    joinedAt: "2024-01-05T09:00:00Z",
    lastActive: "2024-01-15T17:30:00Z",
    reportsCount: 0,
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "Dewi Sartika",
    email: "dewi.sartika@example.com",
    role: "user" as const,
    status: "inactive" as const,
    joinedAt: "2024-01-03T11:20:00Z",
    lastActive: "2024-01-10T13:15:00Z",
    reportsCount: 2,
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "5",
    name: "Rudi Hartono",
    email: "rudi.hartono@example.com",
    role: "user" as const,
    status: "suspended" as const,
    joinedAt: "2024-01-01T14:45:00Z",
    lastActive: "2024-01-08T10:30:00Z",
    reportsCount: 1,
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
];

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-2">
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
            <AdminUsersTableWrapper data={mockAdminUsers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
