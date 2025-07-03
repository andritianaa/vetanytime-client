import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET() {
  try {
    const specialisations = await prisma.specialisation.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(specialisations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch specialisations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const specialisation = await prisma.specialisation.create({
      data: { name },
    });

    return NextResponse.json(specialisation, { status: 201 });
  } catch (error) {
    console.error("Error creating specialisation:", error);
    return NextResponse.json(
      { error: "Failed to create specialisation" },
      { status: 500 },
    );
  }
}
