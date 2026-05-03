/**
 * Server-only Supabase client using the service-role key.
 * Use this in API routes when you need to bypass RLS
 * (e.g. inserting into guest_sessions on behalf of an authenticated phone).
 *
 * NEVER import this from a client component.
 */
import { createClient } from '@supabase/supabase-js';

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local',
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
