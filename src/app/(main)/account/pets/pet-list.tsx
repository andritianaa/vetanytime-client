"use client";

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Hash, Heart, Loader2, PawPrint, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { deletePet } from '@/actions/pet-actions';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Pet {
  id: string;
  name: string;
  birth: Date;
  image: string;
  registrationId: string;
  sexe: "Male" | "Female" | "Other";
  breed: {
    id: string;
    name: string;
  };
}

interface PetListProps {
  pets: Pet[];
}

export function PetList({ pets }: PetListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async (petId: string) => {
    setDeletingId(petId);
    try {
      const result = await deletePet(petId);

      if (result.success) {
        toast({
          title: "Animal supprimé",
          description: "L'animal a été supprimé avec succès.",
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getSexeLabel = (sexe: string) => {
    switch (sexe) {
      case "Male":
        return "Mâle";
      case "Female":
        return "Femelle";
      default:
        return "Autre";
    }
  };

  const getSexeColor = (sexe: string) => {
    switch (sexe) {
      case "Male":
        return "bg-blue-100 text-blue-800";
      case "Female":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    if (age === 0) {
      const months =
        today.getMonth() -
        birth.getMonth() +
        12 * (today.getFullYear() - birth.getFullYear());
      return months <= 1 ? "Moins d'1 mois" : `${months} mois`;
    }

    return age === 1 ? "1 an" : `${age} ans`;
  };

  if (pets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Mes Animaux
          </CardTitle>
          <CardDescription>
            Aucun animal enregistré pour le moment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Ajoutez votre premier compagnon !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Mes Animaux ({pets.length})
        </CardTitle>
        <CardDescription>Liste de vos compagnons enregistrés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="flex items-center justify-between border rounded-lg hover:bg-gray-50 transition-colors p-4"
            >
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div
                    className="flex items-center space-x-4   cursor-pointer w-full"
                    onClick={() => setSelectedPet(pet)}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={
                          pet.image ||
                          `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(
                            pet.name
                          )}`
                        }
                        alt={pet.name}
                      />
                      <AvatarFallback className="text-lg font-semibold">
                        {pet.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {pet.name}
                        </h3>
                        <Badge className={getSexeColor(pet.sexe)}>
                          {getSexeLabel(pet.sexe)}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {pet.breed.name}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(pet.birth), "dd MMMM yyyy", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span>{pet.registrationId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <PawPrint className="h-5 w-5 text-red-500" />
                      {selectedPet?.name}
                    </DialogTitle>
                    <DialogDescription>
                      Informations détaillées de votre compagnon
                    </DialogDescription>
                  </DialogHeader>

                  {selectedPet && (
                    <div className="space-y-6">
                      {/* Photo de l'animal */}
                      <div className="flex justify-center">
                        <Avatar className="h-32 w-32 border-4 border-border">
                          <AvatarImage
                            src={
                              selectedPet.image ||
                              `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(
                                selectedPet.name
                              )}`
                            }
                            alt={selectedPet.name}
                          />
                          <AvatarFallback className="text-3xl font-semibold">
                            {selectedPet.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Informations détaillées */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Nom
                            </p>
                            <p className="text-lg font-semibold">
                              {selectedPet.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Sexe
                            </p>
                            <Badge className={getSexeColor(selectedPet.sexe)}>
                              {getSexeLabel(selectedPet.sexe)}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Race
                          </p>
                          <p className="text-lg">{selectedPet.breed.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Date de naissance
                            </p>
                            <p className="text-sm">
                              {format(
                                new Date(selectedPet.birth),
                                "dd MMMM yyyy",
                                { locale: fr }
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Âge
                            </p>
                            <p className="text-sm font-semibold">
                              {calculateAge(selectedPet.birth)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Numéro d'identification
                          </p>
                          <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {selectedPet.registrationId}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                  >
                    {deletingId === pet.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer {pet.name} ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes les données
                      associées à cet animal seront définitivement supprimées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(pet.id)}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deletingId === pet.id}
                    >
                      {deletingId === pet.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Suppression...
                        </>
                      ) : (
                        "Supprimer"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
