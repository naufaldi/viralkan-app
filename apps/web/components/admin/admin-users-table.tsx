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
  ArrowUpDown,
  Eye,
  Trash2,
  MoreHorizontal,
  Search,
  User,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive" | "suspended";
  joinedAt: string;
  lastActive: string;
  reportsCount: number;
  avatarUrl?: string;
}

interface AdminUsersTableProps {
  data: AdminUser[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function AdminUsersTable({
  data,
  isLoading = false,
  onDelete,
  onViewDetails,
}: AdminUsersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "joinedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<AdminUser | null>(
    null,
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-neutral-900 text-white">
            Aktif
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="secondary"
            className="bg-neutral-200 text-neutral-800"
          >
            Tidak Aktif
          </Badge>
        );
      case "suspended":
        return (
          <Badge
            variant="secondary"
            className="bg-neutral-100 text-neutral-700 border-neutral-200"
          >
            Ditangguhkan
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return (
          <Badge
            variant="outline"
            className="border-neutral-300 text-neutral-700 bg-neutral-50"
          >
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "user":
        return (
          <Badge
            variant="outline"
            className="border-neutral-300 text-neutral-700 bg-neutral-50"
          >
            <User className="w-3 h-3 mr-1" />
            Pengguna
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const handleDeleteClick = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete && onDelete) {
      onDelete(userToDelete.id);
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
        >
          Pengguna
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={row.original.avatarUrl}
              alt={row.getValue("name") as string}
            />
            <AvatarFallback className="bg-neutral-100 text-neutral-700">
              {(row.getValue("name") as string).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-medium text-neutral-900">
              {row.getValue("name")}
            </div>
            <div className="flex items-center text-sm text-neutral-500">
              <Mail className="w-3 h-3 mr-1" />
              {row.original.email as string}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
        >
          Peran
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => getRoleBadge(row.getValue("role")),
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
      accessorKey: "reportsCount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
        >
          Laporan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-medium text-neutral-900">
            {row.getValue("reportsCount")}
          </div>
          <div className="text-xs text-neutral-500">laporan</div>
        </div>
      ),
    },
    {
      accessorKey: "joinedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
        >
          Bergabung
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-neutral-900">
            {formatDate(row.getValue("joinedAt"))}
          </div>
          <div className="text-xs text-neutral-500">
            {getTimeAgo(row.getValue("joinedAt"))}
          </div>
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      accessorKey: "lastActive",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
        >
          Terakhir Aktif
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-neutral-900">
            {formatDate(row.getValue("lastActive"))}
          </div>
          <div className="text-xs text-neutral-500">
            {getTimeAgo(row.getValue("lastActive"))}
          </div>
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(user.id)}
              className="h-8 px-3 text-neutral-700 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400"
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Detail</span>
            </Button>
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
                <DropdownMenuItem onClick={() => onViewDetails?.(user.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(user)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Pengguna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-neutral-100 rounded animate-pulse" />
        <div className="border border-neutral-200 rounded-lg bg-white shadow-sm">
          <div className="h-12 bg-neutral-50 border-b" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b bg-white">
              <div className="flex items-center space-x-4 p-4">
                <div className="w-10 h-10 bg-neutral-100 rounded-full animate-pulse" />
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
    <>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="flex items-center space-x-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input
              placeholder="Cari pengguna..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-10"
            />
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
                        Tidak ada pengguna
                      </div>
                      <div className="text-sm">
                        Belum ada pengguna terdaftar
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
              dari {table.getFilteredRowModel().rows.length} pengguna
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <strong>{userToDelete?.name}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-neutral-50 hover:border-neutral-400">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
