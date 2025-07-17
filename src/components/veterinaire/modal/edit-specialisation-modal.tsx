"use client";
import { Check, ChevronsUpDown, EllipsisVertical, Loader, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import { editOrgSpecialisation } from '@/actions/vetenarian/vet.action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, fetcher } from '@/lib/utils';
import { Specialisation } from '@prisma/client';

export type EditSpecialisationModalProps = {
  organizationId: string;
  specialisations: Specialisation[];
};

export const EditSpecialisationModal = ({
  organizationId,
  specialisations: initialSpecialisations,
}: EditSpecialisationModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSpecialisations.map((s) => s.id)
  );

  const { data: allSpecialisations } = useSWR<Specialisation[]>(
    "/api/specialisations",
    fetcher
  );

  const selectedSpecialisations =
    allSpecialisations?.filter((spec) => selectedIds.includes(spec.id)) || [];

  const handleToggleSpecialisation = (specialisationId: string) => {
    setSelectedIds((prev) =>
      prev.includes(specialisationId)
        ? prev.filter((id) => id !== specialisationId)
        : [...prev, specialisationId]
    );
  };

  const handleRemoveSpecialisation = (specialisationId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== specialisationId));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await editOrgSpecialisation(organizationId, selectedIds);
      toast.success("Données sauvegardées avec succès !");
      setModalOpen(false);
      // Refresh the server components to show updated data
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectOpen(false);
      setSelectedIds(initialSpecialisations.map((s) => s.id));
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="p-2">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier les spécialisations</DialogTitle>
          <DialogDescription>
            Sélectionnez les spécialisations de votre cabinet. Elles seront
            visibles par les utilisateurs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Spécialisations
            </label>

            {!allSpecialisations ? (
              <div className="text-muted-foreground flex items-center justify-center p-8 text-sm">
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Chargement des spécialisations...
              </div>
            ) : (
              <>
                <Popover open={selectOpen} onOpenChange={setSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={selectOpen}
                      className="h-auto min-h-[40px] w-full justify-between px-3 py-2"
                    >
                      <span className="text-left">
                        {selectedIds.length === 0 ? (
                          <span className="text-muted-foreground">
                            Sélectionner des spécialisations...
                          </span>
                        ) : (
                          `${selectedIds.length} spécialisation${
                            selectedIds.length > 1 ? "s" : ""
                          } sélectionnée${selectedIds.length > 1 ? "s" : ""}`
                        )}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Rechercher une spécialisation..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>
                          Aucune spécialisation trouvée.
                        </CommandEmpty>
                        <CommandGroup>
                          {allSpecialisations.map((specialisation) => (
                            <CommandItem
                              key={specialisation.id}
                              value={specialisation.name}
                              onSelect={() =>
                                handleToggleSpecialisation(specialisation.id)
                              }
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedIds.includes(specialisation.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">
                                {specialisation.name}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedSpecialisations.length > 0 && (
                  <div className="bg-muted/30 flex flex-wrap gap-2 rounded-md p-2">
                    {selectedSpecialisations.map((specialisation) => (
                      <Badge
                        key={specialisation.id}
                        variant="secondary"
                        className="flex items-center gap-1 py-1 pr-1"
                      >
                        <span className="max-w-[120px] truncate">
                          {specialisation.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 rounded-full p-0"
                          onClick={() =>
                            handleRemoveSpecialisation(specialisation.id)
                          }
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">
                            Supprimer {specialisation.name}
                          </span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading || !allSpecialisations}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
            <Button
              type="button"
              onClick={() => handleModalClose(false)}
              variant="outline"
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
