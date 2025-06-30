import { nanoid } from 'nanoid';

import { logger } from '@/lib/logger';
import { faker } from '@faker-js/faker';

import { prisma } from '../src/lib/prisma';
import {
  belgianCities, breeds, careTypes, consultationTypesByCaretype, specialisations, specialities
} from './seed-data';

// Set seed for reproducibility
faker.seed(123);



async function main() {
  logger.info("🌱 Seeding database...");

  // Create cities
  logger.info("🏙️ Creating cities...");
  const cityPromises = belgianCities.map(cityData =>
    prisma.city.create({
      data: {
        name: cityData.name,
        arrondissement: cityData.arrondissement,
        province: cityData.province
      },
    })
  );
  const cities = await Promise.all(cityPromises);
  cities.forEach(city => logger.info(`🏙️ Created city: ${city.name}`));

  // Create care types
  logger.info("🏥 Creating care types...");
  const careTypePromises = careTypes.map(name =>
    prisma.careType.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  );
  const createdCareTypes = await Promise.all(careTypePromises);
  createdCareTypes.forEach(careType => logger.info(`🏥 Created care type: ${careType.name}`));

  // Create consultation types
  logger.info("📋 Creating consultation types...");
  const consultationTypePromises: Promise<any>[] = [];

  for (const careType of createdCareTypes) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const consultationTypes = consultationTypesByCaretype[careType.name as keyof typeof consultationTypesByCaretype] || [];

    for (const consultationType of consultationTypes) {
      consultationTypePromises.push(
        prisma.consultationType.upsert({
          where: {
            name_careTypeId: {
              name: consultationType,
              careTypeId: careType.id
            }
          },
          update: {},
          create: {
            name: consultationType,
            careTypeId: careType.id
          }
        })
      );
    }
  }

  const createdConsultationTypes = await Promise.all(consultationTypePromises);
  createdConsultationTypes.forEach(consultationType =>
    logger.info(`📋 Created consultation type: ${consultationType.name}`)
  );

  // Create breeds
  logger.info("🐾 Creating breeds...");
  const breedPromises = breeds.map(name =>
    prisma.breed.upsert({
      where: { id: `breed_${name.toLowerCase().replace(/\s+/g, '_')}` },
      update: {},
      create: {
        id: `breed_${name.toLowerCase().replace(/\s+/g, '_')}`,
        name
      }
    })
  );
  const createdBreeds = await Promise.all(breedPromises);
  createdBreeds.forEach(breed => logger.info(`🐾 Created breed: ${breed.name}`));

  // Create specialities
  logger.info("👨‍⚕️ Creating specialities...");
  const specialityPromises = specialities.map(name =>
    prisma.speciality.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  );
  const createdSpecialities = await Promise.all(specialityPromises);
  createdSpecialities.forEach(speciality => logger.info(`👨‍⚕️ Created speciality: ${speciality.name}`));

  // Create specialisations
  logger.info("🎓 Creating specialisations...");
  const specialisationPromises = specialisations.map(name =>
    prisma.specialisation.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  );
  const createdSpecialisations = await Promise.all(specialisationPromises);
  createdSpecialisations.forEach(specialisation => logger.info(`🎓 Created specialisation: ${specialisation.name}`));

  logger.info("✅ Seeding completed!");
}

main()
  .catch((e) => {
    logger.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });