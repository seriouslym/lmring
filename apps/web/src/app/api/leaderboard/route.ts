import { db, desc } from '@lmring/database';
import { modelRankings } from '@lmring/database/schema';
import { NextResponse } from 'next/server';
import { logError } from '@/libs/error-logging';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const parsedOffset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 50 : Math.min(parsedLimit, 100);
    const offset = Number.isNaN(parsedOffset) || parsedOffset < 0 ? 0 : parsedOffset;

    const rankings = await db
      .select()
      .from(modelRankings)
      .orderBy(desc(modelRankings.rankingScore))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ rankings }, { status: 200 });
  } catch (error) {
    logError('Get leaderboard error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
