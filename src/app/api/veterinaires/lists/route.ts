import { NextRequest, NextResponse } from "next/server";

import { currentSession } from "@/lib/current-user";
import { prisma } from "@/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await currentSession();
    if (
      !session ||
      !session.user ||
      !session.user.permissions.some((role) =>
        ["ADMIN", "SUPERADMIN", "MODERATOR"].includes(role)
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const organizations = await prisma.organization.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        city: true,
        careType: true,
      },
    });
    const total = await prisma.organization.count();
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      organizations,
      pagination: {
        total,
        pages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
