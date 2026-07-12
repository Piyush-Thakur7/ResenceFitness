'use client';

import { useMemo, useState, useEffect } from 'react';

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
  useEffect(() => {
    setClientToday(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase());
  }, []);

  // 1. BMI Calculation
  const bmiData = useMemo(() => {
    if (!profile.weight || !profile.height) return { bmi: 0, category: 'N/A', color: 'text-zinc-400' };
    const hMeters = profile.height / 100;
    const bmi = parseFloat((profile.weight / (hMeters * hMeters)).toFixed(1));
    let category = 'Normal';
    let color = 'text-green-500';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-yellow-500';
    } else if (bmi >= 25 && bmi < 29.9) {
      category = 'Overweight';
      color = 'text-orange-500';
    } else if (bmi >= 30) {
      category = 'Obese';
      color = 'text-red-500';
    }
    return { bmi, category, color };
  }, [profile.weight, profile.height]);

  // 2. Workout Completion Rate for today
  const workoutCompletion = useMemo(() => {
    if (!workoutPlan || !clientToday) return { total: 0, completed: 0, percentage: 0 };
    const today = clientToday;
    
    // Find matching day in plan
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
    // Default targets
    const targets = dietPlan?.plan_data?.daily_targets || {
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 65,
    };

    // Calculate totals consumed today
    let consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    dietLogs.forEach((log) => {
      consumed.calories += Number(log.calories || 0);
      consumed.protein += Number(log.protein || 0);
      consumed.carbs += Number(log.carbs || 0);
      consumed.fat += Number(log.fat || 0);
    });

    // Make numbers clean
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

  return (
    <div className="space-y-6">
      {/* Title greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Welcome back, {profile.full_name || 'Champion'}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Here is your daily fitness and nutrition standing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Card 1: BMI & Profile Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
            <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Body Profile</h2>
            <span className="text-xs bg-orange-950/40 text-orange-400 border border-orange-900 px-2 py-0.5 rounded-full font-medium">
              Goal: {profile.fitness_goal}
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{bmiData.bmi}</span>
            <span className={`text-sm font-semibold ${bmiData.color}`}>{bmiData.category} BMI</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-center">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Height</span>
              <span className="text-sm font-bold text-zinc-200">{profile.height} cm</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Current</span>
              <span className="text-sm font-bold text-zinc-200">{profile.weight} kg</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-orange-400 block uppercase font-bold">Target Weight</span>
              <span className="text-sm font-bold text-orange-500">{targetWeight} kg</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Age</span>
              <span className="text-sm font-bold text-zinc-200">{age} yrs</span>
            </div>
          </div>

          <div className="text-xs text-zinc-400">
            <span className="font-semibold block mb-1">Preferences & Health</span>
            Diet: <strong className="text-zinc-200">{profile.diet_preference}</strong> | Injuries:{' '}
            <strong className="text-zinc-200">{profile.injuries || 'None declared'}</strong>
          </div>
        </div>

        {/* Metric Card 2: Today's Tasks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
            <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Today's Workout</h2>
            {workoutCompletion.isRest ? (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-medium border border-zinc-700">Rest Day</span>
            ) : (
              <span className="text-xs bg-green-950/40 text-green-400 border border-green-900 px-2 py-0.5 rounded-full font-medium">Active</span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* SVG Circular Progress */}
              <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                <path
                  className="text-zinc-850"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-orange-500 transition-all duration-500"
                  strokeDasharray={`${workoutCompletion.percentage}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-white">{workoutCompletion.percentage}%</span>
                <span className="text-[10px] text-zinc-400">completed</span>
              </div>
            </div>
            {!workoutCompletion.isRest && (
              <p className="text-xs text-zinc-300 mt-4 font-medium">
                {workoutCompletion.completed} of {workoutCompletion.total} exercises ticked off today
              </p>
            )}
            {workoutCompletion.isRest && (
              <p className="text-xs text-zinc-400 mt-4 font-medium">Enjoy your active recovery rest day!</p>
            )}
          </div>
        </div>

        {/* Metric Card 3: Motivation / Streak */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
            <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Consistency</h2>
            <span className="text-xs bg-green-950/40 text-green-400 border border-green-900 px-2 py-0.5 rounded-full font-medium">Streak</span>
          </div>

          <div className="flex items-center space-x-4 py-2">
            <div className="bg-orange-950/40 p-4 rounded-2xl border border-orange-900">
              <svg className="w-8 h-8 text-orange-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-white">{streak?.current_streak || 0} Days</span>
              <p className="text-xs text-zinc-400 mt-0.5">Consecutive active logging streak</p>
            </div>
          </div>

          {/* Simple weekly summary (e.g. 5/6 days completed this week) */}
          <div className="pt-2 border-t border-zinc-850">
            <h3 className="text-xs font-semibold text-zinc-300 mb-2">Weekly Goal Completion</h3>
            <div className="flex space-x-1.5 justify-between">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                // Find if completed in weekly progress array
                const progressArr = streak?.weekly_progress || [];
                const isCompleted = progressArr[idx] === true;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-zinc-500 mb-1">{day}</span>
                    <div className={`w-full h-2.5 rounded-sm transition-colors ${isCompleted ? 'bg-green-500' : 'bg-zinc-850'}`} />
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              Note: Completions are updated daily when workouts are logged.
            </p>
          </div>
        </div>
      </div>

      {/* Daily Nutrition Tracker */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider mb-4">Today's Nutrition Summary</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Calorie gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Calories</span>
              <span className="text-zinc-400">
                {nutritionSummary.consumed.calories} / {nutritionSummary.targets.calories} kcal
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-850">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((nutritionSummary.consumed.calories / nutritionSummary.targets.calories) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Protein gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Protein</span>
              <span className="text-zinc-400">
                {nutritionSummary.consumed.protein} / {nutritionSummary.targets.protein}g
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-850">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((nutritionSummary.consumed.protein / nutritionSummary.targets.protein) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Carbohydrates</span>
              <span className="text-zinc-400">
                {nutritionSummary.consumed.carbs} / {nutritionSummary.targets.carbs}g
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-850">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((nutritionSummary.consumed.carbs / nutritionSummary.targets.carbs) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Fat gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Fats</span>
              <span className="text-zinc-400">
                {nutritionSummary.consumed.fat} / {nutritionSummary.targets.fat}g
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-850">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min((nutritionSummary.consumed.fat / nutritionSummary.targets.fat) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Quick Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider mb-1">Rest & Recovery</h2>
          <p className="text-xs text-zinc-400">Recommended Sleep target calculated from goal: <strong className="text-orange-400">{sleepLog?.recommended_hours || 8} hours</strong></p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-850">
            <span className="text-xs text-zinc-500 block">Logged Sleep</span>
            <span className="text-sm font-bold text-white">{sleepLog?.actual_hours || 0} Hours</span>
          </div>
          <span className="text-xs text-zinc-400">
            {sleepLog?.actual_hours >= sleepLog?.recommended_hours
              ? '✅ Target achieved for recovery'
              : '💤 Prioritize rest for optimal muscle recovery'}
          </span>
        </div>
      </div>
    </div>
  );
}
