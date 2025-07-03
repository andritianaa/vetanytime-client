"use client";

import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { adminTerminateSession } from '@/actions/session.actions';
import { SessionsFilters } from '@/components/admin/sessions/sessions-filters';
import { SessionsHeader } from '@/components/admin/sessions/sessions-header';
import { SessionsPagination } from '@/components/admin/sessions/sessions-pagination';
import { SessionsTitleSearch } from '@/components/admin/sessions/sessions-title-search';
import { TerminateSessionDialog } from '@/components/admin/sessions/terminate-session-dialog';
import { useToast } from '@/hooks/use-toast';
import { fetcher } from '@/lib/utils';
import { buildQueryString } from '@/utils/query-builder';

import type {
  AdminSessionsResponse,
  SessionFilters,
} from "@/types/admin-sessions";
import type { Client } from "@/types/schema";
import type { Session } from "@/types/session";
export default function AdminSessionsDashboard() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [filters, setFilters] = useState<SessionFilters>({
    searchQuery: "",
    clientFilter: null,
    deviceTypeFilter: [],
    browserFilter: [],
    startDate: "",
    endDate: "",
    sortBy: "lastActive",
    sortDirection: "desc",
  });
  const [selectedSession, setSelectedSession] = useState<
    (Session & { user: Client }) | null
  >(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterChanged, setFilterChanged] = useState(false);

  // Fetch sessions data
  const {
    data,
    error,
    isLoading: isLoadingSessions,
    mutate,
  } = useSWR<AdminSessionsResponse>(
    `/api/admin/sessions?${buildQueryString(filters, page, limit)}`,
    fetcher
  );

  // Get device types and browser types for filtering from the fetched data
  const deviceTypes = data?.sessions
    ? [...new Set(data.sessions.map((s) => s.deviceType))]
    : [];

  const browserTypes = data?.sessions
    ? [
        ...new Set(
          data.sessions
            .map((s) => s.browser)
            .filter((b): b is string => b !== null && b !== undefined)
        ),
      ]
    : [];

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

  // Update filters
  const updateFilters = (newFilters: Partial<SessionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      clientFilter: null,
      deviceTypeFilter: [],
      browserFilter: [],
      startDate: "",
      endDate: "",
      sortBy: "lastActive",
      sortDirection: "desc",
    });
    handleFilterChange();
  };

  // Handle session termination
  const handleTerminateSession = async () => {
    if (!selectedSession) return;

    setIsLoading(true);
    try {
      await adminTerminateSession(selectedSession.id);

      toast({
        title: "Session terminated",
        description: `Session for ${
          selectedSession.user.username || selectedSession.user.email
        } has been terminated.`,
      });

      mutate(); // Refresh the sessions list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate session. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load sessions: {error.message}
      </div>
    );
  }

  return (
    <>
      <SessionsHeader />

      <div className="space-y-6 p-6">
        <SessionsTitleSearch
          searchQuery={filters.searchQuery}
          setSearchQuery={(query) => updateFilters({ searchQuery: query })}
          handleFilterChange={handleFilterChange}
          refreshData={() => mutate()}
        />

        <SessionsFilters
          filters={filters}
          setFilters={updateFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          deviceTypes={deviceTypes}
          browserTypes={browserTypes}
        />

        {/* TODO : remove comment */}
        {/* <SessionsTable
          sessions={data?.sessions}
          isLoading={isLoadingSessions}
          onTerminateSession={(session) => {
            setSelectedSession(session);
            setIsConfirmOpen(true);
          }}
        /> */}

        {data && data.pagination.totalPages > 1 && (
          <SessionsPagination
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalCount={data.pagination.totalCount}
            totalPages={data.pagination.totalPages}
          />
        )}

        <TerminateSessionDialog
          session={selectedSession}
          isOpen={isConfirmOpen}
          setIsOpen={setIsConfirmOpen}
          onConfirm={handleTerminateSession}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
