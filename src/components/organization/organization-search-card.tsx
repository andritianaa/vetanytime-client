import { addDays, format, isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Mail, MapPin, Phone, Star } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { OrganizationCardClient } from './organization-card-client';

interface OrganizationSearchCardProps {
  organization: {
    id: string;
    name: string;
    logo: string | null;
    address: string | null;
    averageRating: number;
    totalReviews: number;
    careType?: {
      name: string;
    } | null;
    speciality?: {
      name: string;
    } | null;
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
    OrganizationsHours?: Array<{
      dayOfWeek: number;
      isOpen: boolean;
      openTime: Date;
      closeTime: Date;
      breakStartTime?: Date | null;
      breakEndTime?: Date | null;
    }>;
    ExceptionalAvailability?: Array<{
      id: string;
      date: Date;
      startTime: Date;
      endTime: Date;
      isAvailable: boolean;
    }>;
    Unavailability?: Array<{
      id: string;
      type: string;
      startDate: Date;
      endDate: Date;
      startTime?: Date | null;
      endTime?: Date | null;
    }>;
  };
}

// Fonction pour calculer les 6 prochaines disponibilités
function getNextAvailabilities(
  organization: OrganizationSearchCardProps["organization"]
) {
  const availabilities = [];
  const today = startOfDay(new Date());

  // Parcourir les 60 prochains jours pour trouver 6 jours disponibles
  for (let i = 0; i < 60 && availabilities.length < 6; i++) {
    const currentDate = addDays(today, i);
    const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay();

    // Vérifier les horaires d'ouverture normaux
    const organizationHours = organization.OrganizationsHours?.find(
      (h) => h.dayOfWeek === dayOfWeek
    );
    let isAvailable = organizationHours?.isOpen ?? false;
    let firstAvailableTime: Date | null = null;

    if (isAvailable && organizationHours) {
      firstAvailableTime = organizationHours.openTime;
    }

    // Vérifier les disponibilités exceptionnelles
    const exceptionalAvailability = organization.ExceptionalAvailability?.find(
      (ea) => isSameDay(ea.date, currentDate) && ea.isAvailable
    );

    if (exceptionalAvailability) {
      isAvailable = true;
      if (
        !firstAvailableTime ||
        exceptionalAvailability.startTime < firstAvailableTime
      ) {
        firstAvailableTime = exceptionalAvailability.startTime;
      }
    }

    // Vérifier les indisponibilités
    const unavailability = organization.Unavailability?.find((unavail) => {
      const startDate = startOfDay(unavail.startDate);
      const endDate = startOfDay(unavail.endDate);
      return isWithinInterval(startOfDay(currentDate), {
        start: startDate,
        end: endDate,
      });
    });

    if (unavailability) {
      if (!unavailability.startTime || !unavailability.endTime) {
        // Indisponibilité complète
        isAvailable = false;
      } else if (firstAvailableTime) {
        // Indisponibilité partielle - ajuster l'heure si nécessaire
        const unavailStart = unavailability.startTime;
        const unavailEnd = unavailability.endTime;

        if (
          firstAvailableTime >= unavailStart &&
          firstAvailableTime < unavailEnd
        ) {
          firstAvailableTime = unavailEnd;
        }
      }
    }

    // Vérifier si c'est dans le passé
    if (isSameDay(currentDate, today) && firstAvailableTime) {
      const now = new Date();
      if (
        firstAvailableTime.getHours() < now.getHours() ||
        (firstAvailableTime.getHours() === now.getHours() &&
          firstAvailableTime.getMinutes() <= now.getMinutes())
      ) {
        // Trouver le prochain créneau disponible
        const nextSlot = new Date(firstAvailableTime);
        nextSlot.setHours(now.getHours());
        nextSlot.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);

        if (organizationHours && nextSlot < organizationHours.closeTime) {
          firstAvailableTime = nextSlot;
        } else {
          isAvailable = false;
        }
      }
    }

    if (isAvailable && firstAvailableTime) {
      // Arrondir à la demi-heure la plus proche
      const roundedTime = new Date(firstAvailableTime);
      const minutes = roundedTime.getMinutes();
      roundedTime.setMinutes(minutes < 30 ? 0 : 30);

      availabilities.push({
        date: format(currentDate, "EEE d", { locale: fr }),
        fullDate: currentDate,
        time: format(roundedTime, "HH:mm"),
        isToday: isSameDay(currentDate, today),
        consultationType:
          organization.ConsultationTypeDetails[0]?.name || "Consultation",
      });
    }
  }

  return availabilities;
}

export function OrganizationSearchCard({
  organization,
}: OrganizationSearchCardProps) {
  const phone = organization.contactList.find((c) => c.type === "phone")?.value;
  const email = organization.contactList.find((c) => c.type === "email")?.value;

  const availabilities = getNextAvailabilities(organization);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Image et informations principales */}
          <div className="lg:w-2/3 p-6">
            <div className="flex gap-4">
              {/* Logo */}
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

              {/* Informations */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {organization.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {organization.speciality?.name ||
                        organization.careType?.name ||
                        "Professionnel de santé"}
                    </p>
                  </div>
                </div>

                {/* Note et avis */}
                {organization.totalReviews > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">
                      {organization.averageRating}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({organization.totalReviews} avis)
                    </span>
                  </div>
                )}

                {/* Adresse */}
                {organization.address && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{organization.address}</span>
                  </div>
                )}

                {/* Contact */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{phone}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{email}</span>
                    </div>
                  )}
                </div>

                {/* Types de consultation */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {organization.ConsultationTypeDetails.slice(0, 3).map(
                    (consultation) => (
                      <Badge
                        key={consultation.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {consultation.name}
                        {consultation.price[0] > 0 && (
                          <span className="ml-1">
                            • {consultation.price[0]}€
                          </span>
                        )}
                      </Badge>
                    )
                  )}
                  {organization.ConsultationTypeDetails.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{organization.ConsultationTypeDetails.length - 3} autres
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Disponibilités */}
          <div className="lg:w-1/3 bg-gray-50 p-6 border-l">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">
                Prochaines disponibilités
              </span>
            </div>

            {availabilities.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Aucune disponibilité dans les prochains jours
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {availabilities.map((availability, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-2 rounded text-sm ${
                      availability.isToday
                        ? "bg-green-100 text-green-800"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <span className="font-medium">{availability.date}</span>
                    <span>{availability.time}</span>
                  </div>
                ))}
              </div>
            )}

            <OrganizationCardClient
              organization={organization}
              availabilities={availabilities}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
