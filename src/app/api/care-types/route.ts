import { NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET() {
    try {
        const careTypes = await prisma.careType.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { consultationTypes: true },
                },
            },
        });
        return NextResponse.json(careTypes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch care types" }, { status: 500 });
    }
}
