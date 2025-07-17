import { NextRequest, NextResponse } from 'next/server';

import { currentSession } from '@/lib/current-user';
import { prisma } from '@/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Check authentication and admin permissions
    const session = await currentSession();
    if (
      !session ||
      !session.user ||
      !session.user.permissions.some((role) =>
        ["ADMIN", "SUPERADMIN", "MODERATOR"].includes(role)
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: id,
      },
      include: {
        city: true,
        careType: true,
        Avis: true,
        Consultation: true,
        consultationTypes: true,
        OrganizationClient: true,
        OrganizationPet: true,
        OrganizationSpecialisation: {
          include: {
            specialisation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        conferencesList: true,
        experiencesList: true,
        formationsList: true,
        contactList: true,
        researchList: true,
        associationsList: true,
        OrganizationsHours: true,
        Unavailability: true,
        ExceptionalAvailability: true,
      },
    });
    return NextResponse.json(organization || null);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
