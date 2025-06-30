import { Actions } from '@prisma/client';

import { Client } from './schema';
import { Session } from './session';

export interface Activity {
    id: string;
    clientId: string;
    sessionId: string | null;
    action: Actions;
    metadata: any | null;
    createdAt: Date | string;

    // Relations
    client?: Client;
    session?: Session | null;
}

export interface ActivityFilters {
    search?: string;
    actions?: Actions[];
    sessionId?: string | null;
    startDate?: Date | string;
    endDate?: Date | string;
}

export interface ActivityListResponse {
    activities: Activity[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
}