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
    { name: 'Dumbbell Chest Flyes', equipment: 'Dumbbells', target: 'Outer Chest & Stretch', setup: 'Lie flat holding dumbbells overhead with palms facing each other.', execution: 'Lower weights out to sides in wide arc, maintaining slight elbow bend, then return.', tips: 'Stop descent when a stretch is felt.' },
    { name: 'Decline Barbell Bench Press', equipment: 'Barbell', target: 'Lower Chest', setup: 'Secure legs at decline bench end, lie back, grip bar wide.', execution: 'Lower bar to lower chest under control, press upward fully.', tips: 'Keep control to prevent bar from sliding forward.' },
    { name: 'Standard Pushups', equipment: 'Bodyweight', target: 'Chest & Core', setup: 'Place hands slightly wider than shoulder-width, support body on toes.', execution: 'Lower body until chest nearly touches floor, press back up.', tips: 'Keep head, neck, and spine in a straight board line.' },
    { name: 'Chest Dips', equipment: 'Bars', target: 'Lower Chest & Triceps', setup: 'Grip parallel dip bars, support weight, lean torso slightly forward.', execution: 'Lower body by bending elbows until upper arms are parallel to bars, push up.', tips: 'Keep elbows flared slightly to shift load to chest.' },
    { name: 'Cable Crossover', equipment: 'Cable Machine', target: 'Inner Chest Line', setup: 'Set high pulleys, grab handles, step forward with one foot, lean forward.', execution: 'Bring hands down and forward in a wide arc until they meet in front.', tips: 'Squeeze chest muscles hard at peak contraction.' },
    { name: 'Pec Deck Fly', equipment: 'Machine', target: 'Sternal Chest', setup: 'Sit at machine, place forearms/hands on pads, align elbows to chest.', execution: 'Squeeze pads together in front of chest, hold for 1s, return slowly.', tips: 'Keep shoulders retracted against back support.' },
    { name: 'Dumbbell Pullover', equipment: 'Dumbbell', target: 'Lower Chest & Serratus', setup: 'Lie perpendicular across bench, support upper back, hold one dumbbell up.', execution: 'Lower dumbbell back over head in arc, stretch chest, pull back up.', tips: 'Keep core active; do not over-arch the lower spine.' },
    { name: 'Hammer Strength Chest Press', equipment: 'Machine', target: 'Pectoralis Major', setup: 'Sit in press machine, align handles to chest, plant feet.', execution: 'Press handles forward to full extension, control return phase.', tips: 'Maintain posture against seat backing throughout press.' },
  ],
  back: [
    { name: 'Lat Pulldown (Wide Grip)', equipment: 'Machine/Cable', target: 'Lats (Width)', setup: 'Sit at pulldown station, adjust pad, hold bar with wide overhand grip.', execution: 'Pull the bar down to upper chest, leading with your elbows.', tips: 'Squeeze shoulder blades down and back.' },
    { name: 'Single-Arm Dumbbell Row', equipment: 'Dumbbells', target: 'Mid-Back & Lats', setup: 'Place one knee and hand on a flat bench, other arm holds dumbbell.', execution: 'Row the dumbbell up toward your hip pocket, keeping elbow close.', tips: 'Engage back; do not jerk the weight.' },
    { name: 'Barbell Bent-Over Row', equipment: 'Barbell', target: 'Back Thickness', setup: 'Bend at hips 45 degrees, grip bar overhand, hang arms straight.', execution: 'Pull the barbell toward your lower stomach, squeezing shoulder blades.', tips: 'Keep your spine neutral and flat.' },
    { name: 'Deadlift (Conventional)', equipment: 'Barbell', target: 'Posterior Chain', setup: 'Stand with mid-foot under bar, bend at hips, grip bar overhand.', execution: 'Drive legs down, pull chest up, stand tall locking hips out.', tips: 'Keep bar touching your legs; do not round back.' },
    { name: 'Pull-Ups (Bodyweight)', equipment: 'Bar', target: 'Upper Lats & Width', setup: 'Grip pull-up bar overhand, slightly wider than shoulder-width.', execution: 'Pull chest up to the bar, squeeze shoulder blades at peak.', tips: 'Avoid swinging legs; pull with lats, not arms.' },
    { name: 'Seated Cable Row', equipment: 'Cable Machine', target: 'Mid Rhomboids', setup: 'Sit at cable row, rest feet on pads, grip handle, keep spine flat.', execution: 'Row the handle to upper abdomen, squeezing shoulder blades together.', tips: 'Do not swing torso back and forth.' },
    { name: 'T-Bar Row', equipment: 'Barbell/Landmine', target: 'Inner Back & Thickness', setup: 'Straddle bar, grip handles, bend at hips, keep spine locked.', execution: 'Pull handles to chest under control, return to full hang stretch.', tips: 'Brace core to protect lower back.' },
    { name: 'Straight-Arm Cable Pulldown', equipment: 'Cable Machine', target: 'Lats Isolation', setup: 'Attach straight bar, face pulley, step back, lean slightly forward.', execution: 'Pull bar down with straight arms until it meets thighs, stretch up.', tips: 'Isolate lats; do not use elbow flexion.' },
    { name: 'Hyperextensions (Back Extension)', equipment: 'Bench', target: 'Lower Back (Erectors)', setup: 'Lock ankles under pads of extension bench, hinge forward at hips.', execution: 'Raise torso until aligned with legs, squeeze glutes at top.', tips: 'Do not overextend or arch the spine past straight alignment.' },
    { name: 'Barbell Shrugs', equipment: 'Barbell', target: 'Upper Traps', setup: 'Stand tall holding barbell in front of thighs with overhand grip.', execution: 'Elevate shoulders toward ears as high as possible, hold, then lower.', tips: 'Do not roll shoulders; lift straight up and down.' },
  ],
  shoulders: [
    { name: 'Dumbbell Shoulder Press', equipment: 'Dumbbells', target: 'Anterior Deltoids', setup: 'Sit upright, hold dumbbells at shoulder height, palms forward.', execution: 'Drive the weights vertically overhead until arms extend.', tips: 'Keep elbows slightly forward.' },
    { name: 'Lateral Raises', equipment: 'Dumbbells', target: 'Lateral Deltoids', setup: 'Stand tall holding dumbbells at sides, palms facing inwards.', execution: 'Raise arms out to sides until parallel to ground, maintaining elbow bend.', tips: 'Lead with elbows, hands slightly lower than elbows.' },
    { name: 'Rear Delt Flyes', equipment: 'Dumbbells', target: 'Posterior Deltoids', setup: 'Bend at hips 45 degrees, dumbbells hang down, palms facing each other.', execution: 'Raise weights out to sides, squeezing rear shoulder muscles.', tips: 'Avoid swinging torso.' },
    { name: 'Military Press (Overhead Press)', equipment: 'Barbell', target: 'All Deltoid Heads', setup: 'Stand with feet shoulder-width, rack bar on collarbone, grip wide.', execution: 'Press the barbell overhead, pulling head back slightly as bar passes.', tips: 'Brace core and squeeze glutes to support spine.' },
    { name: 'Front Dumbbell Raises', equipment: 'Dumbbells', target: 'Anterior Deltoids', setup: 'Stand holding dumbbells in front of thighs, palms facing down.', execution: 'Raise dumbbells forward to eye level under control, return slowly.', tips: 'Avoid leaning torso back to swing weights.' },
    { name: 'Upright Row', equipment: 'Barbell/Cables', target: 'Traps & Lateral Delts', setup: 'Stand holding bar in front with narrow overhand grip.', execution: 'Pull bar vertically along torso up to chest height, elbows high.', tips: 'Stop pull if pinching is felt in shoulder joints.' },
    { name: 'Arnold Press', equipment: 'Dumbbells', target: 'Anterior & Side Delts', setup: 'Sit upright holding dumbbells at chest, palms facing body.', execution: 'Press weights overhead while rotating wrists so palms face forward.', tips: 'Perform rotation smoothly during the press.' },
    { name: 'Face Pulls', equipment: 'Cable/Rope', target: 'Rear Delts & Rotators', setup: 'Set cable pulley at upper chest height, hold rope ends overhand.', execution: 'Pull rope toward ears, flaring elbows and rotating shoulders out.', tips: 'Hold peak contraction for 1 second to improve posture.' },
    { name: 'Cable Lateral Raise', equipment: 'Cable Machine', target: 'Lateral Deltoid isolation', setup: 'Set low pulley, stand sideways to machine, hold handle.', execution: 'Raise handle out and up across body to shoulder level.', tips: 'Provides constant tension throughout path compared to dumbbells.' },
    { name: 'Dumbbell Shrugs', equipment: 'Dumbbells', target: 'Upper Traps', setup: 'Stand tall holding heavy dumbbells at sides, palms facing body.', execution: 'Shrug shoulders straight up toward ears, squeeze, lower.', tips: 'Keep neck straight; do not drop chin to chest.' },
  ],
  biceps: [
    { name: 'Barbell Bicep Curl', equipment: 'Barbell', target: 'Short & Long Head', setup: 'Stand tall holding barbell underhand, arms extended down.', execution: 'Curl the bar up toward shoulders while keeping elbows pinned to ribs.', tips: 'Do not use back momentum.' },
    { name: 'Hammer Curls', equipment: 'Dumbbells', target: 'Brachialis & Forearm', setup: 'Stand holding dumbbells with palms facing each other (neutral grip).', execution: 'Curl the weights up while keeping palms facing each other.', tips: 'Keep wrist joints straight.' },
    { name: 'Incline Dumbbell Curl', equipment: 'Dumbbells', target: 'Long Head Stretch', setup: 'Sit on incline bench (45 degrees), dumbbells hang straight down.', execution: 'Curl the weights up, keeping elbows locked in backward position.', tips: 'Stretches the biceps for peak loading.' },
    { name: 'Concentration Curls', equipment: 'Dumbbells', target: 'Outer Bicep Peak', setup: 'Sit on bench, lean forward, brace elbow against inner thigh.', execution: 'Curl dumbbell up to chest, keeping upper arm locked in place.', tips: 'Avoid swinging torso; focus on bicep squeeze.' },
    { name: 'Preacher Curls', equipment: 'EZ-Bar/Bench', target: 'Bicep Short Head', setup: 'Sit at preacher bench, rest arms flat on pad, grip EZ-bar.', execution: 'Curl the bar up under control, lower it back slowly to pad.', tips: 'Avoid fully hyperextending elbows at the bottom.' },
    { name: 'Cable Bicep Curls', equipment: 'Cable Machine', target: 'Constant Tension Curl', setup: 'Stand facing low pulley, hold straight bar attachment underhand.', execution: 'Curl bar up to shoulders, maintaining cables tension.', tips: 'Keep wrists locked and straight.' },
    { name: 'Spider Curls', equipment: 'EZ-Bar/Bench', target: 'Bicep Peak isolation', setup: 'Lie chest-down on incline bench, arms hang straight down over top.', execution: 'Curl the EZ-bar upward, isolating biceps against gravity.', tips: 'Excellent for preventing shoulder swing.' },
    { name: 'EZ-Bar Bicep Curl', equipment: 'EZ-Bar', target: 'Outer & Inner Head', setup: 'Hold EZ-bar on angled grip, arms extended down, stand tall.', execution: 'Curl the bar to chest height, control the lower phase.', tips: 'Angled grip reduces strain on wrist joints.' },
    { name: 'Reverse Grip Bicep Curl', equipment: 'Barbell/EZ-Bar', target: 'Brachioradialis (Forearm)', setup: 'Stand holding bar with overhand grip (palms facing down).', execution: 'Curl bar upward, focusing on forearm and bicep outer line.', tips: 'Keeps forearms active and wrists neutral.' },
    { name: 'Chin-Ups (Underhand)', equipment: 'Bar', target: 'Back & Bicep load', setup: 'Grip pull-up bar underhand at shoulder-width, hang straight.', execution: 'Pull body up until chin clears the bar, squeezing biceps.', tips: 'Drive elbows down to pull body weight.' },
  ],
  triceps: [
    { name: 'Tricep Rope Pushdowns', equipment: 'Cable', target: 'Lateral Head', setup: 'Hold rope attachment with neutral grip, elbows tucked to ribs.', execution: 'Push the rope down until arms are straight, flare rope at bottom.', tips: 'Keep upper arms completely stationary.' },
    { name: 'Overhead Cable Extension', equipment: 'Cable', target: 'Long Head', setup: 'Attach rope, face away from machine, hold rope behind neck.', execution: 'Extend elbows upward and forward, straightening arms.', tips: 'Avoid flaring elbows too wide.' },
    { name: 'Close-Grip Bench Press', equipment: 'Barbell', target: 'All Tricep Heads', setup: 'Lie flat, grip barbell at shoulder-width, plant feet.', execution: 'Lower bar to lower chest, press up while keeping elbows tucked.', tips: 'Reduces shoulder shear.' },
    { name: 'Skull Crushers (Lying Extensions)', equipment: 'EZ-Bar', target: 'Tricep Long Head', setup: 'Lie on flat bench, hold EZ-bar overhead, lock elbows.', execution: 'Lower bar toward forehead by bending elbows, press back up.', tips: 'Keep upper arms perpendicular to floor.' },
    { name: 'Bench Dips', equipment: 'Bench', target: 'Triceps & Lower Chest', setup: 'Place hands on edge of bench, feet extended forward on floor.', execution: 'Lower body by bending elbows to 90 degrees, press up.', tips: 'Keep hips close to the bench; do not slide far forward.' },
    { name: 'Overhead Dumbbell Extension', equipment: 'Dumbbell', target: 'Tricep Long Head', setup: 'Sit upright, hold one dumbbell vertically overhead with both hands.', execution: 'Lower weight slowly behind head, extend elbows upward to press.', tips: 'Keep elbows tucked beside ears.' },
    { name: 'Cable Kickbacks', equipment: 'Cable Machine', target: 'Tricep Medial Head', setup: 'Set low pulley, hinge forward 45 degrees, lock elbow to torso.', execution: 'Extend arm straight backward, squeezing tricep at peak.', tips: 'Keep elbow pinned to ribs; do not swing shoulder.' },
    { name: 'Diamond Pushups', equipment: 'Bodyweight', target: 'Triceps & Inner Chest', setup: 'Form diamond shape with thumbs and index fingers under chest.', execution: 'Lower chest to hand shape, press back up to full lockout.', tips: 'Brace core; do not let lower back sag.' },
    { name: 'Single-Arm Cable Pushdowns', equipment: 'Cable/Handle', target: 'Lateral Head isolation', setup: 'Stand at pulley, hold D-handle attachment, tuck elbow.', execution: 'Push handle down to full lockout, return slowly.', tips: 'Excellent for resolving left/right strength imbalances.' },
    { name: 'Parallel Bar Dips (Weighted)', equipment: 'Bars/Belt', target: 'Triceps & Chest', setup: 'Grip dip bars, support body, keep torso completely upright.', execution: 'Lower body under control, press up, lock elbows.', tips: 'Torso upright posture targets triceps; leaning targets chest.' },
  ],
  legs: [
    { name: 'Barbell Back Squat', equipment: 'Barbell', target: 'Quads, Glutes & Core', setup: 'Rest barbell on upper traps, stand with feet shoulder-width.', execution: 'Hinge hips, squat down until thighs are below parallel, drive up.', tips: 'Keep chest high, push weight through mid-foot.' },
    { name: 'Dumbbell Goblet Squat', equipment: 'Dumbbells', target: 'Quads & Glutes', setup: 'Hold one dumbbell vertically at chest, feet shoulder-width.', execution: 'Lower hips down until thighs are parallel to ground, drive up.', tips: 'Keep chest upright, push knees out.' },
    { name: 'Seated Leg Curl', equipment: 'Machine', target: 'Hamstrings', setup: 'Sit in leg curl machine, place heels on pad, lock lap bar.', execution: 'Flex knees, pulling heels back toward your seat.', tips: 'Slow eccentric release.' },
    { name: 'Standing Calf Raises', equipment: 'Bodyweight/Weight', target: 'Calves (Gastrocnemius)', setup: 'Stand on edge of step with heels hanging off, hold rail.', execution: 'Press up onto toes, hold peak squeeze, lower heels below step.', tips: 'Maximize range of motion.' },
    { name: 'Romanian Dumbbell Deadlift', equipment: 'Dumbbells', target: 'Hamstrings & Glutes', setup: 'Stand tall holding dumbbells in front of thighs, flat back.', execution: 'Hinge forward at hips, sliding dumbbells down legs to mid-shin.', tips: 'Keep back flat, feel stretch in hamstrings.' },
    { name: 'Leg Extensions', equipment: 'Machine', target: 'Quads isolation', setup: 'Sit at machine, place ankles behind pad, adjust back support.', execution: 'Extend knees, kicking pad upward, hold 1s at peak.', tips: 'Do not lock knees aggressively.' },
    { name: 'Dumbbell Walking Lunges', equipment: 'Dumbbells', target: 'Quads, Glutes, Hamstrings', setup: 'Stand holding dumbbells at sides, step forward with one leg.', execution: 'Lower hips until rear knee nearly touches floor, step forward.', tips: 'Keep front knee behind toes.' },
    { name: 'Leg Press', equipment: 'Machine', target: 'Quads & Glutes', setup: 'Sit in press seat, place feet shoulder-width on sled.', execution: 'Lower sled slowly to 90 degrees, press upward through heels.', tips: 'Do not lock knees or let lower back lift off pad.' },
    { name: 'Glute Bridges (Weighted)', equipment: 'Barbell/Weight', target: 'Glutes & Hamstrings', setup: 'Lie back, place barbell across hips, bend knees, feet flat.', execution: 'Drive hips up to bridge position, squeezing glutes.', tips: 'Do not hyper-extend lower back at peak.' },
    { name: 'Bulgarian Split Squats', equipment: 'Dumbbells/Bench', target: 'Quads & Glutes single-leg', setup: 'Place one foot back on bench, hold dumbbells, stand forward.', execution: 'Lower body until front thigh is parallel, drive upward.', tips: 'Keeps focus on single-leg stabilization.' },
  ],
  core: [
    { name: 'Hanging Leg Raise', equipment: 'Bar', target: 'Lower Abdominals', setup: 'Hang from pull-up bar, arms fully straight, legs straight.', execution: 'Raise legs up to form a 90-degree angle, lower slowly.', tips: 'Control swing using core tension.' },
    { name: 'Decline Bench Crunch', equipment: 'Bench', target: 'Upper Abdominals', setup: 'Secure feet at top of decline bench, lie back, hands at ears.', execution: 'Curl torso up toward knees, contracting abs.', tips: 'Do not pull on your neck.' },
    { name: 'Plank Hold', equipment: 'Bodyweight', target: 'Transverse Abdominis', setup: 'Rest forearms on floor, support body on toes, flat back.', execution: 'Hold rigid bridge position, squeeze glutes and brace stomach.', tips: 'Keep hips aligned; do not sag.' },
    { name: 'Russian Twists', equipment: 'Weight/Bodyweight', target: 'Obliques', setup: 'Sit on floor, lean back 45 degrees, raise feet off floor.', execution: 'Rotate torso, tap weight on floor beside hip, alternate sides.', tips: 'Follow weight with eyes to ensure torso rotates.' },
    { name: 'Ab Wheel Rollouts', equipment: 'Ab Wheel', target: 'Deep Core / Transverse', setup: 'Kneel on floor, grip ab wheel handles under shoulders.', execution: 'Roll out under control as far as possible, squeeze abs to return.', tips: 'Do not let lower back arch or sag.' },
    { name: 'Cable Woodchoppers', equipment: 'Cable Machine', target: 'Obliques & Rotation', setup: 'Set pulley high, stand sideways, grip handle with both hands.', execution: 'Pull handle diagonally down across body, rotating torso.', tips: 'Keep hips forward; rotate through mid-section.' },
    { name: 'Bicycle Crunches', equipment: 'Bodyweight', target: 'Rectus & Obliques', setup: 'Lie on floor, lift legs, place hands behind head.', execution: 'Bring right elbow to left knee while extending right leg, alternate.', tips: 'Perform slowly under tension.' },
    { name: 'Reverse Crunches', equipment: 'Bodyweight', target: 'Lower Abdominals', setup: 'Lie flat, place hands by sides, lift knees to 90 degrees.', execution: 'Pull knees toward chest, lifting hips off floor slightly, return.', tips: 'Use abs to lift hips; do not swing legs.' },
    { name: 'Mountain Climbers', equipment: 'Bodyweight', target: 'Core & Cardio', setup: 'Form push-up position, hands under shoulders, flat back.', execution: 'Drive knees toward chest in alternating fast running motion.', tips: 'Keep hips low; do not bounce body.' },
    { name: 'Bird-Dogs', equipment: 'Bodyweight', target: 'Spinal stability', setup: 'Start on hands and knees, neutral spine, gaze down.', execution: 'Extend right arm forward and left leg backward, hold 2s, switch.', tips: 'Focus on keeping hips perfectly flat throughout extension.' },
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
  const [activeExercise, setActiveExercise] = useState(EXPLORER_EXERCISES.chest[0]);

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
                setActiveExercise(EXPLORER_EXERCISES[m.id][0]);
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
                <div
                  key={ex.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    console.log('Selecting active exercise:', ex.name);
                    setActiveExercise(ex);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveExercise(ex);
                    }
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer block ${
                    active 
                      ? 'bg-orange-500/10 border-orange-500 text-white font-bold shadow-sm shadow-orange-500/5' 
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <span className="block">{ex.name}</span>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Equip: {ex.equipment} | Target: {ex.target}</span>
                </div>
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
