import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Validates the Supabase session token passed in the Authorization header.
 * Returns either the authenticated user object or an errorResponse container.
 */
export async function verifySession(req) {
  const isMockUrl =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-project');
  
  if (isMockUrl) {
    return { user: { id: 'mock-user-id', email: 'mock@resence.in' } };
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { errorResponse: NextResponse.json({ error: 'Missing or malformed Authorization header' }, { status: 401 }) };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { errorResponse: NextResponse.json({ error: 'Missing session token' }, { status: 401 }) };
  }

  try {
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data: { user }, error } = await supabaseServer.auth.getUser();
    if (error || !user) {
      return { errorResponse: NextResponse.json({ error: 'Invalid session or token expired' }, { status: 401 }) };
    }

    return { user };
  } catch (err) {
    console.error('Session verification exception:', err);
    return { errorResponse: NextResponse.json({ error: 'Authentication service error' }, { status: 500 }) };
  }
}
