import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Sparkles,
  Flame,
  Apple,
  RefreshCw,
  Users,
  Code2,
  CheckCircle2,
  Copy,
  ChevronRight,
  ArrowRight,
  Send,
  Sliders,
  History,
  Info,
  Layers,
  FileCode,
  Download,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Eye,
  Check,
  Zap,
  Shield,
  Bot,
  Activity,
  Calendar,
  HeartPulse,
  TrendingUp
} from 'lucide-react';
import { UserRecord, CurrentPlanResult, WorkoutLogEntry, MeasurementEntry, ScheduleItem, ReminderSetting, ChatMessage } from './types/fitbuddy';
import { FitBuddyChat } from './components/FitBuddyChat';
import { ExerciseGuidance } from './components/ExerciseGuidance';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { SmartScheduling } from './components/SmartScheduling';
import { NutritionAdvisor } from './components/NutritionAdvisor';

interface SourceFile {
  name: string;
  category: string;
  desc: string;
  content: string;
}

const PRESETS = [
  {
    name: 'Jordan Hayes',
    user_id: 103,
    age: 24,
    weight: 70.0,
    height: 175,
    gender: 'Non-binary',
    fitnessLevel: 'beginner' as const,
    goal: 'general fitness',
    intensity: 'medium',
    targetWeight: 72.0,
    availableEquipment: ['Bodyweight Only', 'Pull-up Bar'],
    daysPerWeek: 3,
    workoutDurationMins: 35,
    limitationsOrInjuries: 'None',
    desc: 'Calisthenics & Functional Baseline'
  },
  {
    name: 'Elena Rostova',
    user_id: 104,
    age: 29,
    weight: 63.0,
    height: 168,
    gender: 'Female',
    fitnessLevel: 'intermediate' as const,
    goal: 'weight loss',
    intensity: 'medium',
    targetWeight: 58.0,
    availableEquipment: ['Dumbbells', 'Resistance Bands', 'Yoga Mat'],
    daysPerWeek: 4,
    workoutDurationMins: 45,
    limitationsOrInjuries: 'Mild lower back stiffness',
    desc: 'Metabolic Fat Burn & Toning'
  },
  {
    name: 'Marcus Vance',
    user_id: 101,
    age: 28,
    weight: 78.5,
    height: 180,
    gender: 'Male',
    fitnessLevel: 'advanced' as const,
    goal: 'muscle gain',
    intensity: 'high',
    targetWeight: 82.0,
    availableEquipment: ['Full Gym', 'Barbells', 'Dumbbells', 'Cables'],
    daysPerWeek: 5,
    workoutDurationMins: 60,
    limitationsOrInjuries: 'None',
    desc: 'Hypertrophy & Mass (High Volume)'
  },
  {
    name: 'Carlos Rivera',
    user_id: 105,
    age: 34,
    weight: 71.0,
    height: 173,
    gender: 'Male',
    fitnessLevel: 'advanced' as const,
    goal: 'endurance',
    intensity: 'high',
    targetWeight: 70.0,
    availableEquipment: ['Treadmill', 'Kettlebell', 'Jump Rope'],
    daysPerWeek: 5,
    workoutDurationMins: 50,
    limitationsOrInjuries: 'None',
    desc: 'Aerobic Stamina & VO2 Max'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'generator' | 'nutrition' | 'exercises' | 'progress' | 'schedules' | 'chat' | 'admin' | 'code' | 'architecture'
  >('generator');

  // Generator & Profile Form State
  const [userId, setUserId] = useState<number>(103);
  const [username, setUsername] = useState<string>('Jordan Hayes');
  const [age, setAge] = useState<number>(24);
  const [weight, setWeight] = useState<number>(70.0);
  const [height, setHeight] = useState<number>(175);
  const [gender, setGender] = useState<string>('Non-binary');
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState<string>('general fitness');
  const [intensity, setIntensity] = useState<string>('medium');
  const [targetWeight, setTargetWeight] = useState<number>(72.0);
  const [equipmentList, setEquipmentList] = useState<string[]>(['Bodyweight Only', 'Pull-up Bar']);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [workoutDurationMins, setWorkoutDurationMins] = useState<number>(35);
  const [limitationsOrInjuries, setLimitationsOrInjuries] = useState<string>('None');

  // Generation & Status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<any | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Admin View State
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [adminGoalFilter, setAdminGoalFilter] = useState<string>('all');
  const [inspectModalUser, setInspectModalUser] = useState<UserRecord | null>(null);

  // Feature Data States
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [reminders, setReminders] = useState<ReminderSetting[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Source Code Explorer State
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  // Selected Day Filter for Result <pre>
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [viewComparisonMode, setViewComparisonMode] = useState<'side-by-side' | 'stacked'>('stacked');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const currentUserRecord: UserRecord | null = usersList.find(u => u.id === userId) || (currentResult ? {
    id: currentResult.user_id,
    name: currentResult.username,
    age: currentResult.age,
    weight: currentResult.weight,
    height,
    fitnessLevel,
    gender,
    goal: currentResult.goal,
    intensity: currentResult.intensity,
    targetWeight,
    availableEquipment: equipmentList,
    daysPerWeek,
    workoutDurationMins,
    limitationsOrInjuries,
    created_at: new Date().toISOString(),
    original_plan: currentResult.workout_plan,
    updated_plan: currentResult.updated_plan,
    nutrition_tip: currentResult.nutrition_tip,
    last_feedback: currentResult.feedback,
    updated_at: new Date().toISOString()
  } : null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/view-all-users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchUserData = async (uid: number) => {
    try {
      const [logsRes, mRes, sRes, rRes, cRes] = await Promise.all([
        fetch(`/api/workout-logs/${uid}`).then(r => r.json()),
        fetch(`/api/measurements/${uid}`).then(r => r.json()),
        fetch(`/api/schedules/${uid}`).then(r => r.json()),
        fetch(`/api/reminders/${uid}`).then(r => r.json()),
        fetch(`/api/chat/${uid}`).then(r => r.json()),
      ]);

      if (logsRes.success) setWorkoutLogs(logsRes.logs);
      if (mRes.success) setMeasurements(mRes.measurements);
      if (sRes.success) setSchedules(sRes.schedules);
      if (rRes.success) setReminders(rRes.reminders);
      if (cRes.success) setChatMessages(cRes.messages);
    } catch (err) {
      console.error('Error fetching feature data:', err);
    }
  };

  const fetchSourceFiles = async () => {
    try {
      const res = await fetch('/api/source-files');
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setSourceFiles(data.files);
      }
    } catch (err) {
      console.error('Error fetching source files:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSourceFiles();
    fetchUserData(userId);
  }, []);

  const handleSelectUser = (uid: number) => {
    const user = usersList.find(u => u.id === uid);
    if (user) {
      setUserId(user.id);
      setUsername(user.name);
      setAge(user.age);
      setWeight(user.weight);
      setHeight(user.height || 175);
      setFitnessLevel((user.fitnessLevel as any) || 'intermediate');
      setGoal(user.goal);
      setIntensity(user.intensity);
      setTargetWeight(user.targetWeight || user.weight);
      setEquipmentList(user.availableEquipment || ['Full Gym']);
      setDaysPerWeek(user.daysPerWeek || 4);
      setWorkoutDurationMins(user.workoutDurationMins || 45);
      setLimitationsOrInjuries(user.limitationsOrInjuries || 'None');

      if (user.original_plan) {
        setCurrentResult({
          user_id: user.id,
          username: user.name,
          age: user.age,
          weight: user.weight,
          goal: user.goal,
          intensity: user.intensity,
          workout_plan: user.original_plan,
          nutrition_tip: user.nutrition_tip || '',
          updated_plan: user.updated_plan,
          feedback: user.last_feedback
        });
      }
      fetchUserData(uid);
      showToast(`Switched active athlete to ${user.name}`);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setUserId(preset.user_id);
    setUsername(preset.name);
    setAge(preset.age);
    setWeight(preset.weight);
    setHeight(preset.height);
    setGender(preset.gender);
    setFitnessLevel(preset.fitnessLevel);
    setGoal(preset.goal);
    setIntensity(preset.intensity);
    setTargetWeight(preset.targetWeight);
    setEquipmentList(preset.availableEquipment);
    setDaysPerWeek(preset.daysPerWeek);
    setWorkoutDurationMins(preset.workoutDurationMins);
    setLimitationsOrInjuries(preset.limitationsOrInjuries);
    fetchUserData(preset.user_id);
    showToast(`Loaded preset profile for ${preset.name}`);
  };

  const handleGenerateWorkout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !userId) {
      setErrorMsg('Please enter a valid athlete name and user ID.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username,
          age,
          weight,
          height,
          fitnessLevel,
          gender,
          goal,
          intensity,
          targetWeight,
          availableEquipment: equipmentList,
          daysPerWeek,
          workoutDurationMins,
          limitationsOrInjuries
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate workout plan');
      }

      setCurrentResult({
        user_id: data.user_id,
        username: data.username,
        age: data.age,
        weight: data.weight,
        goal: data.goal,
        intensity: data.intensity,
        workout_plan: data.workout_plan,
        nutrition_tip: data.nutrition_tip,
        updated_plan: data.updated_plan || null,
        feedback: data.feedback || null,
      });

      showToast(`FitBuddy-AI generated 7-day plan & Flash nutrition advice for ${data.username}!`);
      fetchUsers();
      fetchUserData(userId);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitFeedback = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentResult) return;
    if (!feedbackInput.trim()) {
      setErrorMsg('Please enter feedback to revise the workout plan.');
      return;
    }

    setIsUpdating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentResult.user_id,
          feedback: feedbackInput.trim(),
          nutrition_tip: currentResult.nutrition_tip,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update workout plan');
      }

      setCurrentResult((prev: any) => prev ? {
        ...prev,
        updated_plan: data.updated_plan,
        feedback: data.feedback,
      } : null);

      showToast('Adaptive workout plan updated via Gemini based on your feedback!');
      setFeedbackInput('');
      fetchUsers();
      fetchUserData(userId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating workout plan.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendChatMessage = async (msg: string) => {
    setIsChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: msg
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchUserData(userId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch(`/api/chat/${userId}`, { method: 'DELETE' });
      setChatMessages([]);
      showToast('Chat history cleared.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWorkoutLog = async (logData: any) => {
    try {
      const res = await fetch('/api/workout-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Workout session logged successfully!');
        fetchUserData(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMeasurement = async (mData: any) => {
    try {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Body measurements recorded!');
        fetchUserData(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSchedule = async (itemId: string) => {
    try {
      const res = await fetch('/api/schedules/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      const data = await res.json();
      if (data.success) {
        setSchedules(prev => prev.map(s => s.id === itemId ? data.item : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleReminder = async (reminderId: string) => {
    try {
      const res = await fetch('/api/reminders/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId })
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => prev.map(r => r.id === reminderId ? data.reminder : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReminder = async (rData: any) => {
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('New reminder created!');
        fetchUserData(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDb = async () => {
    if (!confirm('Reset database to demo users, workout logs, and plans?')) return;
    try {
      const res = await fetch('/api/reset-db', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        fetchUserData(userId);
        showToast('FitBuddy-AI database reset to sample state.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyPlanToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
    showToast('Workout plan copied to clipboard!');
  };

  const copySourceCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Source code copied to clipboard!');
  };

  const downloadFile = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name.includes('/') ? name.split('/').pop()! : name;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${link.download}`);
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      u.id.toString().includes(adminSearch) ||
      u.goal.toLowerCase().includes(adminSearch.toLowerCase());
    const matchesGoal = adminGoalFilter === 'all' || u.goal.toLowerCase() === adminGoalFilter.toLowerCase();
    return matchesSearch && matchesGoal;
  });

  const filterDayPlan = (fullText: string, day: string) => {
    if (day === 'all') return fullText;
    const regex = new RegExp(`(Day\\s*${day.replace('day', '')}:[\\s\\S]*?)(?=Day\\s*\\d+:|$)`, 'i');
    const match = fullText.match(regex);
    return match ? match[1].trim() : fullText;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-300 to-emerald-200 bg-clip-text text-transparent">
                  FitBuddy-AI
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  Adaptive Fitness Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gemini Models • Personalized Workout & Nutrition Ecosystem
              </p>
            </div>
          </div>

          {/* User Selector Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={userId}
              onChange={e => handleSelectUser(parseInt(e.target.value, 10))}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 hidden sm:block"
            >
              {usersList.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} (#{u.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'generator'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI Workout Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('nutrition')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'nutrition'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>Nutrition & Diet</span>
          </button>

          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'exercises'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Exercise Form & Alternatives</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'progress'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Progress Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'schedules'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Smart Scheduling & Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Gemini AI Coach</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              fetchUsers();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Admin View</span>
            <span className="text-[10px] px-1.5 rounded-full bg-slate-800 text-slate-300">
              {usersList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'code'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Explorer</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-sm">{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-xs px-2 py-1 rounded bg-red-900">Dismiss</button>
          </div>
        )}

        {/* TAB: WORKOUT GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-8">
            {!currentResult ? (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Fitness Plan Generator • Multi-Level Support (Beginner to Advanced)
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    FitBuddy-AI Workout Generation
                  </h2>
                  <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                    Tailored to your body measurements, available equipment, schedule, and limitations. Powered by Gemini Pro and Flash.
                  </p>
                </div>

                {/* Athlete Presets */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-blue-400" />
                      1-Click Athlete Archetypes
                    </span>
                    <span className="text-[11px] text-slate-500">Auto-fills complete physiological profile</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {PRESETS.map(p => (
                      <button
                        key={p.user_id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          userId === p.user_id
                            ? 'bg-blue-950/40 border-blue-500/60 shadow-sm'
                            : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-white">{p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">#{p.user_id}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{p.desc}</div>
                        <div className="flex gap-1.5 mt-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 capitalize">
                            {p.fitnessLevel}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 capitalize">
                            {p.goal}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comprehensive Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                    <FileCode className="w-5 h-5 text-blue-400" />
                    User Profile Analysis & Equipment Inputs
                  </h3>

                  <form onSubmit={handleGenerateWorkout} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Athlete Name</label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">User ID</label>
                        <input
                          type="number"
                          required
                          value={userId}
                          onChange={e => setUserId(parseInt(e.target.value, 10) || 1)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Fitness Level</label>
                        <select
                          value={fitnessLevel}
                          onChange={e => setFitnessLevel(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="beginner">Beginner (Foundations & Safety)</option>
                          <option value="intermediate">Intermediate (Progressive Overload)</option>
                          <option value="advanced">Advanced (High Volume & Intensity)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Age</label>
                        <input
                          type="number"
                          value={age}
                          onChange={e => setAge(parseInt(e.target.value, 10) || 25)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={weight}
                          onChange={e => setWeight(parseFloat(e.target.value) || 70)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Height (cm)</label>
                        <input
                          type="number"
                          value={height}
                          onChange={e => setHeight(parseInt(e.target.value, 10) || 175)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={targetWeight}
                          onChange={e => setTargetWeight(parseFloat(e.target.value) || weight)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Primary Fitness Goal</label>
                        <select
                          value={goal}
                          onChange={e => setGoal(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="muscle gain">Muscle Gain & Hypertrophy</option>
                          <option value="weight loss">Weight Loss & Fat Burn</option>
                          <option value="strength">Strength & Powerlifting</option>
                          <option value="endurance">Endurance & Cardiovascular Stamina</option>
                          <option value="general fitness">General Functional Fitness</option>
                          <option value="mobility and recovery">Mobility & Active Recovery</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Training Intensity</label>
                        <select
                          value={intensity}
                          onChange={e => setIntensity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="medium">Medium Intensity (Balanced pace & recovery)</option>
                          <option value="low">Low Intensity (Joint-friendly / Introductory)</option>
                          <option value="high">High Intensity (Demanding volume / RPE 8-10)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Available Equipment</label>
                        <input
                          type="text"
                          value={equipmentList.join(', ')}
                          onChange={e => setEquipmentList(e.target.value.split(',').map(s => s.trim()))}
                          placeholder="e.g. Dumbbells, Barbell, Resistance Bands"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Training Frequency</label>
                        <select
                          value={daysPerWeek}
                          onChange={e => setDaysPerWeek(parseInt(e.target.value, 10))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value={3}>3 Days / Week (Full Body Split)</option>
                          <option value={4}>4 Days / Week (Upper / Lower)</option>
                          <option value={5}>5 Days / Week (Push / Pull / Legs)</option>
                          <option value={6}>6 Days / Week (Advanced PPL Split)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Session Duration</label>
                        <select
                          value={workoutDurationMins}
                          onChange={e => setWorkoutDurationMins(parseInt(e.target.value, 10))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value={30}>30 Minutes (High Density)</option>
                          <option value={45}>45 Minutes (Standard Optimal)</option>
                          <option value={60}>60 Minutes (Hypertrophy / Strength)</option>
                          <option value={75}>75 Minutes (Extended Volume)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Physical Limitations, Soreness, or Injuries (Optional)
                      </label>
                      <input
                        type="text"
                        value={limitationsOrInjuries}
                        onChange={e => setLimitationsOrInjuries(e.target.value)}
                        placeholder="e.g. Sensitive lower back, shoulder impingement, avoid heavy jumps..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>FitBuddy-AI is Generating Your Custom 7-Day Plan...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Generate Personalized 7-Day Workout & Nutrition Plan</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* RESULT VIEW */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                        7-Day Workout Routine Active
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{currentResult.user_id}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                      <span>{currentResult.username}</span>
                      <span className="text-sm font-normal text-slate-400">
                        ({currentResult.age} yrs • {currentResult.weight} kg)
                      </span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 capitalize">
                        Goal: {currentResult.goal}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 capitalize">
                        Intensity: {currentResult.intensity}
                      </span>
                      {currentResult.updated_plan && (
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Feedback Adaptive Version
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentResult(null)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Configure Profile
                    </button>
                    <button
                      onClick={() => copyPlanToClipboard(currentResult.updated_plan || currentResult.workout_plan)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      {copiedPlan ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedPlan ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Day Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-xs font-semibold text-slate-400 mr-2">Filter Day:</span>
                  {['all', 'day 1', 'day 2', 'day 3', 'day 4', 'day 5', 'day 6', 'day 7'].map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDayFilter(d)}
                      className={`text-xs px-2.5 py-1 rounded-lg uppercase font-semibold transition-all ${
                        selectedDayFilter === d ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* PRE Block: Workout Plan */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-slate-950/80 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-blue-400 uppercase tracking-wide">
                      7-Day Workout Plan (Gemini Pro)
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">Rendered in &lt;pre&gt; tag</span>
                  </div>
                  <div className="p-5 sm:p-6 bg-[#0a0f1d] overflow-x-auto">
                    <pre className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {filterDayPlan(currentResult.workout_plan, selectedDayFilter)}
                    </pre>
                  </div>
                </div>

                {/* Adaptive Workout Plan (if updated) */}
                {currentResult.updated_plan && (
                  <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl">
                    <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-5 py-3.5 flex items-center justify-between">
                      <h3 className="font-bold text-sm text-emerald-300 uppercase tracking-wide flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Adaptive Workout Plan (Feedback Revised)
                      </h3>
                      {currentResult.feedback && (
                        <span className="text-[11px] text-emerald-300/80 italic">"{currentResult.feedback}"</span>
                      )}
                    </div>
                    <div className="p-5 sm:p-6 bg-[#091515] overflow-x-auto">
                      <pre className="font-mono text-xs sm:text-sm text-emerald-100 leading-relaxed whitespace-pre-wrap">
                        {filterDayPlan(currentResult.updated_plan, selectedDayFilter)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Nutrition Tip */}
                <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border-l-4 border-l-amber-500 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <Apple className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          AI Nutrition & Recovery Tip (Gemini Flash)
                        </h4>
                      </div>
                      <p className="text-sm text-amber-100/90 mt-1">{currentResult.nutrition_tip}</p>
                    </div>
                  </div>
                </div>

                {/* Feedback-Based Plan Updating Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                    <RefreshCw className="w-5 h-5 text-emerald-400" />
                    Adaptive Workout Plans – Submit Progress & Feedback
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Modify your plan with user feedback (e.g. <em>"Add 15 mins yoga"</em>, <em>"Include more cardio"</em>, <em>"Swap bench press for dumbbells"</em>). Both original and updated plans are saved in SQLite.
                  </p>

                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <textarea
                      rows={3}
                      value={feedbackInput}
                      onChange={e => setFeedbackInput(e.target.value)}
                      placeholder="Type your adjustments (e.g., 'Add 15 mins recovery yoga on Day 7', 'Include high-intensity cardio intervals', 'Replace squats with leg press')..."
                      className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="submit"
                        disabled={isUpdating || !feedbackInput.trim()}
                        className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>Update Workout Plan</span>
                      </button>

                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Add 15 min restorative yoga on Day 7',
                          'Include more cardio and core work',
                          'Replace barbell squats with bodyweight lunges',
                          'Add dumbbell shoulder work'
                        ].map((prompt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFeedbackInput(prompt)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"
                          >
                            + {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: NUTRITION */}
        {activeTab === 'nutrition' && (
          <NutritionAdvisor
            user={currentUserRecord}
            quickNutritionTip={currentResult?.nutrition_tip || currentUserRecord?.nutrition_tip || null}
          />
        )}

        {/* TAB: EXERCISES & ALTERNATIVES */}
        {activeTab === 'exercises' && <ExerciseGuidance />}

        {/* TAB: PROGRESS ANALYTICS */}
        {activeTab === 'progress' && (
          <ProgressAnalytics
            user={currentUserRecord}
            workoutLogs={workoutLogs}
            measurements={measurements}
            onAddWorkoutLog={handleAddWorkoutLog}
            onAddMeasurement={handleAddMeasurement}
          />
        )}

        {/* TAB: SMART SCHEDULING & REMINDERS */}
        {activeTab === 'schedules' && (
          <SmartScheduling
            user={currentUserRecord}
            schedules={schedules}
            reminders={reminders}
            onToggleSchedule={handleToggleSchedule}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
          />
        )}

        {/* TAB: GEMINI CHATBOT */}
        {activeTab === 'chat' && (
          <FitBuddyChat
            user={currentUserRecord}
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            onClearChat={handleClearChat}
            isLoading={isChatLoading}
          />
        )}

        {/* TAB: ADMIN VIEW */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  all_users.html / Admin Route: /view-all-users
                </span>
                <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-purple-400" />
                  Admin View: All Users & Plans
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Displays all users, goal parameters, original plans, and feedback revisions in SQLite.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchUsers}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={handleResetDb}
                  className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold"
                >
                  Reset DB
                </button>
              </div>
            </div>

            {/* Admin Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Athlete & Stats</th>
                      <th className="py-3 px-4">Goal & Level</th>
                      <th className="py-3 px-4">Original Plan</th>
                      <th className="py-3 px-4">Feedback Update</th>
                      <th className="py-3 px-4">Nutrition Tip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">#{u.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Age: {u.age} • {u.weight} kg {u.fitnessLevel ? `• ${u.fitnessLevel}` : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 capitalize font-medium">
                            {u.goal}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {u.original_plan ? (
                            <details className="cursor-pointer text-blue-400 font-semibold">
                              <summary className="text-xs">View Original Plan</summary>
                              <pre className="mt-2 p-3 bg-slate-950 rounded text-[11px] text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {u.original_plan}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-slate-500 text-xs">No Plan</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {u.updated_plan ? (
                            <details className="cursor-pointer text-emerald-400 font-semibold">
                              <summary className="text-xs">View Revised Plan</summary>
                              <pre className="mt-2 p-3 bg-slate-950 rounded text-[11px] text-emerald-200 max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {u.updated_plan}
                              </pre>
                            </details>
                          ) : (
                            <span className="text-slate-500 text-xs">No Revisions</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-amber-200 max-w-xs">
                          {u.nutrition_tip ? (
                            <p className="line-clamp-2">{u.nutrition_tip}</p>
                          ) : (
                            <span className="text-slate-500">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CODE EXPLORER */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                  Source Architecture
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Python Files & Jinja2 Templates</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                {sourceFiles.map((f, i) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFileIndex(i)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all ${
                      selectedFileIndex === i ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>{f.name}</div>
                    <div className="text-[10px] opacity-75">{f.category}</div>
                  </button>
                ))}
              </div>

              <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {sourceFiles[selectedFileIndex] && (
                  <>
                    <div className="bg-slate-950 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
                      <span className="font-mono text-xs text-blue-300 font-bold">
                        {sourceFiles[selectedFileIndex].name}
                      </span>
                      <button
                        onClick={() => copySourceCode(sourceFiles[selectedFileIndex].content)}
                        className="text-xs px-3 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center gap-1.5"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <div className="p-4 bg-[#070d18] max-h-[600px] overflow-auto">
                      <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre">
                        {sourceFiles[selectedFileIndex].content}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
