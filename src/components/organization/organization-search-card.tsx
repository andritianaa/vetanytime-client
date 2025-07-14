import { BriefcaseMedical, Calendar, Clock, MapPin, Star } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { OrganizationCardClient } from "./organization-card-client";

interface OrganizationSearchCardProps {
  organization: {
    id: string;
    name: string;
    slug: string | null;
    logo: string | null;
    description: string[];
    address: string | null;
    experiences: number;
    averageRating: number;
    totalReviews: number;
    city?: {
      name: string;
      arrondissement: string;
    } | null;
    careType?: {
      name: string;
    } | null;
    speciality?: {
      name: string;
    } | null;
    specialisations: Array<{
      name: string;
    }>;
    contactList: Array<{
      type: "email" | "phone" | "website";
      value: string;
    }>;
    ConsultationTypeDetails: Array<{
      id: string;
      name: string;
      price: number[];
      duration: number;
      color: string;
    }>;
    OrganizationsHours: Array<{
      dayOfWeek: number;
      isOpen: boolean;
      openTime: Date;
      closeTime: Date;
    }>;
    Unavailability?: Array<{
      id: string;
      type: string;
      startDate: Date;
      endDate: Date;
    }>;
  };
}

// Fonction pour calculer les disponibilités côté serveur
function getNextAvailabilities(
  organization: OrganizationSearchCardProps["organization"],
  limit = 6
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const availabilities = [];

  // Parcourir les 60 prochains jours pour trouver les jours disponibles
  for (let i = 0; i < 60 && availabilities.length < limit; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    // Vérifier les horaires d'ouverture pour ce jour
    const hours = organization.OrganizationsHours.find(
      (h) => h.dayOfWeek === dayOfWeek
    );
    if (!hours?.isOpen) {
      continue; // Jour fermé, passer au suivant
    }
    console.log(`Checking availability for ${date.toLocaleDateString()}`);

    // Vérifier s'il y a des indisponibilités ce jour
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayUnavailabilities =
      organization.Unavailability?.filter((unavail) => {
        const unavailStart = new Date(unavail.startDate);
        const unavailEnd = new Date(unavail.endDate);

        // Vérifier si l'indisponibilité affecte ce jour
        return unavailStart <= dayEnd && unavailEnd >= dayStart;
      }) || [];

    // Vérifier si tout le jour est bloqué
    const isFullDayBlocked = dayUnavailabilities.some((unavail) => {
      const unavailStart = new Date(unavail.startDate);
      const unavailEnd = new Date(unavail.endDate);

      // Indisponibilité qui couvre toute la journée
      return (
        unavailStart.getDate() === date.getDate() &&
        unavailStart.getMonth() === date.getMonth() &&
        unavailStart.getFullYear() === date.getFullYear() &&
        unavailStart.getHours() <= hours.openTime.getHours() &&
        unavailEnd.getHours() >= hours.closeTime.getHours()
      );
    });

    if (isFullDayBlocked) {
      continue; // Jour entièrement bloqué, passer au suivant
    }

    // Calculer la première heure disponible
    const openTime = new Date(hours.openTime);
    let firstAvailableHour = openTime.getHours();
    let firstAvailableMinute = openTime.getMinutes();

    // Vérifier les indisponibilités partielles qui pourraient affecter l'heure d'ouverture
    for (const unavail of dayUnavailabilities) {
      const unavailStart = new Date(unavail.startDate);
      const unavailEnd = new Date(unavail.endDate);

      // Si l'indisponibilité commence avant ou à l'heure d'ouverture et se termine après
      if (
        unavailStart.getDate() === date.getDate() &&
        unavailStart.getMonth() === date.getMonth() &&
        unavailStart.getFullYear() === date.getFullYear() &&
        unavailStart.getHours() <= firstAvailableHour &&
        unavailEnd.getHours() > firstAvailableHour
      ) {
        // Décaler la première heure disponible après la fin de l'indisponibilité
        firstAvailableHour = unavailEnd.getHours();
        firstAvailableMinute = unavailEnd.getMinutes();

        // Arrondir à la prochaine demi-heure
        if (firstAvailableMinute > 0 && firstAvailableMinute <= 30) {
          firstAvailableMinute = 30;
        } else if (firstAvailableMinute > 30) {
          firstAvailableHour += 1;
          firstAvailableMinute = 0;
        }
      }
    }

    // Vérifier que l'heure calculée est encore dans les heures d'ouverture
    const closeTime = new Date(hours.closeTime);
    if (firstAvailableHour >= closeTime.getHours()) {
      continue; // Plus de créneaux disponibles ce jour, passer au suivant
    }

    // Ajouter ce créneau aux disponibilités
    availabilities.push({
      date: date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }),
      fullDate: date.toISOString(),
      time: `${firstAvailableHour
        .toString()
        .padStart(2, "0")}:${firstAvailableMinute.toString().padStart(2, "0")}`,
      isToday: i === 0,
      consultationType:
        organization.ConsultationTypeDetails[0]?.name ||
        "Consultation générale",
    });
  }

  return availabilities;
}

export const OrganizationSearchCard = ({
  organization,
}: OrganizationSearchCardProps) => {
  // Calculer les disponibilités côté serveur
  const quickAvailabilities = getNextAvailabilities(organization, 6);
  const allAvailabilities = getNextAvailabilities(organization, 50);

  const phone = organization.contactList.find((c) => c.type === "phone")?.value;
  const email = organization.contactList.find((c) => c.type === "email")?.value;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Section gauche - Informations principales */}
          <div className="flex-1 p-6">
            <div className="flex gap-4">
              {/* Photo du professionnel */}
              <div className="flex-shrink-0">
                <Image
                  src={
                    organization.logo ??
                    "/placeholder.svg?height=80&width=80&query=doctor"
                  }
                  alt={organization.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>

              {/* Informations principales */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {organization.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1 flex gap-1 items-center">
                      <BriefcaseMedical className="h-4 w-4" />
                      {organization.careType?.name || "Professionnel de santé"}
                    </p>
                  </div>

                  {/* Note et avis */}
                  {organization.totalReviews > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {organization.averageRating}
                      </span>
                      <span className="text-gray-500">
                        | {organization.totalReviews} avis
                      </span>
                    </div>
                  )}
                </div>

                {/* Localisation */}
                {(organization.address || organization.city) && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {organization.address ||
                        `${organization.city?.name}, ${organization.city?.arrondissement}`}
                    </span>
                  </div>
                )}

                {/* Spécialisations */}
                {organization.specialisations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {organization.specialisations
                      .slice(0, 3)
                      .map((spec, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {spec.name}
                        </Badge>
                      ))}
                    {organization.specialisations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{organization.specialisations.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Composant client pour les interactions */}
                <OrganizationCardClient
                  description={organization.description[0]}
                />

                {/* Informations de contact */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{organization.experiences} années d'expérience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section droite - Disponibilités */}
          <div className="lg:w-96 bg-gray-50 p-6 border-l">
            {/* Prochaines disponibilités */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Prochaine disponibilité
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {quickAvailabilities.map((slot, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-center cursor-pointer hover:bg-blue-50 transition-colors ${
                      slot.isToday
                        ? "bg-blue-100 border-blue-300 text-blue-800"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {slot.isToday ? "Aujourd'hui" : slot.date}
                    </div>
                    <div className="text-sm font-semibold">Dès {slot.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Types de consultation disponibles */}
            {organization.ConsultationTypeDetails.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Consultations disponibles
                </h5>
                <div className="space-y-1">
                  {organization.ConsultationTypeDetails.slice(0, 3).map(
                    (consultation) => (
                      <div
                        key={consultation.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-gray-600">
                          {consultation.name}
                        </span>
                        <span className="font-medium">
                          {consultation.price[0] > 0
                            ? `${consultation.price[0]}€`
                            : "Sur devis"}
                        </span>
                      </div>
                    )
                  )}
                  {organization.ConsultationTypeDetails.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{organization.ConsultationTypeDetails.length - 3} autres
                      consultations
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Composant client pour le bouton et dialog */}
            <OrganizationCardClient
              organization={organization}
              availabilities={allAvailabilities}
              showButton={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
