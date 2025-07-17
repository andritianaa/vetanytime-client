"use client";

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { EditLocationModal } from '@/components/veterinaire/modal/edit-location-modal';
import { VeterinaireFullProfile } from '@/types/admin-veterinaires';

interface OrgLocationSettingsProps {
  organization: VeterinaireFullProfile;
}

export const OrgLocationSettings = ({
  organization,
}: OrgLocationSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 ">
          <CardTitle>Localisation</CardTitle>
          <EditLocationModal
            cityId={organization.cityId || ""}
            address={organization.address || ""}
            orgId={organization.id || ""}
          />
        </CardHeader>
      </Card>
    </div>
  );
};
