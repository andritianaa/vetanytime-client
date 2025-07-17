import { NextResponse } from 'next/server';

import { prisma } from '@/prisma';

import type { NextRequest } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const { organizationId, schedule } = await request.json();

    // Delete existing schedule
    await prisma.organizationsHours.deleteMany({
      where: { organizationId },
    });

    // Create new schedule
    const scheduleData = schedule.map((day: any) => ({
      organizationId,
      dayOfWeek: day.dayOfWeek,
      isOpen: day.isOpen,
      openTime: day.openTime,
      closeTime: day.closeTime,
      breakStartTime: day.breakStartTime,
      breakEndTime: day.breakEndTime,
    }));

    await prisma.organizationsHours.createMany({
      data: scheduleData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving schedule:", error);
    return NextResponse.json(
      { error: "Failed to save schedule" },
      { status: 500 }
    );
  }
}
