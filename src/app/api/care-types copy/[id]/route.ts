import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedCareType = await prisma.careType.update({
      where: { id },
      data: { name },
      include: {
        _count: {
          select: { consultationTypes: true },
        },
      },
    });

    return NextResponse.json(updatedCareType);
  } catch (error) {
    console.error("Error updating care type:", error);
    return NextResponse.json(
      { error: "Failed to update care type" },
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

    // Check if care type has associated consultation types
    const careType = await prisma.careType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { consultationTypes: true },
        },
      },
    });

    if (!careType) {
      return NextResponse.json(
        { error: "Care type not found" },
        { status: 404 },
      );
    }

    if (careType._count.consultationTypes > 0) {
      return NextResponse.json(
        { error: "Cannot delete care type with associated consultation types" },
        { status: 400 },
      );
    }

    await prisma.careType.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Care type deleted successfully" });
  } catch (error) {
    console.error("Error deleting care type:", error);
    return NextResponse.json(
      { error: "Failed to delete care type" },
      { status: 500 },
    );
  }
}
