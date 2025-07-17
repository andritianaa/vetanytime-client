"use client";

import type React from "react";

import { ChevronLeft, ChevronRight, Clock, Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 5;

interface ExceptionalAvailability {
  id: string;
  organizationId: string;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExceptionalAvailabilityProps {
  organizationId: string;
}

export function ExceptionalAvailability({
  organizationId,
}: ExceptionalAvailabilityProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPastItems, setShowPastItems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [exceptionalAvailabilities, setExceptionalAvailabilities] = useState<
    ExceptionalAvailability[]
  >([]);
  const [editingItem, setEditingItem] =
    useState<ExceptionalAvailability | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "18:00",
    description: "",
  });

  useEffect(() => {
    fetchExceptionalAvailabilities();
  }, [organizationId]);

  const fetchExceptionalAvailabilities = async () => {
    try {
      const response = await fetch(
        `/api/availability/exceptional?organizationId=${organizationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setExceptionalAvailabilities(data);
      }
    } catch (error) {
      console.error("Failed to fetch exceptional availabilities:", error);
    }
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Filtrer et trier les disponibilités exceptionnelles
  const filteredAvailabilities = exceptionalAvailabilities
    .filter((item) => showPastItems || !isPast(new Date(item.endDate)))
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

  // Pagination
  const totalPages = Math.ceil(filteredAvailabilities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredAvailabilities.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const resetForm = () => {
    setFormData({
      date: "",
      startTime: "09:00",
      endTime: "18:00",
      description: "",
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = "/api/availability/exceptional";
      const method = editingItem ? "PUT" : "POST";
      const body = {
        ...(editingItem && { id: editingItem.id }),
        organizationId,
        startDate: new Date(`${formData.date}T${formData.startTime}`),
        endDate: new Date(`${formData.date}T${formData.endTime}`),
        description: formData.description || undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: editingItem
            ? "Disponibilité modifiée"
            : "Disponibilité exceptionnelle ajoutée",
          description: editingItem
            ? "La disponibilité exceptionnelle a été modifiée avec succès."
            : "La disponibilité exceptionnelle a été créée avec succès.",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchExceptionalAvailabilities();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: editingItem
          ? "Impossible de modifier la disponibilité exceptionnelle."
          : "Impossible d'ajouter la disponibilité exceptionnelle.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: ExceptionalAvailability) => {
    const startDate = new Date(item.startDate);
    setEditingItem(item);
    setFormData({
      date: startDate.toISOString().split("T")[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: new Date(item.endDate).toTimeString().slice(0, 5),
      description: item.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/availability/exceptional?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Disponibilité supprimée",
          description:
            "La disponibilité exceptionnelle a été supprimée avec succès.",
        });
        fetchExceptionalAvailabilities();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la disponibilité exceptionnelle.",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Créneaux Exceptionnels</h3>
          <p className="text-muted-foreground text-sm">
            Ajoutez des créneaux d'ouverture en dehors des horaires habituels
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-past-exceptional"
              checked={showPastItems}
              onCheckedChange={setShowPastItems}
            />
            <Label
              htmlFor="show-past-exceptional"
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
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un Créneau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? "Modifier la Disponibilité Exceptionnelle"
                    : "Nouvelle Disponibilité Exceptionnelle"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <DatePicker
                    date={formData.date ? new Date(formData.date) : undefined}
                    onDateChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: date ? date.toISOString().split("T")[0] : "",
                      }))
                    }
                    placeholder="Sélectionner la date"
                    disablePastDates={!editingItem}
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Consultation d'urgence, rattrapage..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
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
        {paginatedItems.map((item) => {
          const isItemPast = isPast(new Date(item.endDate));
          return (
            <Card key={item.id} className={isItemPast ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">
                      {formatDate(new Date(item.startDate))}
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
                    {item.description && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {item.description}
                      </p>
                    )}
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

        {filteredAvailabilities.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {showPastItems
                  ? "Aucune disponibilité exceptionnelle définie"
                  : "Aucune disponibilité exceptionnelle future"}
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
              filteredAvailabilities.length
            )}{" "}
            sur {filteredAvailabilities.length} éléments
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
