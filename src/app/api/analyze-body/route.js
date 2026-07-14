import { NextResponse } from 'next/server';
import { analyzeBodyPhotos } from '@/lib/gemini';
import { verifySession } from '@/lib/auth';

export async function POST(req) {
  try {
    const { errorResponse } = await verifySession(req);
    if (errorResponse) return errorResponse;

    const { images, profile, mimeType } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 501 });
    }

    const report = await analyzeBodyPhotos(images, profile, mimeType || 'image/jpeg');
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Gemini Body API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
