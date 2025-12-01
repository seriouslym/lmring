import { db } from '@lmring/database';
import { conversations, sharedResults } from '@lmring/database/schema';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const conversationId = params.id;
    const body = (await request.json()) as { expiresInDays?: number };

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const shareToken = nanoid(16);
    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const [shared] = await db
      .insert(sharedResults)
      .values({
        conversationId,
        shareToken,
        expiresAt,
      })
      .returning();

    return NextResponse.json(
      {
        shareToken: shared!.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${shared!.shareToken}`,
        expiresAt: shared!.expiresAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create share link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
