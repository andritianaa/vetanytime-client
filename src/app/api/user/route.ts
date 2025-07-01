import { NextResponse } from 'next/server';
import { z } from 'zod';

import { currentClient } from '@/lib/current-user';
import { prisma } from '@/prisma';

// Schéma de validation pour la mise à jour du profil
const updateProfileSchema = z.object({
    fullname: z.string().optional(),
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    image: z.string().optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
})

// GET: Récupérer les informations du profil de l'utilisateur connecté
export async function GET() {
    try {
        const client = await currentClient()
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        return NextResponse.json(client)
    } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PUT: Mettre à jour les informations du profil
export async function PUT(request: Request) {
    try {
        const client = await currentClient()
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        const clientId = client.id
        const body = await request.json()

        // Valider les données
        const validatedData = updateProfileSchema.parse(body)

        // Vérifier si le nom d'utilisateur est déjà pris (si modifié)
        if (validatedData.username) {
            const existingClient = await prisma.client.findFirst({
                where: {
                    username: validatedData.username,
                    id: { not: clientId },
                },
            })
            if (existingClient) {
                return NextResponse.json({ error: "This username is already taken" }, { status: 400 })
            }
        }

        // Vérifier si l'email est déjà pris (si modifié)
        if (validatedData.email) {
            const existingClient = await prisma.client.findFirst({
                where: {
                    email: validatedData.email,
                    id: { not: clientId },
                },
            })

            if (existingClient) {
                return NextResponse.json({ error: "This email is already taken" }, { status: 400 })
            }
        }

        console.log(body);


        // Mettre à jour l'utilisateur
        const updatedClient = await prisma.client.update({
            where: { id: clientId },
            data: {
                ...validatedData,
            },
            select: {
                id: true,
                username: true,
                fullname: true,
                email: true,
                image: true,
                isEmailVerified: true,
                updatedAt: true,
            },
        })

        return NextResponse.json(updatedClient)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
        }
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

