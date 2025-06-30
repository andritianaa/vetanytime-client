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

        const { accountIds } = await request.json()

        if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
            return NextResponse.json({ error: "IDs de comptes manquants" }, { status: 400 })
        }

        // Récupérer le token Meta de l'utilisateur
        const metaAccessToken = await prisma.metaAccessToken.findFirst({
            where: { clientId: client.id },
            orderBy: { createdAt: "desc" },
        })

        if (!metaAccessToken) {
            return NextResponse.json({ error: "Token Meta non trouvé" }, { status: 404 })
        }

        // Obtenir tous les comptes via le SDK
        const allAccounts = await metaSDK.getAdAccounts(metaAccessToken.accessToken)

        // Filtrer les comptes sélectionnés
        const selectedAccountsData = allAccounts.filter((account) => accountIds.includes(account.id))

        const savedAccounts = []

        // Sauvegarder chaque compte sélectionné
        for (const accountData of selectedAccountsData) {
            try {
                // Calculer un score de lisibilité
                const readabilityScore = calculateReadabilityScore(accountData)

                // Sauvegarder ou mettre à jour le compte
                const metaAccount = await prisma.metaAccount.upsert({
                    where: { id: accountData.id },
                    update: {
                        name: accountData.name,
                        currency: accountData.currency,
                        accountStatus: accountData.accountStatus,
                        businessName: accountData.businessName,
                        timezone: accountData.timezone,
                        readabilityScore,
                        lastSyncedAt: new Date(),
                        updatedAt: new Date(),
                    },
                    create: {
                        id: accountData.id,
                        name: accountData.name,
                        currency: accountData.currency,
                        accountStatus: accountData.accountStatus,
                        businessName: accountData.businessName,
                        timezone: accountData.timezone,
                        metaAccessTokenId: metaAccessToken.id,
                        readabilityScore,
                        lastSyncedAt: new Date(),
                    },
                })

                // Synchroniser les campagnes du compte
                await metaSDK.syncCampaigns(accountData.id, metaAccessToken.accessToken, client.id)

                savedAccounts.push(metaAccount)
            } catch (error) {
                console.error(`Erreur pour le compte ${accountData.id}:`, error)
                // Continuer avec les autres comptes
            }
        }

        return NextResponse.json({
            message: "Comptes sauvegardés avec succès",
            accounts: savedAccounts,
            count: savedAccounts.length,
        })
    } catch (error) {
        console.error("Save Meta accounts error:", error)
        return NextResponse.json({ error: "Erreur lors de la sauvegarde des comptes" }, { status: 500 })
    }
}

// Fonction pour calculer un score de lisibilité
function calculateReadabilityScore(accountData: any): number {
    let score = 50 // Score de base

    // Bonus si le nom est descriptif
    if (accountData.name && accountData.name.length > 10) {
        score += 20
    }

    // Bonus si businessName est renseigné
    if (accountData.businessName) {
        score += 15
    }

    // Bonus si le compte est actif
    if (accountData.accountStatus === "ACTIVE") {
        score += 15
    }

    return Math.min(100, Math.max(0, score))
}
