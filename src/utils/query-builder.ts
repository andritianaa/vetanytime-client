import type { SessionFilters } from "@/types/admin-sessions"

export function buildQueryString(filters: SessionFilters, page: number, limit: number) {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())

    if (filters.searchQuery) params.append("search", filters.searchQuery)
    filters.deviceTypeFilter.forEach((type) => params.append("deviceType", type))
    filters.browserFilter.forEach((browser) => params.append("browser", browser))
    if (filters.clientFilter) params.append("clientId", filters.clientFilter)
    if (filters.startDate) params.append("startDate", filters.startDate)
    if (filters.endDate) params.append("endDate", filters.endDate)
    params.append("sortBy", filters.sortBy)
    params.append("sortDirection", filters.sortDirection)

    return params.toString()
}
