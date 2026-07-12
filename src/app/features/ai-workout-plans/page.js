'use client';

import { useState } from 'react';
import FeaturePageLayout from '@/components/FeaturePageLayout';

const MOCK_SAMPLE_WORKOUTS = {
  Lean: {
    name: 'Upper Body Tone & Conditioning',
    exercises: [
      { name: 'Incline Dumbbell Press', sets: '3 sets of 12 reps', focus: 'Upper Chest' },
      { name: 'Lat Pulldown (Wide Grip)', sets: '3 sets of 12 reps', focus: 'Lats Width' },
      { name: 'Lateral Raises', sets: '4 sets of 15 reps', focus: 'Side Deltoids' },
      { name: 'Plank Hold', sets: '3 sets of 60 seconds', focus: 'Transverse Core' },
    ],
  },
  Bulky: {
    name: 'Heavy Push Hypertrophy',
    exercises: [
      { name: 'Flat Barbell Bench Press', sets: '4 sets of 8 reps', focus: 'Chest Thickness' },
      { name: 'Dumbbell Shoulder Press', sets: '3 sets of 8 reps', focus: 'Anterior Delts' },
      { name: 'Close-Grip Bench Press', sets: '3 sets of 10 reps', focus: 'Triceps Mass' },
      { name: 'Cable Crossover', sets: '3 sets of 12 reps', focus: 'Inner Pectoral Squeeze' },
    ],
  },
  'Fat Loss': {
    name: 'High Intensity Core & Conditioning',
    exercises: [
      { name: 'Standard Pushups', sets: '3 sets of max reps', focus: 'Chest Endurance' },
      { name: 'Bicycle Crunches', sets: '3 sets of 20 reps', focus: 'Obliques & Rectus' },
      { name: 'Mountain Climbers', sets: '3 sets of 45 seconds', focus: 'Cardiovascular Burn' },
      { name: 'Bodyweight Squats', sets: '3 sets of 20 reps', focus: 'Quads & Glutes' },
    ],
  },
};

export default function AIWorkoutPlansFeature() {
  const [selectedGoal, setSelectedGoal] = useState('Lean');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How does the adaptive workout system work?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The AI coach evaluates your set logs. If you consistently tick exercises off as completed, the software increases the volume and target reps. If you miss training days, it automatically scales down the intensity to prevent injury.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is there a limit on how many plans I can generate?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'No. Resence is 100% free with no paywalls. You can re-generate, customize, and adapt your training splits as often as your weight or conditioning goals change.'
        }
      }
    ]
  };

  return (
    <FeaturePageLayout
      title="AI Workout Plans"
      tagline="Workouts That Evolve With You — For Free"
      description="Say goodbye to static PDF plans. Get an intelligent weekly routine that adjusts sets, intensity, and exercises based on your performance, stamina, and injuries."
      schemaStructuredData={faqSchema}
    >
      {/* 1. Feature Explanation */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-850 p-5 rounded-xl space-y-2">
          <span className="text-xl">🤖</span>
          <h3 className="font-bold text-white text-xs">7-Day Split Generation</h3>
          <p className="text-zinc-400 text-[10px] leading-relaxed">Gemini calculates optimal splits based on your age, gender, and weekly availability.</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-850 p-5 rounded-xl space-y-2">
          <span className="text-xl">📈</span>
          <h3 className="font-bold text-white text-xs">Dynamic Intensity Scaling</h3>
          <p className="text-zinc-400 text-[10px] leading-relaxed">Completing all tasks triggers incremental target increases; missing logs prompts volume adjustments.</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-850 p-5 rounded-xl space-y-2">
          <span className="text-xl">🩹</span>
          <h3 className="font-bold text-white text-xs">Injury Adaptation</h3>
          <p className="text-zinc-400 text-[10px] leading-relaxed">Log limits like knee pain or lower back soreness, and the AI replaces heavy loaded moves instantly.</p>
        </div>
      </section>

      {/* 2. Interactive Try Sample Widget */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-2xl rounded-full" />
        
        <div>
          <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest block">No Account Needed</span>
          <h3 className="text-base font-bold text-white uppercase tracking-wider mt-1">Try Sample Plan Generator</h3>
          <p className="text-zinc-400 text-[11px] mt-0.5">Select a fitness goal below to instantly generate a one-day training template.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2">
          {['Lean', 'Bulky', 'Fat Loss'].map((goal) => (
            <button
              key={goal}
              onClick={() => setSelectedGoal(goal)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                selectedGoal === goal
                  ? 'bg-orange-500 border-orange-500 text-white font-bold'
                  : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>

        {/* Display Generated Split */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
          <div className="border-b border-zinc-900 pb-2">
            <span className="text-[9px] text-zinc-500 font-bold uppercase">Generated routine</span>
            <h4 className="text-xs font-bold text-white mt-0.5">{MOCK_SAMPLE_WORKOUTS[selectedGoal].name}</h4>
          </div>

          <div className="space-y-2.5">
            {MOCK_SAMPLE_WORKOUTS[selectedGoal].exercises.map((ex, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-zinc-200 block">{ex.name}</span>
                  <span className="text-[9px] text-zinc-500">Focus: {ex.focus}</span>
                </div>
                <span className="text-[10px] bg-zinc-900 px-2 py-1 rounded text-orange-400 border border-zinc-850 font-bold">{ex.sets}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Adaptive Visualization */}
      <section className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">How Dynamic Scaling Operates</h3>
        <p className="text-zinc-400 text-xs leading-relaxed">
          The software logs completion rates for every exercise. If you check off 100% of tasks, the next week's plan scales up reps by 5-10% to prevent adaptation. If sets are left unchecked, the AI scales the target down to let muscles recover.
        </p>

        {/* Flow Visual */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center pt-2">
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex-1 w-full">
            <span className="text-green-400 font-bold text-xs block">💪 Completed 100%</span>
            <p className="text-[9px] text-zinc-500 mt-1">AI increases Bench Press weight by +2.5kg and scales squat sets from 3 to 4.</p>
          </div>
          <div className="text-zinc-600 text-lg hidden sm:block">➜</div>
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex-1 w-full">
            <span className="text-orange-400 font-bold text-xs block">⚠️ Missed 2 Days</span>
            <p className="text-[9px] text-zinc-500 mt-1">AI introduces dynamic active-recovery stretches and drops rep counts to 8-10.</p>
          </div>
        </div>
      </section>
    </FeaturePageLayout>
  );
}
