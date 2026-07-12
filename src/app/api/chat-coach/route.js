import { NextResponse } from 'next/server';
import { chatWithCoach } from '@/lib/gemini';

/**
 * POST handler for AI Coach chat requests. Handles profile context injections.
 * @param {Request} req - Next.js Request container.
 * @returns {Promise<NextResponse>} Next.js JSON Response.
 */
export async function POST(req) {
  try {
    const { profile, messages } = await req.json();

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 501 });
    }

    const responseText = await chatWithCoach(profile, messages);
    return NextResponse.json({ responseText });
  } catch (error) {
    console.error('Gemini Chat API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
