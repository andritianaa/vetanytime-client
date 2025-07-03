"use server";

import { randomBytes } from 'crypto';

import { trackAction } from '@/actions/tracking.actions';
import { hashPassword } from '@/lib/auth';
import { sendResetEmail } from '@/lib/mail';
import { SA } from '@/lib/safe-ation';
import { prisma } from '@/prisma';
import { Actions } from '@prisma/client';

export const editClient = SA(
  async (
    session,
    fullname: string,
    username: string,
    description: string
  ) => {
    // Check if the new username is different from the current one
    if (username !== session.user.username) {
      // Check if the new username is already taken
      const existingClient = await prisma.client.findUnique({
        where: { username },
      });
      if (existingClient) {
        throw new Error("Username already taken");
      }
    }

    await prisma.client.update({
      where: { id: session.user.id },
      data: { username, description, fullname },
    });
  }
);

export const editImage = SA(async (session, image: string) => {
  await prisma.client.update({
    where: { id: session.user.id },
    data: { image },
  });
  await trackAction(Actions.EDIT_IMAGE, {
    prev: session.user.image,
    new: image,
  });
});


export const editLangange = SA(async (session, language: string) => {
  await prisma.client.update({
    where: { id: session.user.id },
    data: { language },
  });
  await trackAction(Actions.EDIT_LANGAGE, {
    prev: session.user.language,
    new: language,
  });
});

export const editPassword = SA(
  async (
    session,
    newPassword: string,
    currentPassword: string
  ): Promise<boolean> => {
    const hashedCurrentPassword = await hashPassword(currentPassword);
    const hashedNewPassword = await hashPassword(newPassword);
    const clientWithPassword = await prisma.client.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (hashedCurrentPassword != clientWithPassword!.password) {
      throw new Error("Wrong password");
    }

    await prisma.client.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
      },
    });
    await trackAction(Actions.EDIT_PASSWORD, {
      new: hashedNewPassword,
    });
    return true;
  }
);

export const resetPassword = async (token: string, password: string): Promise<boolean> => {
  const resetRequest = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!resetRequest || resetRequest.expires < new Date()) {
    throw new Error("Invalid or expired token");
  }

  // Mettre à jour le mot de passe
  const hashedPassword = await hashPassword(password);
  const client = await prisma.client.update({
    where: { email: resetRequest.email },
    data: { password: hashedPassword },
  });

  // Supprimer le token utilisé
  await prisma.passwordReset.delete({
    where: { token },
  });

  // Track action
  if (client) {
    await prisma.activity.create({
      data: {
        userId: client.id,
        action: Actions.RESET_PASSWORD,
      },
    });
  }
  return true;
}

export const forgotPassword = async (email: string) => {
  // Vérifier si l'utilisateur existe

  const client = await prisma.client.findUnique({ where: { email } });

  if (!client) {
    throw new Error("If this address exists, an email has been sent.");
  }

  // Générer un token unique
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 heure

  // Supprimer les anciens tokens
  await prisma.passwordReset.deleteMany({
    where: { email },
  });

  // Créer un nouveau token
  await prisma.passwordReset.create({
    data: {
      email,
      token,
      expires,
    },
  });

  await trackAction(Actions.FORGOT_PASSWORD, {
    token,
  });

  // Envoyer l'email
  await sendResetEmail(email, token);
};

export const getClientIdByEmail = async (email: string): Promise<string> => {
  const client = await prisma.client.findFirst({
    where: {
      email,
    },
  });
  if (client) {
    return client.id;
  } else throw new Error("Client not found");
};



export const checkEmailVerified = SA(async (session) => {
  const client = await prisma.client.findUnique({
    where: { id: session.user.id },
    select: { isEmailVerified: true },
  });

  return { isEmailVerified: client?.isEmailVerified || false };
});

// Add this function to handle email verification status for client components
export const getEmailVerificationStatus = SA(async (session) => {
  const client = await prisma.client.findUnique({
    where: { id: session.user.id },
    select: {
      isEmailVerified: true,
      email: true
    },
  });

  return {
    isEmailVerified: client?.isEmailVerified || false,
    email: client?.email
  };
})

export const checkUsernameAvalability = async (username: string): Promise<boolean> => {
  const client = await prisma.client.findFirst({
    where: {
      username,
    },
  });
  if (!client) {
    return true
  } else return false;
}
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  const client = await prisma.client.findFirst({
    where: {
      email,
    },
  });
  if (!client) {
    return true
  } else return false;
}