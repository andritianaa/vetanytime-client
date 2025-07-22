import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditResearchesModal } from '@/components/veterinaire/modal/edit-research-modal';
import { VeterinaireFullProfile } from '@/types/admin-veterinaires';
import { TRP } from '@/utils/translated-p';

export const OrgResearches = ({
  organization,
}: {
  organization: VeterinaireFullProfile;
}) => {
  if (!organization) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 ">
          <CardTitle>Recherches</CardTitle>
          <EditResearchesModal
            researches={organization.researchList}
            organizationId={organization.id}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {organization?.researchList?.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune recherche ajoutée.
            </p>
          ) : (
            organization?.researchList?.map((research) => (
              <div
                key={research.id}
                className="space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <TRP className="font-medium" text={research.title} />
                    <TRP
                      className="text-muted-foreground text-sm"
                      text={research.organization}
                    />
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {research.year}
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
