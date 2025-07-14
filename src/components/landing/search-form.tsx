"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const fetcher = async (url: string) =>
  fetch(url).then(async (res) => res.json());

interface City {
  id: string;
  name: string;
  arrondissement: string;
  province: string;
}

interface CareType {
  id: string;
  name: string;
  _count: {
    consultationTypes: number;
  };
}

interface ConsultationType {
  id: string;
  name: string;
  careTypeId: string;
  CareType: {
    name: string;
  };
}

// Separate component that uses useSearchParams
const SearchFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // États pour les sélections
  const [cityValue, setCityValue] = useState("");
  const [careTypeValue, setCareTypeValue] = useState("");
  const [consultationTypeValue, setConsultationTypeValue] = useState("");

  // États pour les popovers
  const [openCity, setOpenCity] = useState(false);
  const [openCareType, setOpenCareType] = useState(false);
  const [openConsultationType, setOpenConsultationType] = useState(false);

  // Récupération des données avec SWR
  const { data: cities } = useSWR<City[]>("/api/cities", fetcher);
  const { data: careTypes } = useSWR<CareType[]>("/api/care-types", fetcher);
  const { data: consultationTypes } = useSWR<ConsultationType[]>(
    "/api/consultation-types",
    fetcher
  );

  // Pré-remplissage depuis les searchParams
  useEffect(() => {
    const city = searchParams.get("city");
    const careType = searchParams.get("careType");
    const consultationType = searchParams.get("consultationType");

    if (city) setCityValue(city);
    if (careType) setCareTypeValue(careType);
    if (consultationType) setConsultationTypeValue(consultationType);
  }, [searchParams]);

  // Logique de filtrage des consultation types
  const filteredConsultationTypes = useMemo(() => {
    if (!consultationTypes) return [];

    if (careTypeValue) {
      // Si un care type est sélectionné, filtrer les consultation types
      const selectedCareType = careTypes?.find(
        (ct) => ct.name === careTypeValue
      );
      if (selectedCareType) {
        return consultationTypes.filter(
          (ct) => ct.careTypeId === selectedCareType.id
        );
      }
    }

    // Sinon, retourner tous les consultation types
    return consultationTypes;
  }, [consultationTypes, careTypes, careTypeValue]);

  // Logique pour auto-sélectionner le care type quand on sélectionne un consultation type
  const handleConsultationTypeSelect = (consultationTypeName: string) => {
    setConsultationTypeValue(
      consultationTypeName === consultationTypeValue ? "" : consultationTypeName
    );
    setOpenConsultationType(false);

    if (
      consultationTypeName &&
      consultationTypeName !== consultationTypeValue
    ) {
      // Trouver le consultation type sélectionné
      const selectedConsultationType = consultationTypes?.find(
        (ct) => ct.name === consultationTypeName
      );

      if (selectedConsultationType) {
        // Trouver tous les care types qui ont ce consultation type
        const relatedCareTypes = consultationTypes
          ?.filter((ct) => ct.name === consultationTypeName)
          .map((ct) => ct.CareType.name);

        const uniqueCareTypes = [...new Set(relatedCareTypes)];

        // Si il n'y a qu'un seul care type, le sélectionner automatiquement
        if (uniqueCareTypes.length === 1) {
          setCareTypeValue(uniqueCareTypes[0]);
        }
        // Si il y en a plusieurs, vider la sélection pour laisser le choix
        else if (uniqueCareTypes.length > 1) {
          setCareTypeValue("");
        }
      }
    }
  };

  // Gestion de la recherche
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (cityValue) params.set("city", cityValue);
    if (careTypeValue) params.set("careType", careTypeValue);
    if (consultationTypeValue)
      params.set("consultationType", consultationTypeValue);

    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
  };

  // Formatage des villes pour l'affichage
  const cityOptions = useMemo(() => {
    if (!cities) return [];
    return cities.map((city) => ({
      value: city.name,
      label: `${city.name}`,
      fullLabel: `${city.name}, ${city.arrondissement}`,
    }));
  }, [cities]);

  const careTypeOptions = useMemo(() => {
    if (!careTypes) return [];
    return careTypes.map((careType) => ({
      value: careType.name,
      label: careType.name,
      count: careType._count.consultationTypes,
    }));
  }, [careTypes]);

  // Grouper les consultation types par nom et rassembler les care types associés
  const consultationTypeOptions = useMemo(() => {
    if (!filteredConsultationTypes.length) return [];

    // Grouper par nom de consultation
    const groupedConsultations = filteredConsultationTypes.reduce(
      (acc, consultationType) => {
        const name = consultationType.name;
        if (!acc[name]) {
          acc[name] = {
            name,
            careTypes: [],
          };
        }
        // Ajouter le care type s'il n'est pas déjà présent
        if (!acc[name].careTypes.includes(consultationType.CareType.name)) {
          acc[name].careTypes.push(consultationType.CareType.name);
        }
        return acc;
      },
      {} as Record<string, { name: string; careTypes: string[] }>
    );

    // Convertir en array et trier
    return Object.values(groupedConsultations)
      .map((consultation) => ({
        value: consultation.name,
        label: consultation.name,
        careTypes: consultation.careTypes.sort(), // Trier les care types alphabétiquement
        careTypesText: consultation.careTypes.join(", "),
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Trier les consultations alphabétiquement
  }, [filteredConsultationTypes]);

  return (
    <div className="flex w-full gap-2">
      {/* Sélecteur de profession */}
      <Popover open={openCareType} onOpenChange={setOpenCareType}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCareType}
            className="h-12 flex-1 justify-between backdrop-blur-md"
          >
            {careTypeValue
              ? careTypeOptions.find(
                  (careType) => careType.value === careTypeValue
                )?.label
              : "Que cherchez-vous?"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Rechercher un profession..."
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Aucun profession trouvé.</CommandEmpty>
              <CommandGroup>
                {careTypeOptions.map((careType) => (
                  <CommandItem
                    key={careType.value}
                    value={careType.value}
                    onSelect={(currentValue) => {
                      setCareTypeValue(
                        currentValue === careTypeValue ? "" : currentValue
                      );
                      setOpenCareType(false);
                      // Reset consultation type si on change de care type
                      if (currentValue !== careTypeValue) {
                        setConsultationTypeValue("");
                      }
                    }}
                  >
                    <div className="flex flex-col">
                      <span>{careType.label}</span>
                      <span className="text-xs text-gray-500">
                        {careType.count} consultation
                        {careType.count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto",
                        careTypeValue === careType.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Sélecteur de type de consultation */}
      <Popover
        open={openConsultationType}
        onOpenChange={setOpenConsultationType}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openConsultationType}
            className="h-12 flex-1 justify-between backdrop-blur-md"
          >
            {consultationTypeValue
              ? consultationTypeOptions.find(
                  (consultationType) =>
                    consultationType.value === consultationTypeValue
                )?.label
              : "Type de consultation"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0">
          <Command>
            <CommandInput
              placeholder="Rechercher une consultation..."
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Aucune consultation trouvée.</CommandEmpty>
              <CommandGroup>
                {consultationTypeOptions.map((consultationType) => (
                  <CommandItem
                    key={consultationType.value}
                    value={consultationType.value}
                    onSelect={handleConsultationTypeSelect}
                    className="py-3"
                  >
                    <div className="flex w-full flex-col">
                      <span className="font-medium">
                        {consultationType.label}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {consultationType.careTypes.map((careType, index) => (
                          <span
                            key={careType}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                          >
                            {careType}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 flex-shrink-0",
                        consultationTypeValue === consultationType.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Sélecteur de ville */}
      <Popover open={openCity} onOpenChange={setOpenCity}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCity}
            className="h-12 flex-1 justify-between backdrop-blur-md"
          >
            {cityValue
              ? cityOptions.find((city) => city.value === cityValue)?.label
              : "Adresse, Région ou Ville"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Rechercher une ville..."
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Aucune ville trouvée.</CommandEmpty>
              <CommandGroup>
                {cityOptions.map((city) => (
                  <CommandItem
                    key={city.value}
                    value={city.value}
                    onSelect={(currentValue) => {
                      setCityValue(
                        currentValue === cityValue ? "" : currentValue
                      );
                      setOpenCity(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <span>{city.label}</span>
                      <span className="text-xs text-gray-500">
                        {city.fullLabel}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto",
                        cityValue === city.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Bouton de recherche */}
      <Button className="size-12" onClick={handleSearch}>
        <Search className="size-6" />
      </Button>
    </div>
  );
};

// Fallback component for loading state
const SearchFormFallback = () => {
  return (
    <div className="flex w-full gap-2">
      <Button
        variant="outline"
        className="h-12 flex-1 justify-between backdrop-blur-md"
        disabled
      >
        Que cherchez-vous?
        <ChevronsUpDown className="opacity-50" />
      </Button>
      <Button
        variant="outline"
        className="h-12 flex-1 justify-between backdrop-blur-md"
        disabled
      >
        Type de consultation
        <ChevronsUpDown className="opacity-50" />
      </Button>
      <Button
        variant="outline"
        className="h-12 flex-1 justify-between backdrop-blur-md"
        disabled
      >
        Adresse, Région ou Ville
        <ChevronsUpDown className="opacity-50" />
      </Button>
      <Button className="size-12" disabled>
        <Search className="size-6" />
      </Button>
    </div>
  );
};

// Main component with Suspense boundary
export const SearchForm = () => {
  return (
    <Suspense fallback={<SearchFormFallback />}>
      <SearchFormContent />
    </Suspense>
  );
};
