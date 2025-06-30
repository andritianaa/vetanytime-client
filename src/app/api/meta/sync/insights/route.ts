import { format, subDays } from 'date-fns';
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

        const { campaignId, dateRange } = await request.json()

        if (!campaignId) {
            return NextResponse.json({ error: "ID de campagne manquant" }, { status: 400 })
        }

        // Vérifier que l'utilisateur a accès à cette campagne
        const campaign = await prisma.campaign.findFirst({
            where: {
                id: campaignId,
                ownerId: client.id,
            },
            include: {
                metaAccount: {
                    include: {
                        metaAccessToken: true,
                    },
                },
            },
        })

        if (!campaign) {
            return NextResponse.json({ error: "Campagne non trouvée ou accès refusé" }, { status: 404 })
        }

        // Définir la plage de dates (par défaut: 30 derniers jours)
        const defaultDateRange = {
            since: format(subDays(new Date(), 30), "yyyy-MM-dd"),
            until: format(new Date(), "yyyy-MM-dd"),
        }

        const finalDateRange = dateRange || defaultDateRange

        // Récupérer les insights via le SDK
        const insights = await metaSDK.getCampaignInsights(
            campaignId,
            campaign.metaAccount.metaAccessToken.accessToken,
            finalDateRange,
        )

        if (insights) {
            // Sauvegarder les KPIs en base
            await saveCampaignKpis(campaignId, insights, finalDateRange.until)
        }

        return NextResponse.json({
            message: "Insights synchronisés avec succès",
            insights,
            dateRange: finalDateRange,
        })
    } catch (error) {
        console.error("Sync insights error:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Erreur lors de la synchronisation des insights",
            },
            { status: 500 },
        )
    }
}

// Fonction pour sauvegarder les KPIs de campagne
async function saveCampaignKpis(campaignId: string, insights: any, date: string): Promise<void> {
    const kpiData = {
        campaignId,
        date: new Date(date),
        impressions: insights.impressions ? Number.parseInt(insights.impressions) : null,
        reach: insights.reach ? Number.parseInt(insights.reach) : null,
        frequency: insights.frequency ? Number.parseFloat(insights.frequency) : null,
        spend: insights.spend ? Number.parseFloat(insights.spend) : null,
        totalClicks: insights.clicks ? Number.parseInt(insights.clicks) : null,
        ctr: insights.ctr ? Number.parseFloat(insights.ctr) : null,
        cpc: insights.cpc ? Number.parseFloat(insights.cpc) : null,
        cpm: insights.cpm ? Number.parseFloat(insights.cpm) : null,
        // Ajouter d'autres KPIs selon les données disponibles
    }

    await prisma.campaignKpiSnapshot.upsert({
        where: {
            campaignId_date: {
                campaignId,
                date: new Date(date),
            },
        },
        update: kpiData,
        create: kpiData,
    })
}
