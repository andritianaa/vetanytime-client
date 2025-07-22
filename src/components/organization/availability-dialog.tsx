"use client";

import {
    addDays, addWeeks, format, isBefore, isSameDay, isWithinInterval, startOfDay, startOfWeek,
    subWeeks
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CreditCard, Info, Mail, MapPin, Phone, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

interface AvailabilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
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
  availabilities: Array<{
    date: string;
    fullDate: Date;
    time: string;
    isToday: boolean;
    consultationType: string;
  }>;
}

export const AvailabilityDialog = ({
  isOpen,
  onClose,
  organization,
  availabilities,
}: AvailabilityDialogProps) => {
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedConsultationType, setSelectedConsultationType] =
    useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    time: string;
  } | null>(null);

  const today = startOfDay(new Date());
  const thisWeek = startOfWeek(today, { weekStartsOn: 1 });

  // Fonction pour créer un créneau horaire
  const createTimeSlot = (hour: number, minute: number): string => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  // Fonction pour vérifier si un créneau est dans une plage horaire
  const isTimeInRange = (
    timeSlot: string,
    startTime: Date,
    endTime: Date
  ): boolean => {
    const [hour, minute] = timeSlot.split(":").map(Number);
    const slotMinutes = hour * 60 + minute;
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  };

  // Générer les créneaux pour la semaine courante
  const generateWeekSlots = () => {
    const weekStart = currentWeek;
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayOfWeek = day.getDay() === 0 ? 7 : day.getDay(); // Convertir dimanche (0) en 7

      // ÉTAPE 1: Récupérer les horaires d'ouverture normaux
      const organizationHours = organization.OrganizationsHours?.find(
        (h) => h.dayOfWeek === dayOfWeek
      );
      const isOrganizationOpen = organizationHours?.isOpen ?? false;

      // Créer un Set pour stocker tous les créneaux disponibles
      const availableSlots = new Set<string>();

      // ÉTAPE 1: Ajouter les créneaux des horaires normaux
      if (isOrganizationOpen && organizationHours) {
        const openHour = organizationHours.openTime.getHours();
        const openMinute = organizationHours.openTime.getMinutes();
        const closeHour = organizationHours.closeTime.getHours();
        const closeMinute = organizationHours.closeTime.getMinutes();

        // Ajouter les créneaux du matin (avant la pause si elle existe)
        const breakStart = organizationHours.breakStartTime;
        const breakEnd = organizationHours.breakEndTime;

        if (breakStart && breakEnd) {
          // Créneaux avant la pause
          for (let hour = openHour; hour <= breakStart.getHours(); hour++) {
            const startMinute = hour === openHour ? openMinute : 0;
            const endMinute =
              hour === breakStart.getHours() ? breakStart.getMinutes() : 60;

            for (let minute = startMinute; minute < endMinute; minute += 30) {
              availableSlots.add(createTimeSlot(hour, minute));
            }
          }

          // Créneaux après la pause
          for (let hour = breakEnd.getHours(); hour <= closeHour; hour++) {
            const startMinute =
              hour === breakEnd.getHours() ? breakEnd.getMinutes() : 0;
            const endMinute = hour === closeHour ? closeMinute : 60;

            for (let minute = startMinute; minute < endMinute; minute += 30) {
              if (hour === closeHour && minute >= closeMinute) break;
              availableSlots.add(createTimeSlot(hour, minute));
            }
          }
        } else {
          // Pas de pause, créneaux continus
          for (let hour = openHour; hour <= closeHour; hour++) {
            const startMinute = hour === openHour ? openMinute : 0;
            const endMinute = hour === closeHour ? closeMinute : 60;

            for (let minute = startMinute; minute < endMinute; minute += 30) {
              if (hour === closeHour && minute >= closeMinute) break;
              availableSlots.add(createTimeSlot(hour, minute));
            }
          }
        }
      }

      // ÉTAPE 2: Ajouter les disponibilités exceptionnelles
      const exceptionalAvailabilities =
        organization.ExceptionalAvailability?.filter(
          (ea) => isSameDay(ea.date, day) && ea.isAvailable
        ) || [];

      exceptionalAvailabilities.forEach((ea) => {
        const startHour = ea.startTime.getHours();
        const startMinute = ea.startTime.getMinutes();
        const endHour = ea.endTime.getHours();
        const endMinute = ea.endTime.getMinutes();

        for (let hour = startHour; hour <= endHour; hour++) {
          const hourStartMinute = hour === startHour ? startMinute : 0;
          const hourEndMinute = hour === endHour ? endMinute : 60;

          for (
            let minute = hourStartMinute;
            minute < hourEndMinute;
            minute += 30
          ) {
            if (hour === endHour && minute >= endMinute) break;
            availableSlots.add(createTimeSlot(hour, minute));
          }
        }
      });

      // ÉTAPE 3: Retirer les indisponibilités
      const unavailabilities =
        organization.Unavailability?.filter((unavail) => {
          const startDate = startOfDay(unavail.startDate);
          const endDate = startOfDay(unavail.endDate);
          return isWithinInterval(startOfDay(day), {
            start: startDate,
            end: endDate,
          });
        }) || [];

      unavailabilities.forEach((unavail) => {
        if (unavail.startTime && unavail.endTime) {
          // Indisponibilité partielle (avec heures)
          const startHour = unavail.startTime.getHours();
          const startMinute = unavail.startTime.getMinutes();
          const endHour = unavail.endTime.getHours();
          const endMinute = unavail.endTime.getMinutes();

          for (let hour = startHour; hour <= endHour; hour++) {
            const hourStartMinute = hour === startHour ? startMinute : 0;
            const hourEndMinute = hour === endHour ? endMinute : 60;

            for (
              let minute = hourStartMinute;
              minute < hourEndMinute;
              minute += 30
            ) {
              if (hour === endHour && minute >= endMinute) break;
              availableSlots.delete(createTimeSlot(hour, minute));
            }
          }
        } else {
          // Indisponibilité complète (toute la journée)
          availableSlots.clear();
        }
      });

      // Convertir les créneaux disponibles en objets avec métadonnées
      const allSlots = Array.from(availableSlots)
        .map((timeSlot) => {
          const [hour, minute] = timeSlot.split(":").map(Number);
          const isPast =
            isBefore(day, today) ||
            (isSameDay(day, today) &&
              (hour < new Date().getHours() ||
                (hour === new Date().getHours() &&
                  minute <= new Date().getMinutes())));

          // Filtrer selon le type de consultation sélectionné
          const matchesConsultationType =
            selectedConsultationType === "all" || true; // À implémenter selon vos besoins

          // Filtrer selon les filtres supplémentaires
          const matchesFilter =
            selectedFilter === "all" ||
            (selectedFilter === "morning" && hour < 12) ||
            (selectedFilter === "afternoon" && hour >= 12);

          return {
            time: timeSlot,
            available: !isPast && matchesConsultationType && matchesFilter,
            isPast,
            consultationType: "Consultation", // À adapter selon vos besoins
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));

      weekDays.push({
        date: day,
        dayName: format(day, "EEEE", { locale: fr }),
        dayNumber: format(day, "d"),
        monthYear: format(day, "MM/yyyy"),
        isToday: isSameDay(day, today),
        isPast: isBefore(day, today),
        isOpen: availableSlots.size > 0,
        openTime: organizationHours
          ? format(organizationHours.openTime, "HH:mm")
          : null,
        closeTime: organizationHours
          ? format(organizationHours.closeTime, "HH:mm")
          : null,
        slots: allSlots,
      });
    }

    return weekDays;
  };

  const weekData = generateWeekSlots();

  const goToPreviousWeek = () => {
    const previousWeek = subWeeks(currentWeek, 1);
    // Empêcher de reculer avant cette semaine
    if (!isBefore(previousWeek, thisWeek)) {
      setCurrentWeek(previousWeek);
    }
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const canGoToPrevious = !isBefore(subWeeks(currentWeek, 1), thisWeek);

  const handleSlotClick = (date: Date, time: string, available: boolean) => {
    if (available) {
      setSelectedSlot({ date, time });
    }
  };

  // Récupérer les informations de contact
  const phone = organization.contactList.find((c) => c.type === "phone")?.value;
  const email = organization.contactList.find((c) => c.type === "email")?.value;
  const website = organization.contactList.find(
    (c) => c.type === "website"
  )?.value;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {organization.logo && (
                <Image
                  src={organization.logo || "/placeholder.svg"}
                  alt={organization.name}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
              )}
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {organization.name}
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  {organization.speciality?.name ||
                    organization.careType?.name ||
                    "Professionnel de santé"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Informations du praticien */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-blue-800 mb-3">
                  <strong>Informations pratiques :</strong>
                </div>
                <div className="space-y-2 text-sm text-blue-700">
                  {organization.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{organization.address}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{phone}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Types de consultation */}
          <div>
            <h3 className="font-semibold mb-3">Types de consultation</h3>
            <Select
              value={selectedConsultationType}
              onValueChange={setSelectedConsultationType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous les types de consultation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  Tous les types de consultation
                </SelectItem>
                {organization.ConsultationTypeDetails.map((consultation) => (
                  <SelectItem key={consultation.id} value={consultation.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{consultation.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {consultation.duration}min -
                        {consultation.price[0] > 0
                          ? ` ${consultation.price[0]}€`
                          : " Sur devis"}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtres supplémentaires */}
          <div>
            <h3 className="font-semibold mb-3">Filtres supplémentaires</h3>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les créneaux</SelectItem>
                <SelectItem value="morning">Matin uniquement</SelectItem>
                <SelectItem value="afternoon">Après-midi uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendrier avec carrousel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Choisissez l'heure du rendez-vous
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousWeek}
                  disabled={!canGoToPrevious}
                  className="disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-4">
                  {format(currentWeek, "d MMMM", { locale: fr })} -{" "}
                  {format(addDays(currentWeek, 6), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </span>
                <Button variant="ghost" size="sm" onClick={goToNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Grille des jours avec créneaux */}
            <div className="grid grid-cols-7 gap-2 border rounded-lg p-4 bg-gray-50">
              {weekData.map((day, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 min-h-[400px]"
                >
                  {/* En-tête du jour */}
                  <div
                    className={`text-center mb-4 pb-2 border-b ${
                      day.isToday ? "border-blue-500" : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`font-medium text-sm capitalize ${
                        day.isToday ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      {day.dayName}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        day.isToday
                          ? "text-blue-600 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {day.dayNumber}/{day.monthYear}
                    </div>
                    {!day.isOpen ? (
                      <div className="text-xs text-red-500 mt-1 font-medium">
                        Fermé
                      </div>
                    ) : (
                      day.openTime &&
                      day.closeTime && (
                        <div className="text-xs text-gray-500 mt-1">
                          {day.openTime} - {day.closeTime}
                        </div>
                      )
                    )}
                  </div>

                  {/* Créneaux */}
                  <div className="space-y-1 max-h-[320px] overflow-y-auto">
                    {!day.isOpen ? (
                      <div className="text-center text-gray-400 text-sm py-8">
                        Fermé ce jour
                      </div>
                    ) : day.slots.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-8">
                        Aucun créneau disponible
                      </div>
                    ) : (
                      day.slots.map((slot, slotIndex) => {
                        const isSelected =
                          selectedSlot?.date.toDateString() ===
                            day.date.toDateString() &&
                          selectedSlot?.time === slot.time;

                        return (
                          <Button
                            key={slotIndex}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={`w-full h-8 text-xs justify-center ${
                              slot.available
                                ? "bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
                                : slot.isPast
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                                : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                            } ${
                              isSelected
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : ""
                            }`}
                            onClick={() =>
                              handleSlotClick(
                                day.date,
                                slot.time,
                                slot.available
                              )
                            }
                            disabled={!slot.available}
                          >
                            {slot.time}
                          </Button>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton afficher plus */}
            <div className="text-center mt-6">
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700"
                onClick={goToNextWeek}
              >
                AFFICHER PLUS DE DISPONIBILITÉS
                <ChevronRight className="h-4 w-4 ml-1 rotate-90" />
              </Button>
            </div>
          </div>

          {/* Créneau sélectionné */}
          {selectedSlot && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-800 mb-3">
                <strong>Créneau sélectionné:</strong>{" "}
                {format(selectedSlot.date, "EEEE d MMMM yyyy", { locale: fr })}{" "}
                à {selectedSlot.time}
              </div>
              <div className="flex gap-3">
                <Button className="bg-green-600 hover:bg-green-700">
                  Confirmer le rendez-vous
                </Button>
                <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                  Annuler la sélection
                </Button>
              </div>
            </div>
          )}

          {/* Note de paiement */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Modalités de paiement :</strong> Le paiement sera effectué
              lors de votre visite. Vous pouvez annuler votre rendez-vous
              jusqu'à 24 heures avant l'heure prévue.
              {organization.ConsultationTypeDetails.length > 0 && (
                <div className="mt-2">
                  <strong>Tarifs :</strong>
                  <ul className="mt-1 space-y-1">
                    {organization.ConsultationTypeDetails.map(
                      (consultation) => (
                        <li
                          key={consultation.id}
                          className="flex justify-between"
                        >
                          <span>{consultation.name}</span>
                          <span>
                            {consultation.price[0] > 0
                              ? `${consultation.price[0]}€`
                              : "Sur devis"}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
