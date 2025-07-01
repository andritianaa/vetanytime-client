import { NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET() {
    try {
        const consultationTypes = await prisma.consultationType.findMany({
            orderBy: { name: "asc" },
            include: {
                CareType: {
                    select: { name: true },
                },
            },
        });
        return NextResponse.json(consultationTypes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch consultation types" }, { status: 500 });
    }
}
