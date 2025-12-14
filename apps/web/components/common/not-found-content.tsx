"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import {
  ArrowLeft,
  FileText,
  Home,
  LayoutDashboard,
  Search,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useId, useState } from "react";

const NotFoundContent = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const searchInputId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/laporan");
      return;
    }

    const params = new URLSearchParams();
    params.set("search", trimmed);
    router.push(`/laporan?${params.toString()}`);
  };

  return (
    <Card className="border-neutral-200 bg-white shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 shadow-sm">
            <TriangleAlert className="h-6 w-6 text-neutral-800" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
              Halaman tidak ditemukan
            </CardTitle>
            <CardDescription className="text-base text-neutral-600">
              Tautan yang Anda buka tidak tersedia atau sudah dipindahkan.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-3" role="search">
          <label htmlFor={searchInputId} className="sr-only">
            Cari laporan
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                id={searchInputId}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari laporan (contoh: Sudirman, berlubang, Bekasi)"
                className="h-11 border-neutral-300 pl-10 text-neutral-900 placeholder:text-neutral-400"
                autoComplete="off"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="h-11 bg-neutral-800 px-6 text-white hover:bg-neutral-900"
            >
              Cari laporan
            </Button>
          </div>
          <p className="text-sm text-neutral-500">
            Tips: Gunakan kata kunci lokasi atau kategori kerusakan.
          </p>
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-11 justify-start border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            asChild
          >
            <Link href="/">
              <Home className="mr-3 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-11 justify-start border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            asChild
          >
            <Link href="/laporan">
              <FileText className="mr-3 h-4 w-4" />
              Lihat Laporan
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-11 justify-start border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            asChild
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Buka Dashboard
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-11 justify-start border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            type="button"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-3 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotFoundContent;
