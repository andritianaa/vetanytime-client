"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditExperiencesModal } from '@/components/veterinaire/modal/edit-experiences-modal';
import { VeterinaireFullProfile } from '@/types/admin-veterinaires';

export const OrgExperiences = ({
  organization,
}: {
  organization: VeterinaireFullProfile;
}) => {
  if (!organization) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 ">
          <CardTitle>Expériences professionnelles</CardTitle>
          <EditExperiencesModal
            experiences={organization.experiencesList}
            organizationId={organization.id}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {organization.experiencesList.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune expérience professionnelle ajoutée.
            </p>
          ) : (
            organization.experiencesList.map((experience) => (
              <div
                key={experience.id}
                className="space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">
                      {experience.title.filter(Boolean).join(" • ")}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {experience.organization.filter(Boolean).join(" • ")}
                    </p>
                    {experience.country.some(Boolean) && (
                      <p className="text-muted-foreground text-sm">
                        {experience.country.filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {experience.startYear}
                    {experience.endYear
                      ? ` - ${experience.endYear}`
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
