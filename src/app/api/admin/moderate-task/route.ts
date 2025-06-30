// app/api/admin/moderate-task/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { currentSession } from '@/lib/current-client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  const session = await currentSession();

  if (!session || !session.client.permissions.includes("MODERATOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, isHidden, moderationReason } = await req.json();
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        isHidden,
        moderationReason,
        moderatedAt: new Date(),
        moderatedBy: session.client.id,
      },
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: "Error moderating task" },
      { status: 500 }
    );
  }
}
