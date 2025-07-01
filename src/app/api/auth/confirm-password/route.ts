import { NextResponse } from 'next/server';

import { verifyPassword } from '@/lib/auth';
import { currentClient } from '@/lib/current-user';

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        const client = await currentClient()
        if (!client) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 400 }
            );
        }
        const isValid = await verifyPassword(password, client.password);
        if (!isValid) {
            return NextResponse.json(
                { error: "Mot de passe incorrect" },
                { status: 400 }
            );
        }
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
