import { and, db, eq } from '@lmring/database';
import { conversations, sharedResults } from '@lmring/database/schema';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';
import { shareSchema } from '@/libs/validation';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: conversationId } = await params;
    const rawBody = await request.json();

    const validationResult = shareSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const body = validationResult.data;

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
        shareToken: shared?.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${shared?.shareToken}`,
        expiresAt: shared?.expiresAt,
      },
      { status: 201 },
    );
  } catch (error) {
    logError('Create share link error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
