"use server";
import { prisma } from '@/prisma';

export const addCity = async (
  name: string,
  arrondissement: string,
  province: string,
) => {
  await prisma.city.upsert({
    where: {
      name_arrondissement_province: {
        name,
        arrondissement,
        province,
      },
    },
    update: { name, arrondissement, province },
    create: { name, arrondissement, province },
  });
};

export const addCareType = async (name: string) => {
  await prisma.careType.upsert({
    where: { name },
    update: { name },
    create: { name },
  });
};

export const updateCareType = async (id: string, name: string) => {
  await prisma.careType.update({
    where: { id },
    data: { name },
  });
};

export const updateCity = async (
  id: string,
  name: string,
  arrondissement: string,
  province: string,
) => {
  await prisma.city.update({
    where: { id },
    data: { name, arrondissement, province },
  });
};

export const updateConsultationType = async (
  id: string,
  name: string,
  careTypeId: string,
) => {
  await prisma.consultationType.update({
    where: { id },
    data: { name, careTypeId },
  });
};

export const updateSpecialisation = async (id: string, name: string) => {
  await prisma.specialisation.update({
    where: { id },
    data: { name },
  });
};

export const addSpecialisation = async (name: string) => {
  await prisma.specialisation.upsert({
    where: { name },
    update: { name },
    create: { name },
  });
};

export const addConsultationType = async (name: string, careTypeId: string) => {
  await prisma.consultationType.upsert({
    where: {
      name_careTypeId: {
        name,
        careTypeId,
      },
    },
    update: { name, careTypeId },
    create: { name, careTypeId },
  });
};
