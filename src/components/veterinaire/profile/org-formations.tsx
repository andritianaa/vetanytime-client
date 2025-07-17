"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditFormationsModal } from '@/components/veterinaire/modal/edit-formation-modal';
import { VeterinaireFullProfile } from '@/types/admin-veterinaires';
import { TRP } from '@/utils/translated-p';

export const OrgFormations = ({
  organization,
}: {
  organization: VeterinaireFullProfile;
}) => {
  if (!organization) return null;
  console.log(organization);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 ">
          <CardTitle>Formations</CardTitle>
          <EditFormationsModal
            formations={organization.formationsList}
            organizationId={organization.id}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {organization?.formationsList?.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune formation ajoutée.
            </p>
          ) : (
            organization?.formationsList?.map((formation) => (
              <div
                key={formation.id}
                className="space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <TRP className="font-medium" text={formation.diploma} />
                    <TRP
                      className="text-muted-foreground text-sm"
                      text={formation.specialisation}
                    />
                    <TRP
                      className="text-muted-foreground text-sm"
                      text={formation.school}
                    />
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {formation.startYear}
                    {formation.endYear
                      ? ` - ${formation.endYear}`
                      : " - Présent"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
