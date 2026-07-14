'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// Generic Portion Templates (Fallback 3)
const GENERIC_TEMPLATES = [
  { name: 'Typical Indian Thali', calories: 750, protein: 18, carbs: 110, fat: 22, fiber: 8, sodium: 950, sugar: 4 },
  { name: 'Standard Beef Burger', calories: 600, protein: 26, carbs: 48, fat: 29, fiber: 2.5, sodium: 880, sugar: 6 },
  { name: 'Chicken & Caesar Salad', calories: 420, protein: 28, carbs: 12, fat: 30, fiber: 3, sodium: 740, sugar: 2 },
  { name: 'Three Eggs & Sourdough Toast', calories: 380, protein: 22, carbs: 26, fat: 18, fiber: 2, sodium: 490, sugar: 1.5 },
  { name: 'Oatmeal with Honey & Fruits', calories: 340, protein: 8, carbs: 62, fat: 5, fiber: 7.5, sodium: 5, sugar: 22 },
];

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
  
  // Photo & voice preprocessing states
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [scannedHidden, setScannedHidden] = useState([]);
  const [frequentFoods, setFrequentFoods] = useState([]);
  const [editingItemIdx, setEditingItemIdx] = useState(null);
  const [mealSource, setMealSource] = useState('manual');
  
  // Pipeline progress states (2026 standards)
  // 'idle' | 'compress' | 'upload' | 'analyze' | 'done' | 'failed'
  const [pipelineStep, setPipelineStep] = useState('idle');
  const [pipelineError, setPipelineError] = useState(null);
  const [retryAction, setRetryAction] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [uploadedPath, setUploadedPath] = useState(null);

  // Voice & Text Input fallbacks
  const [voiceInput, setVoiceInput] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showBarcode, setShowBarcode] = useState(false);

  const {
    isRecording,
    isTranscribing,
    error: voiceError,
    startRecording,
    stopRecording,
  } = useVoiceRecorder((transcript) => {
    setVoiceInput(transcript);
    setMealSource('voice');
    runTextAnalysis(transcript);
  });

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
      source: 'manual',
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
    setPipelineStep('idle');
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
      source: mealSource,
    });

    onLogMeal({
      meal_type: mealType,
      meal_name: `${mealName || 'Scanned Meal'} |||${extraData}`,
      calories: Math.round(totalCal),
      protein: Math.round(totalProt * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      photo_url: uploadedPath, // save Supabase private storage path
    });

    // Cache items individually
    scannedItems.forEach(item => {
      cacheFoodLog(item.name, item.calories, item.protein, item.carbs, item.fat, item.fiber, item.sodium, item.sugar);
    });

    // Clear Scanner State
    setScannedItems([]);
    setScannedHidden([]);
    setPhotoPreview(null);
    setPipelineStep('idle');
    setVoiceInput('');
    setMealSource('manual');
  };

  const handleDiscardScannedMeal = () => {
    // Clear Scanner State
    setScannedItems([]);
    setScannedHidden([]);
    setPhotoPreview(null);
    setPipelineStep('idle');
    setVoiceInput('');
    setMealSource('manual');
  };

  // 1. Preprocess & compress step
  const startProcessingPipeline = async (file) => {
    if (!file) return;
    setMealSource('photo');
    setCurrentFile(file);
    setPipelineError(null);
    setPhotoPreview(URL.createObjectURL(file));
    runCompression(file);
  };

  const runCompression = async (file) => {
    setPipelineStep('compress');
    let targetFile = file;

    // HEIC / HEIF conversion fallback (P0)
    if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      try {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        targetFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
      } catch (err) {
        console.error('HEIC conversion failed:', err);
        setPipelineError('HEIC photo conversion failed. Try uploading a screenshot or PNG.');
        setPipelineStep('failed');
        setRetryAction(() => () => runCompression(file));
        return;
      }
    }

    // Canvas-based image compression (max 1200px longest side, target <500KB)
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const maxSide = 1200;
      if (width > height && width > maxSide) {
        height = Math.round((height * maxSide) / width);
        width = maxSide;
      } else if (height > maxSide) {
        width = Math.round((width * maxSide) / height);
        height = maxSide;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (!blob) {
          setPipelineError('Image compression failed.');
          setPipelineStep('failed');
          setRetryAction(() => () => runCompression(file));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          setCompressedBlob(blob);
          setBase64Image(base64);
          
          // Proceed to upload
          runUpload(blob, base64);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    };
    img.onerror = () => {
      setPipelineError('Failed to read image. Make sure file is not corrupted.');
      setPipelineStep('failed');
      setRetryAction(() => () => runCompression(file));
    };
    img.src = URL.createObjectURL(targetFile);
  };

  // 2. Storage Upload step with 20s timeout and 1 auto-retry
  const runUpload = async (blob, base64, isRetry = false) => {
    setPipelineStep('upload');
    setPipelineError(null);

    if (!navigator.onLine) {
      setPipelineError('Network offline. Please check your internet connection.');
      setPipelineStep('failed');
      setRetryAction(() => () => runUpload(blob, base64));
      return;
    }

    if (!profile?.id) {
      setPipelineError('User profile not loaded. Please reload and try again.');
      setPipelineStep('failed');
      return;
    }

    const filePath = `${profile.id}/meal_${Date.now()}.jpg`;

    // 20-second timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timed out due to slow network')), 20000)
    );

    // Supabase upload promise
    const uploadPromise = (async () => {
      const { data, error } = await supabase.storage
        .from('meal-photos')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });
      if (error) throw error;
      return data;
    })();

    try {
      const data = await Promise.race([uploadPromise, timeoutPromise]);
      setUploadedPath(data.path);
      // Proceed to analyze
      runAnalysis(base64, data.path);
    } catch (err) {
      console.error('Upload failed:', err);
      const errMsg = err.message || 'Upload failed';

      if (!isRetry) {
        console.log('Retrying upload once...');
        runUpload(blob, base64, true);
      } else {
        setPipelineError(`${errMsg}. Try again?`);
        setPipelineStep('failed');
        setRetryAction(() => () => runUpload(blob, base64));
      }
    }
  };

  // 3. Gemini Vision analysis step with strict schema parsing & 1 retry
  const runAnalysis = async (base64, path, isRetry = false) => {
    setPipelineStep('analyze');
    setPipelineError(null);

    try {
      const res = await onAnalyzeMealPhoto(base64, 'image/jpeg');
      if (res && res.items) {
        setMealName(res.meal_name || 'Scanned Meal');
        const parsedItems = res.items.map(item => ({
          name: item.name,
          weight_g: item.weight_g || 100,
          calories: item.calories || 0,
          protein: item.protein_g || 0,
          carbs: item.carbs_g || 0,
          fat: item.fat_g || 0,
          fiber: item.fiber_g || 0,
          sodium: item.sodium_mg || 0,
          sugar: item.sugar_g || 0,
          confidence: item.confidence || 0.85,
          original_weight: item.weight_g || 100,
          original_calories: item.calories || 0,
          original_protein: item.protein_g || 0,
          original_carbs: item.carbs_g || 0,
          original_fat: item.fat_g || 0,
          original_fiber: item.fiber_g || 0,
          original_sodium: item.sodium_mg || 0,
          original_sugar: item.sugar_g || 0,
        }));
        setScannedItems(parsedItems);
        
        if (res.hidden_ingredients) {
          setScannedHidden(res.hidden_ingredients.map(hi => ({
            name: hi.name,
            default_amount: hi.typical_amount || '1 tbsp (14g)',
            calories: hi.calories || 120,
            protein: 0,
            carbs: 0,
            fat: 14,
            fiber: 0,
            sodium: 0,
            sugar: 0,
            checked: false
          })));
        }
        setPipelineStep('done');
      } else {
        throw new Error('Invalid JSON structure returned from analysis');
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      if (!isRetry) {
        console.log('Retrying analysis once...');
        runAnalysis(base64, path, true);
      } else {
        setPipelineError('Could not analyze. Try a clearer photo or log manually.');
        setPipelineStep('failed');
        setRetryAction(() => () => runAnalysis(base64, path));
      }
    }
  };

  // Text/Voice description pipeline with 1 auto-retry
  const runTextAnalysis = async (textVal, isRetry = false) => {
    if (!textVal.trim()) return;
    setUploading(true);
    setPipelineStep('analyze');
    setPipelineError(null);
    setScannedItems([]);
    setScannedHidden([]);
    
    try {
      const res = await onAnalyzeMealPhoto(null, null, textVal);
      if (res && res.items) {
        setMealName(res.meal_name || 'Verbal Meal');
        const parsedItems = res.items.map(item => ({
          name: item.name,
          weight_g: item.weight_g || 100,
          calories: item.calories || 0,
          protein: item.protein_g || 0,
          carbs: item.carbs_g || 0,
          fat: item.fat_g || 0,
          fiber: item.fiber_g || 0,
          sodium: item.sodium_mg || 0,
          sugar: item.sugar_g || 0,
          confidence: item.confidence || 0.85,
          original_weight: item.weight_g || 100,
          original_calories: item.calories || 0,
          original_protein: item.protein_g || 0,
          original_carbs: item.carbs_g || 0,
          original_fat: item.fat_g || 0,
          original_fiber: item.fiber_g || 0,
          original_sodium: item.sodium_mg || 0,
          original_sugar: item.sugar_g || 0,
        }));
        setScannedItems(parsedItems);
        if (res.hidden_ingredients) {
          setScannedHidden(res.hidden_ingredients.map(hi => ({
            name: hi.name,
            default_amount: hi.typical_amount || '1 tbsp (14g)',
            calories: hi.calories || 120,
            protein: 0,
            carbs: 0,
            fat: 14,
            fiber: 0,
            sodium: 0,
            sugar: 0,
            checked: false
          })));
        }
        setPipelineStep('done');
      } else {
        throw new Error('Invalid analysis response');
      }
    } catch (err) {
      console.error(err);
      if (!isRetry) {
        runTextAnalysis(textVal, true);
      } else {
        setPipelineError('Verbal analysis failed. Try manual log or template quick-picks.');
        setPipelineStep('failed');
        setRetryAction(() => () => runTextAnalysis(textVal));
      }
    } finally {
      setUploading(false);
    }
  };

  // Barcode packaged food mock log
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setMealSource('barcode');
    setUploading(true);
    setPipelineStep('analyze');
    setTimeout(() => {
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
      setPipelineStep('done');
      setShowBarcode(false);
      setBarcodeInput('');
    }, 1000);
  };

  // Apply Generic Portion Template (Fallback 3)
  const handleSelectTemplate = (tpl) => {
    setMealName(tpl.name);
    setMealSource('template');
    setScannedItems([
      {
        name: tpl.name,
        weight_g: 350,
        calories: tpl.calories,
        protein: tpl.protein,
        carbs: tpl.carbs,
        fat: tpl.fat,
        fiber: tpl.fiber,
        sodium: tpl.sodium,
        sugar: tpl.sugar,
        confidence: 0.9,
        original_weight: 350,
        original_calories: tpl.calories,
        original_protein: tpl.protein,
        original_carbs: tpl.carbs,
        original_fat: tpl.fat,
        original_fiber: tpl.fiber,
        original_sodium: tpl.sodium,
        original_sugar: tpl.sugar,
      }
    ]);
    setPipelineStep('done');
    setPipelineError(null);
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight uppercase">Nutrition & Diet</h1>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Calculate targets, scan food photos, and balance your daily macros.</p>
        </div>
        {dietPlan && (
          <button
            onClick={onGeneratePlan}
            disabled={loadingPlan}
            className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
          >
            {loadingPlan ? 'Regenerating...' : 'Regenerate Diet Plan'}
          </button>
        )}
      </div>

      {!dietPlan ? (
        <div className="stripe-card p-8 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-green-500/5 w-14 h-14 rounded-xl flex items-center justify-center mx-auto border border-green-950">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <h2 className="text-lg font-display font-extrabold text-white uppercase tracking-tight">No active diet plan</h2>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Tap below to generate a tailored macronutrient baseline aligned with your {profile.diet_preference} preference and {profile.fitness_goal} goals.
            </p>
            <button
              onClick={onGeneratePlan}
              disabled={loadingPlan}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider cursor-pointer w-full sm:w-auto transition-colors"
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
            <div className="stripe-card p-6 space-y-6">
              <div className="pb-3 border-b border-zinc-900">
                <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Today's Intake vs Targets</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-1 tracking-wider">Calories</span>
                  <span className="text-base font-black text-white">{consumed.calories}</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block border-t border-zinc-900 pt-1.5 mt-1.5">Goal: {targets.calories}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-1 tracking-wider">Protein</span>
                  <span className="text-base font-black text-green-400">{consumed.protein}g</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block border-t border-zinc-900 pt-1.5 mt-1.5">Goal: {targets.protein}g</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-1 tracking-wider">Carbs</span>
                  <span className="text-base font-black text-blue-400">{consumed.carbs}g</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block border-t border-zinc-900 pt-1.5 mt-1.5">Goal: {targets.carbs}g</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-1 tracking-wider">Fats</span>
                  <span className="text-base font-black text-purple-400">{consumed.fat}g</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block border-t border-zinc-900 pt-1.5 mt-1.5">Goal: {targets.fat}g</span>
                </div>
              </div>

              {/* 2026 Micro-nutrients Grid Display */}
              <div className="border-t border-zinc-900 pt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-zinc-950/60 p-2.5 border border-zinc-850 rounded-xl">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block tracking-wider">Fiber</span>
                  <span className="text-xs font-bold text-zinc-300 mt-0.5 block">{consumed.fiber}g</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 border border-zinc-850 rounded-xl">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block tracking-wider">Sodium</span>
                  <span className="text-xs font-bold text-zinc-300 mt-0.5 block">{consumed.sodium}mg</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 border border-zinc-850 rounded-xl">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block tracking-wider">Sugar</span>
                  <span className="text-xs font-bold text-zinc-300 mt-0.5 block">{consumed.sugar}g</span>
                </div>
              </div>
            </div>

            {/* Premium Liquid Glass scanner view */}
            <div className="stripe-card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-3 border-b border-zinc-900">
                <h2 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Fast Food Recognition</h2>
                <div>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-orange-400 focus:outline-none cursor-pointer"
                  >
                    {MEAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Upload a photo of your plate, speak your description, or type details. Resence Gemini will parse the ingredients and calculate metrics instantly.
              </p>

              {/* Main Log actions strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Photo Upload Trigger */}
                <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-orange-500 rounded-xl py-5 bg-zinc-950 cursor-pointer transition-colors text-center group">
                  <svg className="w-6 h-6 text-zinc-500 mb-1 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Photo Capture</span>
                  <input
                    type="file"
                    accept="image/*,image/heic,image/heif"
                    onChange={(e) => startProcessingPipeline(e.target.files?.[0])}
                    disabled={pipelineStep !== 'idle' && pipelineStep !== 'done' && pipelineStep !== 'failed'}
                    className="hidden"
                  />
                </label>

                {/* Voice Logger Trigger */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={uploading || isTranscribing}
                  className={`flex flex-col items-center justify-center border border-zinc-800 hover:border-orange-500 rounded-xl py-5 transition-colors text-center cursor-pointer ${
                    isRecording ? 'bg-red-500/10 border-red-500/40 text-red-450' : (isTranscribing ? 'bg-orange-500/5 border-orange-500/40 text-orange-400 animate-pulse' : 'bg-zinc-950')
                  }`}
                >
                  <svg className={`w-6 h-6 mb-1 ${isRecording ? 'text-red-500 animate-pulse' : (isTranscribing ? 'text-orange-550' : 'text-zinc-500')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isTranscribing ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="animate-spin origin-center" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                  </svg>
                  <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">
                    {isRecording ? 'Stop Recording' : (isTranscribing ? 'Transcribing...' : 'Voice Logger')}
                  </span>
                </button>

                {/* Barcode Mock Trigger */}
                <button
                  type="button"
                  onClick={() => setShowBarcode(!showBarcode)}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center border border-zinc-800 hover:border-orange-500 rounded-xl py-5 bg-zinc-950 transition-colors text-center cursor-pointer"
                >
                  <svg className="w-6 h-6 text-zinc-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Barcode Entry</span>
                </button>
              </div>

              {/* Barcode Mock input panel */}
              {showBarcode && (
                <form onSubmit={handleBarcodeSubmit} className="flex gap-2 p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <input
                    type="text"
                    placeholder="Enter 12-digit barcode code..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-550 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-655 text-black text-[9px] font-black px-4 py-2 rounded-xl transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Scan
                  </button>
                </form>
              )}

              {voiceError && (
                <div className="p-3 bg-red-950/10 border border-red-950 rounded-xl text-center text-[10px] text-red-300 font-semibold leading-relaxed">
                  ⚠️ {voiceError}
                </div>
              )}

              {/* 2026 Step Progress indicators (Compress -> Upload -> Analyze -> Done) */}
              {pipelineStep !== 'idle' && (
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3.5">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-zinc-500">Processing Pipeline</span>
                    {pipelineStep === 'failed' && (
                      <span className="text-red-400 animate-pulse">✖ Failed</span>
                    )}
                    {pipelineStep === 'done' && (
                      <span className="text-green-400">✓ Completed</span>
                    )}
                    {pipelineStep !== 'done' && pipelineStep !== 'failed' && (
                      <span className="text-orange-400 animate-pulse">⚡ Running</span>
                    )}
                  </div>

                  {/* Horizontal steps flow visual */}
                  <div className="flex items-center justify-between text-[8px] font-extrabold uppercase tracking-wider text-zinc-500">
                    <div className={`flex flex-col items-center ${pipelineStep === 'compress' ? 'text-orange-400' : (pipelineStep !== 'failed' && pipelineStep !== 'idle' ? 'text-green-400' : '')}`}>
                      <span>[1] Compress</span>
                    </div>
                    <div className="w-5 h-px bg-zinc-900" />
                    <div className={`flex flex-col items-center ${pipelineStep === 'upload' ? 'text-orange-400' : (pipelineStep === 'analyze' || pipelineStep === 'done' ? 'text-green-400' : '')}`}>
                      <span>[2] Upload</span>
                    </div>
                    <div className="w-5 h-px bg-zinc-900" />
                    <div className={`flex flex-col items-center ${pipelineStep === 'analyze' ? 'text-orange-400' : (pipelineStep === 'done' ? 'text-green-400' : '')}`}>
                      <span>[3] Analyze</span>
                    </div>
                    <div className="w-5 h-px bg-zinc-900" />
                    <div className={`flex flex-col items-center ${pipelineStep === 'done' ? 'text-green-400' : ''}`}>
                      <span>[4] Finished</span>
                    </div>
                  </div>

                  {/* Error display with Retry option (P1) */}
                  {pipelineStep === 'failed' && pipelineError && (
                    <div className="p-3 bg-red-950/10 border border-red-950 rounded-xl space-y-2.5 text-center">
                      <p className="text-[10px] text-red-300 font-semibold leading-relaxed">{pipelineError}</p>
                      <div className="flex justify-center gap-2">
                        {retryAction && (
                          <button
                            type="button"
                            onClick={retryAction}
                            className="bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-[9px] px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Retry Step
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setPipelineStep('idle');
                            setPipelineError(null);
                            setPhotoPreview(null);
                          }}
                          className="bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-350 text-[9px] px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fallback list offered immediately on failures (P1) */}
                  {pipelineStep === 'failed' && (
                    <div className="border-t border-zinc-900 pt-3.5 space-y-3">
                      <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Verbal Fallback Entry</span>
                      
                      {/* Search / Voice verbal fallback logs (Fallback 1) */}
                      <div className="flex flex-col gap-2">
                        <textarea
                          placeholder="Or verbally describe your meal details here (e.g. 'I had 150g grilled salmon and a cup of brown rice')"
                          value={voiceInput}
                          onChange={(e) => setVoiceInput(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-2.5 text-[11px] text-white placeholder-zinc-550 focus:outline-none"
                          rows={2}
                        />
                        <button
                          type="button"
                          onClick={() => runTextAnalysis(voiceInput)}
                          disabled={!voiceInput.trim()}
                          className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 text-[9px] font-bold py-2 rounded-xl uppercase tracking-wider disabled:opacity-40 cursor-pointer"
                        >
                          Analyze Text Description
                        </button>
                      </div>

                      {/* Generic templates list (Fallback 3) */}
                      <div className="space-y-2">
                        <span className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Or Use Generic Templates</span>
                        <div className="grid grid-cols-2 gap-2">
                          {GENERIC_TEMPLATES.map((tpl, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => handleSelectTemplate(tpl)}
                              className="bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl text-left text-[10px] transition-colors cursor-pointer"
                            >
                              <strong className="text-zinc-200 block truncate">{tpl.name}</strong>
                              <span className="text-orange-400 font-bold mt-0.5 block">{tpl.calories} kcal | {tpl.protein}g P</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Portion Guidance suggestion */}
              {photoPreview && pipelineStep === 'idle' && (
                <div className="flex items-center gap-3.5 p-3.5 bg-zinc-950/60 border border-zinc-850 rounded-xl text-[10px] text-zinc-500">
                  <span className="text-base">📏</span>
                  <p className="leading-relaxed">
                    <strong>Portion guide:</strong> 1 cup cooked rice ≈ 200g | 1 medium banana ≈ 120g | 1 chicken breast ≈ 150g. For scale, ensure clean angle views.
                  </p>
                </div>
              )}

              {/* Scanned item list results editor */}
              {scannedItems.length > 0 && pipelineStep === 'done' && (
                <div className="space-y-5 pt-4 border-t border-zinc-900 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-550 uppercase font-bold block tracking-wider">Scanned Meal Name</span>
                      <input 
                        type="text"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        className="bg-transparent border-b border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-orange-500 max-w-xs"
                      />
                    </div>
                    <button
                      onClick={handleAddScannedItem}
                      className="text-[9px] text-orange-450 hover:text-orange-500 font-bold uppercase tracking-wider px-3.5 py-1.5 border border-zinc-850 rounded-xl bg-zinc-950 hover:bg-zinc-900 transition-colors cursor-pointer"
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
                        <div key={idx} className="bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 space-y-3.5 transition-all relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
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
                            
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => setEditingItemIdx(isEditing ? null : idx)}
                                className="text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                title="Edit item details"
                              >
                                {isEditing ? '✓ Done' : '✏️ Edit'}
                              </button>
                              <button
                                onClick={() => handleDeleteItem(idx)}
                                className="text-[10px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                title="Delete item"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                            <div>
                              <span className="text-zinc-550 font-bold block mb-1 text-[9px] uppercase tracking-wider">Weight (g)</span>
                              <input
                                type="number"
                                value={item.weight_g || 100}
                                onChange={(e) => handleItemWeightChange(idx, e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-855 rounded-xl px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-orange-500"
                              />
                            </div>
                            <div className="bg-zinc-950/45 p-2 border border-zinc-850 rounded-xl">
                              <span className="text-zinc-550 block text-[9px] uppercase tracking-wider">Calories</span>
                              <span className="font-extrabold text-white mt-0.5 block">{item.calories} kcal</span>
                            </div>
                            <div className="bg-zinc-950/45 p-2 border border-zinc-850 rounded-xl">
                              <span className="text-zinc-550 block text-[9px] uppercase tracking-wider">Protein</span>
                              <span className="font-extrabold text-green-400 mt-0.5 block">{item.protein}g</span>
                            </div>
                            <div className="bg-zinc-950/45 p-2 border border-zinc-850 rounded-xl">
                              <span className="text-zinc-550 block text-[9px] uppercase tracking-wider">Carbs | Fats</span>
                              <span className="font-extrabold text-blue-400 mt-0.5 block">
                                {item.carbs}g | <span className="text-purple-400">{item.fat}g</span>
                              </span>
                            </div>
                          </div>

                          {/* Extra Micro-nutrients list */}
                          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-zinc-900 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            <span>Fiber: <span className="text-zinc-300">{item.fiber}g</span></span>
                            <span>Sodium: <span className="text-zinc-300">{item.sodium}mg</span></span>
                            <span>Sugar: <span className="text-zinc-300">{item.sugar}g</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Smart nudges for hidden ingredients */}
                  {scannedHidden.length > 0 && (
                    <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 space-y-3">
                      <div className="space-y-0.5">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">🔬 Smart hidden nudges</h3>
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Did the chef add cooking oils, butter, or dressing that might not be visible? Toggle to add them:
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {scannedHidden.map((hidden, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleToggleHidden(idx)}
                            className={`text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                              hidden.checked
                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                : 'bg-zinc-900 border-zinc-855 text-zinc-500 hover:text-white'
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
                  <div className="bg-orange-500/5 border border-orange-500/15 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-orange-950/20 pb-2">
                      <span className="text-[10px] font-extrabold text-orange-450 uppercase tracking-widest block">Aggregated Meal totals</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">{scannedItems.length} items logged</span>
                    </div>

                    {scannedHidden.some(h => h.checked) && (
                      <div className="bg-orange-500/10 border border-orange-500/20 p-2.5 rounded-lg text-[9.5px] text-orange-450 font-bold uppercase tracking-wider flex items-center justify-between animate-in slide-in-from-top-1 duration-200">
                        <span>⚡ Adjusted for: {scannedHidden.filter(h => h.checked).map(h => h.name).join(', ')}</span>
                        <span className="text-[8px] bg-orange-950/40 px-1.5 py-0.5 rounded text-orange-300 border border-orange-900/50">Active</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Calories</span>
                        <span className="font-extrabold text-white text-sm">{scannedTotals.calories} kcal</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Protein</span>
                        <span className="font-extrabold text-green-400 text-sm">{scannedTotals.protein}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Carbs</span>
                        <span className="font-extrabold text-blue-400 text-sm">{scannedTotals.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Fats</span>
                        <span className="font-extrabold text-purple-400 text-sm">{scannedTotals.fat}g</span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-850 pt-2.5 flex justify-around text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span>Fiber: {scannedTotals.fiber}g</span>
                      <span>Sodium: {scannedTotals.sodium}mg</span>
                      <span>Sugar: {scannedTotals.sugar}g</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleDiscardScannedMeal}
                        className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-700 text-zinc-300 text-[10px] font-bold py-3 px-4 rounded-xl transition-colors flex-1 cursor-pointer uppercase tracking-wider text-center"
                      >
                        Discard / Try Again
                      </button>
                      <button
                        onClick={handleSaveScannedMeal}
                        className="bg-orange-500 hover:bg-orange-605 text-black text-[10px] font-black py-3 px-4 rounded-xl transition-colors flex-1 cursor-pointer uppercase tracking-wider text-center"
                      >
                        Add to Today's Log
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Todays Meal Logs */}
            <div className="stripe-card p-6 space-y-4">
              <div className="pb-3 border-b border-zinc-900">
                <h2 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Today's Logs</h2>
              </div>
              {dietLogs.length === 0 ? (
                <p className="text-xs text-zinc-550 italic">No food logged yet today. Use the photo scanner or manual log form.</p>
              ) : (
                <div className="space-y-3">
                  {dietLogs.map((log, idx) => {
                    const cleanName = log.meal_name.split('|||')[0];
                    return (
                      <div key={idx} className="bg-zinc-950 border border-zinc-855 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 min-w-0">
                          {log.photo_url && (
                            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-850 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              <img src={log.photo_url} alt={cleanName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center flex-wrap gap-1.5 mb-1">
                              <span className="text-[9px] bg-zinc-900 text-zinc-500 border border-zinc-850 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {log.meal_type}
                              </span>
                            </div>
                            <strong className="text-xs text-white font-bold block truncate">{cleanName}</strong>
                            <div className="text-[10px] text-zinc-500 mt-0.5 uppercase font-bold tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                              P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-orange-400 font-bold flex-shrink-0">{log.calories} kcal</span>
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
              <div className="stripe-card p-6 space-y-6">
                <div className="pb-3 border-b border-zinc-900">
                  <h2 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">AI Suggested Meals</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest block">Breakfast</span>
                    <p className="text-xs text-zinc-350 mt-1 leading-relaxed">{dietPlan.plan_data.meal_suggestions.breakfast}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest block">Lunch</span>
                    <p className="text-xs text-zinc-350 mt-1 leading-relaxed">{dietPlan.plan_data.meal_suggestions.lunch}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest block">Dinner</span>
                    <p className="text-xs text-zinc-350 mt-1 leading-relaxed">{dietPlan.plan_data.meal_suggestions.dinner}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest block">Snacks & Supps</span>
                    <p className="text-xs text-zinc-350 mt-1 leading-relaxed">{dietPlan.plan_data.meal_suggestions.snack}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Frequent logged foods quick list */}
            {frequentFoods.length > 0 && (
              <div className="stripe-card p-6 space-y-4">
                <div className="pb-3 border-b border-zinc-900">
                  <h2 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Frequent Foods</h2>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {frequentFoods.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectFrequent(item)}
                      className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 p-3 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <strong className="text-white block font-medium truncate max-w-[130px]">{item.name}</strong>
                        <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider">{item.protein || 0}g protein | {item.carbs || 0}g carbs</span>
                      </div>
                      <span className="text-orange-400 font-bold">{item.calories} kcal</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Form Button/Form */}
            <div className="stripe-card p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Log Meal Manually</h2>
                <button
                  type="button"
                  onClick={() => setManualFormOpen(!manualFormOpen)}
                  className="text-[10px] uppercase font-bold tracking-wider text-orange-500 hover:text-orange-600 cursor-pointer"
                >
                  {manualFormOpen ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {manualFormOpen && (
                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-zinc-900 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-[9px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Meal Type</label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {MEAL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Meal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Scrambled Eggs with Avocado"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Calories (kcal)</label>
                      <input
                        type="number"
                        placeholder="e.g. 450"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Protein (g)</label>
                      <input
                        type="number"
                        placeholder="e.g. 25"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Carbs (g)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Fats (g)</label>
                      <input
                        type="number"
                        placeholder="e.g. 12"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Expanded optional micro-nutrients manual fields */}
                  <div className="pt-3 border-t border-zinc-900 space-y-3">
                    <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Optional Micro-nutrients</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[8px] text-zinc-550 uppercase font-bold mb-1">Fiber (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={fiber}
                          onChange={(e) => setFiber(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-855 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-zinc-555 uppercase font-bold mb-1">Sodium (mg)</label>
                        <input
                          type="number"
                          value={sodium}
                          onChange={(e) => setSodium(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-855 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-zinc-555 uppercase font-bold mb-1">Sugar (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={sugar}
                          onChange={(e) => setSugar(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-855 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-200 text-[10px] font-black py-3 rounded-xl transition-colors cursor-pointer uppercase tracking-wider active:scale-95"
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
