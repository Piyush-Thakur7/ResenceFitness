'use client';

import { useState } from 'react';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function WorkoutSection({
  profile,
  workoutPlan,
  workoutLogs = [],
  onToggleExercise,
  onGeneratePlan,
  loading = false,
}) {
  // Set default active tab to today's weekday, default to monday
  const getTodayDay = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return DAYS_OF_WEEK.includes(today) ? today : 'monday';
  };

  const [activeDay, setActiveDay] = useState(getTodayDay());

  // Get current active day's plan details
  const currentDayPlan = workoutPlan?.plan_data?.days?.[activeDay] || workoutPlan?.plan_data?.[activeDay] || null;

  // Render MuscleWiki link helper
  const getMuscleWikiLink = (exerciseName) => {
    return `https://musclewiki.com/search?q=${encodeURIComponent(exerciseName)}`;
  };

  // Helper to check if an exercise is completed in logs
  const isCompleted = (exerciseName) => {
    const todayStr = new Date().toISOString().split('T')[0]; // simple today comparison for logs
    return workoutLogs.some(
      (log) =>
        log.exercise_name === exerciseName &&
        log.completed &&
        log.date === todayStr
    );
  };

  const activeDayIsToday = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return activeDay === today;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Adaptive Fitness Plan</h1>
          <p className="text-zinc-400 text-sm">AI-customized weekly workouts factored by your goals and limitations.</p>
        </div>
        {workoutPlan && (
          <button
            onClick={onGeneratePlan}
            disabled={loading}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? 'Regenerating...' : 'Regenerate Weekly Plan'}
          </button>
        )}
      </div>

      {!workoutPlan ? (
        // Empty State: Generate Plan
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-orange-950/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-orange-950">
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">No active plan generated</h2>
            <p className="text-zinc-400 text-sm">
              Your onboarding is complete. Tap below to have Resence Gemini analyze your body metrics, goals, and limitations to compile your workout routine.
            </p>
            {profile?.injuries && (
              <p className="text-xs text-orange-400 bg-orange-950/20 border border-orange-900/50 p-2.5 rounded-lg">
                ⚠️ Gemini will incorporate your injury limitation: "{profile.injuries}"
              </p>
            )}
            <button
              onClick={onGeneratePlan}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-colors cursor-pointer w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? 'Consulting Gemini AI...' : 'Generate Adaptive Weekly Plan'}
            </button>
          </div>
        </div>
      ) : (
        // Active Plan Display
        <div className="space-y-6">
          {/* Recovery Notes Alert */}
          {workoutPlan.plan_data?.recovery_notes && (
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-xs text-zinc-400 leading-relaxed flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <span className="font-bold text-zinc-300 block mb-0.5">AI Recovery & Optimization Notes</span>
                {workoutPlan.plan_data.recovery_notes}
              </div>
            </div>
          )}

          {/* Weekdays Tab Bar */}
          <div className="flex border-b border-zinc-850 overflow-x-auto scrollbar-none pb-0.5">
            {DAYS_OF_WEEK.map((day) => {
              const isActive = activeDay === day;
              const isDayRest = workoutPlan.plan_data?.days?.[day]?.is_rest || workoutPlan.plan_data?.[day]?.is_rest;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all capitalize whitespace-nowrap cursor-pointer ${isActive ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
                >
                  {day}
                  {isDayRest && <span className="text-[10px] text-zinc-500 block">Rest</span>}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
            {!currentDayPlan || currentDayPlan.is_rest ? (
              // Rest Day Card
              <div className="text-center py-10 space-y-4">
                <div className="bg-zinc-950 w-12 h-12 rounded-full flex items-center justify-center mx-auto border border-zinc-850">
                  <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Active Recovery Day</h3>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                  {currentDayPlan?.notes || 'No strenuous heavy weights scheduled. Prioritize light movement, yoga, and sleep to rebuild fibers.'}
                </p>
              </div>
            ) : (
              // Workout Day details
              <div className="space-y-6">
                {/* Meta details */}
                <div className="flex flex-wrap gap-4 border-b border-zinc-850 pb-4">
                  <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-2 rounded-xl">
                    <span className="text-[10px] text-zinc-500 block uppercase">Muscle Focus</span>
                    <span className="text-sm font-bold text-white">{currentDayPlan.muscle_group}</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-2 rounded-xl">
                    <span className="text-[10px] text-zinc-500 block uppercase">Est. Duration</span>
                    <span className="text-sm font-bold text-white">{currentDayPlan.gym_duration_minutes} Mins</span>
                  </div>
                  {currentDayPlan.running && (
                    <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-2 rounded-xl">
                      <span className="text-[10px] text-zinc-500 block uppercase">Running Session</span>
                      <span className="text-sm font-bold text-white">
                        {currentDayPlan.running.distance_km}km ({currentDayPlan.running.chunks})
                      </span>
                    </div>
                  )}
                </div>

                {/* Running drill instructions if details are specified */}
                {currentDayPlan.running && (
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-orange-500 font-bold uppercase block tracking-wider">Running Drill Instructions</span>
                    <p className="text-sm text-zinc-300">{currentDayPlan.running.instructions}</p>
                  </div>
                )}

                {/* Exercise Checklist */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Daily Exercises</h3>
                  <div className="space-y-3">
                    {(currentDayPlan.exercises || []).map((ex, idx) => {
                      const done = isCompleted(ex.name);
                      return (
                        <div
                          key={idx}
                          className={`flex items-start justify-between p-4 rounded-xl border transition-all ${done ? 'bg-green-950/10 border-green-950' : 'bg-zinc-950 border-zinc-850 hover:border-zinc-800'}`}
                        >
                          <div className="flex items-start space-x-3.5 flex-1 pr-4">
                            {/* Checkbox */}
                            <button
                              onClick={() => onToggleExercise(ex.name, !done)}
                              disabled={!activeDayIsToday()}
                              className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer border ${done ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-700 bg-zinc-900 hover:border-orange-500'} disabled:opacity-50`}
                            >
                              {done && (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            
                            <div>
                              <span className={`text-sm font-bold text-white block ${done ? 'line-through text-zinc-500' : ''}`}>{ex.name}</span>
                              <span className="text-xs text-zinc-400 block mt-0.5">
                                Target: <strong className="text-zinc-200">{ex.muscle}</strong> | Sets: <strong className="text-zinc-200">{ex.sets}</strong> | Reps: <strong className="text-zinc-200">{ex.reps}</strong>
                              </span>
                              {ex.notes && (
                                <p className="text-xs text-zinc-500 italic mt-1 leading-relaxed">{ex.notes}</p>
                              )}
                            </div>
                          </div>

                          {/* MuscleWiki Search Button */}
                          <a
                            href={getMuscleWikiLink(ex.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-xs bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors"
                          >
                            <span>Posture</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!activeDayIsToday() && (
                  <p className="text-xs text-zinc-500 text-center pt-2">
                    ⚠️ Exercise ticking is disabled for past or future days. Switch to today's weekday page to check them off.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
