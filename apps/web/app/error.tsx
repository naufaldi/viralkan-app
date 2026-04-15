"use client";

import { useEffect } from "react";
import Header from "components/layout/header";
import ErrorContent from "components/common/error-content";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <ErrorContent reset={reset} />
        </div>
      </main>
    </div>
  );
}
