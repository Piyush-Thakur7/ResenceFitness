'use client';

import { useState, useMemo } from 'react';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function DietSection({
  profile,
  dietPlan,
  dietLogs = [],
  onLogMeal,
  onGeneratePlan,
  onAnalyzeMealPhoto,
  loadingPlan = false,
}) {
  const [mealType, setMealType] = useState('Breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [manualFormOpen, setManualFormOpen] = useState(false);

  // Targets
  const targets = useMemo(() => {
    return dietPlan?.plan_data?.daily_targets || {
      calories: 2000,
      protein: 120,
      carbs: 220,
      fat: 65,
    };
  }, [dietPlan]);

  // Consumed
  const consumed = useMemo(() => {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    dietLogs.forEach((log) => {
      totals.calories += Number(log.calories || 0);
      totals.protein += Number(log.protein || 0);
      totals.carbs += Number(log.carbs || 0);
      totals.fat += Number(log.fat || 0);
    });
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
    };
  }, [dietLogs]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mealName || !calories) return;

    onLogMeal({
      meal_type: mealType,
      meal_name: mealName,
      calories: parseFloat(calories),
      protein: parseFloat(protein || 0),
      carbs: parseFloat(carbs || 0),
      fat: parseFloat(fat || 0),
    });

    // Reset Form
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setPhotoPreview(null);
    setManualFormOpen(false);
  };

  // Handle image upload and parse
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setPhotoPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        const res = await onAnalyzeMealPhoto(base64Data, file.type);
        if (res) {
          setMealName(res.meal_name || '');
          setCalories(res.calories?.toString() || '');
          setProtein(res.protein?.toString() || '');
          setCarbs(res.carbs?.toString() || '');
          setFat(res.fat?.toString() || '');
          setManualFormOpen(true); // Open the pre-filled form for editing/confirmation
        }
      } catch (err) {
        console.error('Failed to parse food photo:', err);
        alert('Could not recognize food. Please try another image or log manually.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Diet & Nutrition Planner</h1>
          <p className="text-zinc-400 text-sm">Calculate targets, scan food photos, and balance your daily macros.</p>
        </div>
        {dietPlan && (
          <button
            onClick={onGeneratePlan}
            disabled={loadingPlan}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            {loadingPlan ? 'Regenerating...' : 'Regenerate Diet Plan'}
          </button>
        )}
      </div>

      {!dietPlan ? (
        // Empty State: Generate Diet Plan
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-green-950/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-green-950">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">No active diet plan</h2>
            <p className="text-zinc-400 text-sm">
              Tap below to generate a tailored macronutrient baseline aligned with your {profile.diet_preference} preference and {profile.fitness_goal} goals.
            </p>
            <button
              onClick={onGeneratePlan}
              disabled={loadingPlan}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-colors cursor-pointer w-full sm:w-auto disabled:opacity-50"
            >
              {loadingPlan ? 'Consulting Gemini AI...' : 'Generate AI Diet Plan'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Progress Dials & Tracker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dashboard Dials */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
              <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Today's Intake vs Targets</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Calories</span>
                  <span className="text-lg font-black text-white">{consumed.calories}</span>
                  <span className="text-[10px] text-zinc-400 block border-t border-zinc-900 pt-1 mt-1">Goal: {targets.calories} kcal</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Protein</span>
                  <span className="text-lg font-black text-green-400">{consumed.protein}g</span>
                  <span className="text-[10px] text-zinc-400 block border-t border-zinc-900 pt-1 mt-1">Goal: {targets.protein}g</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Carbs</span>
                  <span className="text-lg font-black text-blue-400">{consumed.carbs}g</span>
                  <span className="text-[10px] text-zinc-400 block border-t border-zinc-900 pt-1 mt-1">Goal: {targets.carbs}g</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Fats</span>
                  <span className="text-lg font-black text-purple-400">{consumed.fat}g</span>
                  <span className="text-[10px] text-zinc-400 block border-t border-zinc-900 pt-1 mt-1">Goal: {targets.fat}g</span>
                </div>
              </div>
            </div>

            {/* Food Recognition Camera Uploader */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Fast Food Recognition</h2>
              <p className="text-xs text-zinc-400">Upload a photo of your plate. Resence Gemini will parse the items and estimate calorie/protein macros instantly.</p>

              <div className="flex items-center space-x-4">
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 hover:border-orange-500 rounded-xl py-6 bg-zinc-950 cursor-pointer transition-colors">
                  <svg className="w-8 h-8 text-zinc-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-zinc-400 font-medium">Click to upload meal photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-[10px] text-orange-400">
                        <svg className="w-5 h-5 animate-spin mb-1 text-orange-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Todays Meal Logs */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Today's Logs</h2>
              {dietLogs.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No food logged yet today. Use the photo scanner or manual log form.</p>
              ) : (
                <div className="space-y-2">
                  {dietLogs.map((log, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-xs bg-zinc-900 text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded-full font-medium mr-2">
                          {log.meal_type}
                        </span>
                        <strong className="text-sm text-white">{log.meal_name}</strong>
                        <div className="text-[10px] text-zinc-500 mt-1">
                          Protein: {log.protein}g | Carbs: {log.carbs}g | Fat: {log.fat}g
                        </div>
                      </div>
                      <span className="text-xs text-orange-400 font-bold">{log.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Suggestion & Manual Entry Form */}
          <div className="space-y-6">
            {/* Meal suggestions list */}
            {dietPlan.plan_data?.meal_suggestions && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">AI Suggested Meals</h2>
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Breakfast</span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{dietPlan.plan_data.meal_suggestions.breakfast}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Lunch</span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{dietPlan.plan_data.meal_suggestions.lunch}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Dinner</span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{dietPlan.plan_data.meal_suggestions.dinner}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">Snacks / Supplements</span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{dietPlan.plan_data.meal_suggestions.snack}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Form Button/Form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Log Meal Manually</h2>
                <button
                  onClick={() => setManualFormOpen(!manualFormOpen)}
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
                >
                  {manualFormOpen ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {manualFormOpen && (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-zinc-850">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Meal Type</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      {MEAL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Meal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Scrambled Eggs with Avocado"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Calories (kcal)</label>
                      <input
                        type="number"
                        placeholder="e.g. 450"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Protein (g)</label>
                      <input
                        type="number"
                        placeholder="e.g. 25"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Fats (g)</label>
                      <input
                        type="number"
                        placeholder="e.g. 12"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Log Meal Intake
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
