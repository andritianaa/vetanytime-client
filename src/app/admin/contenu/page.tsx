"use client";

import {
  Edit,
  Heart,
  MapPin,
  Plus,
  Search,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Breed, Specialisation } from "@prisma/client";

import { CreateBreadModal } from "./modals/create-breed-modal";
import { CreateCareTypeModal } from "./modals/create-care-type-modal";
import { CreateCityModal } from "./modals/create-city-modal";
import { CreateConsultationTypeModal } from "./modals/create-consultation-type-modal";
import { CreateSpecialisationModal } from "./modals/create-specialisation-modal";

const fetcher = async (url: string) =>
  fetch(url).then(async (res) => res.json());

type City = {
  id: string;
  name: string;
  arrondissement: string;
  province: string;
  createdAt: string;
};

type CareType = {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    consultationTypes: number;
  };
};

type ConsultationType = {
  id: string;
  name: string;
  careTypeId: string;
  createdAt: string;
  CareType: {
    name: string;
  };
};

type Bread = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

type AdminSpecialisation = {
  id: string;
  name: string;
  createdAt: string;
};

export default function Page() {
  const [activeTab, setActiveTab] = useState("cities");
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCareTypeModal, setShowCareTypeModal] = useState(false);
  const [showConsultationTypeModal, setShowConsultationTypeModal] =
    useState(false);
  const [showSpecialisationModal, setShowSpecialisationModal] = useState(false);
  const [showBreadModal, setShowBreadModal] = useState(false);

  // Search states
  const [citySearch, setCitySearch] = useState("");
  const [careTypeSearch, setCareTypeSearch] = useState("");
  const [consultationTypeSearch, setConsultationTypeSearch] = useState("");
  const [specialisationSearch, setSpecialisationSearch] = useState("");
  const [breedSearch, setBreedSearch] = useState("");

  // Edit states
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingCareType, setEditingCareType] = useState<CareType | null>(null);
  const [editingConsultationType, setEditingConsultationType] =
    useState<ConsultationType | null>(null);
  const [editingSpecialisation, setEditingSpecialisation] =
    useState<Specialisation | null>(null);
  const [editingBread, setEditingBread] = useState<Bread | null>(null);

  // Delete states
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "city" | "careType" | "consultationType" | "specialisation" | "breed";
    id: string;
    name: string;
  }>({ open: false, type: "city", id: "", name: "" });

  const { toast } = useToast();

  const {
    data: cities,
    error: citiesError,
    mutate: mutateCities,
  } = useSWR<City[]>("/api/cities", fetcher);

  const {
    data: careTypes,
    error: careTypesError,
    mutate: mutateCareTypes,
  } = useSWR<CareType[]>("/api/care-types", fetcher);

  const {
    data: consultationTypes,
    error: consultationTypesError,
    mutate: mutateConsultationTypes,
  } = useSWR<ConsultationType[]>("/api/consultation-types", fetcher);

  const {
    data: specialisations,
    error: specialisationsError,
    mutate: mutateSpecialisations,
  } = useSWR<AdminSpecialisation[]>("/api/specialisations", fetcher);

  const {
    data: breeds,
    error: breedsError,
    mutate: mutateBreeds,
  } = useSWR<Breed[]>("/api/breeds", fetcher);

  // Filter functions
  const filteredCities = cities?.filter(
    (city) =>
      city.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      city.arrondissement.toLowerCase().includes(citySearch.toLowerCase()) ||
      city.province.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredCareTypes = careTypes?.filter((careType) =>
    careType.name.toLowerCase().includes(careTypeSearch.toLowerCase())
  );

  const filteredConsultationTypes = consultationTypes?.filter(
    (consultationType) =>
      consultationType.name
        .toLowerCase()
        .includes(consultationTypeSearch.toLowerCase()) ||
      consultationType.CareType.name
        .toLowerCase()
        .includes(consultationTypeSearch.toLowerCase())
  );

  const filteredSpecialisations = specialisations?.filter((specialisation) =>
    specialisation.name
      .toLowerCase()
      .includes(specialisationSearch.toLowerCase())
  );

  const filteredBreeds = breeds?.filter((breed) =>
    breed.name.toLowerCase().includes(breedSearch.toLowerCase())
  );

  const handleCityCreated = () => {
    mutateCities();
    setShowCityModal(false);
    setEditingCity(null);
  };

  const handleCareTypeCreated = () => {
    mutateCareTypes();
    mutateConsultationTypes();
    setShowCareTypeModal(false);
    setEditingCareType(null);
  };

  const handleConsultationTypeCreated = () => {
    mutateConsultationTypes();
    setShowConsultationTypeModal(false);
    setEditingConsultationType(null);
  };

  const handleSpecialisationCreated = () => {
    mutateSpecialisations();
    setShowSpecialisationModal(false);
    setEditingSpecialisation(null);
  };

  const handleBreadCreated = () => {
    mutateBreeds();
    setShowBreadModal(false);
    setEditingBread(null);
  };

  const handleEdit = (type: string, item: any) => {
    switch (type) {
      case "city":
        setEditingCity(item);
        setShowCityModal(true);
        break;
      case "careType":
        setEditingCareType(item);
        setShowCareTypeModal(true);
        break;
      case "consultationType":
        setEditingConsultationType(item);
        setShowConsultationTypeModal(true);
        break;
      case "specialisation":
        setEditingSpecialisation(item);
        setShowSpecialisationModal(true);
        break;
      case "breed":
        setEditingBread(item);
        setShowBreadModal(true);
        break;
    }
  };

  const handleDeleteClick = (
    type: "city" | "careType" | "consultationType" | "specialisation" | "breed",
    id: string,
    name: string
  ) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const handleDelete = async () => {
    const { type, id } = deleteDialog;
    try {
      let endpoint = "";
      switch (type) {
        case "city":
          endpoint = `/api/cities/${id}`;
          break;
        case "careType":
          endpoint = `/api/care-types/${id}`;
          break;
        case "consultationType":
          endpoint = `/api/consultation-types/${id}`;
          break;
        case "specialisation":
          endpoint = `/api/specialisations/${id}`;
          break;
        case "breed":
          endpoint = `/api/breeds/${id}`;
          break;
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      // Refresh data
      switch (type) {
        case "city":
          mutateCities();
          break;
        case "careType":
          mutateCareTypes();
          mutateConsultationTypes();
          break;
        case "consultationType":
          mutateConsultationTypes();
          break;
        case "specialisation":
          mutateSpecialisations();
          break;
        case "breed":
          mutateBreeds();
          break;
      }

      toast({
        title: "Suppression réussie",
        description: `${deleteDialog.name} a été supprimé avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, type: "city", id: "", name: "" });
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Tableau de bord</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Error Logs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="mt-2 text-gray-600">
            Gérez les villes, types de soins et types de consultations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Villes
            </TabsTrigger>
            <TabsTrigger value="care-types" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Types de soins
            </TabsTrigger>
            <TabsTrigger
              value="consultation-types"
              className="flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4" />
              Types de consultations
            </TabsTrigger>
            <TabsTrigger
              value="Specialisations"
              className="flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4" />
              Specialisations
            </TabsTrigger>
            <TabsTrigger value="Breads" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Breeds
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cities" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Villes</CardTitle>
                  <CardDescription>
                    Gérez les villes disponibles dans le système
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowCityModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une ville
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Rechercher une ville, arrondissement ou province..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {citiesError && (
                  <div className="py-4 text-center text-red-500">
                    Erreur lors du chargement des villes
                  </div>
                )}
                {!cities && !citiesError && (
                  <div className="py-8 text-center text-gray-500">
                    Chargement...
                  </div>
                )}
                {filteredCities &&
                  filteredCities.length === 0 &&
                  citySearch && (
                    <div className="py-8 text-center text-gray-500">
                      Aucune ville trouvée pour "{citySearch}"
                    </div>
                  )}
                {cities && cities.length === 0 && !citySearch && (
                  <div className="py-8 text-center text-gray-500">
                    Aucune ville trouvée
                  </div>
                )}
                {filteredCities && filteredCities.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCities.map((city: City) => (
                      <div
                        key={city.id}
                        className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {city.name}
                            </h3>
                            <p className="text-gray-600">
                              {city.arrondissement}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              {city.province}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit("city", city)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteClick("city", city.id, city.name)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care-types" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Types de soins</CardTitle>
                  <CardDescription>
                    Gérez les différents types de soins disponibles
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowCareTypeModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un profession
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Rechercher un profession..."
                      value={careTypeSearch}
                      onChange={(e) => setCareTypeSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {careTypesError && (
                  <div className="py-4 text-center text-red-500">
                    Erreur lors du chargement des types de soins
                  </div>
                )}
                {!careTypes && !careTypesError && (
                  <div className="py-8 text-center text-gray-500">
                    Chargement...
                  </div>
                )}
                {filteredCareTypes &&
                  filteredCareTypes.length === 0 &&
                  careTypeSearch && (
                    <div className="py-8 text-center text-gray-500">
                      Aucun profession trouvé pour "{careTypeSearch}"
                    </div>
                  )}
                {careTypes && careTypes.length === 0 && !careTypeSearch && (
                  <div className="py-8 text-center text-gray-500">
                    Aucun profession trouvé
                  </div>
                )}
                {filteredCareTypes && filteredCareTypes.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCareTypes.map((careType: CareType) => (
                      <div
                        key={careType.id}
                        className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {careType.name}
                            </h3>
                            <Badge variant="outline" className="mt-2">
                              {careType._count.consultationTypes}{" "}
                              consultation(s)
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit("careType", careType)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteClick(
                                  "careType",
                                  careType.id,
                                  careType.name
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultation-types" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Types de consultations</CardTitle>
                  <CardDescription>
                    Gérez les différents types de consultations par profession
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowConsultationTypeModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un type de consultation
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Rechercher un type de consultation ou profession..."
                      value={consultationTypeSearch}
                      onChange={(e) =>
                        setConsultationTypeSearch(e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                {consultationTypesError && (
                  <div className="py-4 text-center text-red-500">
                    Erreur lors du chargement des types de consultations
                  </div>
                )}
                {!consultationTypes && !consultationTypesError && (
                  <div className="py-8 text-center text-gray-500">
                    Chargement...
                  </div>
                )}
                {filteredConsultationTypes &&
                  filteredConsultationTypes.length === 0 &&
                  consultationTypeSearch && (
                    <div className="py-8 text-center text-gray-500">
                      Aucun type de consultation trouvé pour "
                      {consultationTypeSearch}"
                    </div>
                  )}
                {consultationTypes &&
                  consultationTypes.length === 0 &&
                  !consultationTypeSearch && (
                    <div className="py-8 text-center text-gray-500">
                      Aucun type de consultation trouvé
                    </div>
                  )}
                {filteredConsultationTypes &&
                  filteredConsultationTypes.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredConsultationTypes.map(
                        (consultationType: ConsultationType) => (
                          <div
                            key={consultationType.id}
                            className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                  {consultationType.name}
                                </h3>
                                <Badge variant="secondary" className="mt-2">
                                  {consultationType.CareType.name}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEdit(
                                      "consultationType",
                                      consultationType
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick(
                                      "consultationType",
                                      consultationType.id,
                                      consultationType.name
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="Specialisations" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Specialisations</CardTitle>
                  <CardDescription>
                    Gérez les différents types de Specialisations
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowSpecialisationModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une specialisation
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Rechercher une spécialisation..."
                      value={specialisationSearch}
                      onChange={(e) => setSpecialisationSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {specialisationsError && (
                  <div className="py-4 text-center text-red-500">
                    Erreur lors du chargement des specialisations
                  </div>
                )}
                {!specialisations && !specialisationsError && (
                  <div className="py-8 text-center text-gray-500">
                    Chargement...
                  </div>
                )}
                {filteredSpecialisations &&
                  filteredSpecialisations.length === 0 &&
                  specialisationSearch && (
                    <div className="py-8 text-center text-gray-500">
                      Aucune spécialisation trouvée pour "{specialisationSearch}
                      "
                    </div>
                  )}
                {specialisations &&
                  specialisations.length === 0 &&
                  !specialisationSearch && (
                    <div className="py-8 text-center text-gray-500">
                      Aucune specialisation trouvée
                    </div>
                  )}
                {filteredSpecialisations &&
                  filteredSpecialisations.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredSpecialisations.map(
                        (specialisation: AdminSpecialisation) => (
                          <div
                            key={specialisation.id}
                            className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                  {specialisation.name}
                                </h3>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEdit("specialisation", specialisation)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick(
                                      "specialisation",
                                      specialisation.id,
                                      specialisation.name
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="Breads" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Breeds</CardTitle>
                  <CardDescription>
                    Gérez les différents types de race.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowBreadModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un breed
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Rechercher une race..."
                      value={breedSearch}
                      onChange={(e) => setBreedSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {breedsError && (
                  <div className="py-4 text-center text-red-500">
                    Erreur lors du chargement des breeds
                  </div>
                )}
                {!breeds && !breedsError && (
                  <div className="py-8 text-center text-gray-500">
                    Chargement...
                  </div>
                )}
                {filteredBreeds &&
                  filteredBreeds.length === 0 &&
                  breedSearch && (
                    <div className="py-8 text-center text-gray-500">
                      Aucun breed trouvé pour "{breedSearch}"
                    </div>
                  )}
                {breeds && breeds.length === 0 && !breedSearch && (
                  <div className="py-8 text-center text-gray-500">
                    Aucun breed trouvé
                  </div>
                )}
                {filteredBreeds && filteredBreeds.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBreeds.map((breed: Breed) => (
                      <div
                        key={breed.id}
                        className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {breed.name}
                            </h3>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit("breed", breed)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteClick("breed", breed.id, breed.name)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateCityModal
          open={showCityModal}
          onOpenChange={(open) => {
            setShowCityModal(open);
            if (!open) setEditingCity(null);
          }}
          onSuccess={handleCityCreated}
          editData={editingCity}
        />

        <CreateCareTypeModal
          open={showCareTypeModal}
          onOpenChange={(open) => {
            setShowCareTypeModal(open);
            if (!open) setEditingCareType(null);
          }}
          onSuccess={handleCareTypeCreated}
          editData={editingCareType}
        />

        <CreateConsultationTypeModal
          open={showConsultationTypeModal}
          onOpenChange={(open) => {
            setShowConsultationTypeModal(open);
            if (!open) setEditingConsultationType(null);
          }}
          onSuccess={handleConsultationTypeCreated}
          careTypes={careTypes ?? []}
          editData={editingConsultationType}
        />

        <CreateSpecialisationModal
          open={showSpecialisationModal}
          onOpenChange={(open) => {
            setShowSpecialisationModal(open);
            if (!open) setEditingSpecialisation(null);
          }}
          onSuccess={handleSpecialisationCreated}
          editData={editingSpecialisation ?? undefined}
        />

        <CreateBreadModal
          open={showBreadModal}
          onOpenChange={(open) => {
            setShowBreadModal(open);
            if (!open) setEditingBread(null);
          }}
          onSuccess={handleBreadCreated}
          editData={editingBread}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({ ...prev, open }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer "{deleteDialog.name}" ? Cette
                action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
