"use client";

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
import { LogOut, LayoutDashboard, FileText, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "../../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, isLoading, backendUser, signOut } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderAuthButton = () => {
    if (isLoading) {
      return (
        <Button
          size="default"
          disabled
          variant="default"
          className="min-h-[44px]"
        >
          Loading...
        </Button>
      );
    }

    if (isAuthenticated && backendUser) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-11 w-11 rounded-full hover:bg-neutral-100 focus:bg-neutral-100 transition-colors"
              aria-label="User menu"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={backendUser.avatar_url || undefined}
                  alt={backendUser.name}
                />
                <AvatarFallback className="bg-neutral-100 text-neutral-700 font-medium">
                  {backendUser.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 border-neutral-200 shadow-lg"
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
            {backendUser?.role === "admin" && (
              <>
                <DropdownMenuSeparator className="bg-neutral-200" />
                <DropdownMenuItem asChild className="py-2.5">
                  <Link
                    href="/admin"
                    className="cursor-pointer flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    <span className="font-medium">Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
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
      );
    }

    return (
      <Button
        asChild
        size="default"
        variant="default"
        className="min-h-[44px] px-6"
      >
        <Link href="/login">Mulai Lapor</Link>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
              <ChevronUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">
              Viralkan
            </span>
          </Link>

          {/* Navigation Section */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/laporan"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors text-sm py-2 px-1 border-b-2 border-transparent hover:border-neutral-300"
            >
              Laporan
            </Link>
            <Link
              href="/#how-it-works"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors text-sm py-2 px-1 border-b-2 border-transparent hover:border-neutral-300"
            >
              Cara Kerja
            </Link>
            <Link
              href="/#community"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors text-sm py-2 px-1 border-b-2 border-transparent hover:border-neutral-300"
            >
              Komunitas
            </Link>
            <Link
              href="/#about"
              className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors text-sm py-2 px-1 border-b-2 border-transparent hover:border-neutral-300"
            >
              Tentang
            </Link>

            {/* Auth Button with proper spacing */}
            <div className="ml-4">{renderAuthButton()}</div>
          </nav>

          {/* Mobile Menu Button (for future mobile menu) */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <span className="sr-only">Open menu</span>
              <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
                <div className="w-4 h-0.5 bg-neutral-600 rounded"></div>
                <div className="w-4 h-0.5 bg-neutral-600 rounded"></div>
                <div className="w-4 h-0.5 bg-neutral-600 rounded"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
