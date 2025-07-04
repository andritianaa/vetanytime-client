"use server"

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { currentClient } from '@/lib/current-user';
import { prisma } from '@/prisma';

const petSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    birth: z.string().min(1, "La date de naissance est requise"),
    registrationId: z.string().min(1, "Le numéro d'identification est requis"),
    sexe: z.enum(["Male", "Female", "Other"]),
    breedId: z.string().min(1, "La race est requise"),
    image: z.string(),
})

export async function addPet(formData: FormData) {
    try {
        const client = await currentClient()
        if (!client) {
            return { success: false, error: "Non autorisé" }
        }

        const name = formData.get("name") as string
        const providedImage = formData.get("image") as string

        // Générer une image par défaut avec dicebear si aucune image n'est fournie
        const defaultImage = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(name || "pet")}`

        const data = {
            name,
            birth: formData.get("birth") as string,
            registrationId: formData.get("registrationId") as string,
            sexe: formData.get("sexe") as string,
            breedId: formData.get("breedId") as string,
            image: providedImage || defaultImage,
        }

        const validatedData = petSchema.parse(data)

        await prisma.pet.create({
            data: {
                ...validatedData,
                birth: new Date(validatedData.birth),
                clientId: client.id,
            },
        })

        revalidatePath("/pets")
        return { success: true }
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'animal:", error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        return { success: false, error: "Erreur lors de l'ajout de l'animal" }
    }
}

export async function deletePet(petId: string) {
    try {
        const client = await currentClient()
        if (!client) {
            return { success: false, error: "Non autorisé" }
        }

        // Vérifier que l'animal appartient au client
        const pet = await prisma.pet.findFirst({
            where: { id: petId, clientId: client.id },
        })

        if (!pet) {
            return { success: false, error: "Animal non trouvé" }
        }

        await prisma.pet.delete({
            where: { id: petId },
        })

        revalidatePath("/pets")
        return { success: true }
    } catch (error) {
        console.error("Erreur lors de la suppression:", error)
        return { success: false, error: "Erreur lors de la suppression" }
    }
}

export async function updatePet(petId: string, formData: FormData) {
    try {
        const client = await currentClient()
        if (!client) {
            return { success: false, error: "Non autorisé" }
        }

        // Vérifier que l'animal appartient au client
        const existingPet = await prisma.pet.findFirst({
            where: { id: petId, clientId: client.id },
        })

        if (!existingPet) {
            return { success: false, error: "Animal non trouvé" }
        }

        const name = formData.get("name") as string
        const providedImage = formData.get("image") as string

        // Générer une image par défaut avec dicebear si aucune image n'est fournie
        const defaultImage = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(name || "pet")}`

        const data = {
            name,
            birth: formData.get("birth") as string,
            registrationId: formData.get("registrationId") as string,
            sexe: formData.get("sexe") as string,
            breedId: formData.get("breedId") as string,
            image: providedImage || existingPet.image || defaultImage,
        }

        const validatedData = petSchema.parse(data)

        await prisma.pet.update({
            where: { id: petId },
            data: {
                ...validatedData,
                birth: new Date(validatedData.birth),
            },
        })

        revalidatePath("/pets")
        return { success: true }
    } catch (error) {
        console.error("Erreur lors de la modification:", error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        return { success: false, error: "Erreur lors de la modification" }
    }
}
