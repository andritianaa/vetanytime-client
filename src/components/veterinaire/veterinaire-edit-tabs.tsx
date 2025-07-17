"use client";

import { Calendar, Clock, Star, Stethoscope, User, Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrgAssociations } from '@/components/veterinaire/profile/org-associations';
import { OrgConferences } from '@/components/veterinaire/profile/org-conferences';
import { OrgDescription } from '@/components/veterinaire/profile/org-description';
import { OrgExperiences } from '@/components/veterinaire/profile/org-experiences';
import { OrgFormations } from '@/components/veterinaire/profile/org-formations';
import { OrgInfoSettings } from '@/components/veterinaire/profile/org-info-settings';
import { OrgLocationSettings } from '@/components/veterinaire/profile/org-locations-settings';
import { OrgResearches } from '@/components/veterinaire/profile/org-research';
import { OrgSpecialisation } from '@/components/veterinaire/profile/org-specialisation';

import type { VeterinaireFullProfile } from "@/types/admin-veterinaires";
interface VeterinaireEditTabsProps {
  organization: VeterinaireFullProfile;
}

export const VeterinaireEditTabs = ({
  organization,
}: VeterinaireEditTabsProps) => {
  // Vérification de sécurité
  if (!organization) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            Aucune donnée d'organisation disponible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Tabs defaultValue="profil" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger
            value="disponibilite"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Disponibilité
          </TabsTrigger>
          <TabsTrigger
            value="consultations-types"
            className="flex items-center gap-2"
          >
            <Stethoscope className="h-4 w-4" />
            Types
          </TabsTrigger>
          <TabsTrigger value="avis" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Avis
          </TabsTrigger>
          <TabsTrigger
            value="consultations"
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Consultations
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Patients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-semibold">Profil vétérinaire</p>
              <p className="text-muted-foreground">
                Gérez les informations de profil du vétérinaire.
              </p>
            </div>
            <div className="space-y-6">
              <OrgInfoSettings organization={organization} />
              <OrgLocationSettings organization={organization} />
              <OrgDescription organization={organization} />
              <OrgSpecialisation organization={organization} />
              <OrgExperiences organization={organization} />
              <OrgFormations organization={organization} />
              <OrgConferences organization={organization} />
              <OrgResearches organization={organization} />
              <OrgAssociations organization={organization} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="disponibilite" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des disponibilités</CardTitle>
              <CardDescription>
                Configurez vos horaires de travail et vos créneaux disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                    (jour) => (
                      <div key={jour} className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">{jour}</h3>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <div>09:00 - 12:00</div>
                            <div>14:00 - 18:00</div>
                          </div>
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <Button>Mettre à jour les horaires</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations-types" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Types de consultations</CardTitle>
              <CardDescription>
                Gérez les différents types de consultations que vous proposez
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      nom: "Consultation générale",
                      duree: "30 min",
                      prix: "45€",
                    },
                    { nom: "Vaccination", duree: "20 min", prix: "35€" },
                    { nom: "Chirurgie mineure", duree: "60 min", prix: "120€" },
                    { nom: "Urgence", duree: "45 min", prix: "80€" },
                  ].map((consultation, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{consultation.nom}</h3>
                        <p className="text-sm text-muted-foreground">
                          Durée: {consultation.duree} • Prix:{" "}
                          {consultation.prix}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button>Ajouter un type de consultation</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Avis clients</CardTitle>
              <CardDescription>
                Consultez les avis et évaluations de vos clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">4.8</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      124 avis
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      nom: "Marie L.",
                      note: 5,
                      commentaire:
                        "Excellent vétérinaire, très à l'écoute et professionnel.",
                    },
                    {
                      nom: "Pierre M.",
                      note: 4,
                      commentaire: "Bon suivi, mon chat va beaucoup mieux.",
                    },
                    {
                      nom: "Sophie D.",
                      note: 5,
                      commentaire: "Je recommande vivement, très compétent.",
                    },
                  ].map((avis, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{avis.nom}</div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= avis.note
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {avis.commentaire}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Consultations</CardTitle>
              <CardDescription>
                Gérez vos rendez-vous et consultations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Button variant="outline">Aujourd'hui</Button>
                  <Button variant="outline">Cette semaine</Button>
                  <Button variant="outline">Ce mois</Button>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      heure: "09:00",
                      patient: "Max (Chien)",
                      proprietaire: "Jean Dupont",
                      type: "Consultation générale",
                      statut: "Confirmé",
                    },
                    {
                      heure: "10:30",
                      patient: "Luna (Chat)",
                      proprietaire: "Marie Martin",
                      type: "Vaccination",
                      statut: "En cours",
                    },
                    {
                      heure: "14:00",
                      patient: "Rex (Chien)",
                      proprietaire: "Pierre Durand",
                      type: "Chirurgie",
                      statut: "À venir",
                    },
                  ].map((consultation, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-sm">
                          {consultation.heure}
                        </div>
                        <div>
                          <div className="font-medium">
                            {consultation.patient}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {consultation.proprietaire} • {consultation.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            consultation.statut === "Confirmé"
                              ? "default"
                              : consultation.statut === "En cours"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {consultation.statut}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Liste des patients</CardTitle>
              <CardDescription>
                Gérez la liste de vos patients et leur historique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Rechercher un patient..."
                    className="max-w-sm"
                  />
                  <Button variant="outline">Filtrer</Button>
                  <Button>Ajouter un patient</Button>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      nom: "Max",
                      type: "Chien",
                      race: "Golden Retriever",
                      age: "3 ans",
                      proprietaire: "Jean Dupont",
                      derniereVisite: "15/03/2024",
                    },
                    {
                      nom: "Luna",
                      type: "Chat",
                      race: "Européen",
                      age: "2 ans",
                      proprietaire: "Marie Martin",
                      derniereVisite: "10/03/2024",
                    },
                    {
                      nom: "Rex",
                      type: "Chien",
                      race: "Berger Allemand",
                      age: "5 ans",
                      proprietaire: "Pierre Durand",
                      derniereVisite: "08/03/2024",
                    },
                    {
                      nom: "Mimi",
                      type: "Chat",
                      race: "Persan",
                      age: "4 ans",
                      proprietaire: "Sophie Leroy",
                      derniereVisite: "05/03/2024",
                    },
                  ].map((patient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg?height=40&width=40" />
                          <AvatarFallback>{patient.nom[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{patient.nom}</div>
                          <div className="text-sm text-muted-foreground">
                            {patient.type} • {patient.race} • {patient.age}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Propriétaire: {patient.proprietaire}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Dernière visite: {patient.derniereVisite}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            Voir dossier
                          </Button>
                          <Button variant="outline" size="sm">
                            Nouveau RDV
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
