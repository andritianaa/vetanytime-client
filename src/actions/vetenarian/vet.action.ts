"use server";
import { Contact, Language } from "@prisma/client";

import { prisma } from "../../prisma";

export const editOrgPrincipalInfo = async (data: {
  id: string;
  name: string;
  diploma?: string;
  careTypeId: string;
  approvalNumber?: string;
  contacts?: { type: string; value: string }[];
  languages: string[];
}) => {
  try {
    // Validate input data
    if (!data.id || !data.name) {
      throw new Error("Required fields are missing");
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: data.id },
      data: {
        name: data.name,
        graduation: data.diploma,
        approvalNumber: data.approvalNumber,
        contactList: {
          set: [],
          create: data.contacts as Contact[],
        },
        careType: {
          connect: {
            id: data.careTypeId,
          },
        },
        lang: data.languages as Language[],
      },
    });
    return updatedOrganization;
  } catch (error) {
    console.error("Error updating organization:", error);
    throw new Error("Failed to update organization. Please try again later.");
  }
};

export const updateOrgPicture = async (orgId: string, imageUrl: string) => {
  try {
    if (!orgId || !imageUrl) {
      throw new Error("Organization ID and image URL are required");
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: orgId },
      data: { logo: imageUrl },
    });
    return updatedOrganization;
  } catch (error) {
    console.error("Error updating organization picture:", error);
    throw new Error(
      "Failed to update organization picture. Please try again later."
    );
  }
};
