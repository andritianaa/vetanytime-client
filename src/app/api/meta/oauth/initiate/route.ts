import { NextRequest, NextResponse } from 'next/server';

import { currentClient } from '@/lib/current-client';
import { metaSDK } from '@/lib/meta-business-sdk';

export async function GET(request: NextRequest) {
    try {
        const client = await currentClient()
        if (!client) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
        }

        if (!process.env.META_APP_ID) {
            return NextResponse.json({ error: "Configuration Meta manquante" }, { status: 500 })
        }

        const redirectUri = process.env.META_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/meta`

        // Générer un state pour la sécurité CSRF
        const state = `${client.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`

        // Obtenir l'URL d'autorisation via le SDK
        const authUrl = metaSDK.getOAuthUrl(redirectUri, state)

        return NextResponse.json({
            authUrl,
            state,
        })
    } catch (error) {
        console.error("Meta OAuth initiate error:", error)
        return NextResponse.json({ error: "Erreur lors de l'initialisation OAuth" }, { status: 500 })
    }
}
