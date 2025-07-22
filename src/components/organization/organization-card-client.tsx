"use client";

import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { AvailabilityDialog } from './availability-dialog';

interface OrganizationCardClientProps {
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

export function OrganizationCardClient({
  organization,
  availabilities,
}: OrganizationCardClientProps) {
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);

  return (
    <>
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700"
        onClick={() => setShowAvailabilityDialog(true)}
      >
        Voir tout
      </Button>

      <AvailabilityDialog
        isOpen={showAvailabilityDialog}
        onClose={() => setShowAvailabilityDialog(false)}
        organization={organization}
        availabilities={availabilities}
      />
    </>
  );
}
