"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  ChevronUp,
  LogOut
} from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";

export const AdminNavigation = () => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, backendUser, signOut } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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

          {/* User Menu */}
          {isAuthenticated && backendUser && (
            <div className="hidden md:flex items-center ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full hover:bg-neutral-100 focus:bg-neutral-100 transition-colors"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={backendUser.avatar_url || undefined}
                        alt={backendUser.name}
                      />
                      <AvatarFallback className="bg-neutral-100 text-neutral-700 font-medium text-sm">
                        {backendUser.name?.charAt(0)?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 border-neutral-200 shadow-lg"
                  align="end"
                  forceMount
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-neutral-900">
                        {backendUser.name}
                      </p>
                      <p className="text-xs leading-none text-neutral-600 mt-1">
                        {backendUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-200" />
                  <DropdownMenuItem asChild className="py-2.5">
                    <Link
                      href="/dashboard"
                      className="cursor-pointer flex items-center"
                    >
                      <LayoutDashboard className="mr-3 h-4 w-4" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="py-2.5">
                    <Link
                      href="/laporan/buat"
                      className="cursor-pointer flex items-center"
                    >
                      <FileText className="mr-3 h-4 w-4" />
                      <span className="font-medium">Buat Laporan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral-200" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

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