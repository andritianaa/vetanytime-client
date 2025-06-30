"use client";

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { useToast } from '@/hooks/use-toast';
import { fetcher } from '@/lib/utils';

import { ActivityDetail } from './activity-detail';
import { ActivityFilters } from './activity-filters';
import { ActivityHeader } from './activity-header';
import { ActivityList } from './activity-list';
import { ActivityPagination } from './activity-pagination';
import {
    AVAILABLE_ACTIONS, formatDate, getActionBadgeVariant, getActionDescription, getActionName
} from './activity-utils';

import type { Activity } from "@/types/activity";
import type { Session } from "@/types/session";
import type { DateRange } from "react-day-picker";
interface ActivityManagementProps {
  sessionId?: string;
  sessionInfo?: Session;
}

export function ActivityManagement({
  sessionId,
  sessionInfo,
}: ActivityManagementProps) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterChanged, setFilterChanged] = useState(false);

  // Build query parameters for API call
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (searchQuery) params.append("search", searchQuery);
    actionFilter.forEach((action) => params.append("action", action));

    if (dateRange?.from) {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      params.append("startDate", startDate);
    }

    if (dateRange?.to) {
      const endDate = format(dateRange.to, "yyyy-MM-dd");
      params.append("endDate", endDate);
    }

    params.append("sortBy", sortBy);
    params.append("sortDirection", sortDirection);

    // Add sessionId filter if provided
    if (sessionId) {
      params.append("sessionId", sessionId);
    }

    return params.toString();
  };

  // Fetch activity data
  const { data, error, isLoading, mutate } = useSWR<{
    activities: Activity[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }>(`/api/account/activity?${buildQueryString()}`, fetcher);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (filterChanged) {
      setPage(1);
      setFilterChanged(false);
    }
  }, [filterChanged]);

  const handleFilterChange = () => {
    setFilterChanged(true);
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load activities: {error.message}
      </div>
    );
  }

  return (
    <>
      <ActivityHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleFilterChange={handleFilterChange}
        mutate={mutate}
        sessionInfo={sessionInfo}
      />

      <ActivityFilters
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        setSortBy={setSortBy}
        setSearchQuery={setSearchQuery}
        handleFilterChange={handleFilterChange}
        availableActions={AVAILABLE_ACTIONS}
        getActionName={getActionName}
      />

      <div className="space-y-4">
        {data && data.activities ? (
          <ActivityList
            activities={data.activities}
            isLoading={isLoading}
            formatDate={formatDate}
            getActionName={getActionName}
            getActionDescription={getActionDescription}
            getActionBadgeVariant={getActionBadgeVariant}
            setSelectedActivity={setSelectedActivity}
            setIsDetailsOpen={setIsDetailsOpen}
          />
        ) : (
          <ActivityList
            activities={[]}
            isLoading={isLoading}
            formatDate={formatDate}
            getActionName={getActionName}
            getActionDescription={getActionDescription}
            getActionBadgeVariant={getActionBadgeVariant}
            setSelectedActivity={setSelectedActivity}
            setIsDetailsOpen={setIsDetailsOpen}
          />
        )}

        {data && data.pagination && data.pagination.totalPages > 1 && (
          <ActivityPagination
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalPages={data.pagination.totalPages}
            totalCount={data.pagination.totalCount}
          />
        )}
      </div>

      <ActivityDetail
        activity={selectedActivity}
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        formatDate={formatDate}
        getActionName={getActionName}
        getActionDescription={getActionDescription}
        getActionBadgeVariant={getActionBadgeVariant}
      />
    </>
  );
}
