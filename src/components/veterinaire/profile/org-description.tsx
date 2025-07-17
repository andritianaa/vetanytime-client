"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditDescriptionModal } from '@/components/veterinaire/modal/edit-description-modal';
import { TRP } from '@/utils/translated-p';
import { Organization } from '@prisma/client';

export const OrgDescription = ({
  organization,
}: {
  organization: Organization;
}) => {
  if (organization)
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 ">
            <CardTitle>Description</CardTitle>
            <EditDescriptionModal
              organizationId={organization.id}
              description={organization.description}
            />
          </CardHeader>
          <CardContent>
            <TRP text={organization.description} />
          </CardContent>
        </Card>
      </div>
    );
};
