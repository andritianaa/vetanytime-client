import { useEffect } from 'react';
import useSWR from 'swr';

import { fetcher } from '@/lib/utils';
import { Client } from '@/types/schema';
import { Session } from '@prisma/client';

interface ErrorResponse {
  error: string;
}
interface Data {
  client: Client;
  session: Session;
}
export function useClient() {
  const { data, error, isLoading, mutate } = useSWR<Data | ErrorResponse>(
    "/api/auth/session",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  useEffect(() => {
    if (data && "client" in data) {
      localStorage.setItem("lang", data.client.language);
    }
  }, [data]);

  const isUnauthorized =
    data && "error" in data && data.error === "Non autorisé";
  const client = data && !isUnauthorized && !("error" in data) ? data.client : null;
  const session =
    data && !isUnauthorized && !("error" in data) ? data.session : null;

  return {
    client,
    session,
    isLoading,
    isError:
      !data || isUnauthorized || error ? new Error("Client not found") : null,
    mutate,
  } as const;
}
