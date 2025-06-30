// types/logger.ts
export type LogLevel = "ERROR" | "WARN" | "INFO";

export interface LogEntry {
  id?: string;
  createdAt?: Date;
  level: LogLevel;
  message: string;
  stack?: string;
  path?: string;
  method?: string;
  clientAgent?: string;
  ip?: string;
  statusCode?: number;
  requestBody?: any;
  requestHeaders?: any;
  environment: string;
  tags: string[];
  resolved?: boolean;
  resolution?: string;
  additionalData?: Record<string, any>;
  action?: string;
  identifierHint?: string;
  retryAfter?: number;
  failReason?: string;
  remainingAttempts?: number;
  blockDuration?: number;
  clientId?: string
}

import { headers } from 'next/headers';

// lib/logger.ts
import { currentClient } from '@/lib/current-client';
import { prisma } from '@/prisma';

export class Logger {
  private static async getRequestInfo() {
    try {
      const headersList = await headers();
      return {
        clientAgent: headersList.get("client-agent"),
        ip: headersList.get("x-forwarded-for") || headersList.get("x-real-ip"),
        path: headersList.get("x-invoke-path"),
        method: headersList.get("x-invoke-method"),
        requestHeaders: Object.fromEntries(headersList.entries()),
      };
    } catch {
      return {};
    }
  }

  private static async createLogEntry(params: LogEntry) {
    const requestInfo = this.getRequestInfo();
    const client = await currentClient()
    try {
      await prisma.errorLog.create({
        data: {
          level: params.level,
          message: params.message,
          stack: params.stack,
          path: params.path || (await requestInfo).path,
          method: params.method || (await requestInfo).method,
          clientId: client?.id || "",
          clientAgent: params.clientAgent || (await requestInfo).clientAgent,
          ip: params.ip || (await requestInfo).ip,
          statusCode: params.statusCode,
          requestBody: params.requestBody,
          requestHeaders:
            params.requestHeaders || (await requestInfo).requestHeaders,
          environment: process.env.NODE_ENV || "development",
          tags: params.tags,
          resolved: params.resolved || false,
          resolution: params.resolution,
          additionalData: JSON.stringify(params.additionalData),
        },
      });
    } catch (error) {
      console.error("Failed to create log entry:", error);
    }
  }

  static async error(message: string, params: Partial<LogEntry> = {}) {
    let stack: string | undefined;
    if (params.stack) {
      stack = params.stack;
    } else {
      const err = new Error();
      stack = err.stack;
    }

    await this.createLogEntry({
      level: "ERROR",
      message,
      stack,
      ...params,
      environment: process.env.NODE_ENV || "development",
      tags: [...(params.tags || []), "error"],
    });
  }

  static async warn(message: string, params: Partial<LogEntry> = {}) {
    await this.createLogEntry({
      level: "WARN",
      message,
      ...params,
      environment: process.env.NODE_ENV || "development",
      tags: [...(params.tags || []), "warning"],
    });
  }

  static async info(message: string, params: Partial<LogEntry> = {}) {
    await this.createLogEntry({
      level: "INFO",
      message,
      ...params,
      environment: process.env.NODE_ENV || "development",
      tags: [...(params.tags || []), "info"],
    });
  }

  static async withCatch<T>(
    operation: () => Promise<T>,
    errorMessage: string,
    params: Partial<LogEntry> = {}
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      await this.error(
        `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          ...params,
          stack: error instanceof Error ? error.stack : undefined,
          additionalData: {
            ...params.additionalData,
            originalError: error,
          },
        }
      );
      throw error;
    }
  }
}
