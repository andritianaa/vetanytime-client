"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { AvailabilityDialog } from "./availability-dialog";

interface OrganizationCardClientProps {
  description?: string;
  organization?: {
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
  availabilities?: Array<{
    date: string;
    fullDate: string;
    time: string;
    isToday: boolean;
    consultationType: string;
  }>;
  showButton?: boolean;
}

export const OrganizationCardClient = ({
  description,
  organization,
  availabilities = [],
  showButton = false,
}: OrganizationCardClientProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);

  // Convertir les dates string en Date objects pour le dialog
  const processedAvailabilities = availabilities.map((avail) => ({
    ...avail,
    fullDate: new Date(avail.fullDate),
  }));

  if (showButton && organization) {
    return (
      <>
        <Button
          onClick={() => setShowAvailabilityDialog(true)}
          className="w-full"
        >
          Voir tout
        </Button>

        <AvailabilityDialog
          isOpen={showAvailabilityDialog}
          onClose={() => setShowAvailabilityDialog(false)}
          organization={organization}
          availabilities={processedAvailabilities}
        />
      </>
    );
  }

  if (description) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setShowDescription(!showDescription)}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          À propos du praticien
          {showDescription ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showDescription && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    );
  }

  return null;
};
