"use client";

import { useMemo } from "react";

import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityPaginationProps {
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalCount: number;
  totalPages: number;
}

export function ActivityPagination({
  page,
  setPage,
  limit,
  setLimit,
  totalCount,
  totalPages,
}: ActivityPaginationProps) {
  // Use useMemo to calculate pagination items to prevent recalculation on every render
  const paginationItems = useMemo(() => {
    const items = [];

    // Determine which page numbers to show
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > 5) {
      if (page <= 3) {
        endPage = 5;
      } else if (page >= totalPages - 2) {
        startPage = totalPages - 4;
      } else {
        startPage = page - 2;
        endPage = page + 2;
      }
    }

    // Create array of page numbers to display
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    return items;
  }, [page, totalPages]);

  return (
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
          Showing {totalCount === 0 ? 0 : (page - 1) * limit + 1}-
          {Math.min(page * limit, totalCount)} of {totalCount}
        </span>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {paginationItems.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                isActive={pageNumber === page}
                onClick={() => pageNumber !== page && setPage(pageNumber)}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              aria-disabled={page === totalPages}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
