import {
    Ad, AdAccount, AdSet, Campaign, Client, FacebookAdsApi
} from 'facebook-nodejs-business-sdk';

import { prisma } from '@/prisma';

// Configuration du SDK avec API v22
export class MetaBusinessSDK {
    private static instance: MetaBusinessSDK
    private api: FacebookAdsApi

    private constructor() {
        // Initialisation avec API v22
        this.api = FacebookAdsApi.init(process.env.META_APP_ID!, process.env.META_APP_SECRET!)
    }

    public static getInstance(): MetaBusinessSDK {
        if (!MetaBusinessSDK.instance) {
            MetaBusinessSDK.instance = new MetaBusinessSDK()
        }
        return MetaBusinessSDK.instance
    }

    // Configurer le token d'accès pour une session
    public setAccessToken(accessToken: string): void {
        this.api.accessToken = accessToken
    }

    // Obtenir l'URL d'autorisation OAuth avec API v22
    public getOAuthUrl(redirectUri: string, state: string): string {
        const scope = [
            "ads_read",
            "ads_management",
            "business_management",
            "pages_read_engagement",
            "pages_show_list",
            "read_insights",
        ].join(",")

        return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`
    }

    // Échanger le code contre un token d'accès avec API v22
    public async exchangeCodeForToken(
        code: string,
        redirectUri: string,
    ): Promise<{
        accessToken: string
        expiresIn?: number
        tokenType?: string
    }> {
        const response = await fetch("https://graph.facebook.com/v22.0/oauth/access_token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.META_APP_ID!,
                client_secret: process.env.META_APP_SECRET!,
                redirect_uri: redirectUri,
                code: code,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error?.message || "Erreur lors de l'échange du token")
        }

        return {
            accessToken: data.access_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type || "Bearer",
        }
    }

    // Obtenir un token longue durée (60 jours)
    public async getLongLivedToken(shortLivedToken: string): Promise<{
        accessToken: string
        expiresIn: number
    }> {
        const response = await fetch("https://graph.facebook.com/v22.0/oauth/access_token", {
            method: "GET",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })

        const url = new URL("https://graph.facebook.com/v22.0/oauth/access_token")
        url.searchParams.append("grant_type", "fb_exchange_token")
        url.searchParams.append("client_id", process.env.META_APP_ID!)
        url.searchParams.append("client_secret", process.env.META_APP_SECRET!)
        url.searchParams.append("fb_exchange_token", shortLivedToken)

        const longLivedResponse = await fetch(url.toString())
        const longLivedData = await longLivedResponse.json()

        if (!longLivedResponse.ok) {
            throw new Error(longLivedData.error?.message || "Erreur lors de l'obtention du token longue durée")
        }

        return {
            accessToken: longLivedData.access_token,
            expiresIn: longLivedData.expires_in,
        }
    }

    // Obtenir les informations de l'utilisateur Meta
    public async getMetaClient(accessToken: string): Promise<{
        id: string
        name: string
        email?: string
        picture?: string
    }> {
        this.setAccessToken(accessToken)

        const client = new Client("me")
        const clientData = await client.read(["id", "name", "email", "picture"])

        return {
            id: clientData.id!,
            name: clientData.name!,
            email: clientData.email,
            picture: clientData.picture?.data?.url,
        }
    }

    // Obtenir les comptes publicitaires avec API v22
    public async getAdAccounts(accessToken: string): Promise<
        Array<{
            id: string
            name: string
            currency: string
            accountStatus: string
            businessName?: string
            timezone?: string
            spendCap?: number
            balance?: number
            amountSpent?: number
            accountId?: string
        }>
    > {
        this.setAccessToken(accessToken)

        const client = new Client("me")
        const adAccounts = await client.getAdAccounts([
            "id",
            "name",
            "currency",
            "account_status",
            "business_name",
            "timezone_name",
            "spend_cap",
            "balance",
            "amount_spent",
            "account_id",
        ])

        return adAccounts.map((account: any) => ({
            id: account.id!,
            name: account.name!,
            currency: account.currency!,
            accountStatus: account.account_status!,
            businessName: account.business_name,
            timezone: account.timezone_name,
            spendCap: account.spend_cap,
            balance: account.balance,
            amountSpent: account.amount_spent,
            accountId: account.account_id,
        }))
    }

    // Synchroniser les campagnes d'un compte avec API v22
    public async syncCampaigns(accountId: string, accessToken: string, ownerId: string): Promise<void> {
        this.setAccessToken(accessToken)

        const adAccount = new AdAccount(accountId)
        const campaigns = await adAccount.getCampaigns([
            "id",
            "name",
            "status",
            "effective_status",
            "objective",
            "buying_type",
            "daily_budget",
            "lifetime_budget",
            "budget_remaining",
            "start_time",
            "stop_time",
            "created_time",
            "updated_time",
            "special_ad_categories",
            "bid_strategy",
            "budget_optimization_type",
        ])

        for (const campaign of campaigns) {
            await this.saveCampaign(campaign, accountId, ownerId)
        }
    }

    // Synchroniser les ensembles de publicités d'une campagne avec API v22
    public async syncAdSets(campaignId: string, accessToken: string): Promise<void> {
        this.setAccessToken(accessToken)

        const campaign = new Campaign(campaignId)
        const adSets = await campaign.getAdSets([
            "id",
            "name",
            "status",
            "effective_status",
            "daily_budget",
            "lifetime_budget",
            "bid_strategy",
            "billing_event",
            "optimization_goal",
            "targeting",
            "created_time",
            "updated_time",
            "attribution_spec",
            "bid_amount",
            "bid_info",
        ])

        for (const adSet of adSets) {
            await this.saveAdSet(adSet, campaignId)
        }
    }

    // Synchroniser les publicités d'un ensemble avec API v22
    public async syncAds(adSetId: string, accessToken: string): Promise<void> {
        this.setAccessToken(accessToken)

        const adSet = new AdSet(adSetId)
        const ads = await adSet.getAds([
            "id",
            "name",
            "status",
            "effective_status",
            "creative",
            "preview_url",
            "created_time",
            "updated_time",
            "bid_amount",
            "last_updated_by_app_id",
        ])

        for (const ad of ads) {
            await this.saveAd(ad, adSetId)
        }
    }

    // Obtenir les insights d'une campagne avec API v22
    public async getCampaignInsights(
        campaignId: string,
        accessToken: string,
        dateRange: { since: string; until: string },
    ): Promise<any> {
        this.setAccessToken(accessToken)

        const campaign = new Campaign(campaignId)
        const insights = await campaign.getInsights(
            [
                // Métriques de base
                "impressions",
                "reach",
                "frequency",
                "spend",
                "clicks",
                "unique_clicks",
                "ctr",
                "unique_ctr",
                "cpc",
                "cpm",
                "cpp",

                // Métriques vidéo (API v22)
                "video_play_actions",
                "video_play_curve_actions",
                "video_thruplay_watched_actions",
                "video_p25_watched_actions",
                "video_p50_watched_actions",
                "video_p75_watched_actions",
                "video_p100_watched_actions",
                "video_avg_time_watched_actions",

                // Actions et conversions
                "actions",
                "action_values",
                "conversions",
                "conversion_values",
                "cost_per_action_type",
                "cost_per_conversion",

                // Métriques sociales
                "social_spend",
                "website_ctr",

                // Nouvelles métriques API v22
                "quality_ranking",
                "engagement_rate_ranking",
                "conversion_rate_ranking",
            ],
            {
                time_range: dateRange,
                level: "campaign",
                breakdowns: [],
                time_increment: 1,
            },
        )

        return insights[0] || null
    }

    // Obtenir les insights d'un ensemble de publicités avec API v22
    public async getAdSetInsights(
        adSetId: string,
        accessToken: string,
        dateRange: { since: string; until: string },
    ): Promise<any> {
        this.setAccessToken(accessToken)

        const adSet = new AdSet(adSetId)
        const insights = await adSet.getInsights(
            [
                "impressions",
                "reach",
                "frequency",
                "spend",
                "clicks",
                "unique_clicks",
                "ctr",
                "unique_ctr",
                "cpc",
                "cpm",
                "cpp",
                "video_play_actions",
                "video_thruplay_watched_actions",
                "video_p25_watched_actions",
                "video_p50_watched_actions",
                "video_p75_watched_actions",
                "video_p100_watched_actions",
                "actions",
                "action_values",
                "conversions",
                "conversion_values",
                "cost_per_action_type",
                "cost_per_conversion",
                "quality_ranking",
                "engagement_rate_ranking",
                "conversion_rate_ranking",
            ],
            {
                time_range: dateRange,
                level: "adset",
                time_increment: 1,
            },
        )

        return insights[0] || null
    }

    // Obtenir les insights d'une publicité avec API v22
    public async getAdInsights(
        adId: string,
        accessToken: string,
        dateRange: { since: string; until: string },
    ): Promise<any> {
        this.setAccessToken(accessToken)

        const ad = new Ad(adId)
        const insights = await ad.getInsights(
            [
                "impressions",
                "reach",
                "frequency",
                "spend",
                "clicks",
                "unique_clicks",
                "ctr",
                "unique_ctr",
                "cpc",
                "cpm",
                "cpp",
                "video_play_actions",
                "video_thruplay_watched_actions",
                "video_p25_watched_actions",
                "video_p50_watched_actions",
                "video_p75_watched_actions",
                "video_p100_watched_actions",
                "actions",
                "action_values",
                "conversions",
                "conversion_values",
                "cost_per_action_type",
                "cost_per_conversion",
                "quality_ranking",
                "engagement_rate_ranking",
                "conversion_rate_ranking",
            ],
            {
                time_range: dateRange,
                level: "ad",
                time_increment: 1,
            },
        )

        return insights[0] || null
    }

    // Sauvegarder une campagne en base
    private async saveCampaign(campaign: any, accountId: string, ownerId: string): Promise<void> {
        const objectiveType = this.detectObjectiveType(campaign.objective)

        await prisma.campaign.upsert({
            where: { id: campaign.id! },
            update: {
                name: campaign.name!,
                status: campaign.status!,
                effectiveStatus: campaign.effective_status,
                objective: campaign.objective,
                buyingType: campaign.buying_type,
                dailyBudget: campaign.daily_budget ? Number.parseFloat(campaign.daily_budget) : null,
                lifetimeBudget: campaign.lifetime_budget ? Number.parseFloat(campaign.lifetime_budget) : null,
                budgetRemaining: campaign.budget_remaining ? Number.parseFloat(campaign.budget_remaining) : null,
                startDate: campaign.start_time ? new Date(campaign.start_time) : null,
                endDate: campaign.stop_time ? new Date(campaign.stop_time) : null,
                createdAtMeta: campaign.created_time ? new Date(campaign.created_time) : null,
                updatedAtMeta: campaign.updated_time ? new Date(campaign.updated_time) : null,
                detectedObjectiveType: objectiveType,
                updatedAt: new Date(),
            },
            create: {
                id: campaign.id!,
                metaAccountId: accountId,
                ownerId: ownerId,
                name: campaign.name!,
                status: campaign.status!,
                effectiveStatus: campaign.effective_status,
                objective: campaign.objective,
                buyingType: campaign.buying_type,
                dailyBudget: campaign.daily_budget ? Number.parseFloat(campaign.daily_budget) : null,
                lifetimeBudget: campaign.lifetime_budget ? Number.parseFloat(campaign.lifetime_budget) : null,
                budgetRemaining: campaign.budget_remaining ? Number.parseFloat(campaign.budget_remaining) : null,
                startDate: campaign.start_time ? new Date(campaign.start_time) : null,
                endDate: campaign.stop_time ? new Date(campaign.stop_time) : null,
                createdAtMeta: campaign.created_time ? new Date(campaign.created_time) : null,
                updatedAtMeta: campaign.updated_time ? new Date(campaign.updated_time) : null,
                detectedObjectiveType: objectiveType,
            },
        })
    }

    // Sauvegarder un ensemble de publicités
    private async saveAdSet(adSet: any, campaignId: string): Promise<void> {
        const targeting = adSet.targeting || {}

        await prisma.adSet.upsert({
            where: { id: adSet.id! },
            update: {
                name: adSet.name!,
                status: adSet.status!,
                effectiveStatus: adSet.effective_status,
                dailyBudget: adSet.daily_budget ? Number.parseFloat(adSet.daily_budget) : null,
                lifetimeBudget: adSet.lifetime_budget ? Number.parseFloat(adSet.lifetime_budget) : null,
                bidStrategy: adSet.bid_strategy,
                billingEvent: adSet.billing_event,
                optimizationGoal: adSet.optimization_goal,
                targetingAgeMin: targeting.age_min,
                targetingAgeMax: targeting.age_max,
                targetingGenders: targeting.genders || [],
                targetingCountries: targeting.geo_locations?.countries || [],
                createdAtMeta: adSet.created_time ? new Date(adSet.created_time) : null,
                updatedAtMeta: adSet.updated_time ? new Date(adSet.updated_time) : null,
                updatedAt: new Date(),
            },
            create: {
                id: adSet.id!,
                campaignId: campaignId,
                name: adSet.name!,
                status: adSet.status!,
                effectiveStatus: adSet.effective_status,
                dailyBudget: adSet.daily_budget ? Number.parseFloat(adSet.daily_budget) : null,
                lifetimeBudget: adSet.lifetime_budget ? Number.parseFloat(adSet.lifetime_budget) : null,
                bidStrategy: adSet.bid_strategy,
                billingEvent: adSet.billing_event,
                optimizationGoal: adSet.optimization_goal,
                targetingAgeMin: targeting.age_min,
                targetingAgeMax: targeting.age_max,
                targetingGenders: targeting.genders || [],
                targetingCountries: targeting.geo_locations?.countries || [],
                createdAtMeta: adSet.created_time ? new Date(adSet.created_time) : null,
                updatedAtMeta: adSet.updated_time ? new Date(adSet.updated_time) : null,
            },
        })
    }

    // Sauvegarder une publicité
    private async saveAd(ad: any, adSetId: string): Promise<void> {
        const creative = ad.creative || {}

        await prisma.ad.upsert({
            where: { id: ad.id! },
            update: {
                name: ad.name!,
                status: ad.status!,
                effectiveStatus: ad.effective_status,
                creativeId: creative.id,
                imageUrl: creative.image_url,
                videoId: creative.video_id,
                thumbnailUrl: creative.thumbnail_url,
                headline: creative.title,
                description: creative.body,
                callToAction: creative.call_to_action_type,
                linkUrl: creative.link_url,
                previewUrl: ad.preview_url,
                createdAtMeta: ad.created_time ? new Date(ad.created_time) : null,
                updatedAtMeta: ad.updated_time ? new Date(ad.updated_time) : null,
                updatedAt: new Date(),
            },
            create: {
                id: ad.id!,
                adSetId: adSetId,
                name: ad.name!,
                status: ad.status!,
                effectiveStatus: ad.effective_status,
                creativeId: creative.id,
                imageUrl: creative.image_url,
                videoId: creative.video_id,
                thumbnailUrl: creative.thumbnail_url,
                headline: creative.title,
                description: creative.body,
                callToAction: creative.call_to_action_type,
                linkUrl: creative.link_url,
                previewUrl: ad.preview_url,
                createdAtMeta: ad.created_time ? new Date(ad.created_time) : null,
                updatedAtMeta: ad.updated_time ? new Date(ad.updated_time) : null,
            },
        })
    }

    // Détecter le type d'objectif Vetanytime (mis à jour pour API v22)
    private detectObjectiveType(
        objective?: string,
    ): "NOTORIETE" | "ENGAGEMENT_CONSIDERATION" | "TRAFFIC" | "PERFORMANCE_CONVERSION" | "UNKNOWN" {
        if (!objective) return "UNKNOWN"

        const obj = objective.toUpperCase()

        // Objectifs de notoriété
        if (["BRAND_AWARENESS", "REACH"].includes(obj)) {
            return "NOTORIETE"
        }

        // Objectifs d'engagement et considération
        if (["POST_ENGAGEMENT", "PAGE_LIKES", "EVENT_RESPONSES", "VIDEO_VIEWS"].includes(obj)) {
            return "ENGAGEMENT_CONSIDERATION"
        }

        // Objectifs de trafic
        if (["LINK_CLICKS", "LANDING_PAGE_VIEWS"].includes(obj)) {
            return "TRAFFIC"
        }

        // Objectifs de performance et conversion
        if (
            ["CONVERSIONS", "CATALOG_SALES", "MESSAGES", "LEAD_GENERATION", "OUTCOME_LEADS", "OUTCOME_SALES"].includes(obj)
        ) {
            return "PERFORMANCE_CONVERSION"
        }

        return "UNKNOWN"
    }
}

// Instance singleton
export const metaSDK = MetaBusinessSDK.getInstance()
