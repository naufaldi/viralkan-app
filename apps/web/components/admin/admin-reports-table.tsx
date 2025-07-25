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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import { Input } from "@repo/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  ArrowUpDown,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  Clock,
  User,
  Trash2,
  Filter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AdminReport {
  id: string;
  category: "berlubang" | "retak" | "lainnya";
  streetName: string;
  locationText: string;
  userName: string;
  submittedAt: string;
  imageUrl?: string;
  status: "pending" | "verified" | "rejected";
}

interface AdminReportsTableProps {
  data: AdminReport[];
  isLoading?: boolean;
  onVerify?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AdminReportsTable({
  data,
  isLoading = false,
  onVerify,
  onReject,
  onDelete,
}: AdminReportsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "submittedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      imageUrl: false, // Hide thumbnail on mobile by default
      category: false, // Hide category on mobile by default
    });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [verifyDialogOpen, setVerifyDialogOpen] = React.useState(false);
  const [reportToVerify, setReportToVerify] =
    React.useState<AdminReport | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [reportToDelete, setReportToDelete] =
    React.useState<AdminReport | null>(null);

  // Responsive column visibility
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;

      setColumnVisibility({
        imageUrl: !isMobile, // Show thumbnail on tablet and desktop
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
            className="bg-neutral-100 text-neutral-600 border-neutral-200"
          >
            <Clock className="w-3 h-3 mr-1" />
            Menunggu
          </Badge>
        );
      case "verified":
        return (
          <Badge
            variant="secondary"
            className="bg-neutral-900 text-white border-neutral-900"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="secondary"
            className="bg-neutral-200 text-neutral-800 border-neutral-300"
          >
            <XCircle className="w-3 h-3 mr-1" />
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
            className="border-red-200 text-red-700 bg-red-50"
          >
            Lubang
          </Badge>
        );
      case "retak":
        return (
          <Badge
            variant="outline"
            className="border-neutral-300 text-neutral-600 bg-neutral-50"
          >
            Retak
          </Badge>
        );
      case "lainnya":
        return (
          <Badge
            variant="outline"
            className="border-neutral-200 text-neutral-500 bg-neutral-25"
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const timeAgo = new Date().getTime() - new Date(dateString).getTime();
    const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
    const daysAgo = Math.floor(hoursAgo / 24);

    if (daysAgo > 0) {
      return `${daysAgo} hari yang lalu`;
    } else if (hoursAgo > 0) {
      return `${hoursAgo} jam yang lalu`;
    } else {
      return "Baru saja";
    }
  };

  const handleVerifyClick = (report: AdminReport) => {
    setReportToVerify(report);
    setVerifyDialogOpen(true);
  };

  const handleVerifyConfirm = () => {
    if (reportToVerify && onVerify) {
      onVerify(reportToVerify.id);
    }
    setVerifyDialogOpen(false);
    setReportToVerify(null);
  };

  const handleRejectClick = (report: AdminReport) => {
    if (onReject) {
      onReject(report.id);
    }
  };

  const handleDeleteClick = (report: AdminReport) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (reportToDelete && onDelete) {
      onDelete(reportToDelete.id);
    }
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  // Filter data based on status filter
  const filteredData = React.useMemo(() => {
    if (statusFilter === "all") {
      return data;
    }
    return data.filter((report) => report.status === statusFilter);
  }, [data, statusFilter]);

  // Get status filter options
  const statusFilterOptions = [
    { value: "all", label: "Semua Status", count: data.length },
    {
      value: "pending",
      label: "Menunggu",
      count: data.filter((r) => r.status === "pending").length,
    },
    {
      value: "verified",
      label: "Disetujui",
      count: data.filter((r) => r.status === "verified").length,
    },
    {
      value: "rejected",
      label: "Ditolak",
      count: data.filter((r) => r.status === "rejected").length,
    },
  ];

  const columns: ColumnDef<AdminReport>[] = [
    {
      accessorKey: "submittedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
        >
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-neutral-900">
            {formatDate(row.getValue("submittedAt"))}
          </div>
          <div className="text-xs text-neutral-500">
            {getTimeAgo(row.getValue("submittedAt"))}
          </div>
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      accessorKey: "imageUrl",
      header: "Foto",
      cell: ({ row }) => (
        <div className="w-16 h-12 bg-neutral-100 rounded-md overflow-hidden relative">
          {row.getValue("imageUrl") ? (
            <Image
              src={row.getValue("imageUrl")}
              alt={`Laporan ${row.original.streetName}`}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-200">
              <span className="text-xs text-neutral-500">No Image</span>
            </div>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "streetName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
        >
          Lokasi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px] md:max-w-[300px]">
          <div className="font-medium text-neutral-900 truncate">
            {row.getValue("streetName")}
          </div>
          <div className="text-sm text-neutral-500 truncate">
            {row.original.locationText}
          </div>
          <div className="flex items-center text-xs text-neutral-400 mt-1">
            <User className="w-3 h-3 mr-1" />
            {row.original.userName}
          </div>
          {/* Show category on mobile when column is hidden */}
          <div className="md:hidden mt-2">
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
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
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
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
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
      cell: ({ row }) => {
        const report = row.original;
        const isPending = report.status === "pending";

        return (
          <div className="flex items-center space-x-2">
            {isPending && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerifyClick(report)}
                  className="h-8 px-3 text-neutral-700 border-neutral-300 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Setujui</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectClick(report)}
                  className="h-8 px-3 text-neutral-700 border-neutral-300 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Tolak</span>
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="flex items-center"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </DropdownMenuItem>
                {isPending && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleVerifyClick(report)}
                      className="hover:bg-green-50 hover:text-green-700 focus:bg-green-50 focus:text-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Setujui Laporan
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRejectClick(report)}
                      className="hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Tolak Laporan
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(report)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Laporan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-neutral-100 rounded animate-pulse" />
        <div className="border border-neutral-200 rounded-lg bg-white shadow-sm">
          <div className="h-12 bg-neutral-50 border-b" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b bg-white">
              <div className="flex items-center space-x-4 p-4">
                <div className="w-16 h-12 bg-neutral-100 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2 animate-pulse" />
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
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search Input */}
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <Input
            placeholder="Cari laporan..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-neutral-300 bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-colors">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="border-neutral-200 bg-white shadow-lg">
              {statusFilterOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="hover:bg-neutral-50 focus:bg-neutral-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-neutral-700">{option.label}</span>
                    <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full ml-2">
                      {option.count}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-neutral-200 rounded-lg bg-white shadow-sm">
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
                    <div className="text-lg font-medium mb-2">
                      Tidak ada laporan
                    </div>
                    <div className="text-sm">
                      Semua laporan telah diverifikasi
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
          <div className="text-sm text-neutral-600 text-center md:text-left">
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
              className="px-3 hover:bg-neutral-50 hover:border-neutral-400"
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
                      className="w-8 h-8 p-0"
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
              className="px-3 hover:bg-neutral-50 hover:border-neutral-400"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <span className="sm:hidden">→</span>
            </Button>
          </div>
        </div>
      )}

      {/* Verify Confirmation Dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui Laporan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyetujui laporan{" "}
              <strong>{reportToVerify?.streetName}</strong>? Laporan ini akan
              ditandai sebagai terverifikasi dan dapat diproses lebih lanjut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-neutral-50 hover:border-neutral-400">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyConfirm}
              className="bg-neutral-800 text-white hover:bg-neutral-900 hover:text-white border-neutral-800"
            >
              Setujui
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus laporan{" "}
              <strong>{reportToDelete?.streetName}</strong>? Tindakan ini tidak
              dapat dibatalkan dan laporan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-neutral-50 hover:border-neutral-400">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-neutral-800 text-white hover:bg-red-600 hover:text-white border-neutral-800"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
