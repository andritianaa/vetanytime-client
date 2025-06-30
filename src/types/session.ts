import { Activity } from './activity';
import { Client } from './schema';

export interface Session {
    id: string;
    clientId: string;
    token: string;
    deviceType: string;
    deviceOs: string;
    deviceModel: string | null;
    browser: string | null;
    browserVersion: string | null;
    authType: string;
    ip: string;
    country: string | null;
    lastActive: Date | string;
    createdAt: Date | string;

    // Relations
    client?: Client;
    activities?: Activity[];

    // For frontend display
    isCurrentSession?: boolean;
}

export interface SessionFilters {
    deviceType?: string;
    browser?: string;
    isActive?: boolean;
    startDate?: Date | string;
    endDate?: Date | string;
}