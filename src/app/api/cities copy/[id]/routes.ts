import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, arrondissement, province } = body;

    if (!name || !arrondissement || !province) {
      return NextResponse.json(
        { error: "Name, arrondissement, and province are required" },
        { status: 400 },
      );
    }

    const updatedCity = await prisma.city.update({
      where: { id },
      data: {
        name,
        arrondissement,
        province,
      },
    });

    return NextResponse.json(updatedCity);
  } catch (error) {
    console.error("Error updating city:", error);
    return NextResponse.json(
      { error: "Failed to update city" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    await prisma.city.delete({
      where: { id },
    });

    return NextResponse.json({ message: "City deleted successfully" });
  } catch (error) {
    console.error("Error deleting city:", error);
    return NextResponse.json(
      { error: "Failed to delete city" },
      { status: 500 },
    );
  }
}
