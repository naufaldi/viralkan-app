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
              className="relative h-11 w-11 rounded-full transition-colors hover:bg-neutral-100 focus:bg-neutral-100"
              aria-label="User menu"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={backendUser.avatar_url || undefined}
                  alt={backendUser.name}
                />
                <AvatarFallback className="bg-neutral-100 font-medium text-neutral-700">
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
            <DropdownMenuLabel className="p-3 font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-semibold text-neutral-900">
                  {backendUser.name}
                </p>
                <p className="mt-1 text-xs leading-none text-neutral-600">
                  {backendUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-200" />
            <DropdownMenuItem asChild className="py-2.5">
              <Link
                href="/dashboard"
                className="flex cursor-pointer items-center"
              >
                <LayoutDashboard className="mr-3 h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="py-2.5">
              <Link
                href="/laporan/buat"
                className="flex cursor-pointer items-center"
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
                    className="flex cursor-pointer items-center text-blue-600 hover:text-blue-700"
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
              className="cursor-pointer py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700"
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
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 shadow-sm">
              <ChevronUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              Viralkan
            </span>
          </Link>

          {/* Navigation Section */}
          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            <Link
              href="/laporan"
              className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              Laporan
            </Link>
            <Link
              href="/#how-it-works"
              className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              Cara Kerja
            </Link>
            <Link
              href="/#community"
              className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              Komunitas
            </Link>
            <Link
              href="/#about"
              className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
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
              <div className="flex h-5 w-5 flex-col items-center justify-center gap-1">
                <div className="h-0.5 w-4 rounded bg-neutral-600"></div>
                <div className="h-0.5 w-4 rounded bg-neutral-600"></div>
                <div className="h-0.5 w-4 rounded bg-neutral-600"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
