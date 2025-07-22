"use client";

import { Clock, Save } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const DAYS_OF_WEEK = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 0, label: "Dimanche" },
];

interface WeeklyScheduleProps {
  organizationId: string;
  currentSchedule: Array<{
    id: string;
    dayOfWeek: number;
    isOpen: boolean;
    openTime: Date;
    closeTime: Date;
    breakStartTime: Date;
    breakEndTime: Date;
  }>;
}

export function WeeklySchedule({
  organizationId,
  currentSchedule,
}: WeeklyScheduleProps) {
  const [schedule, setSchedule] = useState(() => {
    const scheduleMap = new Map(currentSchedule?.map((s) => [s.dayOfWeek, s]));

    return DAYS_OF_WEEK.map((day) => {
      const existing = scheduleMap.get(day.value);
      return {
        dayOfWeek: day.value,
        label: day.label,
        isOpen: existing?.isOpen ?? true,
        openTime: existing
          ? existing.openTime.toTimeString().slice(0, 5)
          : "09:00",
        closeTime: existing
          ? existing.closeTime.toTimeString().slice(0, 5)
          : "18:00",
        breakStartTime: existing
          ? existing.breakStartTime.toTimeString().slice(0, 5)
          : "12:00",
        breakEndTime: existing
          ? existing.breakEndTime.toTimeString().slice(0, 5)
          : "13:00",
        id: existing?.id,
      };
    });
  });

  const [isLoading, setIsLoading] = useState(false);

  const updateSchedule = (dayIndex: number, field: string, value: any) => {
    setSchedule((prev) =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const saveSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/availability/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          schedule: schedule.map((day) => ({
            ...day,
            openTime: new Date(`2000-01-01T${day.openTime}:00`),
            closeTime: new Date(`2000-01-01T${day.closeTime}:00`),
            breakStartTime: new Date(`2000-01-01T${day.breakStartTime}:00`),
            breakEndTime: new Date(`2000-01-01T${day.breakEndTime}:00`),
          })),
        }),
      });

      if (response.ok) {
        toast({
          title: "Horaires sauvegardés",
          description:
            "Les horaires hebdomadaires ont été mis à jour avec succès.",
        });
      } else {
        throw new Error("Failed to save schedule");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les horaires.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {schedule.map((day, index) => (
          <Card key={day.dayOfWeek}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {day.label}
                </div>
                <Switch
                  checked={day.isOpen}
                  onCheckedChange={(checked) =>
                    updateSchedule(index, "isOpen", checked)
                  }
                />
              </CardTitle>
            </CardHeader>
            {day.isOpen && (
              <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor={`open-${day.dayOfWeek}`}>Ouverture</Label>
                  <Input
                    type="time"
                    value={day.openTime}
                    onChange={(e) =>
                      updateSchedule(index, "openTime", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`close-${day.dayOfWeek}`}>Fermeture</Label>
                  <Input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) =>
                      updateSchedule(index, "closeTime", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`break-start-${day.dayOfWeek}`}>
                    Début pause
                  </Label>
                  <Input
                    type="time"
                    value={day.breakStartTime}
                    onChange={(e) =>
                      updateSchedule(index, "breakStartTime", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`break-end-${day.dayOfWeek}`}>
                    Fin pause
                  </Label>
                  <Input
                    type="time"
                    value={day.breakEndTime}
                    onChange={(e) =>
                      updateSchedule(index, "breakEndTime", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSchedule} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Sauvegarde..." : "Sauvegarder les Horaires"}
        </Button>
      </div>
    </div>
  );
}
