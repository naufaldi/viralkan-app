"use client";

import { useEffect } from "react";
import ErrorContent from "components/common/error-content";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-neutral-50">
        <main className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <ErrorContent
              reset={reset}
              message="Terjadi kesalahan yang tidak terduga. Halaman tidak dapat ditampilkan."
            />
          </div>
        </main>
      </body>
    </html>
  );
}
