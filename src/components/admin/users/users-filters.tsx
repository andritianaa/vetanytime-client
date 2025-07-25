"use client";

import { addDays, format } from 'date-fns';
import { ArrowUpDown, Calendar, Filter } from 'lucide-react';
import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { ClientFilters } from "@/types/admin-users";
import type { DateRange } from "react-day-picker";

interface ClientsFiltersProps {
  filters: ClientFilters;
  setFilters: (filters: Partial<ClientFilters>) => void;
  handleFilterChange: () => void;
  clearFilters: () => void;
}

export function ClientsFilters({
  filters,
  setFilters,
  handleFilterChange,
  clearFilters,
}: ClientsFiltersProps) {
  const [debouncedSearchQuery] = useDebounce(filters.searchQuery, 500);

  // Effect to trigger filter change only after debounce
  useEffect(() => {
    if (
      debouncedSearchQuery !== undefined &&
      debouncedSearchQuery !== filters.searchQuery
    ) {
      handleFilterChange();
    }
  }, [debouncedSearchQuery, handleFilterChange, filters.searchQuery]);

  // Convert string dates to DateRange object for the calendar
  const dateRange: DateRange | undefined =
    filters.startDate || filters.endDate
      ? {
          from: filters.startDate ? new Date(filters.startDate) : undefined,
          to: filters.endDate ? new Date(filters.endDate) : undefined,
        }
      : undefined;

  // Update date range and convert to string format for filters
  const updateDateRange = (range: DateRange | undefined) => {
    setFilters({
      startDate: range?.from ? format(range.from, "yyyy-MM-dd") : "",
      endDate: range?.to ? format(range.to, "yyyy-MM-dd") : "",
    });
    if (range?.from && range?.to) {
      handleFilterChange();
    }
  };

  // Available roles for filtering
  const availableRoles = ["CLIENT", "ADMIN", "SUPERADMIN", "MODERATOR", "DEV"];

  // Date range presets
  const datePresets = [
    {
      name: "Today",
      range: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      name: "Yesterday",
      range: {
        from: addDays(new Date(), -1),
        to: addDays(new Date(), -1),
      },
    },
    {
      name: "Last 7 days",
      range: {
        from: addDays(new Date(), -6),
        to: new Date(),
      },
    },
    {
      name: "Last 30 days",
      range: {
        from: addDays(new Date(), -29),
        to: new Date(),
      },
    },
  ];

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Filtres</span>
        </div>

        {/* Role filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-background"
            >
              <span className="text-sm font-medium">Rôle</span>
              <Badge className="ml-1 bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0 h-5">
                {filters.roleFilter.length || "Tout"}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Role du client</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableRoles.map((role) => (
              <DropdownMenuCheckboxItem
                key={role}
                checked={filters.roleFilter.includes(role)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilters({
                      roleFilter: [...filters.roleFilter, role],
                    });
                  } else {
                    setFilters({
                      roleFilter: filters.roleFilter.filter((r) => r !== role),
                    });
                  }
                  handleFilterChange();
                }}
              >
                {role}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Verification status filter */}
        <Select
          value={filters.verificationFilter || ""}
          onValueChange={(value) => {
            setFilters({ verificationFilter: value === "" ? null : value });
            handleFilterChange();
          }}
        >
          <SelectTrigger className="h-9 rounded-full bg-background w-[180px]">
            <SelectValue placeholder="Verification email" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les vériications de status</SelectItem>
            <SelectItem value="verified">Vérifié</SelectItem>
            <SelectItem value="unverified">Non vérifié</SelectItem>
          </SelectContent>
        </Select>

        {/* Account status filter */}
        <Select
          value={filters.statusFilter || ""}
          onValueChange={(value) => {
            setFilters({ statusFilter: value === "" ? null : value });
            handleFilterChange();
          }}
        >
          <SelectTrigger className="h-9 rounded-full bg-background w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Status</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
            <SelectItem value="locked">Vérouillé</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 px-3 flex items-center gap-1.5 rounded-full bg-background justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <Calendar lang="Fr" className="h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    <span>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </span>
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Date d'enregistrement</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-2">
              <div className="border-r p-2 sm:p-3">
                <div className="space-y-2 sm:space-y-3">
                  <div className="font-medium text-sm">Presets</div>
                  <div className="flex flex-col gap-2">
                    {datePresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        className="justify-start font-normal"
                        onClick={() => {
                          updateDateRange(preset.range);
                        }}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-2 sm:p-3">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={updateDateRange}
                  numberOfMonths={1}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => {
              setFilters({ sortBy: value });
              handleFilterChange();
            }}
          >
            <SelectTrigger className="h-9 rounded-full bg-background w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date d'inscription</SelectItem>
              <SelectItem value="username">Nom d'utilisateur</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="lastLogin">Dernière connexion</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters({
                sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
              });
              handleFilterChange();
            }}
            className="h-9 rounded-full bg-background"
          >
            <span className="flex items-center gap-1.5">
              <ArrowUpDown
                className={cn(
                  "h-3.5 w-3.5",
                  filters.sortDirection === "asc" && "rotate-180"
                )}
              />
              {filters.sortDirection === "asc" ? "Ascendant" : "Descendant"}
            </span>
          </Button>
        </div>

        {/* Clear filters */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearFilters();
          }}
          className="ml-auto h-9 text-muted-foreground hover:text-foreground"
        >
          Reinitialiser
        </Button>
      </div>
    </div>
  );
}
