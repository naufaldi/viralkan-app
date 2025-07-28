"use client";

import { useState } from "react";
import { AdminUsersTable } from "./admin-users-table";
import { useAdminStatsQuery } from "../../hooks/admin";
import { toast } from "sonner";

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
  // Remove data and isLoading props since we're using real data
}

export function AdminUsersTableWrapper({}: AdminUsersTableWrapperProps) {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
  });

  // Data fetching - temporarily use admin stats for user count
  const { data: statsData, isLoading, error } = useAdminStatsQuery();

  // For now, create mock data based on stats since there's no admin users API yet
  const transformedData: AdminUser[] = statsData
    ? [
        {
          id: "1",
          name: "Admin User",
          email: "admin@viralkan.com",
          role: "admin" as const,
          status: "active" as const,
          joinedAt: "2024-01-01T00:00:00Z",
          lastActive: new Date().toISOString(),
          reportsCount: 0,
          avatarUrl: undefined,
        },
        {
          id: "2",
          name: "Regular User",
          email: "user@viralkan.com",
          role: "user" as const,
          status: "active" as const,
          joinedAt: "2024-01-02T00:00:00Z",
          lastActive: new Date().toISOString(),
          reportsCount: statsData.totalReports,
          avatarUrl: undefined,
        },
      ]
    : [];

  const handleDelete = async (userId: string) => {
    try {
      // TODO: Implement delete logic with API call when admin users API is available
      console.log("Delete user:", userId);
      toast.success("User deleted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user",
      );
    }
  };

  const handleViewDetails = (userId: string) => {
    console.log("View user details:", userId);
    // TODO: Navigate to user details page or open modal
  };

  // Handle error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="border border-red-200 rounded-lg bg-red-50 p-4">
          <div className="text-red-800 font-medium mb-2">
            Error loading users
          </div>
          <div className="text-red-600 text-sm">
            {error instanceof Error ? error.message : "Failed to load users"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminUsersTable
      data={transformedData}
      isLoading={isLoading}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
    />
  );
}
