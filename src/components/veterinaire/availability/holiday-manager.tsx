"use client";

import { Calendar, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const BELGIAN_HOLIDAYS = [
  { date: "2025-01-01", name: "Nouvel An" },
  { date: "2025-04-21", name: "Lundi de Pâques" },
  { date: "2025-05-01", name: "Fête du Travail" },
  { date: "2025-05-29", name: "Ascension" },
  { date: "2025-06-09", name: "Lundi de Pentecôte" },
  { date: "2025-07-11", name: "Fête de la Communauté Flamande" },
  { date: "2025-07-21", name: "Fête Nationale" },
  { date: "2025-08-15", name: "Assomption" },
  { date: "2025-09-27", name: "Fête de la Communauté Française" },
  { date: "2025-11-01", name: "Toussaint" },
  { date: "2025-11-02", name: "Jour des Défunts" },
  { date: "2025-11-11", name: "Armistice" },
  { date: "2025-11-15", name: "Fête du Roi" },
  { date: "2025-12-25", name: "Noël" },
  { date: "2026-01-01", name: "Nouvel An" },
  { date: "2026-04-06", name: "Lundi de Pâques" },
  { date: "2026-05-01", name: "Fête du Travail" },
  { date: "2026-05-14", name: "Ascension" },
  { date: "2026-05-25", name: "Lundi de Pentecôte" },
  { date: "2026-07-11", name: "Fête de la Communauté Flamande" },
  { date: "2026-07-21", name: "Fête Nationale" },
  { date: "2026-08-15", name: "Assomption" },
  { date: "2026-09-27", name: "Fête de la Communauté Française" },
  { date: "2026-11-01", name: "Toussaint" },
  { date: "2026-11-02", name: "Jour des Défunts" },
  { date: "2026-11-11", name: "Armistice" },
  { date: "2026-11-15", name: "Fête du Roi" },
  { date: "2026-12-25", name: "Noël" },
];

interface HolidayManagerProps {
  organizationId: string;
}

export function HolidayManager({ organizationId }: HolidayManagerProps) {
  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add state for current year
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Add available years

  const availableYears = [
    ...new Set(BELGIAN_HOLIDAYS.map((h) => new Date(h.date).getFullYear())),
  ].sort();

  // Filter holidays by current year
  const holidaysForYear = BELGIAN_HOLIDAYS.filter(
    (holiday) => new Date(holiday.date).getFullYear() === currentYear
  );

  useEffect(() => {
    // Load existing holidays
    fetchExistingHolidays();
  }, [organizationId]);

  const fetchExistingHolidays = async () => {
    try {
      const response = await fetch(
        `/api/availability/holidays?organizationId=${organizationId}`
      );
      if (response.ok) {
        const holidays = await response.json();
        setSelectedHolidays(
          holidays.map((h: any) => h.startDate.split("T")[0])
        );
      }
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
    }
  };

  const toggleHoliday = (date: string) => {
    setSelectedHolidays((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const saveHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/availability/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          holidays: selectedHolidays,
        }),
      });

      if (response.ok) {
        toast({
          title: "Jours fériés sauvegardés",
          description: "La sélection des jours fériés a été mise à jour.",
        });
      } else {
        throw new Error("Failed to save holidays");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les jours fériés.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDayAndMonthAndYear = (date: string) => {
    return new Date(date).toLocaleDateString("fr-BE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getWeekday = (date: string) => {
    return new Date(date).toLocaleDateString("fr-BE", {
      weekday: "long",
    });
  };

  const isSelected = (date: string) => selectedHolidays.includes(date);

  const isPast = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };

  // Update futureHolidays to use holidaysForYear instead of BELGIAN_HOLIDAYS
  const futureHolidays = holidaysForYear.filter(
    (holiday) => !isPast(holiday.date)
  );

  const selectAllFutureHolidays = () => {
    const futureHolidayDates = futureHolidays.map((holiday) => holiday.date);
    setSelectedHolidays((prev) => {
      // Remove holidays from current year and add new selection
      const otherYearHolidays = prev.filter(
        (date) => new Date(date).getFullYear() !== currentYear
      );
      return [...otherYearHolidays, ...futureHolidayDates];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Jours Fériés Belges</h3>
          </div>
          <div className="flex items-center gap-2">
            {availableYears.map((year) => (
              <Button
                key={year}
                variant={currentYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {selectedHolidays.length} sélectionné
          {selectedHolidays.length > 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {futureHolidays.map((holiday) => (
          <Card
            key={holiday.date}
            className={cn(
              "cursor-pointer py-0 transition-all duration-200 hover:shadow-md",
              isSelected(holiday.date)
                ? "ring-primary bg-primary/5 border-primary/20 ring-2"
                : "hover:border-primary/30"
            )}
            onClick={() => toggleHoliday(holiday.date)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2">
                    <h4
                      className="truncate text-sm leading-tight font-semibold"
                      title={holiday.name}
                    >
                      {holiday.name}
                    </h4>
                    <p className="text-muted-foreground text-xs capitalize">
                      {getWeekday(holiday.date)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-primary text-sm font-medium">
                      {getDayAndMonthAndYear(holiday.date)}
                    </div>
                  </div>
                </div>
                <div className="ml-2">
                  {isSelected(holiday.date) && (
                    <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                      <Check className="text-primary-foreground h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {futureHolidays.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucun jour férié à venir cette année
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-muted-foreground text-sm">
          Cliquez sur les cartes pour sélectionner/désélectionner les jours
          fériés
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedHolidays([])}>
            Tout désélectionner
          </Button>
          <Button variant="outline" onClick={selectAllFutureHolidays}>
            Tout sélectionner
          </Button>
          <Button onClick={saveHolidays} disabled={isLoading}>
            {isLoading ? "Sauvegarde..." : "Sauvegarder la Sélection"}
          </Button>
        </div>
      </div>
    </div>
  );
}
