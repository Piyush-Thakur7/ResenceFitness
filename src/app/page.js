'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import WorkoutSection from '@/components/WorkoutSection';
import DietSection from '@/components/DietSection';
import SleepSection from '@/components/SleepSection';
import BodyAssessmentSection from '@/components/BodyAssessmentSection';
import ProgressSection from '@/components/ProgressSection';

const LOGO_OPTIONS = [
  { id: 'logo_1', title: 'Option 1: Stylized "R" Mark', path: '/logos/logo_1.jpg', desc: 'Modern energy swoosh forming the letter "R" with orange and green gradients.' },
  { id: 'logo_2', title: 'Option 2: Rising Upward Swoosh', path: '/logos/logo_2.jpg', desc: 'Abstract geometric shape of rising bars/swoosh representing growth.' },
  { id: 'logo_3', title: 'Option 3: Lime Green Energy Wave', path: '/logos/logo_3.jpg', desc: 'Minimalist vector energy wave signifying vitality and motion.' },
  { id: 'logo_4', title: 'Option 4: Combined R + Growth Arrow', path: '/logos/logo_4.jpg', desc: 'Sleek geometric emblem combining the letter "R" with an upward-pointing arrow.' },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // App navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App datasets
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [dietPlan, setDietPlan] = useState(null);
  const [dietLogs, setDietLogs] = useState([]);
  const [sleepLog, setSleepLog] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [streak, setStreak] = useState({ current_streak: 0, weekly_progress: [false, false, false, false, false, false, false] });
  
  // Brand selection
  const [selectedLogoId, setSelectedLogoId] = useState('logo_1');

  // Modes & UI loaders
  const [demoMode, setDemoMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  // 1. Detect Demo Mode based on env placeholders
  useEffect(() => {
    const isMockUrl =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project');
    const isMockKey =
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder-anon-key');

    if (isMockUrl || isMockKey) {
      setDemoMode(true);
      console.log('Resence Fitness: Running in Demo Mode (Mock data fallback).');
    }
  }, []);

  // 2. Auth Session Management
  useEffect(() => {
    if (demoMode) {
      // Check local storage for mock session
      const storedSession = localStorage.getItem('resence_mock_session');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
        loadMockUserData(parsed.user.id);
      } else {
        setLoading(false);
      }
      return;
    }

    // Live Supabase session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        loadLiveUserData(s.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        loadLiveUserData(s.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [demoMode]);

  // Load live DB data
  const loadLiveUserData = async (userId) => {
    try {
      setLoading(true);
      
      // Fetch profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profErr && profErr.code !== 'PGRST116') throw profErr;
      
      if (prof) {
        setProfile(prof);
        await refreshUserData(userId);
      }
    } catch (err) {
      console.error('Error loading live user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh live variables
  const refreshUserData = async (userId) => {
    if (demoMode) return;
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Fetch plans
    const { data: wPlan } = await supabase.from('workout_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
    const { data: dPlan } = await supabase.from('diet_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
    
    // 2. Fetch logs
    const { data: wLogs } = await supabase.from('workout_logs').select('*').eq('user_id', userId).eq('date', todayStr);
    const { data: dLogs } = await supabase.from('diet_logs').select('*').eq('user_id', userId).eq('date', todayStr);
    const { data: sLog } = await supabase.from('sleep_logs').select('*').eq('user_id', userId).eq('date', todayStr).single();
    const { data: wHist } = await supabase.from('weight_history').select('*').eq('user_id', userId).order('logged_at', { ascending: true });
    const { data: bAssess } = await supabase.from('body_assessments').select('*').eq('user_id', userId).order('date', { ascending: false });
    const { data: stk } = await supabase.from('streaks').select('*').eq('user_id', userId).single();

    if (wPlan?.[0]) setWorkoutPlan(wPlan[0]);
    if (dPlan?.[0]) setDietPlan(dPlan[0]);
    if (wLogs) setWorkoutLogs(wLogs);
    if (dLogs) setDietLogs(dLogs);
    if (sLog) setSleepLog(sLog);
    if (wHist) setWeightHistory(wHist);
    if (bAssess) setAssessments(bAssess);
    if (stk) setStreak(stk);
  };

  // Load mock data
  const loadMockUserData = (userId) => {
    setLoading(true);
    const storedProfile = localStorage.getItem(`mock_prof_${userId}`);
    if (storedProfile) {
      const parsedProf = JSON.parse(storedProfile);
      setProfile(parsedProf);

      // Load mock items
      setWorkoutPlan(JSON.parse(localStorage.getItem(`mock_wplan_${userId}`)));
      setDietPlan(JSON.parse(localStorage.getItem(`mock_dplan_${userId}`)));
      setWorkoutLogs(JSON.parse(localStorage.getItem(`mock_wlogs_${userId}`)) || []);
      setDietLogs(JSON.parse(localStorage.getItem(`mock_dlogs_${userId}`)) || []);
      setSleepLog(JSON.parse(localStorage.getItem(`mock_slog_${userId}`)) || null);
      setWeightHistory(JSON.parse(localStorage.getItem(`mock_whist_${userId}`)) || []);
      setAssessments(JSON.parse(localStorage.getItem(`mock_assess_${userId}`)) || []);
      setStreak(JSON.parse(localStorage.getItem(`mock_streak_${userId}`)) || { current_streak: 1, weekly_progress: [true, false, false, false, false, false, false] });
    }
    setLoading(false);
  };

  // 3. User Authentication actions
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    if (demoMode) {
      // Mock login immediate success
      const mockId = 'mock-user-id-999';
      const mockSession = {
        access_token: 'mock-token',
        user: { id: mockId, email: authEmail },
      };
      localStorage.setItem('resence_mock_session', JSON.stringify(mockSession));
      setSession(mockSession);
      loadMockUserData(mockId);
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { full_name: authName },
          },
        });
        if (error) throw error;
        alert('Verification email sent! Check your inbox or log in if auto-confirmed.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (demoMode) {
      localStorage.removeItem('resence_mock_session');
      setSession(null);
      setProfile(null);
      return;
    }
    supabase.auth.signOut();
  };

  // 4. Onboarding complete handler
  const handleOnboardingComplete = async (profileData) => {
    if (demoMode) {
      const updatedProf = { ...profileData, full_name: authName || 'Champion' };
      localStorage.setItem(`mock_prof_${profileData.id}`, JSON.stringify(updatedProf));
      setProfile(updatedProf);
      
      // Initialize mock Weight History
      const initialHist = [{ weight: profileData.weight, height: profileData.height, logged_at: new Date().toISOString().split('T')[0] }];
      localStorage.setItem(`mock_whist_${profileData.id}`, JSON.stringify(initialHist));
      setWeightHistory(initialHist);
      return;
    }

    try {
      // Upsert profile
      const updatedProf = { ...profileData, full_name: session.user.user_metadata?.full_name || 'Champion' };
      const { error } = await supabase.from('profiles').upsert(updatedProf);
      if (error) throw error;

      // Log initial weight history
      await supabase.from('weight_history').insert({
        user_id: profileData.id,
        weight: profileData.weight,
        height: profileData.height,
      });

      setProfile(updatedProf);
      await refreshUserData(profileData.id);
    } catch (err) {
      console.error('Error during onboarding:', err);
      alert('Onboarding failed: ' + err.message);
    }
  };

  // 5. Workout exercise toggle
  const handleToggleExercise = async (exerciseName, completed) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = session.user.id;

    if (demoMode) {
      let updatedLogs = [...workoutLogs];
      if (completed) {
        updatedLogs.push({ date: todayStr, exercise_name: exerciseName, completed: true });
      } else {
        updatedLogs = updatedLogs.filter(log => !(log.exercise_name === exerciseName && log.date === todayStr));
      }
      localStorage.setItem(`mock_wlogs_${userId}`, JSON.stringify(updatedLogs));
      setWorkoutLogs(updatedLogs);

      // Simple mock streak calculations
      updateMockStreak(completed);
      return;
    }

    try {
      if (completed) {
        await supabase.from('workout_logs').insert({
          user_id: userId,
          date: todayStr,
          exercise_name: exerciseName,
          completed: true,
        });
      } else {
        await supabase.from('workout_logs').delete().eq('user_id', userId).eq('date', todayStr).eq('exercise_name', exerciseName);
      }
      await refreshUserData(userId);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to adjust streak inside demo mode
  const updateMockStreak = (completed) => {
    const userId = session.user.id;
    const currentDayIdx = new Date().getDay(); // 0 is Sun, 1 is Mon etc.
    const mappedIdx = currentDayIdx === 0 ? 6 : currentDayIdx - 1; // Map Sunday to last element

    let updatedStreak = { ...streak };
    updatedStreak.weekly_progress[mappedIdx] = completed;
    
    // Count days completed
    const completedCount = updatedStreak.weekly_progress.filter(Boolean).length;
    updatedStreak.current_streak = completed ? Math.max(1, updatedStreak.current_streak + 1) : Math.max(0, updatedStreak.current_streak - 1);
    
    localStorage.setItem(`mock_streak_${userId}`, JSON.stringify(updatedStreak));
    setStreak(updatedStreak);
  };

  // 6. Generate Workout / Diet Plan
  const handleGeneratePlan = async (type) => {
    setActionLoading(true);
    const userId = session.user.id;

    if (demoMode) {
      // Generate realistic mock plans based on profile parameters
      setTimeout(() => {
        if (type === 'workout') {
          const wPlan = getMockWorkoutPlan(profile);
          const wPlanRecord = { id: 'mock-wplan', user_id: userId, plan_data: wPlan, created_at: new Date().toISOString() };
          localStorage.setItem(`mock_wplan_${userId}`, JSON.stringify(wPlanRecord));
          setWorkoutPlan(wPlanRecord);
        } else {
          const dPlan = getMockDietPlan(profile);
          const dPlanRecord = { id: 'mock-dplan', user_id: userId, plan_data: dPlan, created_at: new Date().toISOString() };
          localStorage.setItem(`mock_dplan_${userId}`, JSON.stringify(dPlanRecord));
          setDietPlan(dPlanRecord);
        }
        setActionLoading(false);
      }, 1000);
      return;
    }

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          assessmentReport: assessments[0]?.assessment_report || '',
          type,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (type === 'workout') {
        const { error } = await supabase.from('workout_plans').insert({
          user_id: userId,
          week_start_date: new Date().toISOString().split('T')[0],
          plan_data: data,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('diet_plans').insert({
          user_id: userId,
          week_start_date: new Date().toISOString().split('T')[0],
          plan_data: data,
        });
        if (error) throw error;
      }
      await refreshUserData(userId);
    } catch (err) {
      alert('Plan generation failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Log Meal
  const handleLogMeal = async (mealData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = session.user.id;

    if (demoMode) {
      const newLog = { ...mealData, date: todayStr, id: `mock-meal-${Date.now()}` };
      const updated = [...dietLogs, newLog];
      localStorage.setItem(`mock_dlogs_${userId}`, JSON.stringify(updated));
      setDietLogs(updated);
      return;
    }

    try {
      const { error } = await supabase.from('diet_logs').insert({
        user_id: userId,
        date: todayStr,
        ...mealData,
      });
      if (error) throw error;
      await refreshUserData(userId);
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Analyze Food photo
  const handleAnalyzeFoodPhoto = async (base64Data, mimeType) => {
    if (demoMode) {
      // Mock recognition
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockMealMap = {
            Veg: { meal_name: 'Avocado Quinoa Salad', calories: 420, protein: 12, carbs: 46, fat: 20 },
            Vegan: { meal_name: 'Tofu Broccoli Stir Fry', calories: 380, protein: 18, carbs: 32, fat: 14 },
            Eggetarian: { meal_name: 'Feta Veggie Omelet', calories: 410, protein: 24, carbs: 8, fat: 31 },
            'Non-Veg': { meal_name: 'Grilled Salmon with Brown Rice', calories: 540, protein: 36, carbs: 42, fat: 18 },
          };
          resolve(mockMealMap[profile.diet_preference] || mockMealMap['Non-Veg']);
        }, 1200);
      });
    }

    const res = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data, mimeType }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  };

  // 9. Log Sleep
  const handleLogSleep = async (sleepData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = session.user.id;

    if (demoMode) {
      const record = { ...sleepData, date: todayStr };
      localStorage.setItem(`mock_slog_${userId}`, JSON.stringify(record));
      setSleepLog(record);
      return;
    }

    try {
      const { error } = await supabase.from('sleep_logs').upsert({
        user_id: userId,
        date: todayStr,
        ...sleepData,
      });
      if (error) throw error;
      await refreshUserData(userId);
    } catch (err) {
      console.error(err);
    }
  };

  // 10. Upload photos & assessment
  const handleUploadAndAssess = async (base64Images, fileNames) => {
    setActionLoading(true);
    const userId = session.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    if (demoMode) {
      setTimeout(() => {
        // Return Mock Assessment
        const report = getMockBodyAssessment(profile);
        const urls = fileNames.map(name => `/logos/logo_1.jpg`); // Mock photo URLs
        
        const newRecord = {
          id: `mock-assess-${Date.now()}`,
          date: todayStr,
          photo_urls: urls,
          assessment_report: report,
        };
        const updated = [newRecord, ...assessments];
        localStorage.setItem(`mock_assess_${userId}`, JSON.stringify(updated));
        setAssessments(updated);
        setActionLoading(false);
      }, 1500);
      return;
    }

    try {
      // 1. Upload photos to Supabase Storage
      const uploadedUrls = [];
      for (let i = 0; i < base64Images.length; i++) {
        const base64 = base64Images[i];
        const fileName = `${userId}/${Date.now()}_${i}.jpg`;
        
        // Convert to blob
        const binary = atob(base64);
        const array = [];
        for (let j = 0; j < binary.length; j++) {
          array.push(binary.charCodeAt(j));
        }
        const blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('body-photos')
          .upload(fileName, blob, { contentType: 'image/jpeg' });

        if (uploadErr) throw uploadErr;

        // Get public or signed URL
        const { data: { publicUrl } } = supabase.storage
          .from('body-photos')
          .getPublicUrl(uploadData.path);
        
        uploadedUrls.push(publicUrl);
      }

      // 2. Call Gemini API
      const res = await fetch('/api/analyze-body', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: base64Images,
          profile,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // 3. Write report to assessments table
      const { error: dbErr } = await supabase.from('body_assessments').insert({
        user_id: userId,
        date: todayStr,
        photo_urls: uploadedUrls,
        assessment_report: data.report,
      });

      if (dbErr) throw dbErr;
      await refreshUserData(userId);
    } catch (err) {
      alert('Critique generation failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 11. Update Weight/Height metrics
  const handleUpdateMetrics = async (newMetrics) => {
    const userId = session.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedProfile = {
      ...profile,
      weight: newMetrics.weight,
      height: newMetrics.height,
    };

    if (demoMode) {
      localStorage.setItem(`mock_prof_${userId}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      // Log to history
      const newHistoryLog = { weight: newMetrics.weight, height: newMetrics.height, logged_at: todayStr };
      const updatedHist = [...weightHistory, newHistoryLog];
      localStorage.setItem(`mock_whist_${userId}`, JSON.stringify(updatedHist));
      setWeightHistory(updatedHist);
      return;
    }

    try {
      // Update profile
      await supabase.from('profiles').update({
        weight: newMetrics.weight,
        height: newMetrics.height,
      }).eq('id', userId);

      // Insert weight history log
      await supabase.from('weight_history').insert({
        user_id: userId,
        weight: newMetrics.weight,
        height: newMetrics.height,
      });

      setProfile(updatedProfile);
      await refreshUserData(userId);
    } catch (err) {
      console.error(err);
    }
  };

  // 12. Branding update
  const handleChooseLogo = (logoId) => {
    setSelectedLogoId(logoId);
  };

  // Get active logo details
  const activeLogo = LOGO_OPTIONS.find(l => l.id === selectedLogoId) || LOGO_OPTIONS[0];

  // Loader View
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-white">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full animate-spin text-orange-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-wider text-zinc-400 mt-4 animate-pulse">
          LACING RESENCE BASELINE...
        </span>
      </div>
    );
  }

  // Auth Screen View
  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-xl relative overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800 shadow-md">
              <span className="text-2xl font-black text-white">R</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Resence Fitness</h1>
            <p className="text-zinc-400 text-xs mt-1">Adaptive AI workout, nutrition & recovery client.</p>
          </div>

          {authError && (
            <div className="p-3 bg-red-950 border border-red-900 text-red-300 text-xs rounded-lg text-center">
              {authError}
            </div>
          )}

          {demoMode && (
            <div className="p-3 bg-orange-950/20 border border-orange-900/50 text-orange-400 text-[11px] rounded-lg text-center leading-relaxed">
              ⚡ Demo mode activated. Use any email and password to sign in immediately without checking live databases.
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Carter"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase font-bold mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              {isSignUp ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-zinc-400 hover:text-orange-500 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding View
  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white py-12 px-4">
        <Onboarding user={session.user} onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Full Dashboard Application View
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Banner Alert when in Demo Mode */}
      {demoMode && (
        <div className="bg-orange-500/10 border-b border-orange-950 text-orange-400 py-1.5 px-4 text-[10px] text-center font-medium tracking-wide">
          ⚠️ RUNNING IN LOCAL DEMONSTRATION MODE. TO CONNECT LIVE CLOUD GENERATION, ADD CREDENTIALS TO .ENV.LOCAL
        </div>
      )}

      {/* Navbar Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          {/* Chosen Logo icon mark */}
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
            <img src={activeLogo.path} alt="Active Resence Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white block">Resence Fitness</span>
            <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-widest mt-0.5">Gemini 3.5 Client</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-zinc-400 hover:text-red-400 font-semibold px-3 py-1.5 border border-zinc-800 hover:border-red-950 rounded-lg transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </header>

      {/* Main layout containing Sidebar navigation and tabs content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-zinc-900/60 border-b md:border-b-0 md:border-r border-zinc-800 p-4 space-y-2 md:space-y-4">
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z M14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
              { id: 'workout', label: 'Workout Plan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { id: 'diet', label: 'Nutrition & Diet', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z' },
              { id: 'sleep', label: 'Sleep Logs', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
              { id: 'body', label: 'AI Assessment', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
              { id: 'progress', label: 'Stats & Branding', icon: 'M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap md:w-full ${active ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/10' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full relative overflow-y-auto">
          {actionLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 rounded-2xl">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center space-x-3 shadow-lg">
                <svg className="animate-spin h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs text-white font-semibold tracking-wide animate-pulse uppercase">AI generation active...</span>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              profile={profile}
              streak={streak}
              workoutPlan={workoutPlan}
              todayWorkoutLog={workoutLogs}
              dietLogs={dietLogs}
              dietPlan={dietPlan}
              sleepLog={sleepLog}
            />
          )}

          {activeTab === 'workout' && (
            <WorkoutSection
              profile={profile}
              workoutPlan={workoutPlan}
              workoutLogs={workoutLogs}
              onToggleExercise={handleToggleExercise}
              onGeneratePlan={() => handleGeneratePlan('workout')}
              loading={actionLoading}
            />
          )}

          {activeTab === 'diet' && (
            <DietSection
              profile={profile}
              dietPlan={dietPlan}
              dietLogs={dietLogs}
              onLogMeal={handleLogMeal}
              onGeneratePlan={() => handleGeneratePlan('diet')}
              onAnalyzeMealPhoto={handleAnalyzeFoodPhoto}
              loadingPlan={actionLoading}
            />
          )}

          {activeTab === 'sleep' && (
            <SleepSection
              profile={profile}
              sleepLog={sleepLog}
              onLogSleep={handleLogSleep}
            />
          )}

          {activeTab === 'body' && (
            <BodyAssessmentSection
              profile={profile}
              assessments={assessments}
              onUploadAndAssess={handleUploadAndAssess}
              loading={actionLoading}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressSection
              profile={profile}
              weightHistory={weightHistory}
              assessments={assessments}
              onUpdateMetrics={handleUpdateMetrics}
              onChooseLogo={handleChooseLogo}
              selectedLogoId={selectedLogoId}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// =========================================================================
// MOCK PLAN GENERATORS (Fallback for offline/no-keys demonstration)
// =========================================================================

function getMockWorkoutPlan(profile) {
  const isKneeIssue = (profile.injuries || '').toLowerCase().includes('knee');
  const addBoxing = profile.boxing_or_martial_arts;
  
  const mondayGym = [
    { name: 'Incline Dumbbell Press', muscle: 'Chest', sets: 4, reps: '8-12', notes: 'Keep elbows tucked at a 45-degree angle.' },
    { name: 'Flat Barbell Bench Press', muscle: 'Chest', sets: 3, reps: '8-10', notes: 'Control the eccentric phase down to chest.' },
    { name: 'Overhead Cable Tricep Extension', muscle: 'Triceps', sets: 3, reps: '12-15', notes: 'Flare lats for stability.' },
  ];

  const tuesdayGym = [
    { name: 'Lat Pulldown (Wide Grip)', muscle: 'Back', sets: 4, reps: '10-12', notes: 'Squeeze shoulder blades down and back.' },
    { name: 'Single-Arm Dumbbell Row', muscle: 'Back', sets: 3, reps: '8-10', notes: 'Pull toward hip rather than shoulder.' },
    { name: 'Incline Dumbbell Bicep Curl', muscle: 'Biceps', sets: 3, reps: '12', notes: 'Keep elbows pinned behind torso.' },
  ];

  const WednesdayGym = isKneeIssue ? [
    { name: 'Stretching & Core recovery drills', muscle: 'Core', sets: 3, reps: '30s hold', notes: 'Low impact planks and bird-dogs to recover legs/joints.' },
  ] : [
    { name: 'Leg Extensions (Quad focus)', muscle: 'Quads', sets: 4, reps: '12-15', notes: 'Squeeze hard at the peak contraction.' },
    { name: 'Seated Leg Curl (Hamstrings)', muscle: 'Hamstrings', sets: 3, reps: '10-12', notes: 'Keep toes flexed forward.' },
  ];

  // Adjust boxing day
  const saturdayExercises = addBoxing ? [
    { name: 'Heavy Bag Conditioning Rounds', muscle: 'Shoulders & Core', sets: 5, reps: '3 mins', notes: 'Combine jabs, hooks, and footwork drills.' },
    { name: 'Shadow Boxing with Light Dumbbells', muscle: 'Shoulders', sets: 3, reps: '2 mins', notes: 'Keep speed fast but punches controlled.' },
  ] : [
    { name: 'Standing Dumbbell Shoulder Press', muscle: 'Shoulders', sets: 4, reps: '8-10', notes: 'Do not lock out elbows at top.' },
    { name: 'Lateral Raises', muscle: 'Shoulders', sets: 3, reps: '15', notes: 'Lead with elbows, pinkies slightly up.' },
  ];

  return {
    recovery_notes: isKneeIssue 
      ? '⚠️ Plan adapted for knee limitation. High-impact squats/lunges omitted. Running split replaced by walking.'
      : 'Weekly plan cycles push/pull/legs. Tuesday/Wednesday consecutive training resolved by introducing lower-intensity shoulder conditioning.',
    days: {
      monday: {
        muscle_group: 'Chest & Triceps',
        is_rest: false,
        gym_duration_minutes: 45,
        running: { distance_km: 3, chunks: '3 x 1km', instructions: 'Rest 90 seconds between each 1km rep.' },
        exercises: mondayGym,
      },
      tuesday: {
        muscle_group: 'Back & Biceps',
        is_rest: false,
        gym_duration_minutes: 45,
        running: { distance_km: 3, chunks: '1.5km x 2', instructions: 'Moderate pacing, rest 3 mins between intervals.' },
        exercises: tuesdayGym,
      },
      wednesday: {
        muscle_group: isKneeIssue ? 'Active Stretch Recovery' : 'Legs & Calves',
        is_rest: isKneeIssue,
        gym_duration_minutes: isKneeIssue ? 20 : 45,
        running: isKneeIssue 
          ? { distance_km: 2, chunks: '2km walk', instructions: 'Continuous low-impact recovery walk.' }
          : { distance_km: 3, chunks: '3km steady', instructions: 'Zone 2 aerobic recovery run.' },
        exercises: WednesdayGym,
      },
      thursday: {
        muscle_group: 'Shoulders & Core',
        is_rest: false,
        gym_duration_minutes: 45,
        running: { distance_km: 3, chunks: '3 x 1km', instructions: 'Rest 90 seconds between runs.' },
        exercises: [
          { name: 'Military Press', muscle: 'Shoulders', sets: 4, reps: '8-10', notes: 'Keep core tight.' },
          { name: 'Hanging Leg Raise', muscle: 'Core', sets: 3, reps: '12', notes: 'Slow negatives.' },
        ],
      },
      friday: {
        muscle_group: 'Arms & Conditioning',
        is_rest: false,
        gym_duration_minutes: 40,
        running: { distance_km: 3, chunks: '3km steady', instructions: 'Continuous tempo run.' },
        exercises: [
          { name: 'Tricep Rope Pushdowns', muscle: 'Triceps', sets: 3, reps: '15', notes: 'Hold lockout for 1s.' },
          { name: 'Hammer Curls', muscle: 'Biceps', sets: 3, reps: '12', notes: 'Control lower.' },
        ],
      },
      saturday: {
        muscle_group: addBoxing ? 'Boxing Drills & Conditioning' : 'Shoulders Focus',
        is_rest: false,
        gym_duration_minutes: 45,
        running: { distance_km: 2, chunks: '1km x 2 sprint', instructions: 'High intensity sprints, 2 mins rest.' },
        exercises: saturdayExercises,
      },
      sunday: {
        is_rest: true,
        notes: 'Full recovery day. Hydrate, perform passive foam rolling, and rest.',
      },
    },
  };
}

function getMockDietPlan(profile) {
  const isVeg = ['Veg', 'Vegan'].includes(profile.diet_preference);
  const isBulky = profile.fitness_goal === 'Bulky';
  const isLean = profile.fitness_goal === 'Lean';

  let targets = { calories: 2200, protein: 130, carbs: 250, fat: 70 };
  if (isBulky) {
    targets = { calories: 2900, protein: 170, carbs: 360, fat: 90 };
  } else if (isLean) {
    targets = { calories: 1750, protein: 145, carbs: 160, fat: 50 };
  }

  const vegMeals = {
    breakfast: 'Oatmeal (80g) made with unsweetened almond milk, scoop of soy protein isolate, 1tbsp almond butter, and 50g blueberries. (Est: 430 kcal, 32g protein)',
    lunch: 'Quinoa bowl (100g cooked) with air-fried firm tofu (150g), steamed broccoli, half avocado, and lemon tahini dressing. (Est: 560 kcal, 28g protein)',
    dinner: 'Lentil spaghetti with high-protein marinara sauce, mushrooms, spinach, and 2tbsp nutritional yeast. (Est: 610 kcal, 34g protein)',
    snack: 'Mixed raw almonds (30g) + 1 cup soy milk or protein shake. (Est: 250 kcal, 26g protein)',
  };

  const nonVegMeals = {
    breakfast: '3 whole eggs + 3 egg whites scrambled, 2 slices whole wheat toast, half avocado. (Est: 490 kcal, 36g protein)',
    lunch: 'Grilled chicken breast (150g) with jasmine rice (150g cooked), roasted asparagus, and 1tbsp olive oil. (Est: 580 kcal, 44g protein)',
    dinner: 'Pan-seared salmon fillet (150g) with sweet potato mash (150g), steamed spinach, and garlic butter. (Est: 640 kcal, 38g protein)',
    snack: 'Whey protein shake (1 scoop) with Greek yogurt (150g) and honey. (Est: 260 kcal, 30g protein)',
  };

  return {
    daily_targets: targets,
    meal_suggestions: isVeg ? vegMeals : nonVegMeals,
  };
}

function getMockBodyAssessment(profile) {
  return `
### AI Physique Assessment Report
**Status Profile**: Height ${profile.height} cm | Weight ${profile.weight} kg | Goal: **${profile.fitness_goal}**

1. **Current Physique Estimate**:
   - Visual balance indicates a solid baseline framework.
   - Body fat appears estimated around a healthy range. Moderate muscular foundation detected in core and upper chest lines.
   
2. **Gaps to Goal State (${profile.fitness_goal})**:
   ${profile.fitness_goal === 'Bulky' ? `
   - To build significant muscle bulk, a consistent caloric surplus (+300-500 kcal above maintenance) is needed alongside high-tension lifting (8-12 rep range).
   - Prioritize progressive overload in compound moves (chest bench, shoulder presses, back rows).
   ` : ''}
   ${profile.fitness_goal === 'Lean' ? `
   - Achieving lean definition requires preserving active lean tissue while running a mild caloric deficit (-300-500 kcal).
   - Ensure protein stays high (1.8g+ per kg) to protect fibers during fat oxidation.
   ` : ''}
   ${profile.fitness_goal !== 'Bulky' && profile.fitness_goal !== 'Lean' ? `
   - Focus on improving functional work capacity. Speed running, conditioning drills, and core stability are the primary vectors.
   - Core and joint stability will reduce overall injury risk and enhance postural alignment.
   ` : ''}

3. **Recommended Focus Areas**:
   - **Posterior Chain**: Focus on lats and hamstrings to build posture alignment.
   - **Core Integration**: Keep abdominal walls active during military press and runs to preserve lower-back load capacity.
   - **Adaptive Running**: Split cardio runs into interval chunks as programmed to preserve glycogen load for heavy lifting.
  `;
}
