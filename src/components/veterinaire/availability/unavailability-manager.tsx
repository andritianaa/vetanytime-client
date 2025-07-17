"use client";

import type React from "react";

import { ChevronLeft, ChevronRight, Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

const UNAVAILABILITY_TYPES = [
  { value: "VACATION", label: "Vacances", color: "bg-blue-500" },
  { value: "MAINTENANCE", label: "Maintenance", color: "bg-orange-500" },
  { value: "CLOSED", label: "Fermé", color: "bg-red-500" },
  { value: "HOLIDAY", label: "Jour férié", color: "bg-green-500" },
];

const ITEMS_PER_PAGE = 5;

interface UnavailabilityManagerProps {
  organizationId: string;
  unavailabilities: Array<{
    id: string;
    type: string;
    startDate: Date;
    endDate: Date;
  }>;
}

export function UnavailabilityManager({
  organizationId,
  unavailabilities,
}: UnavailabilityManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showPastItems, setShowPastItems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "18:00",
  });

  const getTypeInfo = (type: string) => {
    return (
      UNAVAILABILITY_TYPES.find((t) => t.value === type) ||
      UNAVAILABILITY_TYPES[0]
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSameDay = (date1: Date | string, date2: Date | string) => {
    const d1 = typeof date1 === "string" ? new Date(date1) : date1;
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatDate = (date: Date) => {
    const validDate = typeof date === "string" ? new Date(date) : date;
    return validDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    if (isSameDay(startDate, endDate)) {
      return formatDate(startDate);
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Filtrer et trier les indisponibilités
  const filteredUnavailabilities = unavailabilities
    ?.filter((item) => showPastItems || !isPast(item.endDate))
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

  // Pagination
  const totalPages = Math.ceil(
    filteredUnavailabilities?.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredUnavailabilities?.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/availability/unavailability", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem?.id,
          organizationId,
          type: formData.type,
          startDate: new Date(`${formData.startDate}T${formData.startTime}`),
          endDate: new Date(`${formData.endDate}T${formData.endTime}`),
        }),
      });

      if (response.ok) {
        toast({
          title: editingItem
            ? "Indisponibilité modifiée"
            : "Indisponibilité ajoutée",
          description: "L'indisponibilité a été sauvegardée avec succès.",
        });
        setIsDialogOpen(false);
        setEditingItem(null);
        setFormData({
          type: "",
          startDate: "",
          endDate: "",
          startTime: "09:00",
          endTime: "18:00",
        });
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'indisponibilité.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `/api/availability/unavailability?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Indisponibilité supprimée",
          description: "L'indisponibilité a été supprimée avec succès.",
        });
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'indisponibilité.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      startDate: new Date(item.startDate).toISOString().split("T")[0],
      endDate: new Date(item.endDate).toISOString().split("T")[0],
      startTime: new Date(item.startDate).toTimeString().slice(0, 5),
      endTime: new Date(item.endTime).toTimeString().slice(0, 5),
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Indisponibilités</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-past"
              checked={showPastItems}
              onCheckedChange={setShowPastItems}
            />
            <Label
              htmlFor="show-past"
              className="flex items-center gap-1 text-sm"
            >
              {showPastItems ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              Afficher les passées
            </Label>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une Indisponibilité
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? "Modifier l'Indisponibilité"
                    : "Nouvelle Indisponibilité"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type d'indisponibilité</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNAVAILABILITY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <DatePicker
                      date={
                        formData.startDate
                          ? new Date(formData.startDate)
                          : undefined
                      }
                      onDateChange={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: date
                            ? date.toISOString().split("T")[0]
                            : "",
                        }))
                      }
                      placeholder="Sélectionner la date de début"
                      disablePastDates={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin</Label>
                    <DatePicker
                      date={
                        formData.endDate
                          ? new Date(formData.endDate)
                          : undefined
                      }
                      onDateChange={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          endDate: date ? date.toISOString().split("T")[0] : "",
                        }))
                      }
                      placeholder="Sélectionner la date de fin"
                      disablePastDates={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heure de début</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heure de fin</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {paginatedItems?.map((item) => {
          const typeInfo = getTypeInfo(item.type);
          const isItemPast = isPast(item.endDate);
          return (
            <Card key={item.id} className={isItemPast ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${typeInfo.color} text-white`}>
                    {typeInfo.label}
                  </Badge>
                  <div>
                    <p className="font-medium">
                      {formatDateRange(item.startDate, item.endDate)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {new Date(item.startDate).toLocaleTimeString("fr-BE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(item.endDate).toLocaleTimeString("fr-BE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    disabled={isItemPast}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredUnavailabilities?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {showPastItems
                  ? "Aucune indisponibilité définie"
                  : "Aucune indisponibilité future"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Affichage de {startIndex + 1} à{" "}
            {Math.min(
              startIndex + ITEMS_PER_PAGE,
              filteredUnavailabilities.length
            )}{" "}
            sur {filteredUnavailabilities.length} éléments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <span className="text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
