import type { Client } from "@/types/schema"
import type { Session } from "@/types/session"

export interface AdminSessionsResponse {
    sessions: Array<Session & { user: Client }>
    pagination: {
        page: number
        limit: number
        totalCount: number
        totalPages: number
    }
}

export interface SessionFilters {
    searchQuery: string
    clientFilter: string | null
    deviceTypeFilter: string[]
    browserFilter: string[]
    startDate: string
    endDate: string
    sortBy: string
    sortDirection: "asc" | "desc"
}
