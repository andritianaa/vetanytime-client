"use server";
import { Contact, Language } from '@prisma/client';

import { prisma } from '../../prisma';

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

export const updateOrgLocation = async (data: {
  orgId: string;
  cityId: string;
  address: string;
}) => {
  try {
    if (!data.cityId || !data.address) {
      throw new Error("City ID and address are required");
    }

    const updatedLocation = await prisma.organization.update({
      where: { id: data.orgId },
      data: {
        city: {
          connect: {
            id: data.cityId,
          },
        },
        address: data.address,
      },
    });
    return updatedLocation;
  } catch (error) {
    console.error("Error updating organization location:", error);
    throw new Error(
      "Failed to update organization location. Please try again later."
    );
  }
};

export const editOrgDescription = async (orgId: string, desc: string[]) => {
  try {
    if (!desc || desc.length === 0) {
      throw new Error("Description is required");
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: orgId },
      data: { description: desc },
    });
    return updatedOrganization;
  } catch (error) {
    console.error("Error updating organization description:", error);
    throw new Error(
      "Failed to update organization description. Please try again later."
    );
  }
};

export const editOrgSpecialisation = async (
  orgId: string,
  specialisationIds: string[]
) => {
  try {
    if (!specialisationIds || specialisationIds.length === 0) {
      throw new Error("At least one specialisation ID is required");
    }
    await prisma.organizationSpecialisation.deleteMany({
      where: { organizationId: orgId },
    });
    const updatedSpecialisations =
      await prisma.organizationSpecialisation.createMany({
        data: specialisationIds.map((id) => ({
          organizationId: orgId,
          specialisationId: id,
        })),
      });

    return updatedSpecialisations;
  } catch (error) {
    console.error("Error updating organization specialisations:", error);
    throw new Error(
      "Failed to update organization specialisations. Please try again later."
    );
  }
};

export const createExperience = async (
  orgId: string,
  data: {
    title: [string, string, string];
    organization: [string, string, string];
    country: [string, string, string];
    startYear: number;
    endYear: number | null;
  }
) => {
  try {
    if (!orgId || !data.title || !data.startYear) {
      throw new Error("Organization ID, title, and start year are required");
    }

    const newExperience = await prisma.experience.create({
      data: {
        organizationId: orgId,
        title: data.title,
        organization: data.organization,
        country: data.country,
        startYear: data.startYear,
        endYear: data.endYear ?? null,
      },
    });
    return newExperience;
  } catch (error) {
    console.error("Error creating experience:", error);
    throw new Error("Failed to create experience. Please try again later.");
  }
};

export const updateExperience = async (
  experienceId: string,
  data: {
    title: [string, string, string];
    organization: [string, string, string];
    country: [string, string, string];
    startYear: number;
    endYear: number | null;
  }
) => {
  try {
    if (!experienceId || !data.title || !data.startYear) {
      throw new Error("Experience ID, title, and start year are required");
    }

    const updatedExperience = await prisma.experience.update({
      where: { id: experienceId },
      data: {
        title: data.title,
        organization: data.organization,
        country: data.country,
        startYear: data.startYear,
        endYear: data.endYear ?? null,
      },
    });
    return updatedExperience;
  } catch (error) {
    console.error("Error updating experience:", error);
    throw new Error("Failed to update experience. Please try again later.");
  }
};

export const deleteExperience = async (experienceId: string) => {
  try {
    if (!experienceId) {
      throw new Error("Experience ID is required");
    }

    await prisma.experience.delete({
      where: { id: experienceId },
    });
  } catch (error) {
    console.error("Error deleting experience:", error);
    throw new Error("Failed to delete experience. Please try again later.");
  }
};

export const createFormation = async (
  orgId: string,
  data: {
    specialisation: [string, string, string];
    school: [string, string, string];
    diploma: [string, string, string];
    startYear: number;
    endYear: number | null;
  }
) => {
  try {
    if (!orgId || !data.specialisation || !data.startYear) {
      throw new Error(
        "Organization ID, specialisation, and start year are required"
      );
    }

    const newFormation = await prisma.formation.create({
      data: {
        organizationId: orgId,
        specialisation: data.specialisation,
        school: data.school,
        diploma: data.diploma,
        startYear: data.startYear,
        endYear: data.endYear ?? null,
      },
    });
    return newFormation;
  } catch (error) {
    console.error("Error creating formation:", error);
    throw new Error("Failed to create formation. Please try again later.");
  }
};

export const updateFormation = async (
  formationId: string,
  data: {
    specialisation: [string, string, string];
    school: [string, string, string];
    diploma: [string, string, string];
    startYear: number;
    endYear: number | null;
  }
) => {
  try {
    if (!formationId || !data.specialisation || !data.startYear) {
      throw new Error(
        "Formation ID, specialisation, and start year are required"
      );
    }

    const updatedFormation = await prisma.formation.update({
      where: { id: formationId },
      data: {
        specialisation: data.specialisation,
        school: data.school,
        diploma: data.diploma,
        startYear: data.startYear,
        endYear: data.endYear ?? null,
      },
    });
    return updatedFormation;
  } catch (error) {
    console.error("Error updating formation:", error);
    throw new Error("Failed to update formation. Please try again later.");
  }
};

export const deleteFormation = async (formationId: string) => {
  try {
    if (!formationId) {
      throw new Error("Formation ID is required");
    }

    await prisma.formation.delete({
      where: { id: formationId },
    });
  } catch (error) {
    console.error("Error deleting formation:", error);
    throw new Error("Failed to delete formation. Please try again later.");
  }
};

export const createConference = async (
  orgId: string,
  data: {
    title: [string, string, string];
    organization: [string, string, string];
    year: number;
  }
) => {
  try {
    if (!orgId || !data.title || !data.year) {
      throw new Error("Organization ID, title, and year are required");
    }

    const newConference = await prisma.conference.create({
      data: {
        organizationId: orgId,
        title: data.title,
        organization: data.organization,
        year: data.year,
      },
    });
    return newConference;
  } catch (error) {
    console.error("Error creating conference:", error);
    throw new Error("Failed to create conference. Please try again later.");
  }
};

export const updateConference = async (
  conferenceId: string,
  data: {
    title: [string, string, string];
    organization: [string, string, string];
    year: number;
  }
) => {
  try {
    if (!conferenceId || !data.title || !data.year) {
      throw new Error("Conference ID, title, and year are required");
    }

    const updatedConference = await prisma.conference.update({
      where: { id: conferenceId },
      data: {
        title: data.title,
        organization: data.organization,
        year: data.year,
      },
    });
    return updatedConference;
  } catch (error) {
    console.error("Error updating conference:", error);
    throw new Error("Failed to update conference. Please try again later.");
  }
};

export const deleteConference = async (conferenceId: string) => {
  try {
    if (!conferenceId) {
      throw new Error("Conference ID is required");
    }

    await prisma.conference.delete({
      where: { id: conferenceId },
    });
  } catch (error) {
    console.error("Error deleting conference:", error);
    throw new Error("Failed to delete conference. Please try again later.");
  }
};

export const createResearch = async (
  orgId: string,
  data: {
    title: [string, string, string];
    organization: [string, string, string];
    year: number;
  }
) => {
  try {
    if (!orgId || !data.title || !data.year) {
      throw new Error("Organization ID, title, and year are required");
    }

    const newResearch = await prisma.research.create({
      data: {
        organizationId: orgId,
        title: data.title,
        organization: data.organization,
        year: data.year,
      },
    });
    return newResearch;
  } catch (error) {
    console.error("Error creating research:", error);
    throw new Error("Failed to create research. Please try again later.");
  }
};

export const updateResearch = async (
  researchId: string,
  data: {
    title: [string, string, string];
    organization: [string, string, string];
    year: number;
  }
) => {
  try {
    if (!researchId || !data.title || !data.year) {
      throw new Error("Research ID, title, and year are required");
    }

    const updatedResearch = await prisma.research.update({
      where: { id: researchId },
      data: {
        title: data.title,
        organization: data.organization,
        year: data.year,
      },
    });
    return updatedResearch;
  } catch (error) {
    console.error("Error updating research:", error);
    throw new Error("Failed to update research. Please try again later.");
  }
};

export const deleteResearch = async (researchId: string) => {
  try {
    if (!researchId) {
      throw new Error("Research ID is required");
    }

    await prisma.research.delete({
      where: { id: researchId },
    });
  } catch (error) {
    console.error("Error deleting research:", error);
    throw new Error("Failed to delete research. Please try again later.");
  }
};

export const createAssociation = async (
  orgId: string,
  data: {
    association: [string, string, string];
    role: [string, string, string];
    startYear: number;
    endYear?: number | null;
  }
) => {
  try {
    if (!orgId || !data.association || !data.startYear) {
      throw new Error(
        "Organization ID, association, and start year are required"
      );
    }

    const newAssociation = await prisma.association.create({
      data: {
        organizationId: orgId,
        association: data.association,
        role: data.role,
        startYear: data.startYear,
        endYear: data.endYear ?? null,
      },
    });
    return newAssociation;
  } catch (error) {
    console.error("Error creating association:", error);
    throw new Error("Failed to create association. Please try again later.");
  }
};

export const updateAssociation = async (
  associationId: string,
  data: {
    association: [string, string, string];
    role: [string, string, string];
    startYear: number;
    endYear?: number | null;
  }
) => {
  try {
    if (!associationId || !data.association || !data.startYear) {
      throw new Error(
        "Association ID, association, and start year are required"
      );
    }

    const updatedAssociation = await prisma.association.update({
      where: { id: associationId },
      data: {
        association: data.association,
        role: data.role,
        startYear: data.startYear,
        endYear: data.endYear ?? null,
      },
    });
    return updatedAssociation;
  } catch (error) {
    console.error("Error updating association:", error);
    throw new Error("Failed to update association. Please try again later.");
  }
};

export const deleteAssociation = async (associationId: string) => {
  try {
    if (!associationId) {
      throw new Error("Association ID is required");
    }

    await prisma.association.delete({
      where: { id: associationId },
    });
  } catch (error) {
    console.error("Error deleting association:", error);
    throw new Error("Failed to delete association. Please try again later.");
  }
};
