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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import {
  MoreHorizontal,
  Search,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  useAdminUsersQuery,
  useChangeUserRoleMutation,
  type AdminUser,
} from "../../hooks/admin";

const getRoleBadge = (role: string) => {
  if (role === "admin") {
    return (
      <Badge
        variant="outline"
        className="border-neutral-300 bg-neutral-50 text-neutral-700"
      >
        <Shield className="mr-1 h-3 w-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-neutral-300 bg-neutral-50 text-neutral-700"
    >
      <User className="mr-1 h-3 w-3" />
      Pengguna
    </Badge>
  );
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

interface RoleChangeTarget {
  user: AdminUser;
  newRole: "user" | "admin";
}

export const AdminUsersTable = () => {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"user" | "admin" | "">("");
  const [roleChangeTarget, setRoleChangeTarget] =
    React.useState<RoleChangeTarget | null>(null);
  const limit = 20;

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error } = useAdminUsersQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
  });

  const changeRoleMutation = useChangeUserRoleMutation();

  const handleRoleChangeClick = (user: AdminUser) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setRoleChangeTarget({ user, newRole });
  };

  const handleRoleChangeConfirm = () => {
    if (!roleChangeTarget) return;
    changeRoleMutation.mutate({
      userId: roleChangeTarget.user.id,
      role: roleChangeTarget.newRole,
    });
    setRoleChangeTarget(null);
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: "Pengguna",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={row.original.avatar_url ?? undefined}
              alt={row.original.name}
            />
            <AvatarFallback className="bg-neutral-100 text-neutral-700">
              {row.original.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-neutral-900">
              {row.original.name}
            </div>
            <div className="text-sm text-neutral-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Peran",
      cell: ({ row }) => getRoleBadge(row.original.role),
    },
    {
      accessorKey: "report_count",
      header: "Laporan",
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-medium text-neutral-900">
            {row.original.report_count}
          </div>
          <div className="text-xs text-neutral-500">laporan</div>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Bergabung",
      cell: ({ row }) => (
        <span className="text-sm text-neutral-600">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-neutral-100"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleRoleChangeClick(user)}
                disabled={changeRoleMutation.isPending}
              >
                <Shield className="mr-2 h-4 w-4" />
                {user.role === "admin" ? "Jadikan Pengguna" : "Jadikan Admin"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pages ?? 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-neutral-500" />
        <span className="text-neutral-500">Memuat pengguna...</span>
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
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val === "all" ? "" : (val as "user" | "admin"));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Semua Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Peran</SelectItem>
              <SelectItem value="user">Pengguna</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <span className="ml-auto text-sm text-neutral-500">
            {data?.total ?? 0} pengguna
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
                    <Users className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                    <p className="text-neutral-500">
                      Tidak ada pengguna ditemukan
                    </p>
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

      {/* Role Change Confirmation Dialog */}
      <AlertDialog
        open={!!roleChangeTarget}
        onOpenChange={(open) => !open && setRoleChangeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah Peran Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan mengubah peran{" "}
              <strong>{roleChangeTarget?.user.name}</strong> dari{" "}
              <strong>{roleChangeTarget?.user.role}</strong> menjadi{" "}
              <strong>{roleChangeTarget?.newRole}</strong>. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChangeConfirm}
              className="bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Ubah Peran
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
