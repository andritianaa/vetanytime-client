import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: [{ province: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(cities);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, arrondissement, province } = body;

    if (!name || !arrondissement || !province) {
      return NextResponse.json(
        { error: "Name, arrondissement, and province are required" },
        { status: 400 },
      );
    }

    const city = await prisma.city.create({
      data: {
        name,
        arrondissement,
        province,
      },
    });

    return NextResponse.json(city, { status: 201 });
  } catch (error) {
    console.error("Error creating city:", error);
    return NextResponse.json(
      { error: "Failed to create city" },
      { status: 500 },
    );
  }
}
