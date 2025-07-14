"use client";

import { addDays, format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Mail, MapPin, Phone, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedConsultationType, setSelectedConsultationType] =
    useState<string>("all");

  // Grouper les disponibilités par date
  const availabilitiesByDate = availabilities.reduce((acc, availability) => {
    const dateKey = availability.fullDate.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(availability);
    return acc;
  }, {} as Record<string, typeof availabilities>);

  // Obtenir les 14 prochains jours
  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      days.push(date);
    }
    return days;
  };

  const next14Days = getNext14Days();

  // Filtrer les disponibilités selon le type de consultation sélectionné
  const filteredAvailabilities = selectedDate
    ? (availabilitiesByDate[selectedDate.toDateString()] || []).filter(
        (availability) =>
          selectedConsultationType === "all" ||
          availability.consultationType === selectedConsultationType
      )
    : [];

  const phone = organization.contactList.find((c) => c.type === "phone")?.value;
  const email = organization.contactList.find((c) => c.type === "email")?.value;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Image
              src={
                organization.logo ??
                "/placeholder.svg?height=40&width=40&query=doctor"
              }
              alt={organization.name}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold">{organization.name}</h2>
              <p className="text-sm text-gray-600">
                {organization.speciality?.name ||
                  organization.careType?.name ||
                  "Professionnel de santé"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(90vh-120px)]">
          {/* Sidebar avec informations */}
          <div className="lg:w-80 space-y-4">
            {/* Informations du praticien */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
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

                  {/* Adresse */}
                  {organization.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{organization.address}</span>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="space-y-1">
                    {phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{phone}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Types de consultation */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Types de consultation</h3>
                <div className="space-y-2">
                  <Button
                    variant={
                      selectedConsultationType === "all" ? "default" : "outline"
                    }
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedConsultationType("all")}
                  >
                    Toutes les consultations
                  </Button>
                  {organization.ConsultationTypeDetails.map((consultation) => (
                    <Button
                      key={consultation.id}
                      variant={
                        selectedConsultationType === consultation.name
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="w-full justify-between"
                      onClick={() =>
                        setSelectedConsultationType(consultation.name)
                      }
                    >
                      <span>{consultation.name}</span>
                      <span className="text-xs">
                        {consultation.price[0] > 0
                          ? `${consultation.price[0]}€`
                          : "Sur devis"}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="calendar" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calendar">Vue calendrier</TabsTrigger>
                <TabsTrigger value="list">Vue liste</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="flex-1 overflow-auto">
                <div className="space-y-4">
                  {/* Sélecteur de date */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Sélectionnez une date
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                      {next14Days.map((date) => {
                        const dateKey = date.toDateString();
                        const dayAvailabilities =
                          availabilitiesByDate[dateKey] || [];
                        const isSelected =
                          selectedDate && isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, new Date());

                        return (
                          <Button
                            key={dateKey}
                            variant={isSelected ? "default" : "outline"}
                            className={`h-16 flex flex-col p-2 ${
                              isToday ? "ring-2 ring-blue-500" : ""
                            } ${
                              dayAvailabilities.length === 0 ? "opacity-50" : ""
                            }`}
                            onClick={() => setSelectedDate(date)}
                            disabled={dayAvailabilities.length === 0}
                          >
                            <span className="text-xs">
                              {format(date, "EEE", { locale: fr })}
                            </span>
                            <span className="font-semibold">
                              {format(date, "d", { locale: fr })}
                            </span>
                            <span className="text-xs text-gray-500">
                              {dayAvailabilities.length} créneaux
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Créneaux disponibles pour la date sélectionnée */}
                  {selectedDate && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Créneaux disponibles le{" "}
                        {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                      </h3>
                      {filteredAvailabilities.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          Aucun créneau disponible pour cette date et ce type de
                          consultation.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                          {filteredAvailabilities.map((availability, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="h-auto p-3 flex flex-col items-center hover:bg-blue-50 bg-transparent"
                            >
                              <span className="font-semibold">
                                {availability.time}
                              </span>
                              <span className="text-xs text-gray-500 text-center">
                                {availability.consultationType}
                              </span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="list" className="flex-1 overflow-auto">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tous les créneaux disponibles
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(availabilitiesByDate).map(
                      ([dateKey, dayAvailabilities]) => {
                        const date = new Date(dateKey);
                        const filteredDayAvailabilities =
                          dayAvailabilities.filter(
                            (availability) =>
                              selectedConsultationType === "all" ||
                              availability.consultationType ===
                                selectedConsultationType
                          );

                        if (filteredDayAvailabilities.length === 0) return null;

                        return (
                          <Card key={dateKey}>
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-3">
                                {format(date, "EEEE d MMMM", { locale: fr })}
                                <Badge variant="secondary" className="ml-2">
                                  {filteredDayAvailabilities.length} créneaux
                                </Badge>
                              </h4>
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {filteredDayAvailabilities.map(
                                  (availability, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="h-auto p-2 flex flex-col bg-transparent"
                                    >
                                      <span className="font-semibold text-xs">
                                        {availability.time}
                                      </span>
                                      <span className="text-xs text-gray-500 truncate w-full text-center">
                                        {availability.consultationType}
                                      </span>
                                    </Button>
                                  )
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
