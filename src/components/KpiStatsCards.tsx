import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  MapPin, 
  Gauge, 
  Calendar, 
  ShieldCheck, 
  Train,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Compass,
  Volume2,
  Radio,
  Sparkles
} from 'lucide-react';
import { TrainDetails } from '../types/railway';

interface KpiStatsCardsProps {
  currentTrain: TrainDetails;
  delayMinutes: number;
  currentSpeed: number;
  stopIndex: number;
  totalStops: number;
  currentApproachingStopName: string;
  nextStopDistanceKm?: number;
  runsToday: boolean;
  onJumpToTimeline?: () => void;
  onJumpToCorridor?: () => void;
}

export const KpiStatsCards: React.FC<KpiStatsCardsProps> = ({
  currentTrain,
  delayMinutes,
  currentSpeed,
  stopIndex,
  totalStops,
  currentApproachingStopName,
  nextStopDistanceKm = 48,
  runsToday,
  onJumpToTimeline,
  onJumpToCorridor,
}) => {
  const [honking, setHonking] = useState(false);
  const isDelayed = delayMinutes > 0;

  // Synthesize realistic twin-tone locomotive horn (WAP-7 / Vande Bharat tone)
  const playLocoHorn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (honking) return;
    setHonking(true);

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const t = ctx.currentTime;

      // Tone 1: 311 Hz (E-flat)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(311, t);
      gain1.gain.setValueAtTime(0.18, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.8);

      // Tone 2: 370 Hz (F-sharp)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(370, t);
      gain2.gain.setValueAtTime(0.18, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.8);

      setTimeout(() => setHonking(false), 850);
    } catch {
      setHonking(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 6 High-Impact Railway KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1: Live Speed & Telemetry */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cruising Speed</span>
            <button
              onClick={playLocoHorn}
              className={`p-1 rounded-lg border transition-all cursor-pointer ${
                honking
                  ? 'bg-amber-500 text-slate-950 border-amber-400 scale-110 shadow'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:scale-105'
              }`}
              title="Blow Locomotive Horn (WAP-7 Twin Tone)"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {currentSpeed}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">km/h</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Max {currentTrain.maxSpeedKmph} km/h</span>
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Track OK
            </span>
          </div>
        </div>

        {/* KPI 2: Live Punctuality / Delay */}
        <div className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm hover:shadow-md transition-all ${
          isDelayed ? 'border-amber-300 dark:border-amber-500/40' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Punctuality</span>
            <div className={`p-1 rounded-lg ${isDelayed ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl lg:text-3xl font-black font-mono tracking-tight ${
              isDelayed ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {isDelayed ? `+${delayMinutes}m` : '0m'}
            </span>
            <span className={`text-xs font-bold ${isDelayed ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isDelayed ? 'Delay' : 'On Time'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="truncate">IST Corridor Status</span>
            <span className={`text-[10px] font-bold ${isDelayed ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isDelayed ? 'Delay Notice' : 'Precise Timing'}
            </span>
          </div>
        </div>

        {/* KPI 3: Journey Start Origin Time */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Journey Start</span>
            <div className="p-1 rounded-lg bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Train className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl lg:text-2xl font-black font-mono text-sky-600 dark:text-sky-400 tracking-tight">
              {currentTrain.sourceDeparture}
            </span>
            <span className="text-[10px] font-mono text-slate-400">IST</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="truncate font-semibold text-slate-700 dark:text-slate-300">{currentTrain.sourceCode} Start</span>
            <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 font-bold">PF {currentTrain.routeStops[0]?.platform || '1'}</span>
          </div>
        </div>

        {/* KPI 4: Terminus Arrival & Distance */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Terminus Arrival</span>
            <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl lg:text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 tracking-tight">
              {currentTrain.destArrival}
            </span>
            <span className="text-[10px] font-mono text-slate-400">IST</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="truncate font-semibold text-slate-700 dark:text-slate-300">{currentTrain.destCode} Terminus</span>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{currentTrain.totalDistanceKm}km</span>
          </div>
        </div>

        {/* KPI 5: Approaching Next Halt */}
        <div 
          onClick={onJumpToCorridor}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          title="Click to view corridor timetable"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Next Station</span>
            <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="truncate text-base lg:text-lg font-black text-slate-900 dark:text-white">
            {currentApproachingStopName}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>~{nextStopDistanceKm} km away</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center">
              Stop {stopIndex + 1}/{totalStops}
              <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* KPI 6: Weekly Frequency / Runs Today */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Operating Days</span>
            <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl lg:text-2xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight">
              {currentTrain.runsOnDays.length === 7 ? '7 Days' : `${currentTrain.runsOnDays.length} D/Wk`}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {currentTrain.runsOnDays.length === 7 ? 'Daily' : 'Special'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-600 dark:text-slate-400">Status:</span>
            <span className={`text-[10px] font-bold ${runsToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {runsToday ? '● Runs Today' : '○ Off Today'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
