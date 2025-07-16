"use client";

import { Globe, Mail, Pen, Phone, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { editOrgPrincipalInfo } from "@/actions/vetenarian/vet.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CareType } from "@prisma/client";

import type { MultiSelectOption } from "@/components/ui/multi-select";
const LANGUAGES: MultiSelectOption[] = [
  { id: "fr", name: "Français" },
  { id: "en", name: "Anglais" },
  { id: "nl", name: "Néerlandais" },
];

const CONTACT_TYPES = [
  { value: "phone", label: "Téléphone", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "website", label: "Site web", icon: Globe },
];

const contactSchema = z
  .object({
    type: z.enum(["phone", "email", "website"]),
    value: z.string().min(1, "La valeur est requise"),
  })
  .superRefine((val, ctx) => {
    if (val.type === "phone") {
      // Simple regex pour numéro de téléphone (international ou FR)
      if (!/^\+?\d[\d\s.-]{7,}$/.test(val.value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Numéro de téléphone invalide",
          path: ["value"],
        });
      }
    } else if (val.type === "email") {
      if (!z.string().email().safeParse(val.value).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email invalide",
          path: ["value"],
        });
      }
    } else {
      if (!z.string().url().safeParse(val.value).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL invalide",
          path: ["value"],
        });
      }
    }
  });

const vetProfileSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  name: z.string().min(1, "Le nom est requis"),
  diploma: z.string().optional(),
  approvalNumber: z.string().optional(),
  careType: z.object({ id: z.string(), name: z.string() }),
  contacts: z.array(contactSchema).optional(),
  languages: z
    .array(z.string())
    .min(1, "Au moins une langue doit être sélectionnée"),
});

type VetProfileFormData = z.infer<typeof vetProfileSchema>;

type VetProfileEditDialogProps = {
  initialData?: Partial<VetProfileFormData>;
  careTypes: CareType[];
};

export function VetProfileEditDialog({
  initialData,
  careTypes,
}: VetProfileEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Stocker la valeur initiale du careType
  const initialCareTypeId = initialData?.careType?.id;

  const form = useForm<VetProfileFormData>({
    resolver: zodResolver(vetProfileSchema),
    defaultValues: {
      id: initialData?.id || "",
      name: initialData?.name || "",
      diploma: initialData?.diploma || "",
      approvalNumber: initialData?.approvalNumber || "",
      contacts:
        initialData?.contacts && initialData.contacts.length > 0
          ? initialData.contacts
          : [{ type: "phone", value: "" }],
      careType: initialData?.careType,
      languages: initialData?.languages || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const addContact = () => {
    append({ type: "phone", value: "" });
  };

  const handleSubmit = async (data: VetProfileFormData) => {
    console.log("here");

    setIsLoading(true);

    await editOrgPrincipalInfo({
      id: data.id,
      name: data.name,
      diploma: data.diploma,
      approvalNumber: data.approvalNumber,
      languages: data.languages,
      contacts: data.contacts,
      careTypeId: data.careType.id,
    })
      .then(() => {
        router.refresh();
        toast.success("Données sauvegardées avec succès !");
        setIsOpen(false);
      })
      .catch(() => {
        toast.error("Une erreur est survenue lors de la sauvegarde.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const defaultTrigger = (
    <div className="hover:bg-muted hover:text-primary text-muted-foreground absolute top-2 right-8 cursor-pointer rounded-lg p-2 transition-all">
      <Pen size={20} />
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-2xl space-y-4 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le profil vétérinaire</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Nom */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom complet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Diplôme */}
              <FormField
                control={form.control}
                name="diploma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diplôme</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un diplôme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Bac">Bac</SelectItem>
                        <SelectItem value="DO">DO</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                        <SelectItem value="MD">MD</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Numéro d'agrément */}
              <FormField
                control={form.control}
                name="approvalNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'agrément</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro d'agrément" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type de soin */}
              <FormField
                control={form.control}
                name="careType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de soin</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={careTypes}
                        value={field.value?.id}
                        onValueChange={(selectedId) => {
                          const selectedCareType = careTypes.find(
                            (ct) => ct.id === selectedId
                          );
                          if (selectedCareType) {
                            field.onChange(selectedCareType); // passer l'objet complet
                          }
                        }}
                        placeholder="Sélectionner un type de soin"
                        searchPlaceholder="Rechercher un type de soin..."
                        emptyMessage="Aucun type de soin trouvé."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contacts */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Contacts</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addContact}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Plus size={16} />
                    Ajouter un contact
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONTACT_TYPES.map((type) => {
                                const Icon = type.icon;
                                return (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Icon size={16} />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <div className="min-h-[20px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`contacts.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-[2]">
                          <FormControl>
                            <Input
                              placeholder={
                                form.watch(`contacts.${index}.type`) === "phone"
                                  ? "+33 1 23 45 67 89"
                                  : form.watch(`contacts.${index}.type`) ===
                                    "email"
                                  ? "email@exemple.com"
                                  : "https://monsite.com"
                              }
                              {...field}
                            />
                          </FormControl>
                          <div className="min-h-[20px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="mt-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Langues - MultiSelect */}
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langues</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={LANGUAGES}
                        selectedIds={field.value}
                        onSelectionChange={field.onChange}
                        placeholder="Sélectionner des langues..."
                        searchPlaceholder="Rechercher une langue..."
                        emptyMessage="Aucune langue trouvée."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
