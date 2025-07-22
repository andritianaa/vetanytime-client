"use client";

import useSWR from "swr";

import { VeterinaireHeader } from "@/components/veterinaire/liste/veterinaire-header";
import { VeterinaireTable } from "@/components/veterinaire/liste/veterinaire-table";
import { VeterinaireTitleSearch } from "@/components/veterinaire/liste/veterinaire-title-search";
import { fetcher } from "@/lib/utils";
import { AdminVeterinairesResponse } from "@/types/admin-veterinaires";

export default function VeterinaireListePage() {
  const { data, error, isLoading, mutate } = useSWR<AdminVeterinairesResponse>(
    "/api/veterinaires/lists?limit=10&page=1",
    fetcher
  );
  console.log(data);
  return (
    <div className="flex flex-col min-h-screen">
      <VeterinaireHeader />
      <div className="space-y-6 p-6 pt-0 flex-1">
        <VeterinaireTitleSearch />

        <VeterinaireTable
          veterinaires={data?.organizations}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
