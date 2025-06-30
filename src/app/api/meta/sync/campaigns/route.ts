import { NextRequest, NextResponse } from 'next/server';

import { currentClient } from '@/lib/current-client';
import { metaSDK } from '@/lib/meta-business-sdk';
import { prisma } from '@/prisma';

export async function POST(request: NextRequest) {
    try {
        const client = await currentClient()
        if (!client) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        const { accountId } = await request.json()

        if (!accountId) {
            return NextResponse.json({ error: "ID de compte manquant" }, { status: 400 })
        }

        // Vérifier que l'utilisateur a accès à ce compte
        const metaAccount = await prisma.metaAccount.findFirst({
            where: {
                id: accountId,
                metaAccessToken: {
                    clientId: client.id,
                },
            },
            include: {
                metaAccessToken: true,
            },
        })

        if (!metaAccount) {
            return NextResponse.json({ error: "Compte non trouvé ou accès refusé" }, { status: 404 })
        }

        // Synchroniser les campagnes
        await metaSDK.syncCampaigns(accountId, metaAccount.metaAccessToken.accessToken, client.id)

        // Mettre à jour la date de dernière synchronisation
        await prisma.metaAccount.update({
            where: { id: accountId },
            data: { lastSyncedAt: new Date() },
        })

        // Récupérer les campagnes synchronisées
        const campaigns = await prisma.campaign.findMany({
            where: { metaAccountId: accountId },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({
            message: "Campagnes synchronisées avec succès",
            campaigns,
            count: campaigns.length,
        })
    } catch (error) {
        console.error("Sync campaigns error:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Erreur lors de la synchronisation",
            },
            { status: 500 },
        )
    }
}
