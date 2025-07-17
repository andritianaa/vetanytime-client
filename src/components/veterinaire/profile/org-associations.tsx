import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditAssociationsModal } from '@/components/veterinaire/modal/edit-associations-modal';
import { VeterinaireFullProfile } from '@/types/admin-veterinaires';
import { TRP } from '@/utils/translated-p';

export const OrgAssociations = ({
  organization,
}: {
  organization: VeterinaireFullProfile;
}) => {
  if (!organization) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 ">
          <CardTitle>Associations</CardTitle>
          <EditAssociationsModal
            associations={organization.associationsList}
            organizationId={organization.id}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {organization.associationsList.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune association ajoutée.
            </p>
          ) : (
            organization.associationsList.map((association) => (
              <div
                key={association.id}
                className="space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <TRP
                      className="font-medium"
                      text={association.association}
                    />
                    <TRP
                      className="text-muted-foreground text-sm"
                      text={association.role}
                    />
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {association.startYear}
                    {association.endYear
                      ? ` - ${association.endYear}`
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
