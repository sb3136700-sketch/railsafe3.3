import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  User, 
  Loader2, 
  X, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  MessageSquare,
  Train,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { TrainDetails, RouteStop } from '../types/railway';

interface FloatingAiAssistantProps {
  currentTrain: TrainDetails;
  currentStation: RouteStop;
  onNavigateToAiPage?: () => void;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({
  currentTrain,
  currentStation,
  onNavigateToAiPage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Namaste! I am your AI Railway Companion for Train #${currentTrain.trainNumber} (${currentTrain.trainName}). Ask me about next halt, catering recommendations, Tatkal rules, platform guidelines, or IRCTC refunds!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    `Next stop after ${currentStation.stationName}?`,
    'What are Tatkal booking opening hours?',
    'What is TDR refund rule for train delays?',
    'What are middle berth sleeping hours?',
  ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
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
        text: data.answer || 'I am ready to assist you on your journey.',
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Offline fallback
      let fallbackText = 'For 24x7 official passenger security or emergency queries, please dial 139 (RailMadad).';
      if (q.toLowerCase().includes('tatkal')) {
        fallbackText = 'Tatkal booking opens at 10:00 AM IST for AC classes (1A, 2A, 3A, CC, EC) and at 11:00 AM IST for Non-AC classes (SL, 2S) one day in advance of travel.';
      } else if (q.toLowerCase().includes('berth') || q.toLowerCase().includes('middle')) {
        fallbackText = 'As per Indian Railways rules, middle berth passengers can sleep between 10:00 PM and 6:00 AM. Lower berth passengers must allow middle berth to be raised during this window.';
      } else if (q.toLowerCase().includes('refund') || q.toLowerCase().includes('delay')) {
        fallbackText = 'Full refund without cancellation charges is given if train is delayed by more than 3 hours at passenger boarding station, provided TDR is filed before actual departure.';
      }

      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: fallbackText,
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-500/15 via-blue-500/20 to-indigo-500/15 hover:from-sky-500/25 hover:to-indigo-500/25 border border-sky-400/40 text-sky-800 dark:text-sky-200 shadow-xl backdrop-blur-md transition-all cursor-pointer group bg-white/90 dark:bg-slate-900/90"
          title="Open AI Railway Assistant"
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-black block leading-none text-slate-900 dark:text-white">Rail AI Assistant</span>
            <span className="text-[10px] text-sky-600 dark:text-sky-300 font-semibold block leading-tight mt-0.5">24/7 Journey Guide</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[520px] rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-sky-500/40 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-fade-in transition-all">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-slate-950 shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-none">
                  AI Railway Assistant
                </span>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono block leading-tight mt-0.5">
                  Train #{currentTrain.trainNumber} · Live Companion
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onNavigateToAiPage && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateToAiPage();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Expand to Full Page"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Strip */}
          <div className="px-3 py-2 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-lg text-[10px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-sky-400/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="h-6 w-6 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`text-[9px] block mt-1 ${m.sender === 'user' ? 'text-sky-100' : 'text-slate-400'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
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
                placeholder="Ask anything about this train..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="p-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
