import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { AdminReportsTableWrapper } from "@/components/admin";

// Mock data for reports - in real app this would come from API
const mockAdminReports = [
  {
    id: "1",
    category: "berlubang" as const,
    streetName: "Jalan Sudirman",
    locationText: "Jakarta Pusat, DKI Jakarta",
    userName: "Ahmad Rizki",
    submittedAt: "2024-01-15T10:30:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop",
    status: "pending" as const,
  },
  {
    id: "2",
    category: "retak" as const,
    streetName: "Jalan Thamrin",
    locationText: "Jakarta Pusat, DKI Jakarta",
    userName: "Siti Nurhaliza",
    submittedAt: "2024-01-14T15:45:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop",
    status: "verified" as const,
  },
  {
    id: "3",
    category: "lainnya" as const,
    streetName: "Jalan Gatot Subroto",
    locationText: "Jakarta Selatan, DKI Jakarta",
    userName: "Budi Santoso",
    submittedAt: "2024-01-13T09:15:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop",
    status: "rejected" as const,
  },
  {
    id: "4",
    category: "berlubang" as const,
    streetName: "Jalan Rasuna Said",
    locationText: "Jakarta Selatan, DKI Jakarta",
    userName: "Dewi Sartika",
    submittedAt: "2024-01-12T14:20:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop",
    status: "pending" as const,
  },
  {
    id: "5",
    category: "retak" as const,
    streetName: "Jalan Sudirman",
    locationText: "Jakarta Pusat, DKI Jakarta",
    userName: "Rudi Hartono",
    submittedAt: "2024-01-11T11:30:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop",
    status: "verified" as const,
  },
];

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-2">
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
            <AdminReportsTableWrapper data={mockAdminReports} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
