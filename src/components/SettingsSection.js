'use client';

import { useState, useMemo } from 'react';

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

const LOGO_OPTIONS = [
  { id: 'logo_1', title: 'Option 1: Stylized "R" Mark', path: '/logos/logo_1.jpg', desc: 'Modern energy swoosh forming the letter "R" with orange and green gradients.' },
  { id: 'logo_2', title: 'Option 2: Rising Upward Swoosh', path: '/logos/logo_2.jpg', desc: 'Abstract geometric shape of rising bars/swoosh representing growth.' },
  { id: 'logo_3', title: 'Option 3: Lime Green Energy Wave', path: '/logos/logo_3.jpg', desc: 'Minimalist vector energy wave signifying vitality and motion.' },
  { id: 'logo_4', title: 'Option 4: Combined R + Growth Arrow', path: '/logos/logo_4.jpg', desc: 'Sleek geometric emblem combining the letter "R" with an upward-pointing arrow.' },
];

export default function SettingsSection({
  profile,
  onUpdateProfile,
  weightHistory = [],
  assessments = [],
  onChooseLogo,
  selectedLogoId = '',
  onLogout,
}) {
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

  // 1. Sort weight history
  const sortedHistory = useMemo(() => {
    return [...weightHistory].sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));
  }, [weightHistory]);

  // 2. Custom SVG Line Chart plotting for stats
  const svgChart = useMemo(() => {
    if (sortedHistory.length < 2) return null;

    const width = 500;
    const height = 180;
    const padding = 30;

    const weights = sortedHistory.map((h) => parseFloat(h.weight));
    const minWeight = Math.min(...weights) - 2;
    const maxWeight = Math.max(...weights) + 2;
    const weightRange = maxWeight - minWeight;

    const points = sortedHistory.map((h, idx) => {
      const x = padding + (idx / (sortedHistory.length - 1)) * (width - padding * 2);
      const y = height - padding - ((parseFloat(h.weight) - minWeight) / weightRange) * (height - padding * 2);
      return {
        x,
        y,
        weight: h.weight,
        date: new Date(h.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { points, pathD, areaD, width, height, padding, minWeight, maxWeight };
  }, [sortedHistory]);

  // 3. Before/After Photos list
  const beforeAfterPhotos = useMemo(() => {
    const allPhotos = [];
    assessments.forEach((as) => {
      if (as.photo_urls && Array.isArray(as.photo_urls)) {
        as.photo_urls.forEach((url) => {
          allPhotos.push({
            url,
            date: new Date(as.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          });
        });
      }
    });
    return allPhotos;
  }, [assessments]);

  const [beforeIdx, setBeforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(Math.max(0, beforeAfterPhotos.length - 1));

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

      setMessage('Settings updated successfully! Your AI plans will dynamically adapt.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings & Customization</h1>
        <p className="text-zinc-400 text-sm">Fine-tune your targets, verify weight progression history, and update brand aesthetics.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Form Fields & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Step 1: Demographics */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">1. Core Demographics</h2>
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

            {/* Step 2: Diet Settings */}
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

            {/* Step 3: Fitness Goals */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">3. Fitness Goal & Conditioning</h2>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-3">Primary Goal Target</label>
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
                <label className="block text-xs font-semibold text-zinc-400 mb-3">Conditioning Splits</label>
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

            {/* Step 4: Injuries */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">4. Physical Limits & Injuries</h2>
              <textarea
                placeholder="Describe lower back, knee limits, or joint pain to auto-adapt reps/plan structure."
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 h-24 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving Profile...' : 'Save Profile Customizations'}
            </button>
          </form>

          {/* SVG Progress stats trend chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Weight Progression Trend</h2>
            {svgChart ? (
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${svgChart.width} ${svgChart.height}`} className="w-full min-w-[400px] h-auto">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <line x1={svgChart.padding} y1={svgChart.padding} x2={svgChart.width - svgChart.padding} y2={svgChart.padding} stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1={svgChart.padding} y1={svgChart.height / 2} x2={svgChart.width - svgChart.padding} y2={svgChart.height / 2} stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1={svgChart.padding} y1={svgChart.height - svgChart.padding} x2={svgChart.width - svgChart.padding} y2={svgChart.height - svgChart.padding} stroke="#374151" strokeWidth="1" />

                  <path d={svgChart.areaD} fill="url(#chartGrad)" />
                  <path d={svgChart.pathD} fill="none" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" />

                  {svgChart.points.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#ff6b35" stroke="#000000" strokeWidth="1.5" />
                      <text x={pt.x} y={pt.y - 10} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                        {pt.weight}kg
                      </text>
                      <text x={pt.x} y={svgChart.height - 12} fill="#6b7280" fontSize="8" textAnchor="middle">
                        {pt.date}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="py-8 bg-zinc-950 border border-zinc-850 rounded-xl text-center text-zinc-500 text-xs italic">
                Your weight updates will build a progression curve here. Saving new weights above adds new data points.
              </div>
            )}
          </div>

          {/* Before/After Photo Progression */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Before & After Progression</h2>
            {beforeAfterPhotos.length < 2 ? (
              <p className="text-xs text-zinc-500 italic">Upload critique photos in the AI Assessment tab to populate side-by-side comparisons.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Before: {beforeAfterPhotos[beforeIdx]?.date}</span>
                    <div className="aspect-[3/4] bg-zinc-950 border border-zinc-850 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={beforeAfterPhotos[beforeIdx]?.url} alt="Before State" className="w-full h-full object-cover" />
                    </div>
                    <select
                      value={beforeIdx}
                      onChange={(e) => setBeforeIdx(parseInt(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none"
                    >
                      {beforeAfterPhotos.map((p, idx) => (
                        <option key={idx} value={idx}>Photo from {p.date}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">After: {beforeAfterPhotos[afterIdx]?.date}</span>
                    <div className="aspect-[3/4] bg-zinc-950 border border-zinc-850 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={beforeAfterPhotos[afterIdx]?.url} alt="After State" className="w-full h-full object-cover" />
                    </div>
                    <select
                      value={afterIdx}
                      onChange={(e) => setAfterIdx(parseInt(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none"
                    >
                      {beforeAfterPhotos.map((p, idx) => (
                        <option key={idx} value={idx}>Photo from {p.date}</option>
                      ))}
                    </select>
                  </div>
                </div>
          </div>

          {/* Account Administration */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-red-400 font-bold text-sm uppercase tracking-wider">Account Settings</h2>
            <p className="text-xs text-zinc-400">Sign out of your session on this device. Your parameters will remain securely stored.</p>
            <button
              type="button"
              onClick={onLogout}
              className="bg-red-950/20 border border-red-900/60 hover:bg-red-900/30 text-red-400 font-bold px-6 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Sign Out of Resence
            </button>
          </div>
        </div>

        {/* Right Column: Brand Selector */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Resence Brand Selector</h2>
          <p className="text-xs text-zinc-400">Review the generated logo options and select your preferred branding. Your choice will update the header brand theme.</p>

          <div className="space-y-4">
            {LOGO_OPTIONS.map((logo) => {
              const isSelected = selectedLogoId === logo.id;
              return (
                <button
                  key={logo.id}
                  onClick={() => onChooseLogo(logo.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-950/20 border-orange-500 shadow-md shadow-orange-500/10'
                      : 'bg-zinc-950 border-zinc-850 hover:border-zinc-800'
                  }`}
                >
                  <div className="w-14 h-14 bg-zinc-900 rounded border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img src={logo.path} alt={logo.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white flex items-center">
                      {logo.title}
                      {isSelected && (
                        <span className="ml-2 text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full uppercase">Selected</span>
                      )}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{logo.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
