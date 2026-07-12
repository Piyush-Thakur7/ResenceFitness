'use client';

import { useMemo, useState, useEffect } from 'react';

// Generic Portion Templates (Fallback / Verification Data)
export default function Dashboard({
  profile,
  streak,
  todayWorkoutLog = [],
  workoutPlan = null,
  dietLogs = [],
  dietPlan = null,
  sleepLog = null,
}) {
  const [clientToday, setClientToday] = useState('');
  const [waterIntake, setWaterIntake] = useState(0);

  const waterTarget = useMemo(() => {
    const w = profile?.weight || 70;
    return Math.round(w * 35);
  }, [profile?.weight]);

  useEffect(() => {
    setClientToday(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase());
    
    if (profile?.id) {
      const todayStr = new Date().toISOString().split('T')[0];
      const val = localStorage.getItem(`water_${profile.id}_${todayStr}`);
      if (val) {
        setWaterIntake(parseInt(val) || 0);
      } else {
        setWaterIntake(0);
      }
    }
  }, [profile?.id]);

  const handleLogWater = (amount) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const current = parseInt(waterIntake) || 0;
    const newAmount = current + amount;
    setWaterIntake(newAmount);
    localStorage.setItem(`water_${profile.id}_${todayStr}`, newAmount.toString());
  };

  const handleResetWater = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setWaterIntake(0);
    localStorage.removeItem(`water_${profile.id}_${todayStr}`);
  };

  // 1. BMI Calculation
  const bmiData = useMemo(() => {
    if (!profile.weight || !profile.height) return { bmi: 0, category: 'N/A', color: 'text-zinc-500', borderColor: 'border-zinc-800/80' };
    const hMeters = profile.height / 100;
    const bmi = parseFloat((profile.weight / (hMeters * hMeters)).toFixed(1));
    let category = 'Normal';
    let color = 'text-green-400';
    let borderColor = 'border-green-500/20';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-yellow-400';
      borderColor = 'border-yellow-500/20';
    } else if (bmi >= 25 && bmi < 29.9) {
      category = 'Overweight';
      color = 'text-orange-400';
      borderColor = 'border-orange-500/20';
    } else if (bmi >= 30) {
      category = 'Obese';
      color = 'text-red-400';
      borderColor = 'border-red-500/20';
    }
    return { bmi, category, color, borderColor };
  }, [profile.weight, profile.height]);

  // 2. Workout Completion Rate for today
  const workoutCompletion = useMemo(() => {
    if (!workoutPlan || !clientToday) return { total: 0, completed: 0, percentage: 0 };
    const today = clientToday;
    
    const daysKeyMap = {
      monday: 'monday', tuesday: 'tuesday', wednesday: 'wednesday',
      thursday: 'thursday', friday: 'friday', saturday: 'saturday', sunday: 'sunday'
    };
    
    const dayPlan = workoutPlan.plan_data?.days?.[daysKeyMap[today]] || workoutPlan.plan_data?.[daysKeyMap[today]];
    if (!dayPlan || dayPlan.is_rest) return { total: 0, completed: 0, percentage: 100, isRest: true };

    const exercises = dayPlan.exercises || [];
    if (exercises.length === 0) return { total: 0, completed: 0, percentage: 100 };

    const total = exercises.length;
    const completed = todayWorkoutLog.filter(log => log.completed).length;
    const percentage = Math.round((completed / total) * 100);

    return { total, completed, percentage, isRest: false };
  }, [workoutPlan, todayWorkoutLog]);

  // 3. Nutrition Summary
  const nutritionSummary = useMemo(() => {
    const targets = dietPlan?.plan_data?.daily_targets || {
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 65,
    };

    let consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    dietLogs.forEach((log) => {
      consumed.calories += Number(log.calories || 0);
      consumed.protein += Number(log.protein || 0);
      consumed.carbs += Number(log.carbs || 0);
      consumed.fat += Number(log.fat || 0);
    });

    consumed.calories = Math.round(consumed.calories);
    consumed.protein = Math.round(consumed.protein);
    consumed.carbs = Math.round(consumed.carbs);
    consumed.fat = Math.round(consumed.fat);

    return { targets, consumed };
  }, [dietPlan, dietLogs]);

  // Age helper
  const age = useMemo(() => {
    if (!profile.dob) return 25;
    const birthDate = new Date(profile.dob);
    const today = new Date();
    let ageVal = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      ageVal--;
    }
    return ageVal;
  }, [profile.dob]);

  // Target weight calculation based on height and fitness goal
  const targetWeight = useMemo(() => {
    if (!profile.weight || !profile.height) return 0;
    const hMeters = profile.height / 100;
    let targetBmi = 22.0;

    switch (profile.fitness_goal) {
      case 'Bulky':
        targetBmi = 24.5;
        break;
      case 'Lean':
        targetBmi = 21.5;
        break;
      case 'Athletic':
        targetBmi = 22.8;
        break;
      case 'Fat Loss':
        targetBmi = 21.0;
        break;
      case 'Healthy':
      case 'General Fitness':
      default:
        targetBmi = 22.0;
        break;
    }
    return Math.round(targetBmi * hMeters * hMeters);
  }, [profile.height, profile.fitness_goal]);

  const timeBasedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title greeting */}
      <div className="space-y-1">
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight uppercase">
          {timeBasedGreeting}, {profile.full_name || 'Champion'}
        </h1>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Here is your daily fitness and nutrition standing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Card 1: BMI & Profile Summary */}
        <div className="stripe-card p-6 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
            <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Body Profile</h2>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-950 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
              {profile.fitness_goal}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Current Status</span>
            <div className="flex items-baseline space-x-2.5">
              <span className="text-4xl font-display font-extrabold text-white">{bmiData.bmi}</span>
              <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${bmiData.borderColor} ${bmiData.color}`}>
                {bmiData.category} BMI
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-center">
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
              <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Height</span>
              <span className="text-xs font-extrabold text-zinc-200 mt-0.5 block">{profile.height} cm</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
              <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Current</span>
              <span className="text-xs font-extrabold text-zinc-200 mt-0.5 block">{profile.weight} kg</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-orange-950/40">
              <span className="text-[9px] text-orange-400 block uppercase font-bold tracking-wider">Target Weight</span>
              <span className="text-xs font-extrabold text-orange-400 mt-0.5 block">{targetWeight} kg</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
              <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Age</span>
              <span className="text-xs font-extrabold text-zinc-200 mt-0.5 block">{age} yrs</span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 border-t border-zinc-900 pt-3 flex justify-between">
            <span>Diet: <strong className="text-zinc-300 font-bold">{profile.diet_preference}</strong></span>
            <span>Injuries: <strong className="text-zinc-300 font-bold">{profile.injuries || 'None'}</strong></span>
          </div>
        </div>

        {/* Metric Card 2: Today's Tasks */}
        <div className="stripe-card p-6 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
            <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Today's Workout</h2>
            {workoutCompletion.isRest ? (
              <span className="text-[10px] bg-zinc-900 text-zinc-500 border border-zinc-850 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Rest Day</span>
            ) : (
              <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-950 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center py-1">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="text-zinc-900"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="15.9155"
                />
                <circle
                  className="text-orange-500 transition-all duration-500"
                  strokeDasharray={`${workoutCompletion.percentage}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  cx="18"
                  cy="18"
                  r="15.9155"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-display font-extrabold text-white">{workoutCompletion.percentage}%</span>
                <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider mt-0.5">completed</span>
              </div>
            </div>
            {!workoutCompletion.isRest && (
              <p className="text-[11px] text-zinc-300 mt-5 font-semibold text-center leading-relaxed">
                {workoutCompletion.completed} of {workoutCompletion.total} exercises ticked off today
              </p>
            )}
            {workoutCompletion.isRest && (
              <p className="text-[11px] text-zinc-400 mt-5 font-semibold text-center leading-relaxed">Enjoy your active recovery rest day!</p>
            )}
          </div>

          <div className="h-[23px]" /> {/* Spacer to balance height */}
        </div>

        {/* Metric Card 3: Motivation / Streak */}
        <div className="stripe-card p-6 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
            <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Consistency</h2>
            <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-950 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Streak</span>
          </div>

          <div className="flex items-center space-x-4 py-1">
            <div className="bg-orange-500/5 p-3.5 rounded-xl border border-orange-950/40">
              <svg className="w-6 h-6 text-orange-500 animate-flicker" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9.879z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-display font-extrabold text-white block">{streak?.current_streak || 0} Days</span>
                {streak?.current_streak > 0 && (
                  <span className="bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border border-orange-500/25 animate-bounce duration-1000">
                    🔥 ON FIRE!
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-0.5">Active Logging Streak</p>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-3 space-y-2">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Weekly Progress</h3>
            <div className="flex space-x-1.5 justify-between">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const progressArr = streak?.weekly_progress || [];
                const isCompleted = progressArr[idx] === true;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <span className="text-[9px] font-bold text-zinc-500 mb-1">{day}</span>
                    <div className={`w-full h-2 rounded transition-all duration-300 ${isCompleted ? 'bg-green-500 shadow-sm shadow-green-500/20' : 'bg-zinc-900'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Nutrition Tracker */}
      <div className="stripe-card p-6 space-y-5">
        <h2 className="text-zinc-300 font-bold text-xs uppercase tracking-widest">Today's Nutrition Summary</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Calorie gauge */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-zinc-400">Calories</span>
              <span className="text-zinc-300">
                {nutritionSummary.consumed.calories} <span className="text-zinc-500">/ {nutritionSummary.targets.calories} kcal</span>
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((nutritionSummary.consumed.calories / nutritionSummary.targets.calories) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Protein gauge */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-zinc-400">Protein</span>
              <span className="text-zinc-300">
                {nutritionSummary.consumed.protein}g <span className="text-zinc-500">/ {nutritionSummary.targets.protein}g</span>
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((nutritionSummary.consumed.protein / nutritionSummary.targets.protein) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs gauge */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-zinc-400">Carbohydrates</span>
              <span className="text-zinc-300">
                {nutritionSummary.consumed.carbs}g <span className="text-zinc-500">/ {nutritionSummary.targets.carbs}g</span>
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((nutritionSummary.consumed.carbs / nutritionSummary.targets.carbs) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Fat gauge */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-zinc-400">Fats</span>
              <span className="text-zinc-300">
                {nutritionSummary.consumed.fat}g <span className="text-zinc-500">/ {nutritionSummary.targets.fat}g</span>
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((nutritionSummary.consumed.fat / nutritionSummary.targets.fat) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sleep Quick Summary */}
        <div className="stripe-card p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-1">
            <h2 className="text-zinc-300 font-bold text-xs uppercase tracking-widest flex items-center">
              <span className="mr-2">🌙</span> Rest & Recovery
            </h2>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wide">
              Sleep target: <strong className="text-orange-400 font-extrabold">{sleepLog?.recommended_hours || 8} hours</strong>
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-900">
            <div className="bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850">
              <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-wider">Logged Sleep</span>
              <span className="text-xs font-extrabold text-white mt-0.5 block">{sleepLog?.actual_hours || 0} Hours</span>
            </div>
            <span className="text-xs font-semibold text-zinc-300">
              {sleepLog?.actual_hours >= (sleepLog?.recommended_hours || 8)
                ? '✅ Recovery targets achieved'
                : '💤 Prioritize sleep repair logs'}
            </span>
          </div>
        </div>

        {/* Water Hydration Tracker */}
        <div className="stripe-card p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-zinc-300 font-bold text-xs uppercase tracking-widest flex items-center">
                <span className="mr-2">💧</span> Hydration Tracker
              </h2>
              <span className="text-[9px] text-zinc-400 font-extrabold bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Target: {waterTarget} ml
              </span>
            </div>
            {/* Progress Bar */}
            <div className="space-y-2.5 mt-3">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                <span className="text-zinc-500">Intake Progress</span>
                <span className={`font-extrabold ${waterIntake >= waterTarget ? 'text-green-400' : 'text-orange-400'}`}>
                  {waterIntake} <span className="text-zinc-500">/ {waterTarget} ml</span>
                  {waterIntake > waterTarget && (
                    <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-950/50 px-1.5 py-0.5 rounded-md font-black ml-2 uppercase animate-pulse">
                      +{waterIntake - waterTarget}ml Over
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    waterIntake >= waterTarget ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min((Number(waterIntake) / Number(waterTarget || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-900">
            <div className="flex gap-2">
              <button
                onClick={() => handleLogWater(250)}
                className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95"
              >
                +250ml 🥛
              </button>
              <button
                onClick={() => handleLogWater(750)}
                className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95"
              >
                +750ml 💧
              </button>
            </div>
            <button
              onClick={handleResetWater}
              className="text-zinc-500 hover:text-red-400 py-1.5 px-3 transition-colors cursor-pointer text-[10px] uppercase font-bold tracking-wider"
              title="Reset today's water logs"
            >
              Reset 🔄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
