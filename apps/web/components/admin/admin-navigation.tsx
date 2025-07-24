"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  ChevronUp 
} from "lucide-react";

export const AdminNavigation = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/reports",
      label: "Laporan",
      icon: FileText,
    },
    {
      href: "/admin/users",
      label: "Pengguna",
      icon: Users,
    },
    {
      href: "/admin/settings",
      label: "Pengaturan",
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
              <ChevronUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-neutral-900 tracking-tight">
              Viralkan Admin
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="sm"
                  className="h-9 px-3"
                >
                  <Link href={item.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <span className="sr-only">Open admin menu</span>
              <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
                <div className="w-4 h-0.5 bg-neutral-600 rounded"></div>
                <div className="w-4 h-0.5 bg-neutral-600 rounded"></div>
                <div className="w-4 h-0.5 bg-neutral-600 rounded"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 