"use client";

import { addDays, format } from 'date-fns';
import { ArrowUpDown, Calendar, Filter } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { DateRange } from "react-day-picker";

interface ActivityFiltersProps {
  actionFilter: string[];
  setActionFilter: (filter: string[]) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (direction: "asc" | "desc") => void;
  setSortBy: (sortBy: string) => void;
  setSearchQuery: (query: string) => void;
  handleFilterChange: () => void;
  availableActions: string[];
  getActionName: (action: string) => string;
}

export function ActivityFilters({
  actionFilter,
  setActionFilter,
  dateRange,
  setDateRange,
  sortDirection,
  setSortDirection,
  setSortBy,
  setSearchQuery,
  handleFilterChange,
  availableActions,
  getActionName,
}: ActivityFiltersProps) {
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
          <span className="font-medium text-sm">Filters</span>
        </div>

        {/* Action filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-background"
            >
              <span className="text-sm font-medium">Action Type</span>
              <Badge className="ml-1 bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0 h-5">
                {actionFilter.length || "All"}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Action Types</DropdownMenuLabel>
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
                          setDateRange(preset.range);
                          handleFilterChange();
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
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range?.from && range?.to) {
                      handleFilterChange();
                    }
                  }}
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
                Oldest
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Newest
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
            setDateRange(undefined);
            setSortBy("createdAt");
            setSortDirection("desc");
            handleFilterChange();
          }}
          className="ml-auto h-9 text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}
