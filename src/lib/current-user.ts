// @/lib/current-client

import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/auth';
import { prisma } from '@/prisma';
import { Session } from '@/types/schema';

export async function currentClient() {
  const session = await currentSession()
  if (!session) return null;


  const client = await prisma.client.findUnique({
    where: { id: session.userId },
  });

  return client;
}

export async function currentSession() {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const sessionData = await prisma.clientSession.findUnique({
    where: { token },
    include: {
      user: true,
    },
  });

  if (!sessionData) return null;

  const session: Session = sessionData;
  return session;
}
