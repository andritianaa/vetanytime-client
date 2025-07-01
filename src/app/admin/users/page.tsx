"use client";

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import { ClientDetailsDialog } from '@/components/admin/users/user-details-dialog';
import { ClientsFilters } from '@/components/admin/users/users-filters';
import { ClientsHeader } from '@/components/admin/users/users-header';
import { ClientsPagination } from '@/components/admin/users/users-pagination';
import { ClientsTable } from '@/components/admin/users/users-table';
import { ClientsTitleSearch } from '@/components/admin/users/users-title-search';
import { useToast } from '@/hooks/use-toast';
import { fetcher } from '@/lib/utils';

import type { AdminClientsResponse, ClientFilters } from "@/types/admin-users";
import type { Client } from "@/types/schema";

export default function AdminClientDashboard() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [filters, setFilters] = useState<ClientFilters>({
    searchQuery: "",
    roleFilter: [],
    verificationFilter: null,
    statusFilter: null,
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterChanged, setFilterChanged] = useState(false);

  // Build query parameters for API call
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (filters.searchQuery) params.append("search", filters.searchQuery);
    filters.roleFilter.forEach((role) => params.append("role", role));
    if (filters.verificationFilter)
      params.append("verification", filters.verificationFilter);
    if (filters.statusFilter) params.append("status", filters.statusFilter);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    params.append("sortBy", filters.sortBy);
    params.append("sortDirection", filters.sortDirection);

    return params.toString();
  }, [page, limit, filters]);

  // Fetch clients data
  const { data, error, isLoading, mutate } = useSWR<AdminClientsResponse>(
    `/api/admin/clients?${buildQueryString()}`,
    fetcher
  );

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
  const updateFilters = (newFilters: Partial<ClientFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: "",
      roleFilter: [],
      verificationFilter: null,
      statusFilter: null,
      startDate: "",
      endDate: "",
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    // Call handleFilterChange in a setTimeout to break the render cycle
    setTimeout(() => {
      handleFilterChange();
    }, 0);
  }, []);

  // Handle view client details
  const handleViewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load clients: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ClientsHeader />

      <div className="space-y-6 p-6 pt-0 flex-1">
        <ClientsTitleSearch
          searchQuery={filters.searchQuery}
          setSearchQuery={(query) => updateFilters({ searchQuery: query })}
          handleFilterChange={handleFilterChange}
          refreshData={() => mutate()}
        />

        <ClientsFilters
          filters={filters}
          setFilters={updateFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
        />

        <ClientsTable
          clients={data?.clients || []}
          isLoading={isLoading}
          onViewClientDetails={handleViewClientDetails}
        />

        {data && data.pagination.totalPages > 1 && (
          <ClientsPagination
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalCount={data.pagination.totalCount}
            totalPages={data.pagination.totalPages}
          />
        )}

        <ClientDetailsDialog
          clientId={selectedClient?.id}
          isOpen={isDetailsOpen}
          setIsOpen={setIsDetailsOpen}
          onClientUpdated={() => mutate()}
        />
      </div>
    </div>
  );
}
