import { asc, db, eq } from '@lmring/database';
import { conversations, messages, sharedResults } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { logError } from '@/libs/error-logging';

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token: shareToken } = await params;

    const [shared] = await db
      .select()
      .from(sharedResults)
      .where(eq(sharedResults.shareToken, shareToken))
      .limit(1);

    if (!shared) {
      return NextResponse.json({ error: 'Shared result not found' }, { status: 404 });
    }

    if (shared.expiresAt && new Date() > shared.expiresAt) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
    }

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, shared.conversationId))
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, shared.conversationId))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json(
      {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
        },
        messages: conversationMessages,
      },
      { status: 200 },
    );
  } catch (error) {
    logError('Get shared result error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
