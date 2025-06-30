import type { Activity } from "@/types/activity"
import type { Client } from "@/types/schema"
import type { Session } from "@/types/session"
import type { Media } from "@prisma/client"

export interface AdminClientsResponse {
    clients: Client[]
    pagination: {
        page: number
        limit: number
        totalCount: number
        totalPages: number
    }
}

// Make sure all required properties from Client remain required
export interface ClientDetailsResponse extends Omit<Client, "password"> {
    Session: Session[]
    activities: Activity[]
    Media: Media[]
    emailVerified?: Date | null
    verificationToken: string | null
    lastLogin?: Date | null
    lastPasswordChange?: Date | null
    active: boolean
    locked: boolean
    description: string | null
    language: string // Required as in Client type
    theme: string // Required as in Client type
}

export interface ClientFilters {
    searchQuery: string
    roleFilter: string[]
    verificationFilter: string | null
    statusFilter: string | null
    startDate: string
    endDate: string
    sortBy: string
    sortDirection: "asc" | "desc"
}
