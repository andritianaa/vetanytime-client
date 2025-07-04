import { redirect } from 'next/navigation';

import { currentClient } from '@/lib/current-user';
import { prisma } from '@/prisma';

import { PetForm } from './pet-form';
import { PetList } from './pet-list';

async function getBreeds() {
  const breeds = await prisma.breed.findMany({
    orderBy: { name: "asc" },
  });
  return breeds;
}

async function getClientPets(clientId: string) {
  const pets = await prisma.pet.findMany({
    where: { clientId },
    include: {
      breed: true,
    },
    orderBy: { name: "asc" },
  });
  return pets;
}

export default async function PetsPage() {
  const client = await currentClient();

  if (!client) {
    redirect("/login");
  }

  const [breeds, pets] = await Promise.all([
    getBreeds(),
    getClientPets(client.id),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Animaux</h1>
          <p className="text-gray-600">
            Gérez les informations de vos compagnons
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire d'ajout */}
          <div>
            <PetForm breeds={breeds} clientId={client.id} />
          </div>

          {/* Liste des animaux */}
          <div>
            <PetList pets={pets} />
          </div>
        </div>
      </div>
    </div>
  );
}
