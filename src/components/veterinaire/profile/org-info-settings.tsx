"use client";

import { Earth } from 'lucide-react';
import useSWR from 'swr';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VetProfileEditDialog } from '@/components/veterinaire/modal/vet-profile-edit-dialog';
import OrgProfilePicture from '@/components/veterinaire/profile/org-profil-picture';
import { fetcher } from '@/lib/utils';
import { languageLabels } from '@/utils/languageLables';

import type { VeterinaireFullProfile } from "@/types/admin-veterinaires";
import type { CareType } from "@prisma/client";
interface OrgInfoSettingsProps {
  organization: VeterinaireFullProfile;
}

export const OrgInfoSettings = ({ organization }: OrgInfoSettingsProps) => {
  const {
    data: careTypeList,
    error: careTypeError,
    isLoading: careTypeLoading,
  } = useSWR<CareType[]>("/api/veterinaires/careTypelists", fetcher);

  // Vérifications de sécurité pour éviter les erreurs
  if (!organization) {
    return (
      <Alert>
        <AlertDescription>
          Aucune donnée d'organisation disponible.
        </AlertDescription>
      </Alert>
    );
  }

  if (!organization) {
    return (
      <Alert>
        <AlertDescription>Données d'organisation manquantes.</AlertDescription>
      </Alert>
    );
  }

  // Données sécurisées avec valeurs par défaut
  const safeOrgData = {
    id: organization.id || "",
    name: organization.name || "Nom non défini",
    logo: organization.logo || "",
    careType: organization.careType || null,
    careTypeId: organization.careTypeId || null,
    graduation: organization.graduation || "",
    approvalNumber: organization.approvalNumber || "",
    contactList: organization.contactList || [],
    lang: organization.lang || [],
  };

  if (careTypeError) {
    console.error("Error fetching care types:", careTypeError);
  }

  return (
    <div className="flex w-full flex-col gap-6 lg:gap-8">
      <div className="space-y-2">
        <Card>
          <CardContent className="relative flex items-start p-6">
            {/* Logo/Image section */}
            <div className="flex-shrink-0 mr-6">
              <OrgProfilePicture
                currentPics={safeOrgData.logo}
                orgId={safeOrgData.id}
              />
            </div>

            {/* Profile Info Display */}
            <div className="flex flex-col items-start gap-4 flex-grow">
              <div className="flex flex-col">
                <p className="text-xl font-semibold">{safeOrgData.name}</p>
                {safeOrgData.careType?.name ? (
                  <p className="text-muted-foreground text-md">
                    {safeOrgData.careType.name}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-md">
                    Aucune profession sélectionnée
                  </p>
                )}
              </div>

              {safeOrgData.lang.length > 0 && (
                <div className="flex items-center gap-2">
                  <Earth size={18} className="text-muted-foreground" />
                  <p className="text-muted-foreground text-md">
                    {safeOrgData.lang.map((l, i, arr) => (
                      <span key={i}>
                        {languageLabels[l] || l}
                        {i < arr.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>

            {/* Edit Dialog */}
            <div className="flex-shrink-0">
              {careTypeLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <VetProfileEditDialog
                  careTypes={careTypeList || []}
                  initialData={{
                    id: safeOrgData.id,
                    name: safeOrgData.name,
                    diploma: safeOrgData.graduation || undefined,
                    careType: safeOrgData.careType
                      ? {
                          id: safeOrgData.careType.id,
                          name: safeOrgData.careType.name,
                        }
                      : undefined,
                    approvalNumber: safeOrgData.approvalNumber || undefined,
                    contacts: safeOrgData.contactList,
                    languages: safeOrgData.lang,
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
