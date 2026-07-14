import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/gemini';
import { verifySession } from '@/lib/auth';

export async function POST(req) {
  try {
    const { errorResponse } = await verifySession(req);
    if (errorResponse) return errorResponse;

    const { audio, mimeType } = await req.json();

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 501 });
    }

    if (!audio) {
      return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
    }

    const transcription = await transcribeAudio(audio, mimeType || 'audio/webm');
    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error('Gemini Transcription API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
