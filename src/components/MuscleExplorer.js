'use client';

import { useState } from 'react';

const EXPLORER_MUSCLES = [
  { id: 'chest', label: 'Chest', desc: 'Pectoralis major and minor. Best targeted with pushing and pressing moves at flat, incline, and decline angles.' },
  { id: 'back', label: 'Back & Lats', desc: 'Latissimus dorsi, rhomboids, and traps. Target with vertical pulls (pulldowns) and horizontal pulls (rows).' },
  { id: 'shoulders', label: 'Shoulders', desc: 'Anterior, lateral, and posterior deltoids. Requires pressing overhead, lateral flyes, and rear extensions.' },
  { id: 'biceps', label: 'Biceps', desc: 'Biceps brachii. Target with elbow flexion movements (curling) in neutral, supinated, and incline positions.' },
  { id: 'triceps', label: 'Triceps', desc: 'Triceps brachii (3 heads). Target with elbow extension movements (pushdowns, overhead extensions).' },
  { id: 'legs', label: 'Legs & Calves', desc: 'Quads, hamstrings, glutes, and calves. Target with squats, leg extensions, leg curls, and calf raises.' },
  { id: 'core', label: 'Core & Abs', desc: 'Rectus abdominis, obliques, and transverse abdominis. Requires spinal flexion, rotation, and bracing exercises.' },
];

const EXPLORER_EXERCISES = {
  chest: [
    { name: 'Flat Barbell Bench Press', equipment: 'Barbell', target: 'Mid Chest', setup: 'Lie flat on a bench, plant feet, grip bar wider than shoulder-width.', execution: 'Lower the bar to mid-chest, then press upward until arms are fully extended.', tips: 'Squeeze shoulder blades together.' },
    { name: 'Incline Dumbbell Press', equipment: 'Dumbbells', target: 'Upper Chest', setup: 'Adjust bench to 30-45 degrees. Hold dumbbells at chest height.', execution: 'Press the dumbbells straight up until arms extend. Control the descent.', tips: 'Avoid locking elbows aggressively at the top.' },
    { name: 'Dumbbell Chest Flyes', equipment: 'Dumbbells', target: 'Outer Chest / Stretch', setup: 'Lie flat holding dumbbells overhead with palms facing each other.', execution: 'Lower weights out to sides in wide arc, maintaining slight elbow bend, then return.', tips: 'Stop descent when stretch is felt.' },
  ],
  back: [
    { name: 'Lat Pulldown (Wide Grip)', equipment: 'Machine/Cable', target: 'Lats (Width)', setup: 'Sit at pulldown station, adjust pad, hold bar with wide overhand grip.', execution: 'Pull the bar down to upper chest, leading with your elbows.', tips: 'Squeeze shoulder blades down and back.' },
    { name: 'Single-Arm Dumbbell Row', equipment: 'Dumbbells', target: 'Mid-Back & Lats', setup: 'Place one knee and hand on a flat bench, other arm holds dumbbell.', execution: 'Row the dumbbell up toward your hip pocket, keeping elbow close.', tips: 'Engage back; do not jerk the weight.' },
    { name: 'Barbell Bent-Over Row', equipment: 'Barbell', target: 'Back Thickness', setup: 'Bend at hips 45 degrees, grip bar overhand, hang arms straight.', execution: 'Pull the barbell toward your lower stomach, squeezing shoulder blades.', tips: 'Keep your spine neutral and flat.' },
  ],
  shoulders: [
    { name: 'Dumbbell Shoulder Press', equipment: 'Dumbbells', target: 'Anterior Deltoids', setup: 'Sit upright, hold dumbbells at shoulder height, palms forward.', execution: 'Drive the weights vertically overhead until arms extend.', tips: 'Keep elbows slightly forward.' },
    { name: 'Lateral Raises', equipment: 'Dumbbells', target: 'Lateral Deltoids', setup: 'Stand tall holding dumbbells at sides, palms facing inwards.', execution: 'Raise arms out to sides until parallel to ground, maintaining elbow bend.', tips: 'Lead with elbows, hands slightly lower than elbows.' },
    { name: 'Rear Delt Flyes', equipment: 'Dumbbells', target: 'Posterior Deltoids', setup: 'Bend at hips 45 degrees, dumbbells hang down, palms facing each other.', execution: 'Raise weights out to sides, squeezing rear shoulder muscles.', tips: 'Avoid swinging torso.' },
  ],
  biceps: [
    { name: 'Barbell Bicep Curl', equipment: 'Barbell', target: 'Short & Long Head', setup: 'Stand tall holding barbell underhand, arms extended down.', execution: 'Curl the bar up toward shoulders while keeping elbows pinned to ribs.', tips: 'Do not use back momentum.' },
    { name: 'Hammer Curls', equipment: 'Dumbbells', target: 'Brachialis & Forearm', setup: 'Stand holding dumbbells with palms facing each other (neutral grip).', execution: 'Curl the weights up while keeping palms facing each other.', tips: 'Keep wrist joints straight.' },
    { name: 'Incline Dumbbell Curl', equipment: 'Dumbbells', target: 'Long Head Stretch', setup: 'Sit on incline bench (45 degrees), dumbbells hang straight down.', execution: 'Curl the weights up, keeping elbows locked in backward position.', tips: 'Stretches the biceps for peak loading.' },
  ],
  triceps: [
    { name: 'Tricep Rope Pushdowns', equipment: 'Cable', target: 'Lateral Head', setup: 'Hold rope attachment with neutral grip, elbows tucked to ribs.', execution: 'Push the rope down until arms are straight, flare rope at bottom.', tips: 'Keep upper arms completely stationary.' },
    { name: 'Overhead Cable Extension', equipment: 'Cable', target: 'Long Head', setup: 'Attach rope, face away from machine, hold rope behind neck.', execution: 'Extend elbows upward and forward, straightening arms.', tips: 'Avoid flaring elbows too wide.' },
    { name: 'Close-Grip Bench Press', equipment: 'Barbell', target: 'All Tricep Heads', setup: 'Lie flat, grip barbell at shoulder-width, plant feet.', execution: 'Lower bar to lower chest, press up while keeping elbows tucked.', tips: 'Reduces shoulder shear.' },
  ],
  legs: [
    { name: 'Dumbbell Goblet Squat', equipment: 'Dumbbells', target: 'Quads & Glutes', setup: 'Hold one dumbbell vertically at chest, feet shoulder-width.', execution: 'Lower hips down until thighs are parallel to ground, drive up.', tips: 'Keep chest upright, push knees out.' },
    { name: 'Seated Leg Curl', equipment: 'Machine', target: 'Hamstrings', setup: 'Sit in leg curl machine, place heels on pad, lock lap bar.', execution: 'Flex knees, pulling heels back toward your seat.', tips: 'Slow eccentric release.' },
    { name: 'Standing Calf Raises', equipment: 'Bodyweight/Weight', target: 'Calves (Gastrocnemius)', setup: 'Stand on edge of step with heels hanging off, hold rail.', execution: 'Press up onto toes, hold peak squeeze, lower heels below step.', tips: 'Maximize range of motion.' },
  ],
  core: [
    { name: 'Hanging Leg Raise', equipment: 'Bar', target: 'Lower Abdominals', setup: 'Hang from pull-up bar, arms fully straight, legs straight.', execution: 'Raise legs up to form a 90-degree angle, lower slowly.', tips: 'Control swing using core tension.' },
    { name: 'Decline Bench Crunch', equipment: 'Bench', target: 'Upper Abdominals', setup: 'Secure feet at top of decline bench, lie back, hands at ears.', execution: 'Curl torso up toward knees, contracting abs.', tips: 'Do not pull on your neck.' },
    { name: 'Plank Hold', equipment: 'Bodyweight', target: 'Transverse Abdominis', setup: 'Rest forearms on floor, support body on toes, flat back.', execution: 'Hold rigid bridge position, squeeze glutes and brace stomach.', tips: 'Keep hips aligned; do not sag.' },
  ],
};

function AnimatedMiniPlayer({ muscle }) {
  const m = muscle.toLowerCase();
  if (m.includes('chest')) {
    return (
      <div className="w-full bg-zinc-950 border border-zinc-850 h-28 rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="w-16 h-1 bg-zinc-700 rounded-full animate-bounce duration-1000 flex items-center justify-between px-1">
          <div className="w-2.5 h-4 bg-zinc-550 rounded" />
          <div className="w-2.5 h-4 bg-zinc-550 rounded" />
        </div>
      </div>
    );
  } else if (m.includes('back') || m.includes('lat')) {
    return (
      <div className="w-full bg-zinc-950 border border-zinc-850 h-28 rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="w-16 h-1 bg-zinc-800 rounded-full animate-bounce duration-1000 relative flex flex-col items-center">
          <div className="w-0.5 h-4 bg-zinc-700" />
        </div>
      </div>
    );
  } else if (m.includes('shoulder')) {
    return (
      <div className="w-full bg-zinc-950 border border-zinc-850 h-28 rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="flex space-x-6 animate-bounce duration-1000">
          <div className="w-2.5 h-3 bg-zinc-800 rounded flex items-center justify-center"><div className="w-1 h-3 bg-zinc-650" /></div>
          <div className="w-2.5 h-3 bg-zinc-800 rounded flex items-center justify-center"><div className="w-1 h-3 bg-zinc-650" /></div>
        </div>
      </div>
    );
  } else if (m.includes('bicep') || m.includes('tricep') || m.includes('arm')) {
    return (
      <div className="w-full bg-zinc-950 border border-zinc-850 h-28 rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="w-2 h-2 bg-zinc-800 rounded-full relative z-10" />
          <div className="absolute w-1 h-6 bg-zinc-700 origin-bottom rounded-full animate-pulse" style={{ transformOrigin: 'bottom center', transform: 'rotate(-45deg)' }} />
        </div>
      </div>
    );
  } else if (m.includes('leg') || m.includes('quad') || m.includes('hamstring') || m.includes('calf')) {
    return (
      <div className="w-full bg-zinc-950 border border-zinc-850 h-28 rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="w-6 h-6 border border-zinc-800 bg-zinc-900 rounded animate-bounce duration-1000" />
      </div>
    );
  } else {
    return (
      <div className="w-full bg-zinc-950 border border-zinc-850 h-28 rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="w-6 h-6 border border-orange-500/30 rounded-full animate-ping" />
      </div>
    );
  }
}

export default function MuscleExplorer({ profile }) {
  const [selectedMuscle, setSelectedMuscle] = useState('chest');
  const [activeExercise, setActiveExercise] = useState(null);

  const getWikiLink = (exName) => {
    const category = selectedMuscle === 'chest' || selectedMuscle === 'shoulders' ? 'dumbbells' : 'bodyweight';
    const gender = profile?.gender || 'male';
    return `https://musclewiki.com/${category}/${gender}/${selectedMuscle}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Muscle Group Explorer</h1>
        <p className="text-zinc-400 text-sm">Explore targeted exercises, dynamic animations, and stable MuscleWiki resources.</p>
      </div>

      {/* Select Grid */}
      <div className="flex border-b border-zinc-850 overflow-x-auto scrollbar-none pb-0.5">
        {EXPLORER_MUSCLES.map((m) => {
          const active = selectedMuscle === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMuscle(m.id);
                setActiveExercise(null);
              }}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all capitalize whitespace-nowrap cursor-pointer ${active ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exercises List */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-2">
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Overview</span>
            <p className="text-xs text-zinc-400 leading-relaxed">{EXPLORER_MUSCLES.find(m => m.id === selectedMuscle)?.desc}</p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">Target Exercises</span>
            {EXPLORER_EXERCISES[selectedMuscle].map((ex) => {
              const active = activeExercise?.name === ex.name;
              return (
                <button
                  key={ex.name}
                  onClick={() => setActiveExercise(ex)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer block ${active ? 'bg-orange-500/10 border-orange-500 text-white font-bold' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'}`}
                >
                  <span className="block">{ex.name}</span>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Equip: {ex.equipment} | Target: {ex.target}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Posture & Animation Details */}
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between min-h-[300px]">
          {activeExercise ? (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] bg-orange-950/40 text-orange-400 border border-orange-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Instruction & Preview
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{activeExercise.name}</h3>
                  <p className="text-xs text-zinc-400">Targeting: <strong className="text-zinc-200">{activeExercise.target}</strong> | Equip: <strong className="text-zinc-200">{activeExercise.equipment}</strong></p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-xs">
                    <div>
                      <strong className="text-orange-400 uppercase text-[9px] block">1. Setup Position</strong>
                      <p className="text-zinc-300 leading-relaxed mt-0.5">{activeExercise.setup}</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-900">
                      <strong className="text-green-400 uppercase text-[9px] block">2. Execution</strong>
                      <p className="text-zinc-300 leading-relaxed mt-0.5">{activeExercise.execution}</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-900">
                      <strong className="text-blue-400 uppercase text-[9px] block">Key Tip</strong>
                      <p className="text-zinc-300 italic leading-relaxed mt-0.5">"{activeExercise.tips}"</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <AnimatedMiniPlayer muscle={selectedMuscle} />
                    <a
                      href={getWikiLink(activeExercise.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg text-xs text-center transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Browse on MuscleWiki</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-10 space-y-4">
              <div className="bg-zinc-950 w-16 h-16 rounded-full flex items-center justify-center border border-zinc-850">
                <svg className="w-8 h-8 text-zinc-550" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Select an Exercise</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">Pick any target move from the left sidebar to unlock step guides and animated loop players.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
