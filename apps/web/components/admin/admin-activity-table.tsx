"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Input } from "@repo/ui/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Activity,
  AlertCircle,
} from "lucide-react";
import {
  useAdminActivitiesQuery,
  type AdminActivityItem,
} from "../../hooks/admin/use-admin-activities";

const ACTION_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  verify_report: { label: "Verifikasi", variant: "default" },
  reject_report: { label: "Tolak", variant: "destructive" },
  delete_report: { label: "Hapus", variant: "secondary" },
  restore_report: { label: "Pulihkan", variant: "outline" },
  toggle_report_status: { label: "Ubah Status", variant: "outline" },
  change_user_role: { label: "Ubah Role", variant: "secondary" },
};

const getActionBadge = (actionType: string) => {
  const config = ACTION_TYPE_CONFIG[actionType] || {
    label: actionType,
    variant: "outline" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDetails = (details: Record<string, unknown> | null): string => {
  if (!details) return "-";
  const parts: string[] = [];
  if (details.previous_status) parts.push(`dari: ${details.previous_status}`);
  if (details.new_status) parts.push(`ke: ${details.new_status}`);
  if (details.reason) parts.push(`alasan: ${details.reason}`);
  if (details.new_role) parts.push(`role: ${details.new_role}`);
  return parts.length > 0 ? parts.join(", ") : "-";
};

const columns: ColumnDef<AdminActivityItem>[] = [
  {
    accessorKey: "created_at",
    header: "Waktu",
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap text-neutral-600">
        {formatTimestamp(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: "admin_user_name",
    header: "Admin",
    cell: ({ row }) => (
      <span className="font-medium text-neutral-900">
        {row.original.admin_user_name}
      </span>
    ),
  },
  {
    accessorKey: "action_type",
    header: "Aksi",
    cell: ({ row }) => getActionBadge(row.original.action_type),
  },
  {
    accessorKey: "target_type",
    header: "Target",
    cell: ({ row }) => (
      <span className="text-sm text-neutral-600">
        {row.original.target_type}:{" "}
        <span className="font-mono text-xs">
          {row.original.target_id.slice(0, 8)}...
        </span>
      </span>
    ),
  },
  {
    accessorKey: "details",
    header: "Detail",
    cell: ({ row }) => (
      <span className="text-sm text-neutral-500">
        {formatDetails(row.original.details)}
      </span>
    ),
  },
];

export const AdminActivityTable = () => {
  const [page, setPage] = React.useState(1);
  const [actionTypeFilter, setActionTypeFilter] = React.useState<string>("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const limit = 20;

  const { data, isLoading, isError, error } = useAdminActivitiesQuery({
    page,
    limit,
    action_type: actionTypeFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pages ?? 0,
  });

  const handleResetFilters = () => {
    setActionTypeFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-neutral-500" />
        <span className="text-neutral-500">Memuat aktivitas...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-red-600">
        <AlertCircle className="mr-2 h-5 w-5" />
        <span>Gagal memuat: {error?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={actionTypeFilter}
          onValueChange={(value) => {
            setActionTypeFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Aksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            <SelectItem value="verify_report">Verifikasi</SelectItem>
            <SelectItem value="reject_report">Tolak</SelectItem>
            <SelectItem value="delete_report">Hapus</SelectItem>
            <SelectItem value="restore_report">Pulihkan</SelectItem>
            <SelectItem value="toggle_report_status">Ubah Status</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="w-[160px]"
          placeholder="Dari tanggal"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="w-[160px]"
          placeholder="Sampai tanggal"
        />

        {(actionTypeFilter || dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Reset
          </Button>
        )}

        <span className="ml-auto text-sm text-neutral-500">
          {data?.total ?? 0} aktivitas
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border border-neutral-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-neutral-50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-neutral-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-neutral-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center"
                >
                  <Activity className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                  <p className="text-neutral-500">Belum ada aktivitas admin</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(data?.pages ?? 0) > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            Halaman {data?.page} dari {data?.pages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (data?.pages ?? 1)}
            >
              Selanjutnya
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
