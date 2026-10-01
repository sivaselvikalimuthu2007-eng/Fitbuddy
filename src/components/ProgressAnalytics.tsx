import React, { useState } from 'react';
import { TrendingUp, Plus, Activity, Calendar, Award, Flame, Scale, Clock } from 'lucide-react';
import { WorkoutLogEntry, MeasurementEntry, UserRecord } from '../types/fitbuddy';

interface Props {
  user: UserRecord | null;
  workoutLogs: WorkoutLogEntry[];
  measurements: MeasurementEntry[];
  onAddWorkoutLog: (log: any) => Promise<void>;
  onAddMeasurement: (entry: any) => Promise<void>;
}

export const ProgressAnalytics: React.FC<Props> = ({
  user,
  workoutLogs,
  measurements,
  onAddWorkoutLog,
  onAddMeasurement
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'logWorkout' | 'logMeasurement'>('overview');

  // New Workout Log Form State
  const [logTitle, setLogTitle] = useState('');
  const [logDuration, setLogDuration] = useState('45');
  const [logCalories, setLogCalories] = useState('320');
  const [logNotes, setLogNotes] = useState('');
  const [logRpe, setLogRpe] = useState('7');
  const [logExercises, setLogExercises] = useState('');

  // New Measurement Form State
  const [mWeight, setMWeight] = useState(user ? user.weight.toString() : '70');
  const [mBodyFat, setMBodyFat] = useState('');
  const [mChest, setMChest] = useState('');
  const [mWaist, setMWaist] = useState('');
  const [mHips, setMHips] = useState('');

  const totalWorkouts = workoutLogs.length;
  const totalMinutes = workoutLogs.reduce((acc, curr) => acc + curr.durationMins, 0);
  const totalCalories = workoutLogs.reduce((acc, curr) => acc + curr.caloriesBurned, 0);

  const sortedMeasurements = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const initialWeight = sortedMeasurements.length > 0 ? sortedMeasurements[0].weight : (user?.weight || 70);
  const currentWeight = sortedMeasurements.length > 0 ? sortedMeasurements[sortedMeasurements.length - 1].weight : (user?.weight || 70);
  const weightChange = (currentWeight - initialWeight).toFixed(1);

  const handleSubmitWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await onAddWorkoutLog({
      userId: user.id,
      title: logTitle || 'Completed Workout Session',
      durationMins: parseInt(logDuration, 10) || 45,
      caloriesBurned: parseInt(logCalories, 10) || 300,
      notes: logNotes,
      completedExercises: logExercises.split(',').map(s => s.trim()).filter(Boolean),
      perceivedExertion: parseInt(logRpe, 10) || 7
    });
    setLogTitle('');
    setLogNotes('');
    setLogExercises('');
    setActiveSection('overview');
  };

  const handleSubmitMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mWeight) return;
    await onAddMeasurement({
      userId: user.id,
      weight: parseFloat(mWeight),
      bodyFatPercent: mBodyFat ? parseFloat(mBodyFat) : undefined,
      chestCm: mChest ? parseFloat(mChest) : undefined,
      waistCm: mWaist ? parseFloat(mWaist) : undefined,
      hipsCm: mHips ? parseFloat(mHips) : undefined
    });
    setActiveSection('overview');
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Nav */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
            Progress Tracking & Performance Analytics
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Workout History & Measurement Trends</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking performance for {user?.name || 'Athlete'} (Goal: {user?.goal || 'Fitness'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'overview'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveSection('logWorkout')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSection === 'logWorkout'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Log Workout
          </button>
          <button
            onClick={() => setActiveSection('logMeasurement')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSection === 'logMeasurement'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> Log Measurements
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalWorkouts}</div>
            <div className="text-xs text-slate-400">Workouts Logged</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalCalories.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Calories Burned</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalMinutes}</div>
            <div className="text-xs text-slate-400">Total Minutes</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{currentWeight} kg</div>
            <div className="text-xs text-slate-400">
              Net Change: {Number(weightChange) > 0 ? `+${weightChange}` : weightChange} kg
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Log Workout Modal/Form */}
      {activeSection === 'logWorkout' && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl animate-in fade-in">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Log a Completed Workout
          </h3>
          <form onSubmit={handleSubmitWorkout} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Session Title</label>
              <input
                type="text"
                placeholder="e.g. Chest & Triceps Hypertrophy, 5km Outdoor Run..."
                value={logTitle}
                onChange={e => setLogTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={logDuration}
                onChange={e => setLogDuration(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Estimated Calories Burned</label>
              <input
                type="number"
                value={logCalories}
                onChange={e => setLogCalories(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Perceived Exertion (RPE 1-10)</label>
              <select
                value={logRpe}
                onChange={e => setLogRpe(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    RPE {i + 1} {i + 1 >= 9 ? '(Maximum Effort)' : i + 1 >= 7 ? '(Challenging / Hard)' : '(Moderate / Light)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Completed Exercises (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Bench Press 4x8, Incline Dumbbell 3x10, Dips 3x12"
                value={logExercises}
                onChange={e => setLogExercises(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Workout Notes & Reflections</label>
              <textarea
                rows={2}
                placeholder="How did your energy, joints, and pumps feel today?"
                value={logNotes}
                onChange={e => setLogNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setActiveSection('overview')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Save Workout Log
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION: Log Measurement Modal/Form */}
      {activeSection === 'logMeasurement' && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl animate-in fade-in">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            Log Body Measurements & Weight
          </h3>
          <form onSubmit={handleSubmitMeasurement} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={mWeight}
                onChange={e => setMWeight(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Body Fat % (Optional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 14.5"
                value={mBodyFat}
                onChange={e => setMBodyFat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Chest Circumference (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 104"
                value={mChest}
                onChange={e => setMChest(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 81"
                value={mWaist}
                onChange={e => setMWaist(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Hips (cm)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 98"
                value={mHips}
                onChange={e => setMHips(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setActiveSection('overview')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Save Measurements
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Workout History & Body Measurement Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout History */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Workout Sessions
            </h3>
            <span className="text-xs text-slate-400">{workoutLogs.length} Entries</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {workoutLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No workouts logged yet. Click "Log Workout" to track your first session!
              </div>
            ) : (
              workoutLogs.map(log => (
                <div key={log.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{log.title}</span>
                    <span className="text-[11px] font-mono text-slate-400">{log.date}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      ⏱️ {log.durationMins} mins
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      🔥 {log.caloriesBurned} kcal
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      ⚡ RPE {log.perceivedExertion}/10
                    </span>
                  </div>

                  {log.completedExercises?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {log.completedExercises.map((ex, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {ex}
                        </span>
                      ))}
                    </div>
                  )}

                  {log.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Measurement History & Progress Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Body Measurement Timeline
            </h3>
            <span className="text-xs text-slate-400">{measurements.length} Records</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto">
            {measurements.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No measurements logged yet. Click "Log Measurements" to start tracking.
              </div>
            ) : (
              measurements.map(m => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Weight: {m.weight} kg</span>
                    <span className="text-[11px] font-mono text-slate-400">{m.date}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {m.bodyFatPercent && (
                      <div className="p-2 rounded bg-slate-900 text-center border border-slate-800">
                        <div className="text-[10px] text-slate-400">Body Fat</div>
                        <div className="font-bold text-emerald-400">{m.bodyFatPercent}%</div>
                      </div>
                    )}
                    {m.chestCm && (
                      <div className="p-2 rounded bg-slate-900 text-center border border-slate-800">
                        <div className="text-[10px] text-slate-400">Chest</div>
                        <div className="font-bold text-white">{m.chestCm} cm</div>
                      </div>
                    )}
                    {m.waistCm && (
                      <div className="p-2 rounded bg-slate-900 text-center border border-slate-800">
                        <div className="text-[10px] text-slate-400">Waist</div>
                        <div className="font-bold text-white">{m.waistCm} cm</div>
                      </div>
                    )}
                    {m.hipsCm && (
                      <div className="p-2 rounded bg-slate-900 text-center border border-slate-800">
                        <div className="text-[10px] text-slate-400">Hips</div>
                        <div className="font-bold text-white">{m.hipsCm} cm</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
