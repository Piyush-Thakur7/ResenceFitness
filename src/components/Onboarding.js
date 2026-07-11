'use client';

import { useState } from 'react';

const fitnessGoals = [
  {
    id: 'Lean',
    title: 'Lean',
    description: 'Lose body fat, increase definition, and build a toned, athletic physique.',
    svg: (
      <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'Fat Loss',
    title: 'Fat Loss',
    description: 'Maximize metabolic rate, target steady calorie deficit, and maintain core stamina.',
    svg: (
      <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2M4 4h16v16H4V4z" />
      </svg>
    ),
  },
  {
    id: 'Bulky',
    title: 'Bulky',
    description: 'Gain muscle mass, increase size, and maximize raw physical strength.',
    svg: (
      <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    id: 'Athletic',
    title: 'Athletic',
    description: 'Enhance speed, endurance, power, and high-performance functional conditioning.',
    svg: (
      <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    ),
  },
  {
    id: 'Healthy',
    title: 'Healthy & Longevity',
    description: 'Improve heart health, lower blood pressure, increase mobility, and feel energized daily.',
    svg: (
      <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'General Fitness',
    title: 'General Fitness',
    description: 'Maintain a balanced level of health, core stability, and moderate active routines.',
    svg: (
      <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const dietPreferences = [
  { id: 'Veg', name: 'Vegetarian', desc: 'No meat, poultry, or seafood. Includes dairy.' },
  { id: 'Non-Veg', name: 'Non-Vegetarian', desc: 'All meats, fish, poultry, eggs, and plants.' },
  { id: 'Vegan', name: 'Vegan', desc: 'Strictly plant-based. No animal products or dairy.' },
  { id: 'Eggetarian', name: 'Eggetarian', desc: 'Vegetarian diet that includes eggs but no meats.' },
];

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [diet, setDiet] = useState('Non-Veg');
  const [goal, setGoal] = useState('General Fitness');
  const [injuries, setInjuries] = useState('');
  const [conditioning, setConditioning] = useState('Running');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-calculate age in UI
  const calculateAge = (dateString) => {
    if (!dateString) return '';
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNext = () => {
    if (step === 1 && (!dob || !height || !weight)) {
      setError('Please fill in date of birth, height, and weight to continue.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const parsedHeight = parseFloat(height);
      const parsedWeight = parseFloat(weight);

      if (isNaN(parsedHeight) || isNaN(parsedWeight)) {
        throw new Error('Height and weight must be valid numbers.');
      }

      await onComplete({
        id: user.id,
        email: user.email,
        dob,
        gender,
        height: parsedHeight,
        weight: parsedWeight,
        diet_preference: diet,
        fitness_goal: goal,
        injuries: injuries.trim() || null,
        conditioning_preference: conditioning,
      });
    } catch (err) {
      setError(err.message || 'Failed to submit onboarding profile.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Onboarding Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
          Welcome to Resence Fitness
        </h1>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">
          Let's construct your personalized AI-driven fitness and nutrition baseline.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-12">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full bg-zinc-800 h-1 rounded-full" />
        </div>
        <div className="relative flex justify-between">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>1</span>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>2</span>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>3</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Step Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-xl">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Step 1: Body Metrics</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Date of Birth</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full sm:w-64 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                  {dob && (
                    <span className="text-zinc-400 text-sm font-medium">
                      Age: <strong className="text-orange-500">{calculateAge(dob)}</strong> years old
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Gender (affects exercise recommendations)</label>
                <div className="flex space-x-4 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${gender === 'male' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'}`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${gender === 'female' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'}`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Step 2: Nutrition & Focus</h2>
            <p className="text-zinc-400 text-sm mb-6">Select your dietary type and overall baseline preferences.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">Dietary Preference</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dietPreferences.map((pref) => (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => setDiet(pref.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${diet === pref.id ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-500/10' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <h3 className="font-semibold text-white">{pref.name}</h3>
                      <p className="text-zinc-400 text-xs mt-1">{pref.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <label className="block text-sm font-medium text-zinc-300 mb-3">Daily Conditioning Focus (Optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'None', label: 'Strength Only (No Cardio)', desc: 'Focus entirely on resistance exercises, skipping daily running/cardio.' },
                    { id: 'Running', label: 'Running / Jogging', desc: 'Standard dynamic running drills and weekly aerobic interval splits.' },
                    { id: 'Rope Skipping', label: 'Rope Skipping / Agility', desc: 'Perform jump rope sessions and light aerobic agility conditioning.' },
                    { id: 'Boxing', label: 'Boxing / MMA Drills', desc: 'Incorporate shadow boxing, heavy bag work, and martial arts drills.' },
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setConditioning(cond.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${conditioning === cond.id ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-500/10' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <h3 className="font-semibold text-white text-xs">{cond.label}</h3>
                      <p className="text-zinc-400 text-[10px] mt-1 leading-relaxed">{cond.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-850 font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Step 3: Define Your Goal</h2>
            <p className="text-zinc-400 text-sm mb-6">Select the primary outcome you want to achieve with your adaptive weekly plans.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {fitnessGoals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`p-4 rounded-xl border text-left flex items-start space-x-4 transition-all cursor-pointer ${goal === g.id ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-500/10' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className="flex-shrink-0 mt-1">{g.svg}</div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{g.title}</h3>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{g.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800 mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Injuries or Physical Limitations (Optional)
              </label>
              <textarea
                placeholder="e.g. Lower back pain, left knee injury (this will limit high strain on those joints)"
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 h-24 resize-none"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-855 font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Creating Profile...' : 'Complete Onboarding'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
