"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditSpecialisationModal } from '@/components/veterinaire/modal/edit-specialisation-modal';
import { VeterinaireFullProfile } from '@/types/admin-veterinaires';

export const OrgSpecialisation = ({
  organization,
}: {
  organization: VeterinaireFullProfile;
}) => {
  if (organization)
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 ">
            <CardTitle>Spécialisations</CardTitle>
            <EditSpecialisationModal
              organizationId={organization.id}
              specialisations={organization.OrganizationSpecialisation.map(
                (os) => ({
                  ...os.specialisation,
                  organizationId: organization.id,
                })
              )}
            />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {organization.OrganizationSpecialisation.map(
              (os) => os.specialisation
            ).map((specialisation) => (
              <Badge
                className="bg-primary/10 border-primary text-primary text-sm"
                key={specialisation.id}
              >
                {specialisation.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    );
};
