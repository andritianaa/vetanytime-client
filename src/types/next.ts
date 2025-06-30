import { Client as PrismaClient, Session as PrismaSession } from '@prisma/client';

import type { ReactNode } from "react";

export type PageParams<T extends Record<string, string> = {}> = {
  params: T;
  searchParams: { [key: string]: string | string[] | undefined };
};

export type LayoutParams<T extends Record<string, string | string[]> = {}> = {
  params: T;
  children?: ReactNode | undefined;
};

export type ErrorParams = {
  error: Error & { digest?: string };
  reset: () => void;
};

export type Client = Omit<PrismaClient, "password">;


export type Session = PrismaSession & {
  client: PrismaClient
};