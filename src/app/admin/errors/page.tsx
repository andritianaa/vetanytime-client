"use client";

import { Calendar, Check, Filter, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetcher } from '@/lib/utils';

interface ErrorLog {
  id: string;
  createdAt: string | Date;
  level: string;
  message: string;
  stack?: string;
  path?: string;
  method?: string;
  clientId?: string;
  clientAgent?: string;
  ip?: string;
  statusCode?: number;
  requestBody?: any;
  requestHeaders?: any;
  environment: string;
  tags: string[];
  resolved: boolean;
  resolution?: string;
  additionalData?: string;
}

interface AdminErrorsResponse {
  errors: ErrorLog[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export default function AdminErrorsDashboard() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [envFilter, setEnvFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [resolvedFilter, setResolvedFilter] = useState<boolean | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolution, setResolution] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterChanged, setFilterChanged] = useState(false);

  // Build query parameters for API call
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (searchQuery) params.append("search", searchQuery);
    levelFilter.forEach((level) => params.append("level", level));
    tagFilter.forEach((tag) => params.append("tag", tag));
    if (envFilter) params.append("environment", envFilter);
    if (resolvedFilter !== null)
      params.append("resolved", resolvedFilter.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("sortBy", sortBy);
    params.append("sortDirection", sortDirection);

    return params.toString();
  };

  // Fetch error logs
  const {
    data,
    error,
    isLoading: isLoadingErrors,
    mutate,
  } = useSWR<AdminErrorsResponse>(
    `/api/admin/errors?${buildQueryString()}`,
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

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Get level badge color
  const getLevelBadgeColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return "bg-red-100 text-red-800 dark:text-red-200";
      case "WARN":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "INFO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Mark error as resolved
  const handleResolveError = async () => {
    if (!selectedError) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/errors/${selectedError.id}/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resolution }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resolve error");
      }

      toast({
        title: "Error resolved",
        description: "The error has been marked as resolved.",
      });

      mutate(); // Refresh error list
      setIsResolveOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve error. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Available error levels for filtering
  const availableLevels = ["ERROR", "WARN", "INFO"];

  // Get all unique tags from the data for filtering
  const availableTags = data?.errors
    ? [...new Set(data.errors.flatMap((error) => error.tags))]
    : [];

  // Get all unique environments from the data for filtering
  const availableEnvironments = data?.errors
    ? [...new Set(data.errors.map((error) => error.environment))]
    : [];

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load error logs: {error.message}
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Tableau de bord</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Error Logs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Error Logs</h2>
            <p className="text-muted-foreground">
              Monitor system errors and exceptions across your application
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search errors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilterChange();
              }}
              className="w-64"
            />
            <Button variant="outline" size="icon" onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter section */}
        <div className="flex flex-wrap items-center gap-2">
          <Label>Filters:</Label>

          {/* Error level filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Filter className="h-3.5 w-3.5" />
                Error Level
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Error Levels</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableLevels.map((level) => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={levelFilter.includes(level)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLevelFilter([...levelFilter, level]);
                    } else {
                      setLevelFilter(levelFilter.filter((l) => l !== level));
                    }
                    handleFilterChange();
                  }}
                >
                  {level}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Environment filter */}
          {availableEnvironments.length > 0 && (
            <Select
              value={envFilter || ""}
              onValueChange={(value) => {
                setEnvFilter(value || null);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All environments</SelectItem>
                {availableEnvironments.map((env) => (
                  <SelectItem key={env} value={env}>
                    {env}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Tags filter */}
          {availableTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Tags
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tags</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={tagFilter.includes(tag)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTagFilter([...tagFilter, tag]);
                      } else {
                        setTagFilter(tagFilter.filter((t) => t !== tag));
                      }
                      handleFilterChange();
                    }}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Resolved filter */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">Resolved:</Label>
            <Select
              value={
                resolvedFilter === null ? "all" : resolvedFilter ? "yes" : "no"
              }
              onValueChange={(value) => {
                if (value === "all") {
                  setResolvedFilter(null);
                } else {
                  setResolvedFilter(value === "yes");
                }
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Resolved</SelectItem>
                <SelectItem value="no">Unresolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date filters */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  handleFilterChange();
                }}
                className="w-auto border-0 p-0"
                placeholder="Start date"
              />
            </Button>
            <span>-</span>
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  handleFilterChange();
                }}
                className="w-auto border-0 p-0"
                placeholder="End date"
              />
            </Button>
          </div>

          {/* Sort controls */}
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              handleFilterChange();
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date</SelectItem>
              <SelectItem value="level">Level</SelectItem>
              <SelectItem value="statusCode">Status Code</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              handleFilterChange();
            }}
          >
            {sortDirection === "asc" ? "Plus ancien" : "Plus récent"}
          </Button>

          {/* Clear filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setLevelFilter([]);
              setEnvFilter(null);
              setTagFilter([]);
              setResolvedFilter(null);
              setStartDate("");
              setEndDate("");
              setSortBy("createdAt");
              setSortDirection("desc");
              handleFilterChange();
            }}
            className="ml-auto"
          >
            Clear Filters
          </Button>
        </div>

        {/* Error logs table */}
        <Card>
          <CardContent className="p-0">
            {isLoadingErrors ? (
              <div className="py-24 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading error logs...
                </p>
              </div>
            ) : data && data.errors.length > 0 ? (
              <div className="w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Date & Time</TableHead>
                      <TableHead className="w-[100px]">Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-[120px]">Path</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="text-right w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.errors.map((errorLog) => (
                      <TableRow
                        key={errorLog.id}
                        className={errorLog.resolved ? "opacity-60" : ""}
                      >
                        <TableCell className="font-mono text-xs">
                          {formatDate(errorLog.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadgeColor(
                              errorLog.level
                            )}`}
                          >
                            {errorLog.level}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="line-clamp-1 font-medium">
                            {errorLog.message}
                          </div>
                          {errorLog.clientId && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Client ID: {errorLog.clientId}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {errorLog.path ? (
                            <div className="text-xs overflow-hidden whitespace-nowrap text-ellipsis max-w-[120px]">
                              <span className="font-medium">
                                {errorLog.method || "GET"}
                              </span>{" "}
                              {errorLog.path}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {errorLog.resolved ? (
                              <div className="flex items-center gap-1.5 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-xs">Resolved</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-amber-600">
                                <X className="h-4 w-4" />
                                <span className="text-xs">Unresolved</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedError(errorLog);
                                setIsDetailsOpen(true);
                              }}
                            >
                              View
                            </Button>
                            {!errorLog.resolved && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedError(errorLog);
                                  setResolution("");
                                  setIsResolveOpen(true);
                                }}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-muted-foreground">
                  No error logs found matching your filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Label>Items per page:</Label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(Number.parseInt(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder={limit.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1}-
                {Math.min(page * limit, data.pagination.totalCount)} of{" "}
                {data.pagination.totalCount}
              </span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(1, page - 1))}
                    // TODO : disabling prev button
                    // disabled={page === 1}
                  />
                </PaginationItem>

                {Array.from(
                  { length: Math.min(5, data.pagination.totalPages) },
                  (_, i) => {
                    let pageNumber;
                    if (data.pagination.totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (page <= 3) {
                      pageNumber = i + 1;
                    } else if (page >= data.pagination.totalPages - 2) {
                      pageNumber = data.pagination.totalPages - 4 + i;
                    } else {
                      pageNumber = page - 2 + i;
                    }

                    if (
                      pageNumber > 0 &&
                      pageNumber <= data.pagination.totalPages
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={pageNumber === page}
                            onClick={() => setPage(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  }
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (page < data.pagination.totalPages) {
                        setPage(Math.min(data.pagination.totalPages, page + 1));
                      }
                    }}
                    className={
                      page === data.pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Error detail dialog */}
        {selectedError && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Error Details</DialogTitle>
                <DialogDescription>
                  Comprehensive information about this error
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadgeColor(
                        selectedError.level
                      )}`}
                    >
                      {selectedError.level}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(selectedError.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium mt-2">
                    {selectedError.message}
                  </h3>
                </div>

                {selectedError.stack && (
                  <div className="space-y-2">
                    <Label>Stack Trace</Label>
                    <ScrollArea className="h-[150px] w-full rounded-md border p-4">
                      <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                        {selectedError.stack}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedError.path && (
                    <div>
                      <Label>Request</Label>
                      <div className="text-sm mt-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method:</span>
                          <span className="font-medium">
                            {selectedError.method || "GET"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Path:</span>
                          <span>{selectedError.path}</span>
                        </div>
                        {selectedError.statusCode && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <span>{selectedError.statusCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedError.clientId && (
                    <div>
                      <Label>Client Information</Label>
                      <div className="text-sm mt-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Client ID:
                          </span>
                          <span>{selectedError.clientId}</span>
                        </div>
                        {selectedError.ip && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              IP Address:
                            </span>
                            <span>{selectedError.ip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedError.tags.length > 0 && (
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedError.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedError.resolved && selectedError.resolution && (
                  <div>
                    <Label>Resolution</Label>
                    <p className="text-sm mt-1 p-3 bg-green-50 border border-green-100 rounded-md dark:bg-green-900/20 dark:border-green-900/30">
                      {selectedError.resolution}
                    </p>
                  </div>
                )}

                {selectedError.requestBody && (
                  <div>
                    <Label>Request Body</Label>
                    <ScrollArea className="h-[100px] w-full rounded-md border p-4 mt-1">
                      <pre className="text-xs font-mono">
                        {JSON.stringify(selectedError.requestBody, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                {selectedError.requestHeaders && (
                  <div>
                    <Label>Request Headers</Label>
                    <ScrollArea className="h-[100px] w-full rounded-md border p-4 mt-1">
                      <pre className="text-xs font-mono">
                        {JSON.stringify(selectedError.requestHeaders, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                {selectedError.additionalData && (
                  <div>
                    <Label>Additional Data</Label>
                    <ScrollArea className="h-[100px] w-full rounded-md border p-4 mt-1">
                      <pre className="text-xs font-mono">
                        {selectedError.additionalData}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Resolve error dialog */}
        {selectedError && (
          <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resolve Error</DialogTitle>
                <DialogDescription>
                  Mark this error as resolved and add optional resolution notes.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution">
                    Resolution Notes (Optional)
                  </Label>
                  <Input
                    id="resolution"
                    className="w-full"
                    placeholder="How was this error resolved?"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="mark-resolved" checked={true} disabled />
                  <Label htmlFor="mark-resolved">Mark as resolved</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsResolveOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleResolveError} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Resolve Error"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
