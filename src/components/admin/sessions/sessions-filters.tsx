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
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { SessionFilters } from "@/types/admin-sessions";
import type { Client } from "@/types/schema";
import type { DateRange } from "react-day-picker";

interface SessionsFiltersProps {
  filters: SessionFilters;
  setFilters: (filters: Partial<SessionFilters>) => void;
  handleFilterChange: () => void;
  clearFilters: () => void;
  deviceTypes: string[];
  browserTypes: string[];
}

export function SessionsFilters({
  filters,
  setFilters,
  handleFilterChange,
  clearFilters,
  deviceTypes,
  browserTypes,
}: SessionsFiltersProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [debouncedSearch] = useDebounce(clientSearch, 300);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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

  // Fetch clients based on search query
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/users?query=${debouncedSearch}&limit=10`
        );
        if (!response.ok) throw new Error("Failed to fetch clients");
        const data = await response.json();
        setClients(data.clients);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [debouncedSearch]);

  // Fetch selected client details if we have a clientFilter but no selectedClient
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (filters.clientFilter && !selectedClient) {
        try {
          // Use the same API but filter for a specific client ID
          const response = await fetch(
            `/api/admin/users?clientId=${filters.clientFilter}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.clients && data.clients.length > 0) {
              setSelectedClient(data.clients[0]);
            }
          }
        } catch (error) {
          console.error("Error fetching client details:", error);
        }
      }
    };

    fetchClientDetails();
  }, [filters.clientFilter, selectedClient]);

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
                      {selectedClient.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{selectedClient.username}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClient(null);
                      setFilters({ clientFilter: null });
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
                  {loading ? (
                    <Skeleton className="h-8 w-full my-1" />
                  ) : (
                    "No clients found"
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {loading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-2 py-1.5"
                        >
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ))
                  ) : (
                    <>
                      <CommandItem
                        onSelect={() => {
                          setSelectedClient(null);
                          setFilters({ clientFilter: null });
                          handleFilterChange();
                          setOpen(false);
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-sm">Tous les clients</span>
                      </CommandItem>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          onSelect={() => {
                            setSelectedClient(client);
                            setFilters({ clientFilter: client.id });
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
                              {client.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {client.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {client.email}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Device type filter */}
        {deviceTypes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-background"
              >
                <span className="text-sm font-medium">Type d'appareil</span>
                <Badge className="ml-1 bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0 h-5">
                  {filters.deviceTypeFilter.length || "Tout"}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Type d'appareils</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {deviceTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.deviceTypeFilter.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({
                        deviceTypeFilter: [...filters.deviceTypeFilter, type],
                      });
                    } else {
                      setFilters({
                        deviceTypeFilter: filters.deviceTypeFilter.filter(
                          (t) => t !== type
                        ),
                      });
                    }
                    handleFilterChange();
                  }}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Browser filter */}
        {browserTypes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-background"
              >
                <span className="text-sm font-medium">Browser</span>
                <Badge className="ml-1 bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0 h-5">
                  {filters.browserFilter.length || "Tout"}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Browsers</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {browserTypes
                .filter((browser): browser is string => browser !== null)
                .map((browser) => (
                  <DropdownMenuCheckboxItem
                    key={browser}
                    checked={filters.browserFilter.includes(browser)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters({
                          browserFilter: [...filters.browserFilter, browser],
                        });
                      } else {
                        setFilters({
                          browserFilter: filters.browserFilter.filter(
                            (b) => b !== browser
                          ),
                        });
                      }
                      handleFilterChange();
                    }}
                  >
                    {browser}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
                <span>Date range</span>
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
              <SelectItem value="lastActive">Dernière activité</SelectItem>
              <SelectItem value="createdAt">Date de création</SelectItem>
              <SelectItem value="deviceType">Type d'appareil</SelectItem>
              <SelectItem value="browser">Browser</SelectItem>
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
            {filters.sortDirection === "asc" ? (
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
          onClick={clearFilters}
          className="ml-auto h-9 text-muted-foreground hover:text-foreground"
        >
          Reinitialiser
        </Button>
      </div>
    </div>
  );
}
