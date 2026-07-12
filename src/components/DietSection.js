'use client';

import { useState, useEffect, useMemo } from 'react';

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
  const [fiber, setFiber] = useState('0');
  const [sodium, setSodium] = useState('0');
  const [sugar, setSugar] = useState('0');
  
  // Custom 2026 food photo/voice states
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [scannedHidden, setScannedHidden] = useState([]);
  const [frequentFoods, setFrequentFoods] = useState([]);
  const [editingItemIdx, setEditingItemIdx] = useState(null);
  
  // Voice & Text Input fallbacks
  const [voiceInput, setVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showBarcode, setShowBarcode] = useState(false);

  // Load cached frequent foods on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('resence-frequent-foods');
      if (stored) {
        setFrequentFoods(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

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
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 };
    dietLogs.forEach((log) => {
      totals.calories += Number(log.calories || 0);
      totals.protein += Number(log.protein || 0);
      totals.carbs += Number(log.carbs || 0);
      totals.fat += Number(log.fat || 0);

      // Parse custom nested extra nutrients from meal name
      const parts = log.meal_name.split('|||');
      if (parts[1]) {
        try {
          const extra = JSON.parse(parts[1]);
          totals.fiber += Number(extra.fiber || 0);
          totals.sodium += Number(extra.sodium || 0);
          totals.sugar += Number(extra.sugar || 0);
        } catch (e) {}
      }
    });
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
      fiber: Math.round(totals.fiber * 10) / 10,
      sodium: Math.round(totals.sodium),
      sugar: Math.round(totals.sugar * 10) / 10,
    };
  }, [dietLogs]);

  // Cache logged meal
  const cacheFoodLog = (name, cal, prot, carb, f, fib, sod, sug) => {
    try {
      const stored = localStorage.getItem('resence-frequent-foods');
      let list = stored ? JSON.parse(stored) : [];
      
      const existingIdx = list.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
      if (existingIdx > -1) {
        list[existingIdx].count = (list[existingIdx].count || 1) + 1;
      } else {
        list.push({ 
          name, 
          calories: parseFloat(cal), 
          protein: parseFloat(prot || 0), 
          carbs: parseFloat(carb || 0), 
          fat: parseFloat(f || 0),
          fiber: parseFloat(fib || 0),
          sodium: parseFloat(sod || 0),
          sugar: parseFloat(sug || 0),
          count: 1 
        });
      }

      list.sort((a, b) => b.count - a.count);
      list = list.slice(0, 15);
      localStorage.setItem('resence-frequent-foods', JSON.stringify(list));
      setFrequentFoods(list);
    } catch (e) {
      console.error(e);
    }
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mealName || !calories) return;

    const extraData = JSON.stringify({
      fiber: parseFloat(fiber || 0),
      sodium: parseFloat(sodium || 0),
      sugar: parseFloat(sugar || 0),
    });

    onLogMeal({
      meal_type: mealType,
      meal_name: `${mealName.trim()} |||${extraData}`,
      calories: parseFloat(calories),
      protein: parseFloat(protein || 0),
      carbs: parseFloat(carbs || 0),
      fat: parseFloat(fat || 0),
    });

    cacheFoodLog(mealName, calories, protein, carbs, fat, fiber, sodium, sugar);

    // Reset Form
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setFiber('0');
    setSodium('0');
    setSugar('0');
    setPhotoPreview(null);
    setManualFormOpen(false);
  };

  // Save the collective itemized results list
  const handleSaveScannedMeal = () => {
    if (scannedItems.length === 0) return;

    let totalCal = 0;
    let totalProt = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSodium = 0;
    let totalSugar = 0;

    scannedItems.forEach(item => {
      totalCal += Number(item.calories || 0);
      totalProt += Number(item.protein || 0);
      totalCarbs += Number(item.carbs || 0);
      totalFat += Number(item.fat || 0);
      totalFiber += Number(item.fiber || 0);
      totalSodium += Number(item.sodium || 0);
      totalSugar += Number(item.sugar || 0);
    });

    const extraData = JSON.stringify({
      fiber: totalFiber,
      sodium: totalSodium,
      sugar: totalSugar,
    });

    onLogMeal({
      meal_type: mealType,
      meal_name: `${mealName || 'Scanned Meal'} |||${extraData}`,
      calories: Math.round(totalCal),
      protein: Math.round(totalProt * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    });

    // Cache items individually
    scannedItems.forEach(item => {
      cacheFoodLog(item.name, item.calories, item.protein, item.carbs, item.fat, item.fiber, item.sodium, item.sugar);
    });

    // Clear Scanner State
    setScannedItems([]);
    setScannedHidden([]);
    setPhotoPreview(null);
  };

  // Handle image upload and parse
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setPhotoPreview(URL.createObjectURL(file));
    setScannedItems([]);
    setScannedHidden([]);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        const res = await onAnalyzeMealPhoto(base64Data, file.type);
        if (res) {
          setMealName(res.meal_name || 'Scanned Meal');
          if (res.items && res.items.length > 0) {
            setScannedItems(res.items.map(item => ({
              ...item,
              original_weight: item.weight_g || 100,
              original_calories: item.calories || 0,
              original_protein: item.protein || 0,
              original_carbs: item.carbs || 0,
              original_fat: item.fat || 0,
              original_fiber: item.fiber || 0,
              original_sodium: item.sodium || 0,
              original_sugar: item.sugar || 0,
            })));
            if (res.suggested_hidden_ingredients) {
              setScannedHidden(res.suggested_hidden_ingredients.map(item => ({
                ...item,
                checked: false
              })));
            }
          }
          setManualFormOpen(false);
        }
      } catch (err) {
        console.error('Failed to parse food photo:', err);
        alert('Could not recognize food. Please try voice logging or manual log.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Web Speech API Voice logger
  const handleVoiceListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type description instead.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceInput(transcript);
      parseVoiceDescription(transcript);
    };

    recognition.start();
  };

  const parseVoiceDescription = async (textVal) => {
    if (!textVal.trim()) return;
    setUploading(true);
    setScannedItems([]);
    setScannedHidden([]);
    
    try {
      const res = await onAnalyzeMealPhoto(null, null, textVal);
      if (res) {
        setMealName(res.meal_name || 'Verbal Meal');
        if (res.items && res.items.length > 0) {
          setScannedItems(res.items.map(item => ({
            ...item,
            original_weight: item.weight_g || 100,
            original_calories: item.calories || 0,
            original_protein: item.protein || 0,
            original_carbs: item.carbs || 0,
            original_fat: item.fat || 0,
            original_fiber: item.fiber || 0,
            original_sodium: item.sodium || 0,
            original_sugar: item.sugar || 0,
          })));
          if (res.suggested_hidden_ingredients) {
            setScannedHidden(res.suggested_hidden_ingredients.map(item => ({
              ...item,
              checked: false
            })));
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert('Could not parse description. Please try manual log form.');
    } finally {
      setUploading(false);
    }
  };

  // Mock barcode scanner parsing
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setUploading(true);
    setTimeout(() => {
      // Return a structured item
      setMealName('Packaged Protein bar');
      setScannedItems([
        {
          name: `Packaged Bar (Barcode: ${barcodeInput})`,
          weight_g: 60,
          calories: 220,
          protein: 20,
          carbs: 24,
          fat: 7,
          fiber: 6,
          sodium: 140,
          sugar: 2,
          confidence: 1.0,
          original_weight: 60,
          original_calories: 220,
          original_protein: 20,
          original_carbs: 24,
          original_fat: 7,
          original_fiber: 6,
          original_sodium: 140,
          original_sugar: 2,
        }
      ]);
      setUploading(false);
      setShowBarcode(false);
      setBarcodeInput('');
    }, 1000);
  };

  // Edit item weight and proportionally recalculate macros
  const handleItemWeightChange = (index, newWeight) => {
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    setScannedItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const ratio = weightNum / (item.original_weight || 100);
      return {
        ...item,
        weight_g: weightNum,
        calories: Math.round(item.original_calories * ratio),
        protein: Math.round(item.original_protein * ratio * 10) / 10,
        carbs: Math.round(item.original_carbs * ratio * 10) / 10,
        fat: Math.round(item.original_fat * ratio * 10) / 10,
        fiber: Math.round(item.original_fiber * ratio * 10) / 10,
        sodium: Math.round(item.original_sodium * ratio),
        sugar: Math.round(item.original_sugar * ratio * 10) / 10,
      };
    }));
  };

  const handleItemFieldChange = (index, field, value) => {
    setScannedItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, [field]: value };
    }));
  };

  // Toggle suggested hidden ingredients
  const handleToggleHidden = (index) => {
    setScannedHidden(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const nextChecked = !item.checked;
      
      if (nextChecked) {
        setScannedItems(items => [
          ...items,
          {
            name: item.name,
            weight_g: 14,
            calories: item.calories || 0,
            protein: item.protein || 0,
            carbs: item.carbs || 0,
            fat: item.fat || 0,
            fiber: item.fiber || 0,
            sodium: item.sodium || 0,
            sugar: item.sugar || 0,
            confidence: 0.9,
            isSuggestedHidden: true,
            original_weight: 14,
            original_calories: item.calories || 0,
            original_protein: item.protein || 0,
            original_carbs: item.carbs || 0,
            original_fat: item.fat || 0,
            original_fiber: item.fiber || 0,
            original_sodium: item.sodium || 0,
            original_sugar: item.sugar || 0,
          }
        ]);
      } else {
        setScannedItems(items => items.filter(i => !(i.name === item.name && i.isSuggestedHidden)));
      }

      return { ...item, checked: nextChecked };
    }));
  };

  const handleDeleteItem = (index) => {
    const item = scannedItems[index];
    if (item.isSuggestedHidden) {
      setScannedHidden(prev => prev.map(sh => {
        if (sh.name === item.name) {
          return { ...sh, checked: false };
        }
        return sh;
      }));
    }
    setScannedItems(prev => prev.filter((_, idx) => idx !== index));
    if (editingItemIdx === index) setEditingItemIdx(null);
  };

  const handleAddScannedItem = () => {
    setScannedItems(prev => [
      ...prev,
      {
        name: 'Custom ingredient',
        weight_g: 100,
        calories: 100,
        protein: 10,
        carbs: 10,
        fat: 2,
        fiber: 0,
        sodium: 0,
        sugar: 0,
        confidence: 1.0,
        original_weight: 100,
        original_calories: 100,
        original_protein: 10,
        original_carbs: 10,
        original_fat: 2,
        original_fiber: 0,
        original_sodium: 0,
        original_sugar: 0,
      }
    ]);
  };

  // Pre-fill fields from cached food logs
  const handleSelectFrequent = (item) => {
    setMealName(item.name);
    setCalories(item.calories?.toString() || '');
    setProtein(item.protein?.toString() || '');
    setCarbs(item.carbs?.toString() || '');
    setFat(item.fat?.toString() || '');
    setFiber(item.fiber?.toString() || '0');
    setSodium(item.sodium?.toString() || '0');
    setSugar(item.sugar?.toString() || '0');
    setManualFormOpen(true);
  };

  // Calculated totals of scanning items list
  const scannedTotals = useMemo(() => {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 };
    scannedItems.forEach(item => {
      totals.calories += Number(item.calories || 0);
      totals.protein += Number(item.protein || 0);
      totals.carbs += Number(item.carbs || 0);
      totals.fat += Number(item.fat || 0);
      totals.fiber += Number(item.fiber || 0);
      totals.sodium += Number(item.sodium || 0);
      totals.sugar += Number(item.sugar || 0);
    });
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sodium: Math.round(totals.sodium),
      sugar: Math.round(totals.sugar * 10) / 10,
    };
  }, [scannedItems]);

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

              {/* 2026 Micro-nutrients Grid Display */}
              <div className="border-t border-zinc-850 pt-4 grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-zinc-950/60 p-2 border border-zinc-850 rounded-lg">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Fiber</span>
                  <span className="font-semibold text-zinc-300 mt-0.5 block">{consumed.fiber}g</span>
                </div>
                <div className="bg-zinc-950/60 p-2 border border-zinc-850 rounded-lg">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Sodium</span>
                  <span className="font-semibold text-zinc-300 mt-0.5 block">{consumed.sodium}mg</span>
                </div>
                <div className="bg-zinc-950/60 p-2 border border-zinc-850 rounded-lg">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Sugar</span>
                  <span className="font-semibold text-zinc-300 mt-0.5 block">{consumed.sugar}g</span>
                </div>
              </div>
            </div>

            {/* Premium Liquid Glass scanner view */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Fast Food Recognition</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1 text-[10px] font-bold text-orange-400 focus:outline-none"
                  >
                    {MEAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <p className="text-xs text-zinc-400 leading-normal">
                Upload a photo of your plate, speak your description, or type details. Resence Gemini will parse the ingredients and calculate metrics instantly.
              </p>

              {/* Main Log actions strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Photo Upload Trigger */}
                <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-orange-500 rounded-xl py-4 bg-zinc-950 cursor-pointer transition-colors text-center group">
                  <svg className="w-6 h-6 text-zinc-500 mb-1 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Photo Capture</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {/* Voice Logger Trigger */}
                <button
                  type="button"
                  onClick={handleVoiceListen}
                  disabled={uploading}
                  className={`flex flex-col items-center justify-center border border-zinc-800 hover:border-orange-500 rounded-xl py-4 transition-colors text-center cursor-pointer ${
                    isListening ? 'bg-orange-950/20 border-orange-500' : 'bg-zinc-950'
                  }`}
                >
                  <svg className={`w-6 h-6 mb-1 ${isListening ? 'text-orange-500 animate-pulse' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {isListening ? 'Listening...' : 'Voice Logger'}
                  </span>
                </button>

                {/* Barcode Mock Trigger */}
                <button
                  type="button"
                  onClick={() => setShowBarcode(!showBarcode)}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center border border-zinc-800 hover:border-orange-500 rounded-xl py-4 bg-zinc-950 transition-colors text-center cursor-pointer"
                >
                  <svg className="w-6 h-6 text-zinc-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Barcode Scanner</span>
                </button>
              </div>

              {/* Barcode Mock input panel */}
              {showBarcode && (
                <form onSubmit={handleBarcodeSubmit} className="flex gap-2 p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <input
                    type="text"
                    placeholder="Enter 12-digit barcode code..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-black text-[10px] font-black px-4 py-1.5 rounded-lg transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Scan
                  </button>
                </form>
              )}

              {/* Loader with spinner details */}
              {uploading && (
                <div className="p-8 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col items-center justify-center space-y-2">
                  <svg className="w-7 h-7 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider animate-pulse">Gemini analyzing food elements...</span>
                </div>
              )}

              {/* Portion Guidance suggestion */}
              {photoPreview && (
                <div className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl text-[10px] text-zinc-400">
                  <span className="text-base">📏</span>
                  <p>
                    <strong>Portion guide:</strong> 1 cup cooked rice ≈ 200g | 1 medium banana ≈ 120g | 1 chicken breast ≈ 150g. For scale, ensure clean angle views.
                  </p>
                </div>
              )}

              {/* Scanned item list results editor */}
              {scannedItems.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-zinc-850 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-500 uppercase font-bold block">Scanned Meal Name</span>
                      <input 
                        type="text"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        className="bg-transparent border-b border-zinc-800 text-sm font-bold text-white focus:outline-none focus:border-orange-500 max-w-xs"
                      />
                    </div>
                    <button
                      onClick={handleAddScannedItem}
                      className="text-[10px] text-orange-400 hover:text-orange-500 font-bold uppercase tracking-wider px-3 py-1 border border-zinc-800 rounded-lg bg-zinc-950 hover:bg-zinc-900 transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {scannedItems.map((item, idx) => {
                      const isEditing = editingItemIdx === idx;
                      const confidence = item.confidence || 0.8;
                      const dotColor = confidence >= 0.85 
                        ? 'bg-green-500' 
                        : confidence >= 0.60 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500';

                      return (
                        <div key={idx} className="bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 space-y-3 transition-all relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {/* Confidence indicator dot */}
                              <span 
                                className={`w-2 h-2 rounded-full ${dotColor}`} 
                                title={`Confidence: ${Math.round(confidence * 100)}%`}
                              />
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleItemFieldChange(idx, 'name', e.target.value)}
                                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs font-bold text-white focus:outline-none"
                                />
                              ) : (
                                <strong className="text-xs text-white font-bold">{item.name}</strong>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingItemIdx(isEditing ? null : idx)}
                                className="text-[10px] text-zinc-400 hover:text-white transition-colors"
                                title="Edit item details"
                              >
                                {isEditing ? '✓ Done' : '✏️ Edit'}
                              </button>
                              <button
                                onClick={() => handleDeleteItem(idx)}
                                className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                                title="Delete item"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                            <div>
                              <span className="text-zinc-500 block mb-0.5">Weight (g)</span>
                              <input
                                type="number"
                                value={item.weight_g || 100}
                                onChange={(e) => handleItemWeightChange(idx, e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-white font-bold focus:outline-none focus:border-orange-500"
                              />
                            </div>
                            <div className="bg-zinc-950/40 p-2 border border-zinc-850 rounded-lg">
                              <span className="text-zinc-500 block">Calories</span>
                              <span className="font-semibold text-white mt-0.5 block">{item.calories} kcal</span>
                            </div>
                            <div className="bg-zinc-950/40 p-2 border border-zinc-850 rounded-lg">
                              <span className="text-zinc-500 block">Protein</span>
                              <span className="font-semibold text-green-400 mt-0.5 block">{item.protein}g</span>
                            </div>
                            <div className="bg-zinc-950/40 p-2 border border-zinc-850 rounded-lg">
                              <span className="text-zinc-500 block">Carbs | Fats</span>
                              <span className="font-semibold text-blue-400 mt-0.5 block">
                                {item.carbs}g | <span className="text-purple-400">{item.fat}g</span>
                              </span>
                            </div>
                          </div>

                          {/* Extra Micro-nutrients list */}
                          <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] border-t border-zinc-900 text-zinc-500 font-medium">
                            <span>Fiber: <span className="text-zinc-400">{item.fiber}g</span></span>
                            <span>Sodium: <span className="text-zinc-400">{item.sodium}mg</span></span>
                            <span>Sugar: <span className="text-zinc-400">{item.sugar}g</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Smart nudges for hidden ingredients */}
                  {scannedHidden.length > 0 && (
                    <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 space-y-3">
                      <div className="space-y-0.5">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">🔬 Smart hidden nudges</h3>
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Did the chef add cooking oils, butter, or dressing that might not be visible? Toggle to add them:
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {scannedHidden.map((hidden, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleToggleHidden(idx)}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                              hidden.checked
                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span>{hidden.checked ? '✓' : '+'}</span>
                            <span>{hidden.name} ({hidden.default_amount})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aggregate Summary card */}
                  <div className="bg-orange-500/5 border border-orange-500/15 p-4 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-orange-400 uppercase tracking-widest block">Aggregated Meal totals</span>
                      <span className="text-[10px] text-zinc-500">{scannedItems.length} items logged</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block">Calories</span>
                        <span className="font-extrabold text-white text-sm">{scannedTotals.calories} kcal</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block">Protein</span>
                        <span className="font-extrabold text-green-400 text-sm">{scannedTotals.protein}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block">Carbs</span>
                        <span className="font-extrabold text-blue-400 text-sm">{scannedTotals.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block">Fats</span>
                        <span className="font-extrabold text-purple-400 text-sm">{scannedTotals.fat}g</span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800/60 pt-2 flex justify-around text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span>Fiber: {scannedTotals.fiber}g</span>
                      <span>Sodium: {scannedTotals.sodium}mg</span>
                      <span>Sugar: {scannedTotals.sugar}g</span>
                    </div>

                    <button
                      onClick={handleSaveScannedMeal}
                      className="bg-orange-500 hover:bg-orange-600 text-black text-xs font-black py-2.5 rounded-xl transition-colors w-full cursor-pointer uppercase tracking-wider"
                    >
                      Confirm and Log Meal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Todays Meal Logs */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Today's Logs</h2>
              {dietLogs.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No food logged yet today. Use the photo scanner or manual log form.</p>
              ) : (
                <div className="space-y-2">
                  {dietLogs.map((log, idx) => {
                    const cleanName = log.meal_name.split('|||')[0];
                    return (
                      <div key={idx} className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-xs bg-zinc-900 text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded-full font-medium mr-2">
                            {log.meal_type}
                          </span>
                          <strong className="text-sm text-white">{cleanName}</strong>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            Protein: {log.protein}g | Carbs: {log.carbs}g | Fat: {log.fat}g
                          </div>
                        </div>
                        <span className="text-xs text-orange-400 font-bold">{log.calories} kcal</span>
                      </div>
                    );
                  })}
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

            {/* Frequent logged foods quick list */}
            {frequentFoods.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
                <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Frequent Foods</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {frequentFoods.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectFrequent(item)}
                      className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <strong className="text-white block font-medium truncate max-w-[130px]">{item.name}</strong>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase">{item.protein || 0}g protein | {item.carbs || 0}g carbs</span>
                      </div>
                      <span className="text-orange-400 font-bold">{item.calories} kcal</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Form Button/Form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Log Meal Manually</h2>
                <button
                  type="button"
                  onClick={() => setManualFormOpen(!manualFormOpen)}
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
                >
                  {manualFormOpen ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {manualFormOpen && (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-zinc-850 animate-in fade-in duration-350">
                  <div>
                    <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Meal Type</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
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
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
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
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
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
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Fats (g)</label>
                      <input
                        type="number"
                        placeholder="e.g. 12"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Expanded optional micro-nutrients manual fields */}
                  <div className="pt-2 border-t border-zinc-850 space-y-3.5">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Optional Micro-nutrients</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[8px] text-zinc-400 uppercase font-bold mb-1">Fiber (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={fiber}
                          onChange={(e) => setFiber(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-zinc-400 uppercase font-bold mb-1">Sodium (mg)</label>
                        <input
                          type="number"
                          value={sodium}
                          onChange={(e) => setSodium(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-zinc-400 uppercase font-bold mb-1">Sugar (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={sugar}
                          onChange={(e) => setSugar(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-black text-xs font-black py-2 rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
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
