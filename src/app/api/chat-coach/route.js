import { chatWithCoachStream } from '@/lib/gemini';
import { verifySession } from '@/lib/auth';

/**
 * POST handler for AI Coach chat requests. Streams text chunks directly.
 * @param {Request} req - Next.js Request container.
 * @returns {Promise<Response>} Next.js Stream Response.
 */
export async function POST(req) {
  try {
    const { errorResponse } = await verifySession(req);
    if (errorResponse) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const { profile, messages } = await req.json();

    if (!profile) {
      return Response.json({ error: 'Profile data is required' }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages are required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return Response.json({ error: 'Gemini API Key is missing' }, { status: 501 });
    }

    const stream = await chatWithCoachStream(profile, messages);
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Gemini Chat API error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
