import { NextResponse } from 'next/server';

import { currentClient, currentSession } from '@/lib/current-client';

export async function GET() {
  const client = await currentClient();
  const session = await currentSession();
  if (!client) {
    return NextResponse.json(
      { error: "client not authentified" },
      { status: 401 }
    );
  }

  return NextResponse.json({ client, session });
}
