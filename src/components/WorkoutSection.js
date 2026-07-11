'use client';

import { useState } from 'react';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Static Posture Details database to guarantee offline form guides
const MOCK_POSTURES = {
  'standing dumbbell shoulder press': {
    setup: 'Stand with feet shoulder-width apart, holding dumbbells at shoulder height with palms facing forward.',
    execution: 'Press weights upward until arms are fully extended overhead. Pause, then lower back to shoulder level slowly.',
    tips: 'Keep your core braced and do not arch your lower back during the press.'
  },
  'dumbbell shoulder press': {
    setup: 'Sit or stand holding dumbbells at shoulder level with an overhand grip.',
    execution: 'Drive the weights straight up until arms lock, then control the descent back to your shoulders.',
    tips: 'Keep elbows slightly in front of shoulders to reduce strain on rotator cuffs.'
  },
  'lateral raises': {
    setup: 'Stand upright holding dumbbells at your sides, palms facing inward.',
    execution: 'Raise arms out to the sides with a slight elbow bend until parallel to the floor. Pause, then lower slowly.',
    tips: 'Lead the movement with your elbows and keep hands slightly lower than elbows at the top.'
  },
  'dumbbell lateral raise': {
    setup: 'Stand tall with dumbbells in hands. Squeeze shoulder blades together.',
    execution: 'Lift the weights out to your sides to form a T-shape. Return down under control.',
    tips: 'Avoid using momentum; control both the raising and lowering phases.'
  },
  'incline dumbbell press': {
    setup: 'Lie on a 30-45 degree incline bench, holding dumbbells at the sides of your chest.',
    execution: 'Press the weights straight up over your chest. Lower them back down until they touch your outer chest.',
    tips: 'Keep elbows tucked at a 45-degree angle to protect your shoulder joints.'
  },
  'flat barbell bench press': {
    setup: 'Lie flat on a bench, grip the bar slightly wider than shoulder-width, plant feet flat on the floor.',
    execution: 'Unrack the bar, lower it slowly to your mid-chest, then press it back up to full extension.',
    tips: 'Keep your shoulder blades retracted (squeezed together) throughout the lift.'
  },
  'barbell bench press': {
    setup: 'Lie on flat bench, grip bar overhand. Set feet solid on the ground.',
    execution: 'Lower bar to chest level, press up vertically until elbows are straight.',
    tips: 'Keep wrists straight and elbows directly under the bar.'
  },
  'overhead cable tricep extension': {
    setup: 'Attach a rope to a cable pulley, face away from the machine, holding the rope behind your head.',
    execution: 'Extend elbows forward and upward, pulling the rope ends apart at extension. Return slowly.',
    tips: 'Keep upper arms locked in place next to your ears; only move your forearms.'
  },
  'lat pulldown (wide grip)': {
    setup: 'Sit at pulldown station, adjust knee pad, grip bar wide overhand.',
    execution: 'Pull bar down to upper chest, squeezing shoulder blades. Return bar up slowly.',
    tips: 'Pull with your elbows, not your hands, to maximize back recruitment.'
  },
  'single-arm dumbbell row': {
    setup: 'Place one knee and hand on a flat bench. Hold a dumbbell in the opposite hand, arm extended.',
    execution: 'Row the dumbbell up toward your hip, keeping elbow close to your body. Lower under control.',
    tips: 'Focus on pulling with your back muscles rather than bending your arm.'
  },
  'incline dumbbell bicep curl': {
    setup: 'Sit on an incline bench set to 45 degrees, dumbbells hanging straight down, palms forward.',
    execution: 'Curl weights up while keeping elbows pinned back. Return to starting position.',
    tips: 'The incline stretches the long head of the bicep, so keep elbows back to maintain tension.'
  },
  'leg extensions (quad focus)': {
    setup: 'Sit on extension machine, secure shins behind pad, grip side handles.',
    execution: 'Extend legs fully straight, squeezing quads at the top. Lower pad slowly.',
    tips: 'Keep your back flat against the support pad throughout the movement.'
  },
  'seated leg curl (hamstrings)': {
    setup: 'Sit on curl machine, place back of legs on pad, secure lap pad.',
    execution: 'Pull heels down and back under your seat. Return to starting position slowly.',
    tips: 'Flex your toes toward your shins to engage the hamstrings better.'
  },
  'military press': {
    setup: 'Set barbell at upper chest height, grip slightly wider than shoulders, brace core.',
    execution: 'Press bar overhead in a straight line, tilting head back slightly as bar passes your face.',
    tips: 'Squeeze glutes and abs to create a rigid torso and protect your spine.'
  },
  'hanging leg raise': {
    setup: 'Hang from a pull-up bar with straight arms and legs hanging down.',
    execution: 'Raise legs straight out in front of you until they are parallel to the floor. Lower slowly.',
    tips: 'Avoid swinging; use your abdominal muscles to control the raising and lowering.'
  },
  'tricep rope pushdowns': {
    setup: 'Grip rope attachment at chest height, tuck elbows close to ribs.',
    execution: 'Push rope down until arms are straight, spreading rope ends at the bottom. Return slowly.',
    tips: 'Do not let your shoulders roll forward; keep chest up.'
  },
  'hammer curls': {
    setup: 'Stand holding dumbbells with palms facing each other (neutral grip).',
    execution: 'Curl weights up while keeping palms facing each other. Lower under control.',
    tips: 'This targets the brachialis and forearm muscles for upper arm thickness.'
  }
};

export default function WorkoutSection({
  profile,
  workoutPlan,
  workoutLogs = [],
  onToggleExercise,
  onGeneratePlan,
  loading = false,
}) {
  const getTodayDay = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return DAYS_OF_WEEK.includes(today) ? today : 'monday';
  };

  const [activeDay, setActiveDay] = useState(getTodayDay());
  const [selectedExercise, setSelectedExercise] = useState(null);

  const currentDayPlan = workoutPlan?.plan_data?.days?.[activeDay] || workoutPlan?.plan_data?.[activeDay] || null;

  // Constructs Category/Muscle landing pages which are 100% stable on MuscleWiki
  const getMuscleWikiCategoryLink = (exerciseName, muscleGroup) => {
    const nameLower = exerciseName.toLowerCase();
    const muscleLower = (muscleGroup || '').toLowerCase().trim();

    let category = 'bodyweight';
    if (nameLower.includes('dumbbell')) category = 'dumbbells';
    else if (nameLower.includes('barbell')) category = 'barbell';
    else if (nameLower.includes('cable')) category = 'cables';
    else if (nameLower.includes('kettlebell')) category = 'kettlebells';
    else if (nameLower.includes('machine')) category = 'machines';
    else if (nameLower.includes('stretch') || nameLower.includes('stretching')) category = 'stretch';

    let muscle = 'shoulders';
    if (muscleLower.includes('chest')) muscle = 'chest';
    else if (muscleLower.includes('back') || muscleLower.includes('lat')) muscle = 'lats';
    else if (muscleLower.includes('bicep')) muscle = 'biceps';
    else if (muscleLower.includes('tricep')) muscle = 'triceps';
    else if (muscleLower.includes('quad') || muscleLower.includes('leg') || muscleLower.includes('thigh')) muscle = 'quads';
    else if (muscleLower.includes('hamstring')) muscle = 'hamstrings';
    else if (muscleLower.includes('calf') || muscleLower.includes('calves')) muscle = 'calves';
    else if (muscleLower.includes('glute')) muscle = 'glutes';
    else if (muscleLower.includes('core') || muscleLower.includes('abdom') || muscleLower.includes('abs')) muscle = 'abdominals';

    return `https://musclewiki.com/${category}/male/${muscle}`;
  };

  const getPostureDetails = (name) => {
    const nameLower = name.toLowerCase().trim();
    for (const key in MOCK_POSTURES) {
      if (nameLower.includes(key)) {
        return MOCK_POSTURES[key];
      }
    }
    return {
      setup: 'Position yourself comfortably with appropriate weight or body position.',
      execution: 'Execute the exercise under control. Complete full range of motion while maintaining muscular tension.',
      tips: 'Brace your core and maintain proper neutral spine posture throughout the set.'
    };
  };

  const isCompleted = (exerciseName) => {
    const todayStr = new Date().toISOString().split('T')[0];
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
        <div className="space-y-6">
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
              <div className="space-y-6">
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

                          {/* Posture Guide Modal trigger */}
                          <button
                            type="button"
                            onClick={() => setSelectedExercise(ex)}
                            className="flex-shrink-0 text-xs bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <span>Posture</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
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

      {/* Posture Guide Modal */}
      {selectedExercise && (() => {
        const posture = getPostureDetails(selectedExercise.name);
        const categoryLink = getMuscleWikiCategoryLink(selectedExercise.name, selectedExercise.muscle);
        
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setSelectedExercise(null)}
                className="absolute top-4 right-4 text-zinc-450 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
              
              <div>
                <span className="text-[10px] bg-orange-950/40 text-orange-400 border border-orange-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Posture & Form Guide
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{selectedExercise.name}</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Target Muscle: <strong className="text-zinc-200">{selectedExercise.muscle}</strong>
                </p>
              </div>

              {/* Modal Body: Instructions + MuscleWiki Embed iframe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Instructions column */}
                <div className="space-y-3 bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-xs">
                  <div>
                    <strong className="text-orange-400 uppercase tracking-wider text-[10px] block mb-1">1. Setup Position</strong>
                    <p className="text-zinc-300 leading-relaxed">{posture.setup}</p>
                  </div>
                  <div className="pt-2 border-t border-zinc-900">
                    <strong className="text-green-400 uppercase tracking-wider text-[10px] block mb-1">2. Execution</strong>
                    <p className="text-zinc-300 leading-relaxed">{posture.execution}</p>
                  </div>
                  <div className="pt-2 border-t border-zinc-900">
                    <strong className="text-blue-400 uppercase tracking-wider text-[10px] block mb-1">3. Key Form Tips</strong>
                    <p className="text-zinc-300 italic leading-relaxed">"{posture.tips}"</p>
                  </div>
                </div>

                {/* Embed/Link Column */}
                <div className="flex flex-col space-y-3">
                  <div className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden min-h-[180px] flex flex-col justify-center items-center p-4 text-center text-xs relative">
                    {/* MuscleWiki Category Page Embed */}
                    <iframe
                      src={categoryLink}
                      className="absolute inset-0 w-full h-full border-none opacity-85"
                      title="MuscleWiki Exercises"
                    />
                    
                    {/* Floating Helper */}
                    <div className="absolute bottom-2 inset-x-2 bg-zinc-900/90 border border-zinc-850 rounded-lg p-2 text-[10px] text-zinc-400 leading-normal pointer-events-none">
                      💡 Interactive map loaded. If blocked by browser headers, click below to open.
                    </div>
                  </div>
                  
                  <a
                    href={categoryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg text-xs text-center transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Open Category on MuscleWiki</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
