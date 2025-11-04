import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@lmring/env';
import * as schema from './schema';

export const createDbConnection = () => {
  try {
    // Add search_path to connection options to ensure we use the public schema
    // This prevents conflicts with Supabase's auth schema
    const url = new URL(env.DATABASE_URL);
    if (!url.searchParams.has('options')) {
      url.searchParams.set('options', '-c search_path=public');
    }

    const client = postgres(url.toString(), {
      prepare: false,
    });

    return drizzle(client, { schema });
  } catch (error) {
    console.error(
      'Failed to create database connection:',
      error instanceof Error ? error.message : error,
    );
    throw new Error('Database connection failed');
  }
};

