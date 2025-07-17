"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditConferencesModal } from '@/components/veterinaire/modal/edit-conferences-modal';
import { VeterinaireFullProfile } from '@/types/admin-veterinaires';
import { TRP } from '@/utils/translated-p';

export const OrgConferences = ({
  organization,
}: {
  organization: VeterinaireFullProfile;
}) => {
  if (!organization) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 ">
          <CardTitle>Conférences</CardTitle>
          <EditConferencesModal
            conferences={organization.conferencesList}
            organizationId={organization.id}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {organization.conferencesList.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune conférence ajoutée.
            </p>
          ) : (
            organization.conferencesList.map((conference) => (
              <div
                key={conference.id}
                className="space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <TRP className="font-medium" text={conference.title} />
                    <TRP
                      className="text-muted-foreground text-sm"
                      text={conference.organization}
                    />
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {conference.year}
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
