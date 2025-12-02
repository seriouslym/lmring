import { and, db, eq } from '@lmring/database';
import { conversations } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: conversationId } = await params;

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    logError('Get conversation error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: conversationId } = await params;
    const body = (await request.json()) as { title?: string };

    if (!body.title || body.title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const [updated] = await db
      .update(conversations)
      .set({
        title: body.title,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))
      .returning();

    return NextResponse.json({ conversation: updated }, { status: 200 });
  } catch (error) {
    logError('Update conversation error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: conversationId } = await params;

    const [existing] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    await db.delete(conversations).where(eq(conversations.id, conversationId));

    return NextResponse.json({ message: 'Conversation deleted successfully' }, { status: 200 });
  } catch (error) {
    logError('Delete conversation error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
