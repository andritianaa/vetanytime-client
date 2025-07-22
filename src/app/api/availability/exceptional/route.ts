import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    const exceptionalAvailabilities =
      await prisma.exceptionalAvailability.findMany({
        where: {
          organizationId,
        },
        orderBy: {
          startDate: "asc",
        },
      });

    return NextResponse.json(exceptionalAvailabilities);
  } catch (error) {
    console.error("Error fetching exceptional availabilities:", error);
    return NextResponse.json(
      { error: "Failed to fetch exceptional availabilities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organizationId, startDate, endDate, description } =
      await request.json();

    const exceptional = await prisma.exceptionalAvailability.create({
      data: {
        organizationId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description || null,
      },
    });

    return NextResponse.json(exceptional);
  } catch (error) {
    console.error("Error creating exceptional availability:", error);
    return NextResponse.json(
      { error: "Failed to create exceptional availability" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, startDate, endDate, description } = await request.json();

    const exceptional = await prisma.exceptionalAvailability.update({
      where: { id },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description: description || null,
      },
    });

    return NextResponse.json(exceptional);
  } catch (error) {
    console.error("Error updating exceptional availability:", error);
    return NextResponse.json(
      { error: "Failed to update exceptional availability" },
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

    await prisma.exceptionalAvailability.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exceptional availability:", error);
    return NextResponse.json(
      { error: "Failed to delete exceptional availability" },
      { status: 500 }
    );
  }
}
