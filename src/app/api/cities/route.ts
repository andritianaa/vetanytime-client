import { NextResponse } from "next/server";

import { prisma } from "@/prisma";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: [{ province: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(cities);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
