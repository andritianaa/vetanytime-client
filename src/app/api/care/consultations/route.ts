import { logger } from 'better-auth';
import { NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const careTypeId = url.searchParams.get("careTypeId");
    console.log(
      "Récupération des consultations pour le type de soin :",
      careTypeId,
    );

    if (!careTypeId) {
      return NextResponse.json(
        { message: "ID du type de soin manquant" },
        { status: 400 },
      );
    }

    const consultations = await prisma.consultationType.findMany({
      where: { careTypeId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(consultations, {
      status: 200,
    });
  } catch (error) {
    logger.error("Erreur récupération consultations :", error);
    return NextResponse.json(
      { message: "Erreur interne serveur" },
      { status: 500 },
    );
  }
}
