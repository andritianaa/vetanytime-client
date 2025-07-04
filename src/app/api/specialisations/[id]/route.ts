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

    const updatedSpecialisation = await prisma.specialisation.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedSpecialisation);
  } catch (error) {
    console.error("Error updating specialisation:", error);
    return NextResponse.json(
      { error: "Failed to update specialisation" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const { params } = context
    const id = params.id.toString()

    await prisma.specialisation.delete({
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
