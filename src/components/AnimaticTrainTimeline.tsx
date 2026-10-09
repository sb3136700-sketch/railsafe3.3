import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Clock, 
  Train, 
  Radio, 
  Compass, 
  Gauge, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react';
import { TrainDetails, RouteStop } from '../types/railway';
import { calculateTrainScheduleState } from '../utils/trainSchedule';

interface AnimaticTrainTimelineProps {
  currentTrain: TrainDetails;
  selectedJourneyDate?: string;
  onSetAlarmForStation?: (stationCode: string, stationName: string) => void;
}

// Synthesize pleasant railway sound effects using Web Audio API (zero external assets)
class TrainAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private intervalId: number | null = null;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Soft track rhythmic click-clack
  public playClickClack() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // First tap
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(140, t);
    osc1.frequency.exponentialRampToValueAtTime(40, t + 0.06);

    gain1.gain.setValueAtTime(0.04, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc1.connect(filter);
    filter.connect(gain1);
    gain1.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.07);

    // Second tap (track seam)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const t2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(120, t2);
      osc2.frequency.exponentialRampToValueAtTime(35, t2 + 0.05);

      gain2.gain.setValueAtTime(0.03, t2);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.05);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(t2);
      osc2.stop(t2 + 0.06);
    }, 110);
  }

  // Classic gentle train departure horn (two-tone chord)
  public playHorn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [311.13, 370.0]; // D#4 + F#4 rail horn interval

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.035, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.75);
    });
  }
}

export const AnimaticTrainTimeline: React.FC<AnimaticTrainTimelineProps> = ({
  currentTrain,
  selectedJourneyDate,
  onSetAlarmForStation,
}) => {
  const stops = currentTrain.routeStops;
  const totalStops = stops.length;
  const totalDistance = currentTrain.totalDistanceKm || 1;

  // Sound Engine
  const soundEngineRef = useRef<TrainAudioSynthesizer | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    soundEngineRef.current = new TrainAudioSynthesizer();
    return () => {
      soundEngineRef.current?.setMuted(true);
    };
  }, []);

  const toggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    soundEngineRef.current?.setMuted(!nextState);
    if (nextState) {
      soundEngineRef.current?.playHorn();
    }
  };

  // Simulation & Animation State
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [progressRatio, setProgressRatio] = useState<number>(0.25); // 0.0 to 1.0 across the whole route
  const [syncWithLiveSchedule, setSyncWithLiveSchedule] = useState(false);
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null);

  // Compute live timetable state
  const liveState = calculateTrainScheduleState(
    currentTrain,
    selectedJourneyDate ? new Date(selectedJourneyDate) : new Date()
  );

  // If syncWithLiveSchedule is toggled, snap to timetable progress
  useEffect(() => {
    if (syncWithLiveSchedule) {
      const ratio = (liveState.totalPercent || 0) / 100;
      setProgressRatio(Math.min(1, Math.max(0, ratio)));
      setIsPlaying(false);
    }
  }, [syncWithLiveSchedule, liveState.totalPercent]);

  // Main Animation Loop
  useEffect(() => {
    if (!isPlaying || syncWithLiveSchedule) return;

    let soundTickCounter = 0;
    const interval = setInterval(() => {
      setProgressRatio((prev) => {
        // Increment progress based on speed
        // At 1x, traverses 100% of route in ~70 seconds
        const step = (0.0014 * simSpeed);
        const next = prev + step;

        // Sound trigger periodically
        soundTickCounter += 1;
        if (soundTickCounter % 15 === 0 && isAudioEnabled) {
          soundEngineRef.current?.playClickClack();
        }

        if (next >= 1.0) {
          setIsPlaying(false);
          return 1.0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, syncWithLiveSchedule, isAudioEnabled]);

  // Derived current metrics along the route
  const currentKm = Math.round(progressRatio * totalDistance);
  const remainingKm = Math.max(0, totalDistance - currentKm);

  // Determine current active stop segment
  let currentStopIndex = 0;
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].distanceKm <= currentKm) {
      currentStopIndex = i;
    } else {
      break;
    }
  }

  const prevStop = stops[currentStopIndex] || stops[0];
  const nextStop = stops[Math.min(stops.length - 1, currentStopIndex + 1)];
  const isAtHalt = stops.some(
    (s) => Math.abs(s.distanceKm - currentKm) <= 3 && s.distanceKm > 0 && s.distanceKm < totalDistance
  );

  // Signal aspect determination for each stop
  // Green = upcoming stations clear
  // Amber = next approaching stop
  // Red = stop being occupied or train halted
  const getSignalAspect = (stopIdx: number): 'green' | 'amber' | 'red' => {
    if (stopIdx < currentStopIndex) return 'green'; // Section cleared
    if (stopIdx === currentStopIndex) {
      return isAtHalt ? 'red' : 'amber';
    }
    if (stopIdx === currentStopIndex + 1) return 'amber';
    return 'green';
  };

  // Stepper handlers
  const handlePrevStation = () => {
    setSyncWithLiveSchedule(false);
    const targetIdx = Math.max(0, currentStopIndex - 1);
    const targetKm = stops[targetIdx].distanceKm;
    setProgressRatio(targetKm / totalDistance);
  };

  const handleNextStation = () => {
    setSyncWithLiveSchedule(false);
    const targetIdx = Math.min(stops.length - 1, currentStopIndex + 1);
    const targetKm = stops[targetIdx].distanceKm;
    setProgressRatio(targetKm / totalDistance);
  };

  const handleReset = () => {
    setSyncWithLiveSchedule(false);
    setProgressRatio(0);
    setIsPlaying(true);
    soundEngineRef.current?.playHorn();
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSyncWithLiveSchedule(false);
    const val = parseFloat(e.target.value);
    setProgressRatio(val);
  };

  // Speed calculation for animatic display
  const effectiveSpeedKmph = isAtHalt
    ? 0
    : progressRatio >= 0.99
    ? 0
    : Math.round(currentTrain.avgSpeedKmph * (0.85 + Math.sin(progressRatio * Math.PI * 4) * 0.15));

  const inspectedStation = selectedStationIndex !== null ? stops[selectedStationIndex] : null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative Blueprint Grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* HEADER: Title, Train Number & Tele-Indicator Mode */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 flex-wrap">
            <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {currentTrain.trainNumber}
            </span>
            <span>·</span>
            <span className="text-slate-300 font-semibold">{currentTrain.trainName}</span>
            <span>·</span>
            <span className="text-slate-400 font-mono">{totalStops} Stations / {totalDistance} KM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Train className="h-6 w-6 text-amber-400" />
            <span>Animatic Route Timeline</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider font-semibold">
              Live Motion Visualizer
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Handcrafted mechanical railway simulation showing real-time track progression, signal aspects, and station dwell times.
          </p>
        </div>

        {/* Telemetry Status Box (Mechanical Departure Indicator Style) */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-4">
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
                Telemetry Speed
              </div>
              <div className="text-xl font-black font-mono text-white flex items-baseline gap-1">
                <span className={effectiveSpeedKmph > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                  {effectiveSpeedKmph}
                </span>
                <span className="text-xs text-slate-400 font-normal">km/h</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
                Progress
              </div>
              <div className="text-xl font-black font-mono text-cyan-400">
                {Math.round(progressRatio * 100)}%
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
                Current Block
              </div>
              <div className="text-xs font-mono font-bold text-amber-300">
                {isAtHalt ? `AT ${prevStop.stationCode}` : `${prevStop.stationCode} → ${nextStop.stationCode}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCH CONTROLS STRIP (Interactive manual control deck) */}
      <div className="relative z-10 my-5 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
        {/* Play / Pause / Replay / Speed */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setSyncWithLiveSchedule(false);
              setIsPlaying(!isPlaying);
              if (!isPlaying && isAudioEnabled) soundEngineRef.current?.playClickClack();
            }}
            className={`h-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shadow ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play Ride'}</span>
          </button>

          <button
            onClick={handleReset}
            className="h-8 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Reset to Origin"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1 hidden sm:block" />

          {/* Steppers */}
          <button
            onClick={handlePrevStation}
            className="h-8 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            disabled={currentStopIndex === 0}
            title="Jump to Previous Station"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Prev Stop</span>
          </button>

          <button
            onClick={handleNextStation}
            className="h-8 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            disabled={currentStopIndex >= stops.length - 1}
            title="Jump to Next Station"
          >
            <span className="hidden md:inline">Next Stop</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1 hidden sm:block" />

          {/* Speed Multiplier Segmented Control */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                  simSpeed === spd
                    ? 'bg-slate-800 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Live Timetable Sync & Sound Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSyncWithLiveSchedule(!syncWithLiveSchedule)}
            className={`h-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all border ${
              syncWithLiveSchedule
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Lock position to current IST timetable time"
          >
            <Radio className={`h-3.5 w-3.5 ${syncWithLiveSchedule ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{syncWithLiveSchedule ? 'Synced to Live IST' : 'Sync to Live IST'}</span>
          </button>

          <button
            onClick={toggleAudio}
            className={`h-8 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors border ${
              isAudioEnabled
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={isAudioEnabled ? 'Mute track audio' : 'Enable realistic track sound effects'}
          >
            {isAudioEnabled ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isAudioEnabled ? 'Audio On' : 'Sound'}</span>
          </button>
        </div>
      </div>

      {/* THE ANIMATIC RAILWAY TRACK (The Visual Masterpiece) */}
      <div className="relative z-10 my-8 py-6 px-2 sm:px-6 bg-slate-950 rounded-2xl border border-slate-800/90 shadow-inner overflow-hidden">
        
        {/* Overhead Catenary Cable (Electric Line) */}
        <div className="relative mb-8 px-4 sm:px-8">
          <div className="h-0.5 w-full bg-slate-700/60 relative">
            {/* Catenary Mast Poles spaced across track */}
            <div className="absolute inset-0 flex justify-between pointer-events-none">
              {[0, 15, 30, 45, 60, 75, 90, 100].map((pct) => (
                <div key={pct} className="relative flex flex-col items-center">
                  <div className="w-1 h-7 bg-slate-600/80 -mt-6 rounded-t" />
                  <div className="w-4 h-0.5 bg-slate-500 -mt-6" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RAIL TRACK CONTAINER */}
        <div className="relative px-4 sm:px-8">
          
          {/* Dual Steel Rails & Wooden Sleepers */}
          <div className="relative h-12 flex items-center">
            {/* Sleepers (Cross ties) */}
            <div 
              className="absolute inset-x-0 h-8 rounded bg-repeat-x opacity-60 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #1e293b 0px, #1e293b 4px, transparent 4px, transparent 16px)',
              }}
            />

            {/* Top Steel Rail */}
            <div className="absolute top-2 inset-x-0 h-1 bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 shadow-sm" />
            {/* Bottom Steel Rail */}
            <div className="absolute bottom-2 inset-x-0 h-1 bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 shadow-sm" />

            {/* Electric Track Live Glow Trail (Completed segment) */}
            <div 
              className="absolute top-2 left-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              style={{ width: `${progressRatio * 100}%` }}
            />
            <div 
              className="absolute bottom-2 left-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              style={{ width: `${progressRatio * 100}%` }}
            />

            {/* THE ANIMATED TRAIN (Locomotive + Passenger Carriages) */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-150 pointer-events-none"
              style={{ 
                left: `clamp(12px, calc(${progressRatio * 100}% - 48px), calc(100% - 90px))` 
              }}
            >
              <div className="relative flex items-center">
                
                {/* Forward Headlight Beam Cone */}
                <div 
                  className="absolute left-[78px] top-1/2 -translate-y-1/2 w-28 h-10 pointer-events-none opacity-80"
                  style={{
                    background: 'radial-gradient(ellipse at left, rgba(253, 224, 71, 0.45) 0%, rgba(253, 224, 71, 0.1) 50%, transparent 80%)',
                    clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)'
                  }}
                />

                {/* Train Vector Illustration (Handcrafted WAP-7 / Vande Bharat Profile) */}
                <svg width="86" height="34" viewBox="0 0 86 34" fill="none" className="drop-shadow-lg">
                  {/* Pantograph */}
                  <path d="M42 9 L46 2 L56 2" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="56" cy="2" r="1.5" fill="#f59e0b" />

                  {/* Coach 2 (Trailing) */}
                  <rect x="2" y="10" width="22" height="15" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                  <rect x="5" y="13" width="5" height="4" rx="0.5" fill="#38bdf8" opacity="0.8" />
                  <rect x="12" y="13" width="5" height="4" rx="0.5" fill="#38bdf8" opacity="0.8" />

                  {/* Coupling */}
                  <line x1="24" y1="18" x2="27" y2="18" stroke="#475569" strokeWidth="2" />

                  {/* Coach 1 (Middle) */}
                  <rect x="27" y="10" width="24" height="15" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                  <rect x="30" y="13" width="5" height="4" rx="0.5" fill="#38bdf8" opacity="0.8" />
                  <rect x="37" y="13" width="5" height="4" rx="0.5" fill="#38bdf8" opacity="0.8" />

                  {/* Coupling */}
                  <line x1="51" y1="18" x2="54" y2="18" stroke="#475569" strokeWidth="2" />

                  {/* Driving Motor Coach / Engine (Lead) */}
                  <path 
                    d="M54 10 H73 Q82 12 84 20 L84 25 H54 Z" 
                    fill="#0f766e" 
                    stroke="#14b8a6" 
                    strokeWidth="1" 
                  />
                  {/* Vande Bharat Aerodynamic Blue/White Stripe */}
                  <path d="M54 18 H81" stroke="#f59e0b" strokeWidth="1.5" />
                  {/* Driver Windshield */}
                  <path d="M72 12 L79 16 L74 16 Z" fill="#bae6fd" />
                  {/* Headlamp */}
                  <circle cx="83" cy="21" r="2" fill="#fef08a" />
                  <circle cx="83" cy="21" r="3.5" fill="#fef08a" opacity="0.4" />

                  {/* Wheels (Bogies) */}
                  <circle cx="10" cy="26" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="18" cy="26" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="34" cy="26" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="43" cy="26" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="61" cy="26" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="73" cy="26" r="2.5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
                </svg>

                {/* Train Floating Speed & Loco Tag */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-500/50 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-bold whitespace-nowrap shadow-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{effectiveSpeedKmph} km/h</span>
                </div>
              </div>
            </div>

            {/* STATION NODES ALONG THE LINE */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              {stops.map((stop, idx) => {
                const stopRatio = stop.distanceKm / totalDistance;
                const isPassed = stopRatio < progressRatio - 0.02;
                const isCurrent = Math.abs(stopRatio - progressRatio) <= 0.035;
                const signalAspect = getSignalAspect(idx);

                return (
                  <div 
                    key={stop.stationCode}
                    className="relative flex flex-col items-center pointer-events-auto"
                    style={{
                      position: 'absolute',
                      left: `${stopRatio * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {/* Signal Post (Above Track) */}
                    <div className="absolute -top-11 flex flex-col items-center">
                      <div className="bg-slate-900 border border-slate-700 rounded-full px-1 py-1 flex flex-col gap-0.5 shadow">
                        <span 
                          className={`w-2 h-2 rounded-full transition-all ${
                            signalAspect === 'red' ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-slate-800'
                          }`} 
                        />
                        <span 
                          className={`w-2 h-2 rounded-full transition-all ${
                            signalAspect === 'amber' ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-slate-800'
                          }`} 
                        />
                        <span 
                          className={`w-2 h-2 rounded-full transition-all ${
                            signalAspect === 'green' ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-slate-800'
                          }`} 
                        />
                      </div>
                      <div className="w-0.5 h-2 bg-slate-600" />
                    </div>

                    {/* Station Track Node Marker */}
                    <button
                      onClick={() => setSelectedStationIndex(idx)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer z-20 ${
                        isCurrent
                          ? 'bg-amber-400 border-white text-slate-950 font-black scale-125 shadow-[0_0_15px_rgba(245,158,11,0.9)] animate-pulse'
                          : isPassed
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-300'
                      }`}
                      title={`${stop.stationName} (${stop.stationCode}) - Click for details`}
                    >
                      <span className="text-[10px] font-mono">{idx + 1}</span>
                    </button>

                    {/* Station Info Below Track */}
                    <div className="absolute top-10 flex flex-col items-center text-center w-24">
                      <button
                        onClick={() => setSelectedStationIndex(idx)}
                        className={`text-xs font-mono font-bold hover:underline transition-colors ${
                          isCurrent ? 'text-amber-300' : isPassed ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {stop.stationCode}
                      </button>
                      <span className="text-[10px] text-slate-400 truncate max-w-[85px] leading-tight">
                        {stop.stationName}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                        {stop.distanceKm} km
                      </span>
                      <span className="text-[9px] font-mono text-amber-400/90 font-medium">
                        {stop.arrivalTime === 'Source' ? stop.departureTime : stop.arrivalTime}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* INTERACTIVE TRACK SCRUBBER (Drag to inspect any point on journey) */}
        <div className="mt-20 pt-4 px-4 sm:px-8">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>{currentTrain.sourceCode} (0 km)</span>
            <span className="text-amber-400 font-bold">
              Scrubber: {currentKm} km / {totalDistance} km
            </span>
            <span>{currentTrain.destCode} ({totalDistance} km)</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.002"
            value={progressRatio}
            onChange={handleScrub}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-amber-500 hover:accent-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* INSPECTED STATION DETAILS DRAWER (When user clicks any station node) */}
      {inspectedStation && (
        <div className="relative z-10 mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-amber-300 font-bold text-sm">
                  {inspectedStation.stationCode}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-white font-bold text-sm">
                  {inspectedStation.stationName}
                </span>
                <span className="text-slate-400">({inspectedStation.city}, {inspectedStation.state})</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] font-semibold">
                  Platform {inspectedStation.platform}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-4 text-slate-300 text-xs flex-wrap font-mono">
                <span>Arrival: <strong>{inspectedStation.arrivalTime}</strong></span>
                <span>Departure: <strong>{inspectedStation.departureTime}</strong></span>
                <span>Halt: <strong>{inspectedStation.haltMinutes > 0 ? `${inspectedStation.haltMinutes} mins` : 'Origin/Terminus'}</strong></span>
                <span>Distance from Origin: <strong>{inspectedStation.distanceKm} km</strong></span>
              </div>

              {inspectedStation.localSpecialty && (
                <div className="mt-2 text-slate-300 flex items-baseline gap-1.5">
                  <span className="text-amber-400 font-semibold">Famous Station Food:</span>
                  <span>{inspectedStation.localSpecialty.dish}</span>
                  <span className="text-slate-500">({inspectedStation.localSpecialty.description})</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onSetAlarmForStation && (
                <button
                  onClick={() => onSetAlarmForStation(inspectedStation.stationCode, inspectedStation.stationName)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Set Alarm
                </button>
              )}
              <button
                onClick={() => setSelectedStationIndex(null)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER METRICS SUMMARY (Section details at a glance) */}
      <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Journey Start</div>
          <div className="text-white font-bold font-mono mt-0.5">{currentTrain.sourceDeparture}</div>
          <div className="text-slate-400 text-[11px]">{currentTrain.sourceName}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Next Approaching</div>
          <div className="text-amber-300 font-bold font-mono mt-0.5">{nextStop.stationCode} (PF {nextStop.platform})</div>
          <div className="text-slate-400 text-[11px]">ETA {nextStop.arrivalTime}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Distance Left</div>
          <div className="text-cyan-400 font-bold font-mono mt-0.5">{remainingKm} KM</div>
          <div className="text-slate-400 text-[11px]">Total: {totalDistance} KM</div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Terminus Arrival</div>
          <div className="text-white font-bold font-mono mt-0.5">{currentTrain.destArrival}</div>
          <div className="text-slate-400 text-[11px]">{currentTrain.destName}</div>
        </div>
      </div>
    </div>
  );
};
