
import { prisma } from '@/prisma';

export async function GET() {
  try {
    const careTypes = await prisma.careType.findMany({
      include: {
        consultationTypes: {
          select: {
            id: true,
            name: true,
            careTypeId: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return new Response(JSON.stringify(careTypes), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Erreur interne serveur" }), {
      status: 500,
    });
  }
}
