"use client";

import { addDays, format } from 'date-fns';
import { ArrowUpDown, Calendar, Filter, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { Client } from "@/types/schema";
import type { DateRange } from "react-day-picker";

interface ActivityFiltersProps {
  actionFilter: string[];
  setActionFilter: (filter: string[]) => void;
  clientFilter: string | null;
  setClientFilter: (filter: string | null) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (direction: "asc" | "desc") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleFilterChange: () => void;
  availableActions: string[];
  getActionName: (action: string) => string;
  clients?: Client[];
}

export function ActivityFilters({
  actionFilter,
  setActionFilter,
  clientFilter,
  setClientFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  searchQuery,
  setSearchQuery,
  handleFilterChange,
  availableActions,
  getActionName,
  clients,
}: ActivityFiltersProps) {
  const [open, setOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [debouncedSearch] = useDebounce(clientSearch, 300);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Effect to trigger filter change only after debounce
  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      handleFilterChange();
    }
  }, [debouncedSearchQuery, handleFilterChange]);

  // Convert string dates to DateRange object for the calendar
  const dateRange: DateRange | undefined =
    startDate || endDate
      ? {
          from: startDate ? new Date(startDate) : undefined,
          to: endDate ? new Date(endDate) : undefined,
        }
      : undefined;

  // Update date range and convert to string format for filters
  const updateDateRange = (range: DateRange | undefined) => {
    setStartDate(range?.from ? format(range.from, "yyyy-MM-dd") : "");
    setEndDate(range?.to ? format(range.to, "yyyy-MM-dd") : "");
    if (range?.from && range?.to) {
      handleFilterChange();
    }
  };

  // Fetch selected client details if we have a clientFilter but no selectedClient
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (clientFilter && !selectedClient && clients) {
        const foundClient = clients.find(
          (client) => client.id === clientFilter
        );
        if (foundClient) {
          setSelectedClient(foundClient);
        }
      }
    };

    fetchClientDetails();
  }, [clientFilter, selectedClient, clients]);

  // Filter clients based on search
  const filteredClients = Array.isArray(clients)
    ? clients.filter(
        (client) =>
          client.username
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          client.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (client.fullname &&
            client.fullname
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase()))
      )
    : [];

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

        {/* Action filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-background"
            >
              <span className="text-sm font-medium">Types d'actions</span>
              <Badge className="ml-1 bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0 h-5">
                {actionFilter.length || "Tout"}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 max-h-80 overflow-y-auto"
          >
            <DropdownMenuLabel>Types d'actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableActions.map((action) => (
              <DropdownMenuCheckboxItem
                key={action}
                checked={actionFilter.includes(action)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setActionFilter([...actionFilter, action]);
                  } else {
                    setActionFilter(actionFilter.filter((a) => a !== action));
                  }
                  handleFilterChange();
                }}
              >
                {getActionName(action)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Client filter with search */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-background justify-between"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">Client</span>
              </div>
              {selectedClient ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={selectedClient.image || "/placeholder.svg"}
                      alt={selectedClient.username}
                    />
                    <AvatarFallback>
                      {selectedClient.username?.slice(0, 2).toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {selectedClient.username || selectedClient.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClient(null);
                      setClientFilter(null);
                      handleFilterChange();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Badge className="ml-1 bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0 h-5">
                  Tout
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[300px]" align="start">
            <Command>
              <CommandInput
                placeholder="Recherche clients..."
                value={clientSearch}
                onValueChange={setClientSearch}
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>
                  {loading ? "Chargement..." : "Auncun client"}
                </CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelectedClient(null);
                      setClientFilter(null);
                      handleFilterChange();
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm">Tous les clients</span>
                  </CommandItem>
                  {filteredClients.map((client) => (
                    <CommandItem
                      key={client.id}
                      onSelect={() => {
                        setSelectedClient(client);
                        setClientFilter(client.id);
                        handleFilterChange();
                        setOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={client.image || "/placeholder.svg"}
                          alt={client.username}
                        />
                        <AvatarFallback>
                          {client.username?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {client.username || client.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {client.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

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
              <Calendar className="h-4 w-4" />
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
                <span>Date</span>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              handleFilterChange();
            }}
            className="h-9 rounded-full bg-background"
          >
            {sortDirection === "asc" ? (
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 rotate-180" />
                Plus ancien
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Plus récent
              </span>
            )}
          </Button>
        </div>

        {/* Clear filters */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearchQuery("");
            setActionFilter([]);
            setClientFilter(null);
            setStartDate("");
            setEndDate("");
            setSortBy("createdAt");
            setSortDirection("desc");
            handleFilterChange();
          }}
          className="ml-auto h-9 text-muted-foreground hover:text-foreground"
        >
          Reinitialiser
        </Button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // Don't call handleFilterChange() here, it will be called by the effect
          }}
          placeholder="Search..."
          className="hidden"
        />
      </div>
    </div>
  );
}
