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

    const careTypeList = await prisma.careType.findMany({});

    return NextResponse.json(careTypeList);
  } catch (error) {
    console.error("Error fetching care type list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
