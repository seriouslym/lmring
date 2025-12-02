import { db, eq } from '@lmring/database';
import { userPreferences } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { auth } from '@/libs/Auth';
import { logError } from '@/libs/error-logging';
import { userPreferencesSchema } from '@/libs/validation';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (!preferences) {
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({
          userId,
          theme: 'system',
          language: 'en',
          configSource: 'manual',
        })
        .returning();

      return NextResponse.json({ preferences: newPreferences }, { status: 200 });
    }

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    logError('Get preferences error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const rawBody = await request.json();

    const validationResult = userPreferencesSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const body = validationResult.data;

    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({
          theme: body.theme ?? existing.theme,
          language: body.language ?? existing.language,
          defaultModels: body.defaultModels ?? existing.defaultModels,
          configSource: body.configSource ?? existing.configSource,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.id, existing.id))
        .returning();

      return NextResponse.json({ preferences: updated }, { status: 200 });
    }

    const [newPreferences] = await db
      .insert(userPreferences)
      .values({
        userId,
        theme: body.theme ?? 'system',
        language: body.language ?? 'en',
        defaultModels: body.defaultModels,
        configSource: body.configSource ?? 'manual',
      })
      .returning();

    return NextResponse.json({ preferences: newPreferences }, { status: 201 });
  } catch (error) {
    logError('Update preferences error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
