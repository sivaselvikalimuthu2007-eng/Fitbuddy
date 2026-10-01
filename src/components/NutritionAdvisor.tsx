import React, { useState, useEffect } from 'react';
import { Apple, Utensils, Droplets, Sparkles, Flame, CheckCircle, RefreshCw } from 'lucide-react';
import { UserRecord, NutritionPlan } from '../types/fitbuddy';

interface Props {
  user: UserRecord | null;
  quickNutritionTip: string | null;
}

export const NutritionAdvisor: React.FC<Props> = ({ user, quickNutritionTip }) => {
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFullNutrition = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/nutrition-plan/${user.id}`);
      const data = await res.json();
      if (data.success && data.nutritionPlan) {
        setNutritionPlan(data.nutritionPlan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFullNutrition();
    }
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
            AI Nutrition Suggestions & Diet Recommendations
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Goal-Tailored Dietary Protocol</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Calculated for {user?.name || 'Athlete'} (Goal: {user?.goal || 'General Fitness'}, Weight: {user?.weight || 70}kg).
          </p>
        </div>

        <button
          onClick={fetchFullNutrition}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/30 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Regenerate Diet Plan</span>
        </button>
      </div>

      {/* Quick Gemini Flash Tip Highlight */}
      {quickNutritionTip && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border-l-4 border-l-amber-500 border border-slate-800 rounded-2xl p-5 shadow-md flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Gemini Flash Instant Guidance
              </h4>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
                Low-Latency Model
              </span>
            </div>
            <p className="text-sm text-amber-100/90 mt-1 leading-relaxed">
              {quickNutritionTip}
            </p>
          </div>
        </div>
      )}

      {/* Full AI Nutrition Plan */}
      {isLoading ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-semibold">Gemini AI is calculating your optimal macronutrient targets and meal plan...</p>
        </div>
      ) : nutritionPlan ? (
        <div className="space-y-6">
          {/* Macro Targets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Daily Calorie Target</div>
              <div className="text-2xl font-bold text-amber-400">{nutritionPlan.dailyCalories} kcal</div>
              <div className="text-[10px] text-slate-500">Based on {user?.goal}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Protein Intake</div>
              <div className="text-2xl font-bold text-blue-400">{nutritionPlan.proteinGrams}g</div>
              <div className="text-[10px] text-slate-500">~{((nutritionPlan.proteinGrams * 4 / nutritionPlan.dailyCalories) * 100).toFixed(0)}% of daily intake</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Carbohydrates</div>
              <div className="text-2xl font-bold text-emerald-400">{nutritionPlan.carbGrams}g</div>
              <div className="text-[10px] text-slate-500">Energy & glycogen replenishment</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Hydration Goal</div>
              <div className="text-2xl font-bold text-cyan-400">{nutritionPlan.hydrationTarget || '3.0 L/day'}</div>
              <div className="text-[10px] text-slate-500">Pure water & electrolytes</div>
            </div>
          </div>

          {/* Meal Suggestions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-400" />
              Tailored Daily Meal Suggestions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nutritionPlan.mealSuggestions?.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300">{item.meal}</span>
                    <span className="text-[11px] font-mono text-slate-400">{item.macros}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines & Habits */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Evidence-Based Nutritional Guidelines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {nutritionPlan.guidelines?.map((guide, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-[11px] font-bold">
                    ✓
                  </span>
                  <span>{guide}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
