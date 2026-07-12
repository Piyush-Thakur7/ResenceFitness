'use client';

import { useState } from 'react';

const DIET_OPTIONS = [
  { id: 'Veg', label: 'Vegetarian', desc: 'No meat, fish, or eggs. Dairy is allowed.' },
  { id: 'Non-Veg', label: 'Non-Vegetarian', desc: 'All protein sources allowed.' },
  { id: 'Vegan', label: 'Vegan', desc: 'Strictly plant-based. No animal products.' },
  { id: 'Eggetarian', label: 'Eggetarian', desc: 'Vegetarian, but eggs are allowed.' },
];

const GOAL_OPTIONS = [
  { id: 'Lean', label: 'Get Lean', desc: 'Preserve muscle definition, target mild caloric deficit.' },
  { id: 'Bulky', label: 'Gain Bulk', desc: 'Hypertrophy target, clean caloric surplus, heavy weights.' },
  { id: 'Athletic', label: 'Athletic Conditioning', desc: 'Agility focus, speed runs, power, core durability.' },
  { id: 'Healthy', label: 'Healthy & Longevity', desc: 'Lower blood pressure, improve cardiovascular health.' },
  { id: 'General Fitness', label: 'General Fitness', desc: 'Well-rounded stamina, endurance, and general health.' },
  { id: 'Fat Loss', label: 'Fat Loss', desc: 'Calibrated for calorie deficit and fat oxidation.' },
];

const COND_OPTIONS = [
  { id: 'None', label: 'None (Strength Only)', desc: 'Resistance targets only. Skip daily running/cardio.' },
  { id: 'Running', label: 'Running / Jogging', desc: 'Aerobic running drills and weekly interval splits.' },
  { id: 'Rope Skipping', label: 'Rope Skipping / Agility', desc: 'Jump rope segments and agile movement drills.' },
  { id: 'Boxing', label: 'Boxing / MMA Drills', desc: 'Shadow boxing, heavy bag work, and combat splits.' },
];

export default function SettingsSection({ profile, onUpdateProfile }) {
  const [dob, setDob] = useState(profile.dob || '');
  const [gender, setGender] = useState(profile.gender || 'male');
  const [height, setHeight] = useState(profile.height?.toString() || '');
  const [weight, setWeight] = useState(profile.weight?.toString() || '');
  const [diet, setDiet] = useState(profile.diet_preference || 'Non-Veg');
  const [goal, setGoal] = useState(profile.fitness_goal || 'General Fitness');
  const [conditioning, setConditioning] = useState(profile.conditioning_preference || 'Running');
  const [injuries, setInjuries] = useState(profile.injuries || '');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const parsedHeight = parseFloat(height);
      const parsedWeight = parseFloat(weight);

      if (isNaN(parsedHeight) || isNaN(parsedWeight)) {
        throw new Error('Height and weight must be valid numbers.');
      }

      await onUpdateProfile({
        dob,
        gender,
        height: parsedHeight,
        weight: parsedWeight,
        diet_preference: diet,
        fitness_goal: goal,
        conditioning_preference: conditioning,
        injuries: injuries.trim() || null,
      });

      setMessage('Profile settings saved successfully! Your AI plans will automatically adapt.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings & Customization</h1>
        <p className="text-zinc-400 text-sm">Update your body metrics, goals, and training preferences at any time.</p>
      </div>

      {message && (
        <div className="p-4 bg-green-950/40 border border-green-900 text-green-400 text-xs rounded-xl font-semibold">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900 text-red-400 text-xs rounded-xl font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Step 1 Block: Core Metrics */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">1. Core Metrics & Demographics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Gender</label>
            <div className="flex space-x-3">
              {['male', 'female'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`px-5 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    gender === g
                      ? 'bg-orange-500 border-orange-500 text-white font-bold'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2 Block: Diet Preference */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">2. Nutrition Settings</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DIET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDiet(opt.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  diet === opt.id
                    ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-500/10'
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-800'
                }`}
              >
                <h3 className="font-semibold text-white text-xs">{opt.label}</h3>
                <p className="text-zinc-400 text-[10px] mt-1 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3 Block: Goal & Conditioning */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">3. Fitness Goal & Conditioning</h2>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-3">Primary Objective</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGoal(opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    goal === opt.id
                      ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-500/10'
                      : 'bg-zinc-950 border-zinc-850 hover:border-zinc-800'
                  }`}
                >
                  <h3 className="font-semibold text-white text-xs">{opt.label}</h3>
                  <p className="text-zinc-400 text-[10px] mt-1 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-850">
            <label className="block text-xs font-semibold text-zinc-400 mb-3">Conditioning Preference</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COND_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setConditioning(opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    conditioning === opt.id
                      ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-500/10'
                      : 'bg-zinc-950 border-zinc-850 hover:border-zinc-800'
                  }`}
                >
                  <h3 className="font-semibold text-white text-xs">{opt.label}</h3>
                  <p className="text-zinc-400 text-[10px] mt-1 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4 Block: Physical Limitations */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">4. Physical Limitations (Optional)</h2>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Injuries or joint limits</label>
            <textarea
              placeholder="e.g. Lower back pain, left knee injury (this will adapt plan volume)"
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 h-24 resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving Customizations...' : 'Save Profile Customizations'}
          </button>
        </div>
      </form>
    </div>
  );
}
