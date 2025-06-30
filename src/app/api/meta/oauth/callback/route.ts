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

        const { code } = await request.json()

        if (!code) {
            return NextResponse.json({ error: "Code d'autorisation manquant" }, { status: 400 })
        }

        const redirectUri = process.env.META_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/meta`

        // Échanger le code contre un token via le SDK
        const { accessToken, expiresIn } = await metaSDK.exchangeCodeForToken(code, redirectUri)

        // Obtenir les informations de l'utilisateur Meta via le SDK
        const metaClientData = await metaSDK.getMetaClient(accessToken)

        // Obtenir les comptes publicitaires via le SDK
        const accountsData = await metaSDK.getAdAccounts(accessToken)

        // Calculer la date d'expiration
        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null

        // Sauvegarder le token d'accès
        const metaAccessToken = await prisma.metaAccessToken.upsert({
            where: {
                clientId_metaClientId: {
                    clientId: client.id,
                    metaClientId: metaClientData.id,
                },
            },
            update: {
                accessToken: accessToken, // À chiffrer en production
                expiresAt,
                scope: "ads_read,ads_management,business_management,pages_read_engagement",
                updatedAt: new Date(),
            },
            create: {
                clientId: client.id,
                accessToken: accessToken, // À chiffrer en production
                expiresAt,
                metaClientId: metaClientData.id,
                scope: "ads_read,ads_management,business_management,pages_read_engagement",
            },
        })

        return NextResponse.json({
            client: metaClientData,
            accounts: accountsData,
            tokenId: metaAccessToken.id,
        })
    } catch (error) {
        console.error("Meta OAuth callback error:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 },
        )
    }
}
