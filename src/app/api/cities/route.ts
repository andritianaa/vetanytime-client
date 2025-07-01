import { NextResponse } from 'next/server';

import { prisma } from '@/prisma';

export async function GET() {
    try {
        const cities = await prisma.city.findMany({
            orderBy: [
                { province: 'asc' },
                { name: 'asc' }
            ]
        });
        return NextResponse.json(cities);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }
}
