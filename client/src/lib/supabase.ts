'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase browser client.
 *
 * The project URL and the publishable (anon) key are public by design — they
 * ship inside every Supabase web app. Server-side secrets stay on the server.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wmsfhjqhuqdldzkoxozc.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc2ZoanFodXFkbGR6a294b3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMjY5MDcsImV4cCI6MjEwOTgwMjkwN30.DkkyPT4Lk88hYyNKdyrZNd0oJtWwD4HNRCcDQZBTxbY';

/** Edge function that turns a Supabase session into a signed assertion. */
export const SUPABASE_BRIDGE_URL = `${SUPABASE_URL}/functions/v1/session-bridge`;

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'nyanza.supabase.auth',
      },
    });
  }
  return client;
}
