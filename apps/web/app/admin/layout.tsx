import { redirect } from "next/navigation";
import { requireAuth } from "../../lib/auth-server";
import { AdminNavigation } from "../../components/admin/admin-navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Server-side authentication check for all admin routes
  const user = await requireAuth();

  // Server-side admin role check for all admin routes
  if (user.role !== "admin") {
    console.log(
      `User ${user.email} with role ${user.role} attempted to access admin area`,
    );
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <main className="container mx-auto px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
