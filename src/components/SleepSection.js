'use client';

import { useState } from 'react';

export default function SleepSection({
  profile,
  sleepLog,
  onLogSleep,
}) {
  const [hours, setHours] = useState(sleepLog?.actual_hours || 7.5);

  // Recommended sleep based on fitness goals
  const recommendedHours = sleepLog?.recommended_hours || (() => {
    switch (profile.fitness_goal) {
      case 'Bulky':
        return 8.5; // Muscle hypertrophy needs heavy rest
      case 'Lean':
        return 7.5;
      case 'Athletic':
        return 8.0; // High intensity needs solid recovery
      case 'Healthy':
      case 'General Fitness':
      default:
        return 8.0;
    }
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogSleep({
      recommended_hours: recommendedHours,
      actual_hours: parseFloat(hours),
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Sleep & Recovery Logs</h1>
        <p className="text-zinc-400 text-sm">Sleep is crucial for muscle repair, fat oxidation, and metabolic balance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sleep Logger Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 md:col-span-2">
          <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Log Last Night's Sleep</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-zinc-300">Sleep Duration</span>
                <span className="text-2xl font-black text-orange-500">{hours} hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-zinc-800"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>4 hrs (Severe deficit)</span>
                <span>8 hrs (Optimal)</span>
                <span>12 hrs (Oversleeping)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Log Sleep Duration
              </button>
            </div>
          </form>
        </div>

        {/* Target and Impact Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Recovery Baseline</h2>
          
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Recommended Sleep</span>
            <span className="text-3xl font-extrabold text-white">{recommendedHours} hrs</span>
            <span className="text-xs text-zinc-400 block pt-1">based on your {profile.fitness_goal} goal</span>
          </div>

          <div className="pt-2 text-xs text-zinc-400 space-y-2">
            <span className="font-semibold text-zinc-300 block">Why this matters:</span>
            {profile.fitness_goal === 'Bulky' && (
              <p className="leading-relaxed">
                During deep sleep phases, human growth hormone (HGH) release peaks, driving muscle hypertrophy and repair of training tears.
              </p>
            )}
            {profile.fitness_goal === 'Lean' && (
              <p className="leading-relaxed">
                Sleep deprivation raises cortisol (stress hormone), causing body water retention and increased cravings for high-sugar food.
              </p>
            )}
            {profile.fitness_goal !== 'Bulky' && profile.fitness_goal !== 'Lean' && (
              <p className="leading-relaxed">
                Sufficient sleep keeps metabolic activity high and stabilizes central nervous system (CNS) fatigue from heavy cardio or weights.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
