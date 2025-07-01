"use client";

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import { ActivityDetailsDialog } from '@/components/admin/activity/activity-details-dialog';
import { ActivityFilters } from '@/components/admin/activity/activity-filters';
import { ActivityHeader } from '@/components/admin/activity/activity-header';
import { ActivityPagination } from '@/components/admin/activity/activity-pagination';
import { ActivityTable } from '@/components/admin/activity/activity-table';
import { SessionDetailsDialog } from '@/components/admin/activity/session-details-dialog';
import { useToast } from '@/hooks/use-toast';
import { fetcher } from '@/lib/utils';
import { Actions } from '@prisma/client';

import type { Activity } from "@/types/activity";
import type { Client } from "@/types/schema";
import type { Session } from "@/types/session";
interface AdminActivityResponse {
  activities: Array<Activity & { client: Client }>;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export default function AdminActivityDashboard() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string[]>([]);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedActivity, setSelectedActivity] = useState<
    (Activity & { client: Client }) | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterChanged, setFilterChanged] = useState(false);

  // Add state for the session details dialog
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSessionDetailsOpen, setIsSessionDetailsOpen] = useState(false);

  // Build query parameters for API call - memoize to prevent unnecessary rebuilds
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    // Only add search param if it's not empty
    if (searchQuery && searchQuery.trim() !== "") {
      params.append("search", searchQuery);
    }

    actionFilter.forEach((action) => params.append("action", action));
    if (clientFilter) params.append("clientId", clientFilter);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("sortBy", sortBy);
    params.append("sortDirection", sortDirection);

    return params.toString();
  }, [
    page,
    limit,
    searchQuery,
    actionFilter,
    clientFilter,
    startDate,
    endDate,
    sortBy,
    sortDirection,
  ]);

  // Fetch clients for filtering
  const { data: clientsResponse } = useSWR<{ clients: Client[] }>(
    "/api/admin/clients",
    fetcher
  );
  const clients = clientsResponse?.clients || [];

  // Available actions for filtering
  const availableActions = Object.values(Actions);

  // Fetch activity data
  const { data, error, isLoading, mutate } = useSWR<AdminActivityResponse>(
    `/api/admin/activity?${buildQueryString()}`,
    fetcher
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    if (filterChanged) {
      setPage(1);
      setFilterChanged(false);
    }
  }, [filterChanged]);

  const handleFilterChange = useCallback(() => {
    setFilterChanged(true);
  }, []);

  // Format date
  const formatDate = useCallback((date: Date | string) => {
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  // Get readable action name
  const getActionName = useCallback((action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, []);

  // Get badge color for action type
  const getActionBadgeVariant = useCallback((action: Actions) => {
    switch (action) {
      case "LOGIN_SUCCESS":
      case "USER_SIGNUP":
      case "PLAN_UPGRADE":
        return "default"; // Primary color
      case "EDIT_THEME":
      case "EDIT_IMAGE":
      case "EDIT_LANGAGE":
      case "EDIT_PASSWORD":
      case "PROFILE_UPDATE":
      case "SESSION_TERMINATED":
        return "secondary"; // Secondary color
      case "RESET_PASSWORD":
      case "FORGOT_PASSWORD":
      case "SESSIONS_TERMINATED":
        return "outline"; // Outline style
      case "LOGIN_FAILURE":
      case "DELETE_ACCOUNT":
        return "destructive"; // Destructive color
      default:
        return "secondary";
    }
  }, []);

  // Handle view details
  const handleViewDetails = useCallback(
    (activity: Activity & { client: Client }) => {
      setSelectedActivity(activity);
      setIsDetailsOpen(true);
    },
    []
  );

  // Add a handler for viewing session details
  const handleViewSessionDetails = useCallback((session: Session) => {
    setSelectedSession(session);
    setIsSessionDetailsOpen(true);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setActionFilter([]);
    setClientFilter(null);
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
    setSortDirection("desc");
    handleFilterChange();
  }, [handleFilterChange]);

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load activities: {error.message}
      </div>
    );
  }

  // Extract pagination data with fallbacks
  const totalCount = data?.pagination?.totalCount || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="flex flex-col min-h-screen">
      <ActivityHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleFilterChange={handleFilterChange}
        onRefresh={mutate}
      />

      <div className="space-y-6 p-6 pt-0 flex-1">
        <ActivityFilters
          actionFilter={actionFilter}
          setActionFilter={setActionFilter}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleFilterChange={handleFilterChange}
          availableActions={availableActions}
          getActionName={getActionName}
          clients={clients}
        />

        <ActivityTable
          activities={data?.activities || []}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onViewSessionDetails={handleViewSessionDetails}
          getActionBadgeVariant={getActionBadgeVariant}
          getActionName={getActionName}
          formatDate={formatDate}
        />

        {totalCount > 0 && (
          <ActivityPagination
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalCount={totalCount}
            totalPages={totalPages}
          />
        )}

        <ActivityDetailsDialog
          activity={selectedActivity}
          isOpen={isDetailsOpen}
          setIsOpen={setIsDetailsOpen}
          getActionBadgeVariant={getActionBadgeVariant}
          getActionName={getActionName}
          formatDate={formatDate}
        />

        <SessionDetailsDialog
          session={selectedSession}
          isOpen={isSessionDetailsOpen}
          setIsOpen={setIsSessionDetailsOpen}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
}
