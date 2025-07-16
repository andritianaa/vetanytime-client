"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import useSWR from "swr";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { VeterinaireEditTabs } from "@/components/veterinaire/veterinaire-edit-tabs";
import { fetcher } from "@/lib/utils";

import type { VeterinaireFullProfile } from "@/types/admin-veterinaires";
export default function Page() {
  const pathname = usePathname();

  const id = useMemo(() => {
    const segments = pathname.split("/");
    return segments[2]; // segments[0] = "", [1] = "veterinaire", [2] = "123"
  }, [pathname]);

  const { data, error, isLoading, mutate } = useSWR<VeterinaireFullProfile>(
    id ? `/api/veterinaires/${id}` : null,
    fetcher
  );

  if (error) {
    console.error("Error fetching veterinarian profile:", error);
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">Tableau de bord</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/veterinaire/liste">
                    Gestion des vétérinaires
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Erreur</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Erreur lors du chargement du profil vétérinaire. Veuillez
              réessayer.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Tableau de bord</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/veterinaire/liste">
                  Gestion des vétérinaires
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {isLoading
                    ? "Chargement..."
                    : data?.name || "Profil vétérinaire"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-6 p-6 pt-0 flex-1">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6 p-6 pt-0 flex-1">
          <VeterinaireEditTabs organization={data} />
        </div>
      ) : (
        <div className="p-6">
          <Alert>
            <AlertDescription>
              Aucune donnée trouvée pour ce vétérinaire.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
