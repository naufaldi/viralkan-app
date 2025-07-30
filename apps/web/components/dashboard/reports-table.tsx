"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Input } from "@repo/ui/components/ui/input";
import {
  ArrowUpDown,
  Eye,
  Edit,
  MoreHorizontal,
  Search,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Report {
  id: number;
  title: string;
  category: string;
  status: string;
  created_at: string;
  image_url?: string;
  street_name?: string;
}

interface ReportsTableProps {
  data: Report[];
  isLoading?: boolean;
}

export function ReportsTable({ data, isLoading = false }: ReportsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      image_url: false, // Hide thumbnail on mobile by default
      category: false, // Hide category on mobile by default
    });
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Responsive column visibility
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;

      setColumnVisibility({
        image_url: !isMobile, // Show thumbnail on tablet and desktop
        category: !isTablet, // Show category on desktop only
      });
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="border-neutral-200 bg-neutral-100 text-neutral-600"
          >
            <Clock className="mr-1 h-3 w-3" />
            Menunggu
          </Badge>
        );
      case "verified":
        return (
          <Badge
            variant="secondary"
            className="border-neutral-900 bg-neutral-900 text-white"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="secondary"
            className="border-neutral-300 bg-neutral-200 text-neutral-800"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "berlubang":
        return (
          <Badge
            variant="outline"
            className="border-neutral-300 text-neutral-700"
          >
            Berlubang
          </Badge>
        );
      case "retak":
        return (
          <Badge
            variant="outline"
            className="border-neutral-300 text-neutral-700"
          >
            Retak
          </Badge>
        );
      case "lainnya":
        return (
          <Badge
            variant="outline"
            className="border-neutral-300 text-neutral-700"
          >
            Lainnya
          </Badge>
        );
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900"
        >
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-neutral-900">
          {formatDate(row.getValue("created_at"))}
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      accessorKey: "image_url",
      header: "Foto",
      cell: ({ row }) => (
        <div className="relative h-12 w-16 overflow-hidden rounded-md bg-neutral-100">
          {row.getValue("image_url") ? (
            <Image
              src={row.getValue("image_url")}
              alt={row.getValue("title") || "Report image"}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-200">
              <span className="text-xs text-neutral-500">No Image</span>
            </div>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900"
        >
          Judul Laporan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px] md:max-w-[300px]">
          <div className="truncate font-medium text-neutral-900">
            {row.getValue("title") || "Laporan Kerusakan Jalan"}
          </div>
          {row.original.street_name && (
            <div className="truncate text-sm text-neutral-500">
              {row.original.street_name}
            </div>
          )}
          {/* Show category on mobile when column is hidden */}
          <div className="mt-1 md:hidden">
            {getCategoryBadge(row.original.category)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900"
        >
          Kategori
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => getCategoryBadge(row.getValue("category")),
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      filterFn: "includesString",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/laporan/${row.original.id}`}
                className="flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/laporan/${row.original.id}/edit`}
                className="flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Laporan
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
  console.log("data", data);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded bg-neutral-100" />
        <div className="rounded-lg border">
          <div className="h-12 border-b bg-neutral-50" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b bg-white">
              <div className="flex items-center space-x-4 p-4">
                <div className="h-12 w-16 animate-pulse rounded bg-neutral-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-neutral-400" />
          <Input
            placeholder="Cari laporan..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-neutral-50">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-neutral-50"
                >
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
                  className="h-24 text-center"
                >
                  <div className="text-neutral-500">
                    <div className="mb-2 text-lg font-medium">
                      Tidak ada laporan
                    </div>
                    <div className="text-sm">
                      Laporan Anda akan muncul di sini setelah dibuat
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="text-center text-sm text-neutral-600 md:text-left">
            Menampilkan{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            hingga{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            dari {table.getFilteredRowModel().rows.length} laporan
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3"
            >
              <span className="hidden sm:inline">Sebelumnya</span>
              <span className="sm:hidden">←</span>
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(table.getPageCount(), 5) },
                (_, i) => {
                  const pageIndex = table.getState().pagination.pageIndex;
                  const totalPages = table.getPageCount();
                  let displayPage = i;

                  // Show pages around current page for mobile
                  if (totalPages > 5) {
                    const start = Math.max(0, pageIndex - 2);
                    const end = Math.min(totalPages - 1, start + 4);
                    displayPage = start + i;
                    if (displayPage > end) return null;
                  }

                  return (
                    <Button
                      key={displayPage}
                      variant={
                        pageIndex === displayPage ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => table.setPageIndex(displayPage)}
                      className="h-8 w-8 p-0"
                    >
                      {displayPage + 1}
                    </Button>
                  );
                },
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <span className="sm:hidden">→</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
