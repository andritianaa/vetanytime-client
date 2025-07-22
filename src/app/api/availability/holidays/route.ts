import { NextResponse } from 'next/server';

import { prisma } from '@/prisma';

import type { NextRequest } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    console.log("here");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    const holidays = await prisma.unavailability.findMany({
      where: {
        organizationId,
        type: "HOLIDAY",
      },
    });

    return NextResponse.json(holidays);
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organizationId, holidays } = await request.json();

    // Delete existing holidays
    await prisma.unavailability.deleteMany({
      where: {
        organizationId,
        type: "HOLIDAY",
      },
    });

    // Create new holidays
    if (holidays.length > 0) {
      const holidayData = holidays.map((date: string) => ({
        organizationId,
        type: "HOLIDAY" as const,
        startDate: new Date(`${date}T00:00:00`),
        endDate: new Date(`${date}T23:59:59`),
      }));

      await prisma.unavailability.createMany({
        data: holidayData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving holidays:", error);
    return NextResponse.json(
      { error: "Failed to save holidays" },
      { status: 500 }
    );
  }
}
