import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, Dumbbell, ShieldCheck, Trash2 } from 'lucide-react';
import { ChatMessage, UserRecord } from '../types/fitbuddy';

interface Props {
  user: UserRecord | null;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
}

export const FitBuddyChat: React.FC<Props> = ({
  user,
  messages,
  onSendMessage,
  onClearChat,
  isLoading
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    await onSendMessage(text);
  };

  const QUICK_QUESTIONS = [
    "What can I replace Barbell Squats with to protect my knees?",
    "How much protein should I eat on rest days?",
    "Should I do cardio before or after lifting for fat loss?",
    "How do I prevent lower back strain during Deadlifts?"
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[700px] shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-slate-950/90 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Gemini Fitness AI Coach</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Online • Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized guidance for {user ? `${user.name} (${user.goal})` : 'your fitness journey'}
            </p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1.5"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="text-lg font-bold text-white">Ask FitBuddy AI Anything!</h4>
              <p className="text-xs text-slate-400">
                Ask about exercise technique, replacement movements, calorie/macro timing, injury accommodations, or pacing.
              </p>
            </div>

            <div className="w-full max-w-lg space-y-2 mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Popular Quick Prompts</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 text-slate-300 text-xs transition-all flex items-start gap-2"
                  >
                    <Dumbbell className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-300">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5">
              FitBuddy is analyzing your fitness profile and crafting an evidence-based answer...
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a fitness, nutrition, or workout question..."
          className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>
    </div>
  );
};
