"use client";

import { EllipsisVertical, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import useSWR from 'swr';
import * as z from 'zod';

import { updateOrgLocation } from '@/actions/vetenarian/vet.action';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { fetcher } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

type City = { id: string; name: string };

type EditLocationModalProps = {
  cityId: string;
  address: string;
  orgId?: string;
};

const locationSchema = z.object({
  cityId: z.string().min(1, "Veuillez sélectionner une ville"),
  address: z.string().min(1, "L'adresse est requise"),
});

type LocationFormData = z.infer<typeof locationSchema>;

export const EditLocationModal = ({
  cityId,
  address,
  orgId,
}: EditLocationModalProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: cities, isLoading: citiesLoading } = useSWR<City[]>(
    "/api/cities",
    fetcher
  );
  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      cityId: cityId || "",
      address: address || "",
    },
  });

  const handleSubmit = async (data: LocationFormData) => {
    try {
      setIsSubmitting(true);
      await updateOrgLocation({
        orgId: orgId || "",
        cityId: data.cityId,
        address: data.address,
      });
      toast.success("Localisation mise à jour avec succès");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la localisation");
      console.error("Error updating location:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"outline"} size="icon" className="p-2">
          <EllipsisVertical />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier la localisation</DialogTitle>
          <DialogDescription>
            Modifiez la ville et l'adresse de votre cabinet.
            {/* {cities?.map((city) => (
              <div key={city.id}>{city.name}</div>
            ))} */}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="cityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={cities || []}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner une ville..."
                      searchPlaceholder="Rechercher une ville..."
                      emptyMessage="Aucune ville trouvée."
                      disabled={citiesLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Entrez l'adresse complète..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || citiesLoading}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
