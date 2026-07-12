'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DemoDashboard() {
  const [waterIntake, setWaterIntake] = useState(1500);
  const [tourDismissed, setTourDismissed] = useState(false);
  const [exercises, setExercises] = useState([
    { name: 'Flat Barbell Bench Press', completed: true, sets: 4, reps: '8-10', target: 'Mid Chest' },
    { name: 'Incline Dumbbell Press', completed: false, sets: 3, reps: '10-12', target: 'Upper Chest' },
    { name: 'Chest Dips', completed: false, sets: 3, reps: 'max', target: 'Lower Chest' },
  ]);

  const waterTarget = 2450;
  const streak = 7;
  const weight = 70;
  const height = 178;
  const bmi = 24.7;

  // Toggle Exercise Check status
  const handleToggleExercise = (idx) => {
    const updated = [...exercises];
    updated[idx].completed = !updated[idx].completed;
    setExercises(updated);
  };

  const completedCount = exercises.filter((ex) => ex.completed).length;
  const totalCount = exercises.length;
  const workoutPercentage = Math.round((completedCount / totalCount) * 100);

  const handleAddWater = (amount) => {
    setWaterIntake((prev) => prev + amount);
  };

  return (
    <div className="min-h-screen premium-mesh-bg text-white flex flex-col font-sans relative overflow-y-auto selection:bg-orange-500/30 pb-20">
      {/* Demo watermark banner */}
      <div className="bg-orange-500 text-white py-1.5 px-4 text-[10px] text-center font-black tracking-widest uppercase shadow-md relative z-50">
        ⚡ DEMO MODE — EXPERIENCE THE DASHBOARD FREE FOREVER WITH SAMPLE DATA
      </div>

      {/* Sticky Navbar Header */}
      <header className="bg-zinc-900/40 backdrop-blur-md border-b border-zinc-850 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
            <img src="/logos/logo_1.jpg" alt="Resence Logo" className="w-full h-full object-cover" />
          </div>
          <Link href="/">
            <span className="font-display font-extrabold tracking-widest text-white uppercase text-xs md:text-sm block cursor-pointer">
              Resence <span className="text-orange-500 font-extrabold">Fitness</span>
            </span>
          </Link>
        </div>
        <Link 
          href="/"
          className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 uppercase tracking-wider cursor-pointer"
        >
          Create Free Account
        </Link>
      </header>

      {/* Help Tour Tooltip banner */}
      {!tourDismissed && (
        <div className="max-w-4xl mx-auto px-6 pt-6 w-full animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-zinc-900 border border-orange-500/30 p-4 rounded-xl flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">👋 Welcome to the Interactive Tour!</h4>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                This is a live preview of the client dashboard. You can click exercise checklist checkboxes, add water to the hydration tracker, and inspect the responsive layout. Create a free account to save real history and connect live Gemini coach splits.
              </p>
            </div>
            <button 
              onClick={() => setTourDismissed(true)} 
              className="text-zinc-500 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Preview Grid */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6 w-full">
        {/* Header summary info */}
        <div className="flex flex-wrap items-center justify-between bg-zinc-900/60 border border-zinc-800 backdrop-blur-md rounded-2xl p-5 gap-4">
          <div>
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Dashboard summary</span>
            <h1 className="text-xl font-extrabold text-white mt-1">Welcome back, Alex!</h1>
            <p className="text-[10px] text-zinc-400 mt-0.5">Calibrating plans to your height ({height}cm) and target weight (70kg).</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-lg text-[9px] font-bold text-zinc-300 uppercase">Goal: Get Lean</span>
            <span className="bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-lg text-[9px] font-bold text-zinc-300 uppercase">Diet: Non-Veg</span>
          </div>
        </div>

        {/* 3 Metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: BMI */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
              <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Body Profile</span>
              <span className="text-[9px] text-green-400 font-bold bg-green-950/20 border border-green-900/50 px-2 py-0.5 rounded-full uppercase">Normal</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white">{bmi}</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Current BMI</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850">
              <div>Height: <span className="text-white font-bold">{height}cm</span></div>
              <div>Weight: <span className="text-white font-bold">{weight}kg</span></div>
              <div className="col-span-2 pt-1.5 mt-1.5 border-t border-zinc-900">Target Weight: <span className="text-orange-400 font-bold">68.1kg</span></div>
            </div>
          </div>

          {/* Card 2: Workout Completion */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
              <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Today's Workout</span>
              <span className="text-[9px] text-orange-400 font-bold bg-orange-950/20 border border-orange-900/50 px-2 py-0.5 rounded-full uppercase">Active</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-zinc-850" strokeWidth="2.5" stroke="currentColor" fill="none" r="28" cx="32" cy="32" />
                  <circle className="text-orange-500 transition-all duration-300" strokeWidth="2.8" strokeDasharray={`${workoutPercentage * 1.76}, 176`} strokeLinecap="round" stroke="currentColor" fill="none" r="28" cx="32" cy="32" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xs font-black text-white">{workoutPercentage}%</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-300 font-semibold block">{completedCount} of {totalCount} exercises</span>
                <span className="text-[9px] text-zinc-500 block mt-0.5">Ticked off today</span>
              </div>
            </div>
          </div>

          {/* Card 3: Consistency Streak */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
              <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Consistency</span>
              <span className="text-[9px] text-green-400 font-bold bg-green-950/20 border border-green-900/50 px-2 py-0.5 rounded-full uppercase">Active</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔥</span>
              <div>
                <span className="text-2xl font-black text-white block">{streak} Days</span>
                <span className="text-[9px] text-zinc-500 block mt-0.5">Active logging streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workout list checklist & Hydration tracker details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workout Checklist */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">Today's Workout Checkoff</h3>
            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleToggleExercise(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    ex.completed 
                      ? 'bg-orange-500/5 border-orange-500/30 text-white' 
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                  }`}
                >
                  <div>
                    <span className={`block font-bold ${ex.completed ? 'line-through text-zinc-500' : ''}`}>{ex.name}</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">{ex.sets} sets | Focus: {ex.target}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ex.completed}
                    onChange={() => {}} // handled by parent click
                    className="w-4 h-4 rounded border-zinc-800 accent-orange-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Hydration Tracker */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider">💧 Hydration Tracker</h3>
                <span className="text-[9px] text-zinc-400">Target: {waterTarget}ml</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Water intake status</span>
                  <span className={`font-semibold ${waterIntake >= waterTarget ? 'text-green-400' : 'text-orange-400'}`}>
                    {waterIntake} / {waterTarget} ml
                  </span>
                </div>
                <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-850">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      waterIntake >= waterTarget ? 'bg-green-500 shadow-sm shadow-green-500/20' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min((waterIntake / waterTarget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick addition buttons */}
            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => handleAddWater(250)}
                className="bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 text-zinc-300 text-[10px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex-1"
              >
                +250ml 🥛
              </button>
              <button 
                onClick={() => handleAddWater(750)}
                className="bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 text-zinc-300 text-[10px] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex-1"
              >
                +750ml 💧
              </button>
            </div>
          </div>
        </div>

        {/* Static Diet visual placeholder in demo */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold text-xs uppercase tracking-wider">Nutrition & Diet Estimation (Sample meal)</h3>
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-bold uppercase block">Today's Meal Entry</span>
              <span className="font-bold text-white text-sm">Grilled Paneer Salad Bowl</span>
              <span className="text-[10px] text-zinc-400 block">Identified via AI photo recognition</span>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Calories</span>
                <span className="font-bold text-orange-400 text-sm">450 kcal</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Protein</span>
                <span className="font-bold text-green-400 text-sm">35g</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Carbs</span>
                <span className="font-bold text-blue-400 text-sm">25g</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky Create Account CTA at bottom of Demo */}
        <section className="bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-zinc-950 border border-orange-500/20 rounded-2xl p-8 text-center space-y-4">
          <h3 className="text-white font-bold text-lg">Like the experience?</h3>
          <p className="text-zinc-400 text-xs max-w-md mx-auto">Create a free account to track your workouts, query the AI coach, log meals, and secure your photo critiques.</p>
          <div className="pt-2">
            <Link 
              href="/"
              className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white text-xs font-bold px-8 py-3.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider inline-block shadow-md shadow-orange-500/15"
            >
              Start Your Free Assessment
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
