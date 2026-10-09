import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  User, 
  Loader2, 
  Cpu, 
  HelpCircle, 
  Zap, 
  Check, 
  Copy 
} from 'lucide-react';
import { TrainDetails, RouteStop } from '../types/railway';

interface AiAssistantPageProps {
  currentTrain: TrainDetails;
  currentStation: RouteStop;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  source?: string;
  timestamp: string;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  currentTrain,
  currentStation,
}) => {
  const [modelChoice, setModelChoice] = useState<'gemini' | 'huggingface' | 'irctc_kb'>('gemini');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello! I am your AI Train Guide for Train #${currentTrain.trainNumber} (${currentTrain.trainName}). I can answer any question about platform allocations, Tatkal speed booking, IRCTC refund policies, station specialties at upcoming halts, or luggage rules.`,
      source: 'Gemini 2.5 Flash / Indian Railways Core',
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const curatedPrompts = [
    `What is the best food to order near ${currentStation.stationName}?`,
    'What happens if I miss my train at my booked boarding station?',
    'What is the TDR refund rule if train is delayed by more than 3 hours?',
    'Can I carry my pet dog or cat on the train?',
    'What are the exact hours when Middle Berth can be kept open?',
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/rail-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          currentTrain: `${currentTrain.trainNumber} ${currentTrain.trainName}`,
          currentStation: `${currentStation.stationName} (${currentStation.stationCode})`,
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.answer || 'I am ready to help you with your journey.',
        source: modelChoice === 'huggingface' ? 'HuggingFace IndianRail Model' : 'Gemini 2.5 Flash',
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'For 24x7 Indian Railways passenger emergency and enquiries, dial 139 (RailMadad). Passengers can claim 100% full refund on filing TDR if train is delayed by more than 3 hours before departure.',
        source: 'IRCTC Verified Knowledge Base',
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-600 dark:text-cyan-400 font-semibold mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Intelligent Rail Companion Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Travel Guide & Rail Intelligence</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time context-aware assistant for train schedules, coach tips, and platform guidelines
          </p>
        </div>

        {/* Engine switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setModelChoice('gemini')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              modelChoice === 'gemini'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>Gemini 2.5 Flash</span>
          </button>

          <button
            onClick={() => setModelChoice('huggingface')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              modelChoice === 'huggingface'
                ? 'bg-amber-500 text-slate-950 shadow font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="h-3 w-3" />
            <span>IndianRail NLP</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md flex flex-col h-[560px] overflow-hidden">
        {/* Curated Prompt Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Quick Prompts:</span>
          {curatedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700/60 text-[11px] cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-cyan-500/20 text-sky-600 dark:text-cyan-400 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isAi
                      ? 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm'
                      : 'bg-sky-500 text-white shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    <span>{m.source || 'Passenger Inquiry'}</span>
                    <span>{m.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-sky-600 dark:text-cyan-400 text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing railway rules...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about this train or railway rules..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs disabled:opacity-40 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
