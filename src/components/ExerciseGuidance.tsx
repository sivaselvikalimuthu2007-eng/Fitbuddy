import React, { useState } from 'react';
import { Search, Sparkles, AlertTriangle, CheckCircle, Dumbbell, Shield, ArrowRight } from 'lucide-react';
import { EXERCISE_LIBRARY, ExerciseData } from '../data/exerciseLibrary';

export const ExerciseGuidance: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeExercise, setActiveExercise] = useState<ExerciseData>(EXERCISE_LIBRARY[0]);

  // AI Alternative Generator State
  const [customExerciseQuery, setCustomExerciseQuery] = useState('');
  const [customReason, setCustomReason] = useState('Joint sensitivity / shoulder discomfort');
  const [isGeneratingAlt, setIsGeneratingAlt] = useState(false);
  const [aiAlternatives, setAiAlternatives] = useState<any[] | null>(null);

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Core', 'Cardio'];

  const filteredExercises = EXERCISE_LIBRARY.filter(ex => {
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.primaryMuscles.some(m => m.toLowerCase().includes(search.toLowerCase())) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAskAlternatives = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExerciseQuery.trim()) return;
    setIsGeneratingAlt(true);
    try {
      const res = await fetch('/api/exercise-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseName: customExerciseQuery,
          reason: customReason,
          availableEquipment: ['Dumbbells', 'Bodyweight', 'Bands']
        })
      });
      const json = await res.json();
      if (json.success && json.data?.alternatives) {
        setAiAlternatives(json.data.alternatives);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAlt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
              Exercise Guidance & Alternatives Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Exercise Form Guide & Smart Alternatives</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Master strict execution, prevent injury, and generate intelligent exercise swaps when equipment or joints require adjustments.
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search exercise, muscle, or equipment..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Exercise List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 h-[650px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Exercise Library ({filteredExercises.length})
          </h3>
          {filteredExercises.map(ex => (
            <button
              key={ex.id}
              onClick={() => setActiveExercise(ex)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                activeExercise.id === ex.id
                  ? 'bg-blue-950/40 border-blue-500/80 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{ex.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {ex.difficulty}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>{ex.category}</span>
                <span>•</span>
                <span>{ex.equipment}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {ex.primaryMuscles.slice(0, 2).map((m, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {m}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Center & Right: Detail & Alternatives */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Exercise Detail Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {activeExercise.category} Focus
                </span>
                <h3 className="text-2xl font-bold text-white mt-1.5">{activeExercise.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Equipment: <strong className="text-slate-200">{activeExercise.equipment}</strong> | Recommended: <strong className="text-slate-200">{activeExercise.durationOrReps}</strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activeExercise.primaryMuscles.map((m, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {activeExercise.description}
            </p>

            {/* Step-by-Step Form Instructions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Step-by-Step Form Instructions
              </h4>
              <div className="space-y-2">
                {activeExercise.formInstructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-300 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & Common Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Form & Safety Tips
                </h5>
                <ul className="text-xs text-emerald-100/90 space-y-1 list-disc pl-4">
                  {activeExercise.safetyTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Common Mistakes to Avoid
                </h5>
                <ul className="text-xs text-amber-100/90 space-y-1 list-disc pl-4">
                  {activeExercise.commonMistakes.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pre-packaged Alternatives */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                Exercise Alternatives for {activeExercise.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeExercise.alternatives.map((alt, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-xs text-purple-300">{alt.name}</div>
                    <div className="text-[11px] text-slate-400">Equip: {alt.equipment}</div>
                    <div className="text-[11px] text-slate-300 leading-snug mt-1">{alt.benefit}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Exercise Alternative Generator Tool */}
          <div className="bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/30 border border-purple-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">Gemini AI Exercise Replacement Generator</h3>
            </div>
            <p className="text-xs text-slate-400">
              Need a replacement for an exercise not in the gym, or experiencing shoulder, lower back, or knee discomfort? FitBuddy AI will calculate biomechanically equivalent swaps.
            </p>

            <form onSubmit={handleAskAlternatives} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Exercise to Replace</label>
                <input
                  type="text"
                  placeholder="e.g. Barbell Squat, Overhead Press, Pull-ups..."
                  value={customExerciseQuery}
                  onChange={e => setCustomExerciseQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Reason / Limitation</label>
                <input
                  type="text"
                  placeholder="e.g. Knee click, no barbell, home dumbbells only..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!customExerciseQuery.trim() || isGeneratingAlt}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingAlt ? 'Analyzing Biomechanics with Gemini...' : 'Find Smart Exercise Replacements'}</span>
                </button>
              </div>
            </form>

            {aiAlternatives && (
              <div className="mt-4 space-y-2 animate-in fade-in">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Suggested Replacements:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiAlternatives.map((item, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1">
                      <div className="font-bold text-xs text-white flex items-center justify-between">
                        <span>{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          {item.difficulty || 'Alternative'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">Target: {item.targetMuscles} • Equip: {item.equipmentNeeded}</div>
                      <div className="text-xs text-slate-300 mt-1">{item.whyItWorks}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
