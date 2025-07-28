"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import Link from "next/link";

interface ReportActionsProps {
  reportId: string;
  canEdit: boolean;
}

export function ReportActions({ reportId, canEdit }: ReportActionsProps) {
  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-neutral-900">
          Aksi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          asChild
        >
          <Link href="/laporan">Lihat Semua Laporan</Link>
        </Button>

        {canEdit && (
          <Button
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
            asChild
          >
            <Link href={`/laporan/${reportId}/edit`}>Edit Laporan</Link>
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          asChild
        >
          <Link href="/laporan/buat">Buat Laporan Baru</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
