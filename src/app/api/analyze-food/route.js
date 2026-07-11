import { NextResponse } from 'next/server';
import { analyzeFoodPhoto } from '@/lib/gemini';

export async function POST(req) {
  try {
    const { image, mimeType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 501 });
    }

    const analysis = await analyzeFoodPhoto(image, mimeType || 'image/jpeg');
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Gemini Food API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
