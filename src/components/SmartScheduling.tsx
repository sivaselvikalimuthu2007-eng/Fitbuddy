import React, { useState } from 'react';
import { Calendar, Bell, Clock, CheckCircle2, Circle, Plus, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { ScheduleItem, ReminderSetting, UserRecord } from '../types/fitbuddy';

interface Props {
  user: UserRecord | null;
  schedules: ScheduleItem[];
  reminders: ReminderSetting[];
  onToggleSchedule: (itemId: string) => Promise<void>;
  onToggleReminder: (reminderId: string) => Promise<void>;
  onAddReminder: (data: any) => Promise<void>;
}

export const SmartScheduling: React.FC<Props> = ({
  user,
  schedules,
  reminders,
  onToggleSchedule,
  onToggleReminder,
  onAddReminder
}) => {
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [remTitle, setRemTitle] = useState('Workout Time!');
  const [remDays, setRemDays] = useState('Mon, Wed, Fri');
  const [remTime, setRemTime] = useState('07:00');
  const [remMessage, setRemMessage] = useState('Get your water bottle ready and start warming up!');

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmitReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await onAddReminder({
      userId: user.id,
      title: remTitle,
      dayOfWeek: remDays,
      time: remTime,
      message: remMessage
    });
    setShowAddReminder(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold">
            Smart Scheduling & Consistency Reminders
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Weekly Training Calendar & Alerts</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated schedule aligned with {user?.name || 'Athlete'}'s availability ({user?.daysPerWeek || 4} days/week, {user?.workoutDurationMins || 45} mins).
          </p>
        </div>

        <button
          onClick={() => setShowAddReminder(!showAddReminder)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{showAddReminder ? 'Close Form' : '+ Add Reminder'}</span>
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAddReminder && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl animate-in fade-in">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            Create Notification & Motivation Trigger
          </h3>
          <form onSubmit={handleSubmitReminder} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Reminder Title</label>
              <input
                type="text"
                value={remTitle}
                onChange={e => setRemTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Days of Week</label>
              <input
                type="text"
                value={remDays}
                onChange={e => setRemDays(e.target.value)}
                placeholder="e.g. Mon, Wed, Fri"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Alert Time</label>
              <input
                type="time"
                value={remTime}
                onChange={e => setRemTime(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Encouragement Message</label>
              <input
                type="text"
                value={remMessage}
                onChange={e => setRemMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddReminder(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Save Reminder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: 7-Day Calendar & Active Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7-Day Weekly Schedule */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Interactive Weekly Schedule
            </h3>
            <span className="text-xs text-slate-400">Click circle to mark completed</span>
          </div>

          <div className="space-y-2.5">
            {daysOrder.map(day => {
              const dayItems = schedules.filter(s => s.dayOfWeek === day);
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

              return (
                <div
                  key={day}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isToday
                      ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{day}</span>
                      {isToday && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-semibold uppercase">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {dayItems.length > 0 ? `${dayItems.length} Activity` : 'Rest Day'}
                    </span>
                  </div>

                  {dayItems.length > 0 ? (
                    <div className="mt-2.5 space-y-2">
                      {dayItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => onToggleSchedule(item.id)}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                            item.completed
                              ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400 shrink-0" />
                            )}
                            <div>
                              <div className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                                {item.activity}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Scheduled at {item.time} • {item.durationMins} minutes
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${item.completed ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                            {item.completed ? 'Completed' : 'Upcoming'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic mt-1">
                      Scheduled active rest, gentle stroll, and recovery hydration.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Smart Reminders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Active Reminders
            </h3>
            <span className="text-xs text-slate-400">{reminders.filter(r => r.enabled).length} Enabled</span>
          </div>

          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No reminders created yet. Add one above!
              </div>
            ) : (
              reminders.map(rem => (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    rem.enabled
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{rem.time}</span>
                        <span className="text-slate-400">• {rem.dayOfWeek}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-1">{rem.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{rem.message}</div>
                    </div>

                    <button
                      onClick={() => onToggleReminder(rem.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        rem.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rem.enabled ? 'ON' : 'OFF'}
                    </button>
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
