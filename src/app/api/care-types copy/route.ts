import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET() {
  try {
    const careTypes = await prisma.careType.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { consultationTypes: true },
        },
      },
    });

    return NextResponse.json(careTypes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch care types" },
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

    const careType = await prisma.careType.create({
      data: { name },
      include: {
        _count: {
          select: { consultationTypes: true },
        },
      },
    });

    return NextResponse.json(careType, { status: 201 });
  } catch (error) {
    console.error("Error creating care type:", error);
    return NextResponse.json(
      { error: "Failed to create care type" },
      { status: 500 },
    );
  }
}
