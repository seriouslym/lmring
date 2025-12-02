import { db, desc, eq } from '@lmring/database';
import { conversations } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';
import { conversationSchema } from '@/libs/validation';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const parsedOffset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 50 : Math.min(parsedLimit, 100);
    const offset = Number.isNaN(parsedOffset) || parsedOffset < 0 ? 0 : parsedOffset;

    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ conversations: userConversations }, { status: 200 });
  } catch (error) {
    logError('Get conversations error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const rawBody = (await request.json()) as { title: string };

    const validationResult = conversationSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const body = validationResult.data;

    const [newConversation] = await db
      .insert(conversations)
      .values({
        userId,
        title: body.title,
      })
      .returning();

    return NextResponse.json({ conversation: newConversation }, { status: 201 });
  } catch (error) {
    logError('Create conversation error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
