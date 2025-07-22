import { Navbar } from '@/app/(web)/navbar';
import { SearchForm } from '@/components/landing/search-form';
import { OrganizationSearchCard } from '@/components/organization/organization-search-card';
import { prisma } from '@/prisma';

type SearchParams = {
  city?: string;
  careType?: string;
  consultationType?: string;
  speciality?: string;
};

export default async function SearchOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { city, careType, consultationType, speciality } = await searchParams;

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
      speciality: speciality
        ? {
            name: speciality,
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
        orderBy: { name: "asc" },
      },
      OrganizationsHours: {
        orderBy: { dayOfWeek: "asc" },
      },
      ExceptionalAvailability: true,
      Unavailability: {
        where: {
          endDate: {
            gte: new Date(),
          },
        },
        orderBy: { startDate: "asc" },
      },
      // Simuler des avis pour l'affichage
      _count: {
        select: {
          Consultation: true,
        },
      },
    },
  });

  // Calculer les statistiques pour chaque organisation
  const organizationsWithStats = organizations.map((org: any) => {
    // Simulation des avis basée sur le nombre de consultations
    const consultationCount = org._count.Consultation;
    const averageRating = Math.min(4.2 + Math.random() * 0.8, 5.0);
    const totalReviews = Math.max(Math.floor(consultationCount * 0.3), 5);

    return {
      ...org,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    };
  });

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Formulaire de recherche */}
        <div className="mt-20 mb-8">
          <div className="rounded-lg border p-6 shadow-sm bg-white">
            <h2 className="mb-4 text-lg font-semibold">
              Trouvez votre professionnel de santé
            </h2>
            <SearchForm />
          </div>
        </div>

        {/* En-tête des résultats */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Professionnels de santé disponibles
          </h1>
          {/* Filtres actifs */}
          {(city || careType || consultationType || speciality) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {city && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  📍 {city}
                </span>
              )}
              {careType && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  🏥 {careType}
                </span>
              )}
              {consultationType && (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                  💊 {consultationType}
                </span>
              )}
              {speciality && (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                  🩺 {speciality}
                </span>
              )}
            </div>
          )}
          <p className="text-gray-600">
            {organizationsWithStats.length} professionnel
            {organizationsWithStats.length > 1 ? "s" : ""} trouvé
            {organizationsWithStats.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Liste des résultats */}
        {organizationsWithStats.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl text-gray-400">🔍</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Aucun professionnel trouvé
            </h2>
            <p className="mb-6 text-gray-600">
              Essayez de modifier vos critères de recherche ou supprimez
              certains filtres.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {organizationsWithStats.map((org: any) => (
              <OrganizationSearchCard key={org.id} organization={org} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
