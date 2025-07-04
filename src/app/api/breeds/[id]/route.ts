import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    const { params } = context
    const id = params.id.toString()
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedBreed = await prisma.breed.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedBreed);
  } catch (error) {
    console.error("Error updating breed:", error);
    return NextResponse.json(
      { error: "Failed to update breed" },
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

    await prisma.breed.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Specialisation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting specialisation:", error);
    return NextResponse.json(
      { error: "Failed to delete specialisation" },
      { status: 500 },
    );
  }
}
