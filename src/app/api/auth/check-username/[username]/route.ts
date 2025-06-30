// app/api/auth/check-username/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/prisma';

// La fonction GET avec la signature correcte pour Next.js 15
export const GET = async (req: NextRequest, context: any) => {
  try {
    const { params } = context;
    const username = params.username.toString();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findFirst({
      where: {
        username: username,
      },
    });

    if (!client) {
      return NextResponse.json(
        { available: true, message: "Username is available" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { available: false, message: "Username is already taken" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
