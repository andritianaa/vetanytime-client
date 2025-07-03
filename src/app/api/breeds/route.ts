import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET() {
  try {
    const breeds = await prisma.breed.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(breeds);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch breeds" },
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

    const breed = await prisma.breed.create({
      data: { name },
    });

    return NextResponse.json(breed, { status: 201 });
  } catch (error) {
    console.error("Error creating breed:", error);
    return NextResponse.json(
      { error: "Failed to create breed" },
      { status: 500 },
    );
  }
}
