'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import WorkoutSection from '@/components/WorkoutSection';
import DietSection from '@/components/DietSection';
import SleepSection from '@/components/SleepSection';
import BodyAssessmentSection from '@/components/BodyAssessmentSection';
import MuscleExplorer from '@/components/MuscleExplorer';
import AICoachSection from '@/components/AICoachSection';
import SettingsSection from '@/components/SettingsSection';

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // App navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App datasets
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [dietPlan, setDietPlan] = useState(null);
  const [dietLogs, setDietLogs] = useState([]);
  const [sleepLog, setSleepLog] = useState(null);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [streak, setStreak] = useState({ current_streak: 0, weekly_progress: [false, false, false, false, false, false, false] });
  
  // Brand selection
  const [selectedLogoId, setSelectedLogoId] = useState('logo_1');

  // Modes & UI loaders
  const [demoMode, setDemoMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project') ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-project');
    const isMockKey =
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder-anon-key') ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-supabase-anon-key');

    if (isMockUrl || isMockKey) {
      setDemoMode(true);
      console.log('Resence Fitness: Running in Demo Mode (Mock data fallback).');
    }
  }, []);

  // Safety Liveness Timeout to prevent permanent stuck loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Resence: Liveness timeout triggered. Force resolving loading state.');
        setLoading(false);
      }
    }, 4000); // 4.0 seconds safety net
    return () => clearTimeout(timer);
  }, [loading]);

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
    }).catch(err => {
      console.error('Supabase getSession failed:', err);
      setLoading(false);
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
    const { data: sLogs } = await supabase.from('sleep_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10);
    const { data: wHist } = await supabase.from('weight_history').select('*').eq('user_id', userId).order('logged_at', { ascending: true });
    const { data: bAssess } = await supabase.from('body_assessments').select('*').eq('user_id', userId).order('date', { ascending: false });
    const { data: stk } = await supabase.from('streaks').select('*').eq('user_id', userId).single();

    if (wPlan?.[0]) setWorkoutPlan(wPlan[0]);
    if (dPlan?.[0]) setDietPlan(dPlan[0]);
    if (wLogs) setWorkoutLogs(wLogs);
    if (dLogs) setDietLogs(dLogs);
    if (sLog) setSleepLog(sLog);
    if (sLogs) setSleepLogs(sLogs);
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
      setSleepLogs(JSON.parse(localStorage.getItem(`mock_slogs_${userId}`)) || []);
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
      // Mock login immediate success with email-derived unique ID to preserve logins
      const mockId = 'mock-' + btoa(authEmail.toLowerCase().trim()).replace(/=/g, '').substring(0, 16);
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

  // 4b. Update profile handler from Settings
  const handleUpdateProfile = async (updatedData) => {
    const userId = session.user.id;
    if (demoMode) {
      const mergedProf = { ...profile, ...updatedData };
      localStorage.setItem(`mock_prof_${userId}`, JSON.stringify(mergedProf));
      
      // Update mock weight history if weight changed
      if (updatedData.weight !== profile.weight) {
        const hist = [...weightHistory, { weight: updatedData.weight, height: updatedData.height, logged_at: new Date().toISOString().split('T')[0] }];
        localStorage.setItem(`mock_whist_${userId}`, JSON.stringify(hist));
        setWeightHistory(hist);
      }
      
      setProfile(mergedProf);
      return;
    }

    try {
      const mergedProf = { id: userId, email: session.user.email, ...updatedData, full_name: profile.full_name || 'Champion' };
      const { error } = await supabase.from('profiles').upsert(mergedProf);
      if (error) throw error;

      // Log new weight if it changed
      if (updatedData.weight !== profile.weight) {
        await supabase.from('weight_history').insert({
          user_id: userId,
          weight: updatedData.weight,
          height: updatedData.height,
        });
      }

      setProfile(mergedProf);
      await refreshUserData(userId);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
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
      const updated = [record, ...sleepLogs.filter(log => log.date !== todayStr)];
      localStorage.setItem(`mock_slog_${userId}`, JSON.stringify(record));
      localStorage.setItem(`mock_slogs_${userId}`, JSON.stringify(updated));
      setSleepLog(record);
      setSleepLogs(updated);
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

  // Auth Screen View (Landing Page for Public Users)
  if (!session) {
    return (
      <div className="min-h-screen premium-mesh-bg text-white flex flex-col font-sans relative overflow-x-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Navbar */}
        <header className="bg-zinc-900/40 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
              <img src="/logos/logo_1.jpg" alt="Resence Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white block">Resence Fitness</span>
              <span className="text-[9px] text-orange-400 font-bold block uppercase tracking-widest mt-0.5">Discipline Equals Freedom</span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSignUp(false);
              setShowAuthModal(true);
            }}
            className="text-xs text-zinc-300 hover:text-white font-semibold px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-lg transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </header>

        {/* Hero Section */}
        <section className="flex-1 max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <span className="inline-block text-xs bg-orange-950/40 text-orange-400 border border-orange-900 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              ✨ Intelligent Adaptive Coach
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Your body is dynamic.<br/>
              <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                Your plan should be too.
              </span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Resence is a personalized fitness tracking client. It uses the Gemini 3.5 Flash model to compile adaptive weekly workout and nutrition plans, critique body assessments from physique photos, and parse daily meal macros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setShowAuthModal(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Start Your Assessment
              </button>
              <a
                href="#features"
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-semibold px-6 py-3.5 rounded-xl transition-colors text-center"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="flex-1 w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-red-500/60 rounded-full" />
                <div className="w-2.5 h-2.5 bg-yellow-500/60 rounded-full" />
                <div className="w-2.5 h-2.5 bg-green-500/60 rounded-full" />
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Client Dashboard</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Current BMI</span>
                  <span className="text-lg font-black text-white">24.7</span>
                </div>
                <span className="text-[10px] text-green-500 bg-green-950/20 border border-green-900/50 px-2 py-0.5 rounded-full font-semibold">Normal weight</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Calories Consumed</span>
                  <span className="text-zinc-500">1800 / 2200 kcal</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                  <div className="bg-orange-500 h-full w-[80%] rounded-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Protein Target</span>
                  <span className="text-zinc-500">120 / 140g</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                  <div className="bg-green-500 h-full w-[85%] rounded-full" />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-850 flex justify-between items-center text-xs">
                <span className="text-zinc-400">Active Logging Streak</span>
                <span className="font-bold text-orange-500">🔥 7 Days</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-zinc-900/30 border-t border-zinc-900 px-6 py-16 relative z-10">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Packed with Elite AI Capabilities</h2>
              <p className="text-zinc-400 text-sm">Everything you need to maintain consistency, adapt intensities, and achieve your targets in one low-friction dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 bg-orange-950/40 border border-orange-900/50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-base">AI Body Photo Assessment</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Upload front or side physique photos securely. Gemini Vision critiques chest/shoulder alignment, calculates muscle gaps, and logs historical progress curves.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 bg-green-950/40 border border-green-900/50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-base">Adaptive Workout Routines</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Weekly active workout plans that automatically adjust. If you consistently tick exercises off, intensity climbs. If you miss days, it adapts to a realistic volume.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 bg-blue-950/40 border border-blue-900/50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-base">Food Photo Recognition</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Simply take a photo of your meal. Gemini analyzes the food structure, estimates carbs/protein/fat macros, and pre-populates your logging form for one-tap log entries.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-2xl space-y-3">
                <div className="w-10 h-10 bg-purple-950/40 border border-purple-900/50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-base">Sleep & Recovery Logs</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Tailored rest targets based on your training workload. Log sleep times to verify muscle fiber replenishment and optimize HGH hormone release.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-6 text-center text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Resence Fitness. All rights reserved.</p>
        </footer>

        {/* Login / Sign Up Overlay Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="max-w-md w-full glowing-login-card rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>

              <div className="text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 border border-zinc-800 shadow-md">
                  <span className="text-xl font-black text-white">R</span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Resence Fitness Account</h1>
                <p className="text-zinc-400 text-[10px] mt-1">Sign in to sync your adaptive baseline configuration.</p>
              </div>

              {authError && (
                <div className="p-3 bg-red-950 border border-red-900 text-red-300 text-xs rounded-lg text-center">
                  {authError}
                </div>
              )}

              {demoMode && (
                <div className="p-3 bg-orange-950/20 border border-orange-900/50 text-orange-400 text-[10px] rounded-lg text-center leading-relaxed">
                  ⚡ Demo mode active. Input any email/password to log in immediately.
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
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {isSignUp ? 'Register Account' : 'Sign In'}
                </button>
              </form>

              <div className="text-center pt-1 border-t border-zinc-850">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-zinc-400 hover:text-orange-500 transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </div>
          </div>
        )}
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
    <div className="min-h-screen premium-mesh-bg text-white flex flex-col">
      {/* Top Banner Alert when in Demo Mode */}
      {demoMode && (
        <div className="bg-orange-500/10 border-b border-orange-950 text-orange-400 py-1.5 px-4 text-[10px] text-center font-medium tracking-wide">
          ⚠️ RUNNING IN LOCAL DEMONSTRATION MODE. TO CONNECT LIVE CLOUD GENERATION, ADD CREDENTIALS TO .ENV.LOCAL
        </div>
      )}

      {/* Navbar Header */}
      <header className="glass-header px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          {/* Chosen Logo icon mark */}
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
            <img src={activeLogo.path} alt="Active Resence Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white block">Resence Fitness</span>
            <span className="text-[9px] text-green-400 font-bold block uppercase tracking-widest mt-0.5">Every Day Is Day One</span>
          </div>
        </div>

        {/* Header top-right action button */}
        <div className="flex items-center space-x-2">
          {/* Settings button on Desktop/Laptop */}
          <button
            onClick={() => setActiveTab('settings')}
            className="hidden md:flex text-xs text-zinc-400 hover:text-white font-semibold px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors cursor-pointer items-center space-x-1.5"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>

          {/* Hamburger Menu button on Mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-zinc-400 hover:text-white p-1.5 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main layout containing Sidebar navigation and tabs content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav (Desktop only) */}
        <aside className="hidden md:block w-64 glass-sidebar p-4 space-y-4">
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z M14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
              { id: 'workout', label: 'Workout Plan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { id: 'diet', label: 'Nutrition & Diet', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z' },
              { id: 'sleep', label: 'Sleep Logs', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
              { id: 'body', label: 'AI Assessment', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
              { id: 'explorer', label: 'Muscle Explorer', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { id: 'coach', label: 'AI Coach Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
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
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full relative overflow-y-auto pb-24 md:pb-8">
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

          <div key={activeTab} className="tab-transition">
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
              sleepLogs={sleepLogs}
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

          {activeTab === 'explorer' && (
            <MuscleExplorer profile={profile} />
          )}

          {activeTab === 'coach' && (
            <AICoachSection
              profile={profile}
              demoMode={demoMode}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsSection
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              weightHistory={weightHistory}
              assessments={assessments}
              onChooseLogo={handleChooseLogo}
              selectedLogoId={selectedLogoId}
              onLogout={handleLogout}
            />
          )}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-45 glass-bottom-nav px-1 py-2.5 flex justify-around items-center">
        {[
          { id: 'dashboard', label: 'Dash', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z M14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
          { id: 'workout', label: 'Workout', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { id: 'diet', label: 'Diet', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z' },
          { id: 'coach', label: 'Coach', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${active ? 'text-orange-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span className="text-[7.5px] uppercase tracking-wide font-semibold block">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile sliding drawer menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding panel */}
          <div className="relative w-72 max-w-xs h-full bg-zinc-950/95 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <h2 className="text-sm font-extrabold tracking-wider uppercase text-zinc-400">Premium Menu</h2>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-zinc-500 hover:text-white p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'sleep', label: 'Sleep Logs', desc: 'Track rest & recovery hours', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
                  { id: 'body', label: 'AI Assessment', desc: 'Gemini physique analysis', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
                  { id: 'explorer', label: 'Muscle Explorer', desc: 'Interactive exercise guide', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                  { id: 'settings', label: 'Settings', desc: 'Profile, brand & account', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left flex items-start space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
                        active 
                          ? 'bg-orange-500 text-white font-bold' 
                          : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      <div>
                        <span className="text-xs font-bold block">{tab.label}</span>
                        <span className={`text-[9px] block mt-0.5 ${active ? 'text-orange-200' : 'text-zinc-500'}`}>{tab.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer info inside sidebar */}
            <div className="pt-4 border-t border-zinc-900 text-center">
              <span className="text-[9px] text-zinc-600 block">Resence Fitness Client</span>
              <span className="text-[8px] text-zinc-700 block mt-0.5">v1.2.0 • Active Session</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// MOCK PLAN GENERATORS (Fallback for offline/no-keys demonstration)
// =========================================================================

function getMockWorkoutPlan(profile) {
  const isKneeIssue = (profile.injuries || '').toLowerCase().includes('knee');
  const condPref = profile.conditioning_preference || 'Running';
  const isFatLoss = profile.fitness_goal === 'Fat Loss';
  
  const mondayGym = [
    { name: 'Flat Barbell Bench Press', muscle: 'Chest', sets: 4, reps: '8-10', notes: 'Control the eccentric phase down to chest.' },
    { name: 'Incline Dumbbell Press', muscle: 'Chest', sets: 4, reps: '8-12', notes: 'Keep elbows tucked at a 45-degree angle.' },
    { name: 'Dumbbell Chest Flyes', muscle: 'Chest', sets: 3, reps: '12', notes: 'Maintain a slight elbow bend, feel the chest stretch.' },
    { name: 'Overhead Cable Tricep Extension', muscle: 'Triceps', sets: 3, reps: '12-15', notes: 'Keep upper arms locked alongside ears.' },
    { name: 'Tricep Rope Pushdowns', muscle: 'Triceps', sets: 3, reps: '15', notes: 'Squeeze and flare the rope ends at the bottom lockout.' },
    { name: 'Diamond Pushups', muscle: 'Triceps & Chest', sets: 3, reps: 'Max', notes: 'Focus on full elbow extension at peak contraction.' }
  ];

  const tuesdayGym = [
    { name: 'Lat Pulldown (Wide Grip)', muscle: 'Back', sets: 4, reps: '10-12', notes: 'Squeeze shoulder blades down and back.' },
    { name: 'Single-Arm Dumbbell Row', muscle: 'Back', sets: 4, reps: '8-10', notes: 'Pull toward hip rather than shoulder.' },
    { name: 'Barbell Bent-Over Row', muscle: 'Back', sets: 3, reps: '8-10', notes: 'Keep spine flat, pull bar to lower stomach.' },
    { name: 'Incline Dumbbell Bicep Curl', muscle: 'Biceps', sets: 3, reps: '12', notes: 'Keep elbows pinned back behind torso.' },
    { name: 'Hammer Curls', muscle: 'Biceps', sets: 3, reps: '12', notes: 'Keep palms facing each other throughout curling motion.' },
    { name: 'Reverse Grip Chin-Ups', muscle: 'Back & Biceps', sets: 3, reps: '6-8', notes: 'Focus on pulling with your back and arms.' }
  ];

  const wednesdayGym = isKneeIssue ? [
    { name: 'Stretching & Core recovery drills', muscle: 'Core', sets: 3, reps: '30s hold', notes: 'Low impact planks and bird-dogs to recover legs/joints.' },
    { name: 'Hanging Leg Raise', muscle: 'Core', sets: 3, reps: '12', notes: 'Slow negatives, avoid swinging body.' },
    { name: 'Decline Bench Crunch', muscle: 'Core', sets: 3, reps: '15', notes: 'Focus on squeezing upper abdominal wall.' },
    { name: 'Plank Hold', muscle: 'Core', sets: 3, reps: '45s', notes: 'Squeeze glutes and brace stomach.' },
  ] : [
    { name: 'Leg Extensions (Quad focus)', muscle: 'Quads', sets: 4, reps: '12-15', notes: 'Squeeze hard at the peak contraction.' },
    { name: 'Seated Leg Curl (Hamstrings)', muscle: 'Hamstrings', sets: 4, reps: '10-12', notes: 'Keep toes flexed forward.' },
    { name: 'Romanian Dumbbell Deadlift', muscle: 'Hamstrings & Glutes', sets: 3, reps: '10', notes: 'Keep back flat, push hips backward.' },
    { name: 'Dumbbell Goblet Squat', muscle: 'Quads & Glutes', sets: 3, reps: '12', notes: 'Keep chest upright, push knees out.' },
    { name: 'Standing Calf Raises', muscle: 'Calves', sets: 4, reps: '15', notes: 'Hold calf stretch for 1 second at bottom.' },
    { name: 'Glute Bridges', muscle: 'Glutes', sets: 3, reps: '15', notes: 'Squeeze glutes at top of bridge.' }
  ];

  const thursdayGym = [
    { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', sets: 4, reps: '8-10', notes: 'Do not lock out elbows at top.' },
    { name: 'Lateral Raises', muscle: 'Shoulders', sets: 4, reps: '15', notes: 'Lead with elbows, hands slightly lower than elbows.' },
    { name: 'Rear Delt Flyes', muscle: 'Shoulders', sets: 3, reps: '15', notes: 'Keep chest down, avoid shoulder shrugging.' },
    { name: 'Hanging Leg Raise', muscle: 'Core', sets: 3, reps: '12', notes: 'Slow negatives.' },
    { name: 'Ab Wheel Rollouts', muscle: 'Core', sets: 3, reps: '10', notes: 'Roll out under control, squeeze abs to pull back.' },
    { name: 'Plank Hold', muscle: 'Core', sets: 3, reps: '60s', notes: 'Maintain straight board line.' }
  ];

  const fridayGym = [
    { name: 'Close-Grip Bench Press', muscle: 'Triceps', sets: 4, reps: '8-10', notes: 'Keeps elbows tucked close to ribcage.' },
    { name: 'Barbell Bicep Curl', muscle: 'Biceps', sets: 4, reps: '10', notes: 'Do not swing back to lift weight.' },
    { name: 'Skull Crushers', muscle: 'Triceps', sets: 3, reps: '12', notes: 'Lower bar to forehead slowly.' },
    { name: 'Concentration Curls', muscle: 'Biceps', sets: 3, reps: '12', notes: 'Brace elbow against thigh.' },
    { name: 'Tricep Rope Pushdowns', muscle: 'Triceps', sets: 3, reps: '15', notes: 'Lock arms out at bottom.' },
    { name: 'Wrist Curls', muscle: 'Forearms', sets: 3, reps: '15', notes: 'Squeeze forearms at top.' }
  ];

  const saturdayExercises = condPref === 'Boxing' ? [
    { name: 'Heavy Bag Conditioning Rounds', muscle: 'Shoulders & Core', sets: 5, reps: '3 mins', notes: 'Combine jabs, hooks, and footwork drills.' },
    { name: 'Shadow Boxing with Light Dumbbells', muscle: 'Shoulders', sets: 3, reps: '2 mins', notes: 'Keep speed fast but punches controlled.' },
    { name: 'Jump Rope Conditioning', muscle: 'Calves & Cardio', sets: 3, reps: '3 mins', notes: 'Maintains steady bouncing rhythm.' },
    { name: 'Mountain Climbers', muscle: 'Core', sets: 3, reps: '45s', notes: 'Drive knees fast, keep hips low.' },
    { name: 'Plank Hold', muscle: 'Core', sets: 3, reps: '60s', notes: 'Keep core active.' }
  ] : [
    { name: 'Standing Dumbbell Shoulder Press', muscle: 'Shoulders', sets: 4, reps: '8-10', notes: 'Do not lock out elbows at top.' },
    { name: 'Dumbbell lateral raise', muscle: 'Shoulders', sets: 4, reps: '15', notes: 'Lead with elbows, pinkies slightly up.' },
    { name: 'Face Pulls', muscle: 'Shoulders', sets: 3, reps: '15', notes: 'Pull rope ends to ears, flare elbows.' },
    { name: 'Front Raises', muscle: 'Shoulders', sets: 3, reps: '12', notes: 'Lift dumbbells to eye level.' },
    { name: 'Shadow Boxing / Jump Rope', muscle: 'Cardio', sets: 3, reps: '3 mins', notes: 'Keep body bouncing.' },
    { name: 'Mountain Climbers', muscle: 'Core', sets: 3, reps: '45s', notes: 'Fast dynamic knee drives.' }
  ];

  const getCardioSession = (dayName) => {
    if (condPref === 'None') return null;
    if (condPref === 'Running') {
      const dist = isFatLoss ? 4 : 3;
      if (dayName === 'tuesday') return { distance_km: dist, chunks: '1.5km x 2', instructions: 'Moderate pacing, rest 3 mins between intervals.' };
      if (dayName === 'wednesday') return isKneeIssue ? { distance_km: 2, chunks: '2km walk', instructions: 'Continuous low-impact recovery walk.' } : { distance_km: dist, chunks: '3km steady', instructions: 'Zone 2 aerobic recovery run.' };
      if (dayName === 'friday') return { distance_km: dist, chunks: '3km steady', instructions: 'Continuous tempo run.' };
      if (dayName === 'saturday') return { distance_km: isFatLoss ? 3 : 2, chunks: '1km x 2 sprint', instructions: 'High intensity sprints, 2 mins rest.' };
      return { distance_km: dist, chunks: '3 x 1km', instructions: 'Rest 90 seconds between each 1km rep.' };
    }
    if (condPref === 'Rope Skipping') {
      return { distance_km: 0, chunks: '4 Rounds', instructions: '4 rounds of 3 mins jump rope, fast pace, rest 60s between rounds.' };
    }
    if (condPref === 'Boxing') {
      return { distance_km: 0, chunks: '5 Rounds', instructions: '5 rounds of heavy bag combo work and shadow boxing drills.' };
    }
    return null;
  };

  return {
    recovery_notes: isKneeIssue 
      ? '⚠️ Plan adapted for knee limitation. High-impact squats/lunges omitted. Running/Cardio drills replaced by walking.'
      : isFatLoss 
      ? '🔥 Plan calibrated for Fat Loss. Higher exercise volume, shorter rest periods (~45s), and steady state conditioning programmed.'
      : `Weekly plan cycles strength targets. Conditioning is set to ${condPref} to fit your baseline preference.`,
    days: {
      monday: {
        muscle_group: 'Chest & Triceps',
        is_rest: false,
        gym_duration_minutes: 55,
        pre_workout_warmup: '5 mins arm circles, dynamic chest stretches, shoulder shrugs.',
        running: getCardioSession('monday'),
        exercises: mondayGym,
      },
      tuesday: {
        muscle_group: 'Back & Biceps',
        is_rest: false,
        gym_duration_minutes: 55,
        pre_workout_warmup: '5 mins cat-cow stretches, dynamic lats stretch, band pull-aparts.',
        running: getCardioSession('tuesday'),
        exercises: tuesdayGym,
      },
      wednesday: {
        muscle_group: isKneeIssue ? 'Active Stretch Recovery' : 'Legs & Calves',
        is_rest: false,
        gym_duration_minutes: isKneeIssue ? 30 : 55,
        pre_workout_warmup: '5 mins dynamic leg swings, bodyweight air squats, knee rotations.',
        running: getCardioSession('wednesday'),
        exercises: wednesdayGym,
      },
      thursday: {
        muscle_group: 'Shoulders & Core',
        is_rest: false,
        gym_duration_minutes: 55,
        pre_workout_warmup: '5 mins shoulder sweeps, active dynamic plank holds, head rotations.',
        running: getCardioSession('thursday'),
        exercises: thursdayGym,
      },
      friday: {
        muscle_group: 'Arms & Conditioning',
        is_rest: false,
        gym_duration_minutes: 50,
        pre_workout_warmup: '5 mins dynamic wrist rotations, arm extensions, dynamic elbow curls.',
        running: getCardioSession('friday'),
        exercises: fridayGym,
      },
      saturday: {
        muscle_group: condPref === 'Boxing' ? 'Boxing Drills & Conditioning' : 'Shoulders Focus',
        is_rest: false,
        gym_duration_minutes: 55,
        pre_workout_warmup: '5 mins shadow boxing, dynamic jump rope simulation, hip openers.',
        running: getCardioSession('saturday'),
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
  const pref = profile.diet_preference || 'Non-Veg';
  const isBulky = profile.fitness_goal === 'Bulky';
  const isLean = profile.fitness_goal === 'Lean';
  const isFatLoss = profile.fitness_goal === 'Fat Loss';

  let targets = { calories: 2200, protein: 130, carbs: 250, fat: 70 };
  if (isBulky) {
    targets = { calories: 2900, protein: 170, carbs: 360, fat: 90 };
  } else if (isLean) {
    targets = { calories: 1750, protein: 145, carbs: 160, fat: 50 };
  } else if (isFatLoss) {
    targets = { calories: 1550, protein: 140, carbs: 135, fat: 45 };
  }

  const vegMeals = {
    breakfast: 'Oatmeal (80g) made with whole milk, scoop of whey protein, 1tbsp peanut butter, and 50g blueberries. (Est: 460 kcal, 34g protein)',
    lunch: 'Brown rice (150g) with paneer cubes (150g) cooked in olive oil, steamed broccoli, and mixed greens. (Est: 610 kcal, 30g protein)',
    dinner: 'Lentil spaghetti (100g) with high-protein marinara sauce, mushrooms, and spinach. (Est: 580 kcal, 32g protein)',
    snack: 'Roasted chickpeas (50g) + 1 cup double-toned milk. (Est: 230 kcal, 16g protein)',
  };

  const veganMeals = {
    breakfast: 'Oatmeal (80g) made with unsweetened almond milk, scoop of soy protein isolate, 1tbsp almond butter, and 50g blueberries. (Est: 430 kcal, 32g protein)',
    lunch: 'Quinoa bowl (100g cooked) with air-fried firm tofu (150g), steamed broccoli, half avocado, and lemon tahini dressing. (Est: 560 kcal, 28g protein)',
    dinner: 'Lentil spaghetti with high-protein marinara sauce, mushrooms, spinach, and 2tbsp nutritional yeast. (Est: 610 kcal, 34g protein)',
    snack: 'Mixed raw almonds (30g) + 1 cup soy milk or pea protein shake. (Est: 250 kcal, 26g protein)',
  };

  const eggetarianMeals = {
    breakfast: '3 egg whites scrambled, 2 slices whole wheat toast, 1tbsp peanut butter, half banana. (Est: 420 kcal, 26g protein)',
    lunch: 'Brown rice (150g) with 3 whole boiled eggs, steamed spinach, roasted carrots, and 1tbsp olive oil. (Est: 590 kcal, 28g protein)',
    dinner: 'Lentil soup (large bowl) with a side of dynamic egg scramble (2 eggs) and asparagus. (Est: 550 kcal, 32g protein)',
    snack: 'Boiled egg whites (4 whites) with black pepper + cup of green tea. (Est: 120 kcal, 16g protein)',
  };

  const nonVegMeals = {
    breakfast: '3 whole eggs scrambled, 2 slices whole wheat toast, half avocado. (Est: 490 kcal, 36g protein)',
    lunch: 'Grilled chicken breast (150g) with jasmine rice (150g cooked), roasted asparagus, and 1tbsp olive oil. (Est: 580 kcal, 44g protein)',
    dinner: 'Pan-seared salmon fillet (150g) with sweet potato mash (150g), steamed spinach, and garlic butter. (Est: 640 kcal, 38g protein)',
    snack: 'Whey protein shake (1 scoop) with Greek yogurt (150g) and honey. (Est: 260 kcal, 30g protein)',
  };

  let chosenMeals = nonVegMeals;
  if (pref === 'Veg') chosenMeals = vegMeals;
  else if (pref === 'Vegan') chosenMeals = veganMeals;
  else if (pref === 'Eggetarian') chosenMeals = eggetarianMeals;

  return {
    daily_targets: targets,
    meal_suggestions: chosenMeals,
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
