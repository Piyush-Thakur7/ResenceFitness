'use client';

import { useState, useEffect } from 'react';

export default function SleepSection({
  profile,
  sleepLog,
  sleepLogs = [],
  onLogSleep,
}) {
  const [hours, setHours] = useState(7.5);
  const [saving, setSaving] = useState(false);

  // Sync state dynamically when sleepLog updates
  useEffect(() => {
    if (sleepLog?.actual_hours) {
      setHours(Number(sleepLog.actual_hours));
    } else {
      setHours(7.5);
    }
  }, [sleepLog]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onLogSleep({
        recommended_hours: recommendedHours,
        actual_hours: parseFloat(hours),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight uppercase flex items-center gap-3">
          <span>Sleep & Recovery</span>
          {sleepLog && (
            <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              ✓ Logged Today
            </span>
          )}
        </h1>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Sleep is crucial for muscle repair, fat oxidation, and metabolic balance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sleep Logger Form */}
        <div className="stripe-card p-6 space-y-6 md:col-span-2 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-900">
            <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Log Last Night's Sleep</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Sleep Duration</span>
                <span className="text-3xl font-display font-extrabold text-orange-500">{hours} hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-zinc-950 rounded-full appearance-none cursor-pointer accent-orange-500 border border-zinc-850"
              />
              <div className="flex justify-between text-[10px] font-bold text-zinc-650 uppercase tracking-wide">
                <span>4 hrs (Severe deficit)</span>
                <span>8 hrs (Optimal)</span>
                <span>12 hrs (Oversleeping)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 disabled:opacity-50 text-zinc-200 font-bold px-6 py-3.5 rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                {saving ? 'Logging...' : (sleepLog ? 'Update Sleep Log' : 'Log Sleep Duration')}
              </button>
            </div>
          </form>
        </div>

        {/* Target and Impact Card */}
        <div className="stripe-card p-6 space-y-6 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-900">
            <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Recovery Baseline</h2>
          </div>
          
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold tracking-wider">Recommended Sleep</span>
            <span className="text-3xl font-display font-extrabold text-white">{recommendedHours} hrs</span>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider pt-1">based on {profile.fitness_goal} goal</span>
          </div>

          <div className="pt-2 text-xs text-zinc-500 space-y-2 border-t border-zinc-900">
            <span className="font-bold text-zinc-400 uppercase tracking-wider block text-[10px]">Why this matters:</span>
            {profile.fitness_goal === 'Bulky' && (
              <p className="leading-relaxed text-[11px]">
                During deep sleep phases, human growth hormone (HGH) release peaks, driving muscle hypertrophy and repair of training tears.
              </p>
            )}
            {profile.fitness_goal === 'Lean' && (
              <p className="leading-relaxed text-[11px]">
                Sleep deprivation raises cortisol (stress hormone), causing body water retention and increased cravings for high-sugar food.
              </p>
            )}
            {profile.fitness_goal !== 'Bulky' && profile.fitness_goal !== 'Lean' && (
              <p className="leading-relaxed text-[11px]">
                Sufficient sleep keeps metabolic activity high and stabilizes central nervous system (CNS) fatigue from heavy cardio or weights.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sleep History Section */}
      <div className="stripe-card p-6 space-y-6">
        <div className="pb-3 border-b border-zinc-900">
          <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Sleep & Recovery History</h2>
        </div>
        
        {sleepLogs.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-4 text-center">Your logged sleep durations will populate a daily history timeline here.</p>
        ) : (
          <div className="space-y-4">
            {sleepLogs.map((log, idx) => {
              const reachedTarget = log.actual_hours >= log.recommended_hours;
              const ratio = Math.min((log.actual_hours / log.recommended_hours) * 100, 100);
              
              return (
                <div key={idx} className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold block tracking-wider">Date Logged</span>
                    <span className="text-xs font-bold text-white">
                      {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="flex-1 max-w-md space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-zinc-500">Recovery progression</span>
                      <span className="text-zinc-300">{log.actual_hours} / {log.recommended_hours} hrs</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${reachedTarget ? 'bg-green-500 shadow-sm shadow-green-500/20' : 'bg-orange-500'}`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded border ${
                      reachedTarget 
                        ? 'bg-green-950/20 border-green-900 text-green-400' 
                        : 'bg-orange-950/20 border-orange-900 text-orange-400'
                    }`}>
                      {reachedTarget ? 'Target Met' : 'Deficit'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
