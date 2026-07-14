import { NextResponse } from 'next/server';
import { generateWorkoutPlan, generateDietPlan } from '@/lib/gemini';
import { verifySession } from '@/lib/auth';

export async function POST(req) {
  try {
    const { errorResponse } = await verifySession(req);
    if (errorResponse) return errorResponse;

    const { profile, assessmentReport, type } = await req.json();

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 501 });
    }

    if (type === 'workout') {
      const plan = await generateWorkoutPlan(profile, assessmentReport);
      return NextResponse.json(plan);
    } else if (type === 'diet') {
      const plan = await generateDietPlan(profile);
      return NextResponse.json(plan);
    } else {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Gemini Plan API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
