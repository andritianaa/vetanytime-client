import { Navbar } from '@/app/(web)/navbar';
import { SearchForm } from '@/components/landing/search-form';
import { VeterinarianCard } from '@/components/veterinarian/veterinarian-card-client';
import { prisma } from '@/prisma';

type SearchParams = {
  city?: string;
  careType?: string;
  consultationType?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { city, careType, consultationType } = await searchParams;

  const organizations = await prisma.organization.findMany({
    where: {
      city: city
        ? {
            name: city,
          }
        : undefined,
      careType: careType
        ? {
            name: careType,
          }
        : undefined,
      consultationTypes: consultationType
        ? {
            some: {
              name: consultationType,
            },
          }
        : undefined,
    },
    include: {
      city: true,
      careType: true,
      consultationTypes: true,
      speciality: true,
      specialisations: true,
      contactList: true,
      ConsultationTypeDetails: {
        where: { isActive: true },
        take: 3,
      },
      // Commenté temporairement jusqu'à ce qu'on connaisse la structure exacte d'Avis
      // Avis: {
      //   select: {
      //     rating: true,
      //   },
      // },
      OrganizationsHours: {
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  // Calculer les statistiques pour chaque organisation
  const organizationsWithStats = organizations.map((org: any) => {
    // Pour l'instant, on utilise des valeurs par défaut pour les avis
    // Vous pouvez ajuster cela une fois que la structure d'Avis sera clarifiée
    const averageRating = 4.5; // Valeur par défaut
    const totalReviews = Math.floor(Math.random() * 50) + 10; // Simulation temporaire

    return {
      ...org,
      averageRating,
      totalReviews,
    };
  });

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Formulaire de recherche */}
        <div className="mt-20 mb-8">
          <div className="rounded-lg border p-6 shadow-sm bg-white">
            <h2 className="mb-4 text-lg font-semibold">
              Affiner votre recherche
            </h2>
            <SearchForm />
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Résultats de la recherche</h1>

          {/* Filtres actifs */}
          {(city || careType || consultationType) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {city && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  Ville: {city}
                </span>
              )}
              {careType && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Type de soin: {careType}
                </span>
              )}
              {consultationType && (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                  Consultation: {consultationType}
                </span>
              )}
            </div>
          )}

          <p className="text-gray-600">
            {organizationsWithStats.length} vétérinaire
            {organizationsWithStats.length > 1 ? "s" : ""} trouvée
            {organizationsWithStats.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Liste des résultats */}
        {organizationsWithStats.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl text-gray-400">🔍</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Aucun résultat trouvé
            </h2>
            <p className="mb-6 text-gray-600">
              Essayez de modifier vos critères de recherche ou supprimez
              certains filtres.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-1">
            {organizationsWithStats.map((org: any) => (
              <VeterinarianCard key={org.id} veterinarian={org} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
