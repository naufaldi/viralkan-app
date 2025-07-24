import { AdminRouteGuard } from "../../components/auth/admin-route-guard";
import { AdminNavigation } from "../../components/admin/admin-navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <main className="container mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </AdminRouteGuard>
  );
} 