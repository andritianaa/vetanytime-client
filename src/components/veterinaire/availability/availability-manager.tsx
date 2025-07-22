"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ExceptionalAvailability
} from '@/components/veterinaire/availability/exceptional-availability';
import { HolidayManager } from '@/components/veterinaire/availability/holiday-manager';
import {
    UnavailabilityManager
} from '@/components/veterinaire/availability/unavailability-manager';
import { WeeklySchedule } from '@/components/veterinaire/availability/weekly-schedule';
import { VeterinaireFullProfile } from '@/types/admin-veterinaires';

interface AvailabilityManagerProps {
  organization: VeterinaireFullProfile;
}

export function AvailabilityManager({
  organization,
}: AvailabilityManagerProps) {
  return (
    <Tabs defaultValue="schedule" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="schedule">Horaires Hebdomadaires</TabsTrigger>
        <TabsTrigger value="holidays">Jours Fériés</TabsTrigger>
        <TabsTrigger value="exceptional">
          Disponibilités Exceptionnelles
        </TabsTrigger>
        <TabsTrigger value="unavailability">Indisponibilités</TabsTrigger>
      </TabsList>

      <TabsContent value="schedule">
        <Card>
          <CardHeader>
            <CardTitle>Horaires d'Ouverture Hebdomadaires</CardTitle>
            <CardDescription>
              Définissez vos horaires d'ouverture pour chaque jour de la semaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklySchedule
              organizationId={organization.id}
              currentSchedule={organization.OrganizationsHours}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="holidays">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Jours Fériés</CardTitle>
            <CardDescription>
              Sélectionnez et gérez les jours fériés belges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HolidayManager organizationId={organization.id} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exceptional">
        <Card>
          <CardHeader>
            <CardTitle>Disponibilités Exceptionnelles</CardTitle>
            <CardDescription>
              Ajoutez des créneaux d'ouverture exceptionnels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExceptionalAvailability organizationId={organization.id} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="unavailability">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Indisponibilités</CardTitle>
            <CardDescription>
              Gérez les périodes de fermeture, vacances et maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UnavailabilityManager
              organizationId={organization.id}
              unavailabilities={organization.Unavailability}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
