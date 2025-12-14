import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header />

      <main className="my-40 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Card className="relative transform border border-neutral-200 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <CardContent className="justify-content flex flex-col items-center p-6">
            <img src="/404-loading.gif" alt="" className="w-[250px]" />
            <h1 className="text-6xl leading-tight font-bold tracking-tight text-neutral-900 lg:text-9xl">
              404
            </h1>
            <p className="mt-3 mb-9 max-w-lg text-xl leading-relaxed text-neutral-600">
              Halaman tidak tersedia, klik tombol dibawah untuk mengakses
              kembali.
            </p>

            <div className="flex gap-4">
              <Button
                className="shadow-button hover:shadow-button-hover bg-neutral-800 px-8 py-4 text-lg text-white transition-all duration-200 hover:bg-neutral-900"
                asChild
              >
                <Link href="/">Back to Homepage</Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                <Link href="/laporan">Reports</Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
