"use client";

import { AdminUsersTable } from "./admin-users-table";

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

interface AdminUsersTableWrapperProps {
  data: AdminUser[];
  isLoading?: boolean;
}

export function AdminUsersTableWrapper({ data, isLoading }: AdminUsersTableWrapperProps) {
  const handleDelete = (userId: string) => {
    console.log("Delete user:", userId);
    // TODO: Implement delete logic with API call
  };

  const handleViewDetails = (userId: string) => {
    console.log("View user details:", userId);
    // TODO: Navigate to user details page or open modal
  };

  return (
    <AdminUsersTable
      data={data}
      isLoading={isLoading}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
    />
  );
} 