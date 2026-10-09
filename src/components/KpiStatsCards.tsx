import React from 'react';
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
  Compass
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
  const isDelayed = delayMinutes > 0;
  const progressPercent = Math.min(100, Math.round(((stopIndex) / Math.max(1, totalStops - 1)) * 100));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* KPI 1: Live Speed & Telemetry */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-md relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Cruising Speed</span>
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
            <Gauge className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-black font-mono text-white tracking-tight">
            {currentSpeed}
          </span>
          <span className="text-xs font-bold text-amber-400/90">km/h</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Max {currentTrain.maxSpeedKmph} km/h</span>
          <span className="inline-flex items-center text-emerald-400 font-medium text-[10px]">
            <TrendingUp className="h-3 w-3 mr-0.5" /> Optimal
          </span>
        </div>
      </div>

      {/* KPI 2: Live Punctuality / Delay */}
      <div className={`p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border shadow-md relative overflow-hidden group transition-all ${
        isDelayed ? 'border-amber-500/40' : 'border-emerald-500/30'
      }`}>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Punctuality</span>
          <div className={`p-1 rounded-lg ${isDelayed ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl lg:text-3xl font-black font-mono tracking-tight ${
            isDelayed ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {isDelayed ? `+${delayMinutes}m` : '0m'}
          </span>
          <span className={`text-xs font-bold ${isDelayed ? 'text-amber-400/80' : 'text-emerald-400/80'}`}>
            {isDelayed ? 'Delay' : 'On Time'}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="truncate">IST Corridor Check</span>
          <span className={`text-[10px] font-bold ${isDelayed ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isDelayed ? 'Delayed' : 'Precise'}
          </span>
        </div>
      </div>

      {/* KPI 3: Journey Start Origin Time */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-md relative overflow-hidden group hover:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Journey Start</span>
          <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Train className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl lg:text-2xl font-black font-mono text-cyan-300 tracking-tight">
            {currentTrain.sourceDeparture}
          </span>
          <span className="text-[10px] font-mono text-slate-400">IST</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="truncate text-slate-300 font-semibold">{currentTrain.sourceCode} Start</span>
          <span className="font-mono text-[10px] text-cyan-400 font-bold">PF {currentTrain.routeStops[0]?.platform || '1'}</span>
        </div>
      </div>

      {/* KPI 4: Terminus Arrival & Distance */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-md relative overflow-hidden group hover:border-indigo-500/40 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Terminus Arrival</span>
          <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl lg:text-2xl font-black font-mono text-indigo-300 tracking-tight">
            {currentTrain.destArrival}
          </span>
          <span className="text-[10px] font-mono text-slate-400">IST</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="truncate text-slate-300 font-semibold">{currentTrain.destCode} Terminus</span>
          <span className="font-mono text-[10px] text-slate-400">{currentTrain.totalDistanceKm}km</span>
        </div>
      </div>

      {/* KPI 5: Approaching Next Halt */}
      <div 
        onClick={onJumpToCorridor}
        className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-md relative overflow-hidden group hover:border-lime-500/40 transition-all cursor-pointer"
        title="Click to view corridor timetable"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Next Station</span>
          <div className="p-1 rounded-lg bg-lime-500/10 text-lime-400 group-hover:scale-110 transition-transform">
            <Compass className="h-4 w-4" />
          </div>
        </div>
        <div className="truncate text-base lg:text-lg font-black text-white">
          {currentApproachingStopName}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span>~{nextStopDistanceKm} km away</span>
          <span className="text-lime-400 font-bold text-[10px] flex items-center">
            Stop {stopIndex + 1}/{totalStops}
            <ArrowUpRight className="h-3 w-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* KPI 6: Weekly Frequency / Runs Today */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Operating Days</span>
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl lg:text-2xl font-black font-mono text-emerald-300 tracking-tight">
            {currentTrain.runsOnDays.length === 7 ? '7 Days' : `${currentTrain.runsOnDays.length} D/Wk`}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {currentTrain.runsOnDays.length === 7 ? 'Daily' : 'Special'}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-300">Today:</span>
          <span className={`text-[10px] font-bold ${runsToday ? 'text-emerald-400' : 'text-amber-400'}`}>
            {runsToday ? '● Runs Today' : '○ Off Today'}
          </span>
        </div>
      </div>
    </div>
  );
};
