import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function POST(request: NextRequest) {
  try {
    const { organizationId, type, startDate, endDate } = await request.json();

    const unavailability = await prisma.unavailability.create({
      data: {
        organizationId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json(unavailability);
  } catch (error) {
    console.error("Error creating unavailability:", error);
    return NextResponse.json(
      { error: "Failed to create unavailability" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, type, startDate, endDate } = await request.json();

    const unavailability = await prisma.unavailability.update({
      where: { id },
      data: {
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json(unavailability);
  } catch (error) {
    console.error("Error updating unavailability:", error);
    return NextResponse.json(
      { error: "Failed to update unavailability" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.unavailability.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting unavailability:", error);
    return NextResponse.json(
      { error: "Failed to delete unavailability" },
      { status: 500 }
    );
  }
}
