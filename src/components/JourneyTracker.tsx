import React, { useState, useEffect } from 'react';
import { 
  Train, 
  Clock, 
  MapPin, 
  Gauge, 
  Share2, 
  Bell, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  Utensils, 
  AlertCircle,
  Copy,
  Check,
  Compass,
  FileText,
  Car,
  Ticket,
  ExternalLink,
  Calculator,
  Building2,
  LayoutGrid,
  CheckSquare,
  RefreshCw,
  Radio,
  CheckCircle2,
  XCircle,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { TrainDetails, RouteStop, DestinationAlarm, UserProfile, RealTimeTrainStatus } from '../types/railway';
import { 
  ALL_DAYS_ORDERED, 
  DAY_ABBRS_BY_INDEX, 
  FULL_DAY_NAMES, 
  getIstDate, 
  formatDateIso, 
  formatDateDisplay, 
  isTrainOperatingOnDate, 
  getNextOperatingDate,
  calculateTrainScheduleState,
  getOperatingDaysSummary
} from '../utils/trainSchedule';
import { KpiStatsCards } from './KpiStatsCards';
import { playRailwayChime, playWakeupAlarm } from '../utils/audioChime';
import { DestinationWeatherCard } from './DestinationWeatherCard';
import { LuggageReminderCard } from './LuggageReminderCard';

interface JourneyTrackerProps {
  currentTrain: TrainDetails;
  allTrains: TrainDetails[];
  onSelectTrain: (train: TrainDetails) => void;
  alarm: DestinationAlarm;
  onOpenAlarmModal: () => void;
  onNavigateToRoute: () => void;
  onNavigateToNearby: () => void;
  onOpenComplaintModal: () => void;
  onOpenFoodModal: () => void;
  onOpenTicketModal: () => void;
  userProfile: UserProfile;
  onNavigateToPnrStatus?: () => void;
  onNavigateToFareCalculator?: () => void;
  onNavigateToCoachPosition?: () => void;
  onNavigateToStationInfo?: () => void;
  onNavigateToChecklist?: () => void;
}

export const JourneyTracker: React.FC<JourneyTrackerProps> = ({
  currentTrain,
  allTrains,
  onSelectTrain,
  alarm,
  onOpenAlarmModal,
  onNavigateToRoute,
  onNavigateToNearby,
  onOpenComplaintModal,
  onOpenFoodModal,
  onOpenTicketModal,
  userProfile,
  onNavigateToPnrStatus,
  onNavigateToFareCalculator,
  onNavigateToCoachPosition,
  onNavigateToStationInfo,
  onNavigateToChecklist,
}) => {
  // IST Date & Journey Origin Timing State
  const istToday = getIstDate();
  const yesterdayDate = new Date(istToday.getTime() - 24 * 60 * 60 * 1000);
  const tomorrowDate = new Date(istToday.getTime() + 24 * 60 * 60 * 1000);

  const [selectedJourneyDate, setSelectedJourneyDate] = useState<string>(() => {
    return formatDateIso(istToday);
  });

  // Parse selected date as Date object
  const selectedDateObj = React.useMemo(() => {
    const parts = selectedJourneyDate.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return istToday;
  }, [selectedJourneyDate, istToday]);

  // Periodic clock tick every 30s to update timetable calculations against current IST time
  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setClockTick((c) => c + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute accurate timetable schedule state based on current IST time and train route stops
  const scheduleState = React.useMemo(() => {
    return calculateTrainScheduleState(currentTrain, selectedDateObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrain, selectedDateObj, clockTick]);

  // Mode: by default follow accurate real-time schedule, allow corridor demo animation when requested
  const [isSimulating, setIsSimulating] = useState(false);
  const [stopIndex, setStopIndex] = useState(() => scheduleState.calculatedStopIndex);
  const [progressBetweenStops, setProgressBetweenStops] = useState(() => scheduleState.calculatedProgress);
  const [currentSpeed, setCurrentSpeed] = useState(() => scheduleState.speedKmph);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [alarmTriggered, setAlarmTriggered] = useState(false);

  // Sync state whenever train or schedule calculation changes (when not in manual simulation mode)
  useEffect(() => {
    if (!isSimulating) {
      setStopIndex(scheduleState.calculatedStopIndex);
      setProgressBetweenStops(scheduleState.calculatedProgress);
      setCurrentSpeed(scheduleState.speedKmph);
    }
  }, [scheduleState, isSimulating]);

  // Calculate day-of-week and operating schedule
  const todayDayAbbr = DAY_ABBRS_BY_INDEX[istToday.getDay()];
  const todayFullName = FULL_DAY_NAMES[todayDayAbbr] || todayDayAbbr;
  const runsToday = isTrainOperatingOnDate(currentTrain, istToday);
  const nextOperating = getNextOperatingDate(currentTrain, istToday);

  // Real-Time Train Running Status state
  const [liveStatus, setLiveStatus] = useState<RealTimeTrainStatus | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveFetchError, setLiveFetchError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const stops = currentTrain.routeStops;
  const currentApproachingStop: RouteStop = isSimulating 
    ? (stops[stopIndex] || stops[stops.length - 1])
    : (scheduleState.approachingStop || stops[stopIndex] || stops[stops.length - 1]);
  const previousStop: RouteStop = isSimulating
    ? stops[Math.max(0, stopIndex - 1)]
    : (scheduleState.lastDepartedStop || stops[Math.max(0, stopIndex - 1)]);

  const segStartKm = previousStop.distanceKm;
  const segEndKm = currentApproachingStop.distanceKm;
  const totalJourneyKm = currentTrain.totalDistanceKm;
  
  const currentKm = isSimulating
    ? Math.round(segStartKm + (segEndKm - segStartKm) * progressBetweenStops)
    : scheduleState.currentKm;
  const remainingKm = isSimulating
    ? Math.max(0, totalJourneyKm - currentKm)
    : scheduleState.remainingKm;
  const totalPercent = isSimulating
    ? Math.min(100, Math.max(0, Math.round((currentKm / totalJourneyKm) * 100)))
    : scheduleState.totalPercent;

  // Fetch verified live status from server endpoint (supporting journey origin date)
  const fetchLiveStatus = async (trainNum: string, journeyDate?: string) => {
    setIsLoadingLive(true);
    setLiveFetchError(null);
    try {
      const dateToUse = journeyDate || selectedJourneyDate;
      const dateQuery = dateToUse ? `?date=${encodeURIComponent(dateToUse)}` : '';
      const res = await fetch(`/api/train-live-status/${encodeURIComponent(trainNum)}${dateQuery}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data: RealTimeTrainStatus = await res.json();
      setLiveStatus(data);
      setLastFetchedAt(new Date());
      if (data.success && typeof data.delayMinutes === 'number') {
        setDelayMinutes(data.delayMinutes);
      }
    } catch (err: any) {
      console.error('Failed to fetch live train status:', err);
      setLiveFetchError(err.message || 'Failed to connect to railway status service');
    } finally {
      setIsLoadingLive(false);
    }
  };

  // When train selection or journey date changes: clear stale data and fetch fresh live status
  useEffect(() => {
    setLiveStatus(null);
    setLiveFetchError(null);
    fetchLiveStatus(currentTrain.trainNumber, selectedJourneyDate);

    // Periodic live telemetry refresh every 60s (safe for API rate limits)
    const interval = setInterval(() => {
      fetchLiveStatus(currentTrain.trainNumber, selectedJourneyDate);
    }, 60000);

    return () => clearInterval(interval);
  }, [currentTrain.trainNumber, selectedJourneyDate]);

  // Simulation timer for corridor progress demo
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProgressBetweenStops((prev) => {
        if (prev >= 0.98) {
          setStopIndex((currIdx) => {
            if (currIdx < stops.length - 1) {
              return currIdx + 1;
            } else {
              setIsSimulating(false);
              return currIdx;
            }
          });
          return 0.05;
        }
        return prev + 0.02;
      });

      setCurrentSpeed((base) => {
        const jitter = Math.floor(Math.random() * 7) - 3;
        return Math.min(currentTrain.maxSpeedKmph, Math.max(45, base + jitter));
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isSimulating, stops.length, currentTrain.maxSpeedKmph]);

  // Alarm sound trigger
  useEffect(() => {
    if (alarm.enabled && !alarm.soundPlayed && !alarmTriggered) {
      if (alarm.stationCode === currentApproachingStop.stationCode) {
        if (progressBetweenStops > 0.8) {
          setAlarmTriggered(true);
          playRailwayChime().then(() => {
            playWakeupAlarm();
          });
        }
      }
    }
  }, [alarm, currentApproachingStop.stationCode, progressBetweenStops, alarmTriggered]);

  // WhatsApp share message: Uses verified provider data when available, or scheduled timetable with explicit offline note
  const getShareText = () => {
    if (liveStatus?.success && liveStatus.currentLocation) {
      const loc = liveStatus.currentLocation;
      const next = liveStatus.nextStop;
      const verifiedDelay =
        liveStatus.delayMinutes === 0
          ? 'On Time'
          : `${liveStatus.delayMinutes}m delay`;
      const verifiedSpeed =
        loc.speed !== null && loc.speed !== undefined
          ? `${loc.speed} km/h`
          : 'In transit';
      const timeStr = lastFetchedAt ? lastFetchedAt.toLocaleTimeString('en-IN') : 'Live';
      const mapPin =
        loc.latitude && loc.longitude
          ? `\nLive Map Pin: https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`
          : '';

      return `🚆 VERIFIED LIVE TRAIN RUNNING STATUS (${liveStatus.provider || 'RailRadar'}):
Train: ${currentTrain.trainNumber} ${currentTrain.trainName}
Origin Departure: ${currentTrain.sourceName} (${currentTrain.sourceCode}) at ${currentTrain.sourceDeparture}
Destination Arrival: ${currentTrain.destName} (${currentTrain.destCode}) at ${currentTrain.destArrival} (${currentTrain.duration})
Runs On Days: ${currentTrain.runsOnDays.join(', ')} (${runsToday ? 'Runs Today' : `Next run: ${nextOperating?.fullDayName}`})
Reported Location: ${loc.stationName || loc.stationCode} (${loc.statusDescription})
Delay: ${verifiedDelay}
Next Station: ${next?.stationName || currentApproachingStop.stationName} (PF ${next?.platform || currentApproachingStop.platform}) · ETA ${next?.eta || currentApproachingStop.arrivalTime}
Speed: ${verifiedSpeed}
Reported At: ${timeStr}
Tracked Journey Date: ${selectedJourneyDate}${mapPin}`;
    }

    return `🚆 TRAIN JOURNEY SCHEDULE (TRAVELLING GUIDE):
Train: ${currentTrain.trainNumber} ${currentTrain.trainName}
Origin Departure: ${currentTrain.sourceName} (${currentTrain.sourceCode}) at ${currentTrain.sourceDeparture}
Destination Arrival: ${currentTrain.destName} (${currentTrain.destCode}) at ${currentTrain.destArrival} (${currentTrain.duration})
Runs On Days: ${currentTrain.runsOnDays.join(', ')} (${runsToday ? 'Runs Today' : `Next run: ${nextOperating?.fullDayName}`})
Approaching: ${currentApproachingStop.stationName} (${currentApproachingStop.stationCode}) · PF ${currentApproachingStop.platform} (ETA: ${currentApproachingStop.arrivalTime})
Journey Date: ${selectedJourneyDate}
Note: Live GPS telemetry offline; showing scheduled timetable.`;
  };

  const shareText = getShareText();
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const resetSimulation = () => {
    setStopIndex(1);
    setProgressBetweenStops(0.1);
    setIsSimulating(true);
    setAlarmTriggered(false);
  };

  return (
    <div className="space-y-6">
      {/* Alarm Banner Alert when triggered */}
      {alarmTriggered && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-300 animate-pulse neon-glow-amber">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                STATION ALARM: Approaching {currentApproachingStop.stationName} ({currentApproachingStop.stationCode})!
              </div>
              <div className="text-xs text-amber-200">
                Scheduled arrival: {currentApproachingStop.arrivalTime} · Platform {currentApproachingStop.platform}. Get ready to deboard!
              </div>
            </div>
          </div>
          <button
            onClick={() => setAlarmTriggered(false)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Train Selector & Telemetry Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl neon-glow-amber">
        <div className="flex items-center gap-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 border border-amber-500/40 text-amber-400 shadow-inner">
            <Train className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 font-mono tracking-wider">
                {currentTrain.trainNumber}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-semibold text-slate-300">
                {currentTrain.type}
              </span>
              <span className="text-slate-500">·</span>
              <span className={`text-xs font-semibold ${delayMinutes === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {delayMinutes === 0 ? '● Running On Time' : `▲ Delay ${delayMinutes}m`}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentTrain.trainName}
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{currentTrain.sourceName} ({currentTrain.sourceCode})</span>
              <span>→</span>
              <span>{currentTrain.destName} ({currentTrain.destCode})</span>
              <span>·</span>
              <span>{currentTrain.duration}</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Live WhatsApp Location Share + Quick Dropdown */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={currentTrain.trainNumber}
            onChange={(e) => {
              const tr = allTrains.find((t) => t.trainNumber === e.target.value);
              if (tr) {
                onSelectTrain(tr);
                setStopIndex(1);
                setProgressBetweenStops(0.2);
              }
            }}
            className="h-10 flex-1 lg:flex-initial rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
          >
            {allTrains.map((t) => (
              <option key={t.trainNumber} value={t.trainNumber}>
                {t.trainNumber} - {t.trainName}
              </option>
            ))}
          </select>

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow shrink-0 whitespace-nowrap"
            title="Share verified status on WhatsApp"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WhatsApp Status</span>
          </a>

          <button
            onClick={handleShare}
            className="h-10 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors shrink-0 whitespace-nowrap"
          >
            {copiedShare ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Copy Status'}</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Status Cards Matrix (User friendly quick comprehension metrics) */}
      <KpiStatsCards
        currentTrain={currentTrain}
        delayMinutes={delayMinutes}
        currentSpeed={currentSpeed}
        stopIndex={stopIndex}
        totalStops={stops.length}
        currentApproachingStopName={currentApproachingStop.stationName}
        runsToday={runsToday}
        onJumpToCorridor={onNavigateToRoute}
      />

      {/* Train Origin Start Time, Destination Arrival & Operating Days Schedule */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <CalendarDays className="h-4 w-4" />
              <span>Journey Origin & Operating Days Schedule</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              When Train #{currentTrain.trainNumber} Starts & Operates
            </h2>
          </div>

          {/* Runs Today Status Badge */}
          <div>
            {runsToday ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Runs Today ({todayFullName})</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span>Does Not Run Today ({todayFullName})</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Timetable Running Status Banner */}
        <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
          scheduleState.phase === 'IN_TRANSIT'
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
            : scheduleState.phase === 'HALTED_AT_STATION'
            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
            : scheduleState.phase === 'YET_TO_START'
            ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'
            : scheduleState.phase === 'COMPLETED'
            ? 'bg-slate-800/80 border-slate-700 text-slate-300'
            : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
        }`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/80 shrink-0 border border-slate-800">
            {scheduleState.phase === 'IN_TRANSIT' && <Train className="h-5 w-5 text-emerald-400" />}
            {scheduleState.phase === 'HALTED_AT_STATION' && <Clock className="h-5 w-5 text-cyan-400" />}
            {scheduleState.phase === 'YET_TO_START' && <Clock className="h-5 w-5 text-indigo-400" />}
            {scheduleState.phase === 'COMPLETED' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            {scheduleState.phase === 'NOT_RUNNING_TODAY' && <AlertCircle className="h-5 w-5 text-amber-400" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                {scheduleState.phaseTitle}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 font-semibold text-slate-300">
                {selectedJourneyDate === formatDateIso(istToday) ? 'Today IST' : selectedJourneyDate}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {scheduleState.phaseDescription}
            </p>
            {scheduleState.phase === 'YET_TO_START' && scheduleState.timeUntilDepartureFormatted && (
              <div className="mt-2 text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Starts its journey in {scheduleState.timeUntilDepartureFormatted} from {currentTrain.sourceName} Platform {stops[0].platform}</span>
              </div>
            )}
            {scheduleState.phase === 'NOT_RUNNING_TODAY' && scheduleState.nextOperatingRun && (
              <div className="mt-2 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Next scheduled departure: {scheduleState.nextOperatingRun.dayName} ({scheduleState.nextOperatingRun.dateDisplay}) at {currentTrain.sourceDeparture}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Summary: Origin Departure, Destination Arrival & Operating Days */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Box 1: Origin Departure (When the train starts its journey) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5 mb-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Journey Origin (Start of Journey)</span>
              </div>
              <div className="text-sm font-extrabold text-white">
                {currentTrain.sourceName}
                <span className="ml-1 text-xs font-mono text-amber-400">({currentTrain.sourceCode})</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-300 tracking-tight">
                  {currentTrain.sourceDeparture}
                </span>
                <span className="text-slate-400 text-[11px]">Departure (IST)</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Origin Starting Station</span>
              <span className="text-slate-200 font-semibold">Day 1 Origin</span>
            </div>
          </div>

          {/* Box 2: Destination Arrival (When the train completes its journey) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1.5 mb-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Destination Terminus</span>
              </div>
              <div className="text-sm font-extrabold text-white">
                {currentTrain.destName}
                <span className="ml-1 text-xs font-mono text-cyan-400">({currentTrain.destCode})</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-cyan-300 tracking-tight">
                  {currentTrain.destArrival}
                </span>
                <span className="text-slate-400 text-[11px]">Arrival (IST)</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Duration: <strong className="text-slate-200 font-mono">{currentTrain.duration}</strong></span>
              <span className="font-mono text-slate-300">{currentTrain.totalDistanceKm} km</span>
            </div>
          </div>

          {/* Box 3: Days of Operation (What days the train operates) */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Days of Operation</span>
                </span>
                <span className="font-bold text-slate-400 font-mono text-[10px]">
                  {currentTrain.runsOnDays.length === 7 ? 'Daily Service' : `${currentTrain.runsOnDays.length} Days/Wk`}
                </span>
              </div>

              {/* 7-Day Matrix */}
              <div className="grid grid-cols-7 gap-1 my-2">
                {ALL_DAYS_ORDERED.map((day) => {
                  const isOperating = currentTrain.runsOnDays.includes(day);
                  const isToday = day === todayDayAbbr;
                  return (
                    <div
                      key={day}
                      className={`flex flex-col items-center justify-center py-1 rounded-lg border text-center transition-all ${
                        isOperating
                          ? isToday
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-slate-950/60 border-slate-900 text-slate-600 line-through'
                      }`}
                      title={
                        isOperating
                          ? `${FULL_DAY_NAMES[day]}: Operates`
                          : `${FULL_DAY_NAMES[day]}: Does not operate`
                      }
                    >
                      <span className="text-[10px] font-mono leading-none">{day[0]}</span>
                      <span className="text-[8px] mt-0.5 leading-none">{isOperating ? '✓' : '×'}</span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-300 leading-snug">
                {currentTrain.runsOnDays.length === 7 ? (
                  <span className="text-emerald-400 font-semibold">Runs all 7 days of the week (Daily)</span>
                ) : (
                  <span>
                    Operates on: <strong className="text-white">{currentTrain.runsOnDays.join(', ')}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
              {runsToday ? (
                <span className="text-emerald-400 font-medium">● Operating today as scheduled</span>
              ) : (
                <span className="text-amber-400 font-medium">
                  Next trip: {nextOperating?.fullDayName} at {currentTrain.sourceDeparture}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Journey Origin Date Selector for Tracking */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-xs">Track Journey Origin Date:</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">(Select departure date if train started yesterday):</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: formatDateIso(yesterdayDate), label: `Yesterday (${formatDateDisplay(yesterdayDate)})` },
              { id: formatDateIso(istToday), label: `Today (${formatDateDisplay(istToday)})` },
              { id: formatDateIso(tomorrowDate), label: `Tomorrow (${formatDateDisplay(tomorrowDate)})` }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedJourneyDate(d.id)}
                className={`h-8 inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                  selectedJourneyDate === d.id
                    ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Genuine Live Train Running Status (GPS / RailRadar Integration) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              liveStatus?.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              <Radio className={`h-5 w-5 ${isLoadingLive ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Real-Time Train Running Status
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  liveStatus?.success
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {liveStatus?.success ? '● Verified Telemetry' : '○ GPS Telemetry Provider'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Provider: <strong className="text-slate-300">{liveStatus?.provider || 'RailRadar'}</strong></span>
                <span>·</span>
                <span>
                  {lastFetchedAt ? `Last checked: ${lastFetchedAt.toLocaleTimeString('en-IN')}` : 'Ready to fetch'}
                </span>
              </div>
            </div>
          </div>

          {/* Manual Refresh Button with equal height and alignment */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLiveStatus(currentTrain.trainNumber)}
              disabled={isLoadingLive}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50"
              title="Manually fetch latest running status"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLive ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
              <span>{isLoadingLive ? 'Fetching...' : 'Refresh Status'}</span>
            </button>
          </div>
        </div>

        {/* State Rendering */}
        {isLoadingLive && !liveStatus && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-400 mb-2" />
            <p className="text-xs text-slate-300 font-medium">
              Querying live railway telemetry for Train #{currentTrain.trainNumber}...
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Connecting to Indian Railways live running-status servers
            </p>
          </div>
        )}

        {/* Successful Verified Telemetry Display */}
        {liveStatus?.success && liveStatus.currentLocation && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Reported Location */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>Reported Location</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {liveStatus.currentLocation.stationName || liveStatus.currentLocation.stationCode || 'In Transit'}
                  {liveStatus.currentLocation.stationCode && (
                    <span className="ml-1 text-xs font-mono text-amber-400">
                      ({liveStatus.currentLocation.stationCode})
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                  {liveStatus.currentLocation.statusDescription || 'Running as per signal'}
                </p>
              </div>
              {liveStatus.currentLocation.latitude && liveStatus.currentLocation.longitude && (
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <a
                    href={`https://www.google.com/maps?q=${liveStatus.currentLocation.latitude},${liveStatus.currentLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <span>Live Coordinates Pin</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Upcoming Halt */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>Next Halt / Station</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {liveStatus.nextStop?.stationName || currentApproachingStop.stationName}
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  Platform: <strong className="text-white font-mono">{liveStatus.nextStop?.platform || currentApproachingStop.platform}</strong>
                  {' · '}
                  ETA: <strong className="text-white font-mono">{liveStatus.nextStop?.eta || currentApproachingStop.arrivalTime}</strong>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                {liveStatus.nextStop?.distanceRemainingKm !== null && liveStatus.nextStop?.distanceRemainingKm !== undefined
                  ? `${liveStatus.nextStop.distanceRemainingKm} km to halt`
                  : 'Scheduled halting station'}
              </div>
            </div>

            {/* Delay & Schedule Status */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-emerald-400" />
                <span>Punctuality Status</span>
              </div>
              <div>
                <div className={`text-base font-black ${
                  (liveStatus.delayMinutes || 0) === 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {(liveStatus.delayMinutes || 0) === 0 ? '● Running On Time' : `▲ Delay ${liveStatus.delayMinutes} mins`}
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  {(liveStatus.delayMinutes || 0) === 0
                    ? 'Operating on scheduled timetable'
                    : `Train running ${liveStatus.delayMinutes} minutes behind schedule`}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                Official delay calculation
              </div>
            </div>

            {/* Speed Telemetry */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                <span>Reported Loco Speed</span>
              </div>
              <div>
                <div className="text-2xl font-black font-mono text-white">
                  {liveStatus.currentLocation.speed !== null && liveStatus.currentLocation.speed !== undefined
                    ? `${liveStatus.currentLocation.speed} km/h`
                    : '—'}
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {liveStatus.currentLocation.speed !== null && liveStatus.currentLocation.speed !== undefined
                    ? 'Reported by loco GPS unit'
                    : 'Speed telemetry in transit'}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                Updated: {new Date(liveStatus.currentLocation.updatedAt || Date.now()).toLocaleTimeString('en-IN')}
              </div>
            </div>
          </div>
        )}

        {/* Clear Explanation When Live API is Unavailable / Not Configured / Train Not Running */}
        {liveStatus && !liveStatus.success && (
          <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    Live GPS Running Status Unavailable
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    {liveStatus.error || 'OFFLINE'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {liveStatus.message || 'Unable to fetch real-time GPS telemetry from railway provider.'}
                </p>
                <p className="text-[11px] text-slate-400 pt-1">
                  <strong>Important:</strong> The scheduled route timetable, station amenities, food guide, coach layout, and corridor demo simulation below remain fully operational.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Matrix for Commuters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Cabs / Auto (Ola, Uber, Rapido) */}
        <button
          onClick={onNavigateToNearby}
          className="h-full min-h-[72px] flex items-center gap-2.5 p-3 rounded-xl border border-lime-500/40 bg-slate-900/90 hover:bg-slate-800 text-left transition-all shadow hover:shadow-lime-500/20 group"
        >
          <div className="h-8 w-8 rounded-lg bg-lime-500/10 text-lime-400 flex items-center justify-center shrink-0">
            <Car className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-lime-300">Book Ola / Uber</div>
            <div className="text-[10px] text-slate-400">Rapido & Station Autos</div>
          </div>
        </button>

        {/* Food Order to Seat */}
        <button
          onClick={onOpenFoodModal}
          className="h-full min-h-[72px] flex items-center gap-2.5 p-3 rounded-xl border border-amber-500/40 bg-slate-900/90 hover:bg-slate-800 text-left transition-all shadow hover:shadow-amber-500/20 group"
        >
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Utensils className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-amber-300">Order Food to Seat</div>
            <div className="text-[10px] text-slate-400">IRCTC e-Catering & Pantry</div>
          </div>
        </button>

        {/* RailMadad Official Complaint */}
        <button
          onClick={onOpenComplaintModal}
          className="h-full min-h-[72px] flex items-center gap-2.5 p-3 rounded-xl border border-red-500/40 bg-slate-900/90 hover:bg-slate-800 text-left transition-all shadow hover:shadow-red-500/20 group"
        >
          <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-red-300">RailMadad Complaint</div>
            <div className="text-[10px] text-slate-400">Cleanliness & Medical</div>
          </div>
        </button>

        {/* E-Ticket Download / Print */}
        <button
          onClick={onOpenTicketModal}
          className="h-full min-h-[72px] flex items-center gap-2.5 p-3 rounded-xl border border-cyan-500/40 bg-slate-900/90 hover:bg-slate-800 text-left transition-all shadow hover:shadow-cyan-500/20 group"
        >
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Ticket className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-cyan-300">Download E-Ticket</div>
            <div className="text-[10px] text-slate-400">Print / IRCTC Slip</div>
          </div>
        </button>
      </div>

      {/* Smart Rail Tools Strip (PNR, Fare, Coach Position, Station Info, Checklist) */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold px-1 py-1 inline-flex items-center">Passenger Utilities:</span>
        {onNavigateToPnrStatus && (
          <button
            onClick={onNavigateToPnrStatus}
            className="h-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold transition-colors whitespace-nowrap"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Check PNR Status</span>
          </button>
        )}
        {onNavigateToFareCalculator && (
          <button
            onClick={onNavigateToFareCalculator}
            className="h-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold transition-colors whitespace-nowrap"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Fare Calculator</span>
          </button>
        )}
        {onNavigateToCoachPosition && (
          <button
            onClick={onNavigateToCoachPosition}
            className="h-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold transition-colors whitespace-nowrap"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Coach Position</span>
          </button>
        )}
        {onNavigateToStationInfo && (
          <button
            onClick={onNavigateToStationInfo}
            className="h-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold transition-colors whitespace-nowrap"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Station Info & Navigation</span>
          </button>
        )}
        {onNavigateToChecklist && (
          <button
            onClick={onNavigateToChecklist}
            className="h-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition-colors whitespace-nowrap"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Packing Checklist</span>
          </button>
        )}
      </div>

      {/* Main Telemetry Gauges with Neon Glow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Speedometer Gauge (Neon Emerald) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between neon-glow-emerald">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-emerald-400">
              {isSimulating ? 'Corridor Simulation Preview' : 'Timetable Running Speed'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block h-2 w-2 rounded-full ${
                isSimulating 
                  ? 'bg-amber-400 animate-ping' 
                  : (scheduleState.phase === 'IN_TRANSIT' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500')
              }`} />
              <span className="font-semibold text-slate-300">
                {isSimulating ? 'Demo Mode' : scheduleState.phaseTitle}
              </span>
            </div>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-5xl font-black text-white font-mono tracking-tight neon-text-cyan">
              {currentSpeed}
            </span>
            <span className="text-sm font-bold text-slate-400">km/h</span>
            <div className="ml-auto text-right text-xs text-slate-400">
              <div>Top Speed: {currentTrain.maxSpeedKmph} km/h</div>
              <div>Average: {currentTrain.avgSpeedKmph} km/h</div>
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-500 h-2.5 rounded-full transition-all duration-700 shadow"
              style={{ width: `${Math.min(100, (currentSpeed / currentTrain.maxSpeedKmph) * 100)}%` }}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {isSimulating ? 'Demo playback:' : 'Mode:'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="h-8 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {isSimulating ? <RotateCcw className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                <span>{isSimulating ? 'Back to Live Schedule' : 'Preview Demo Ride'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Approaching Station Spotlight (Neon Amber) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between neon-glow-amber">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-amber-400">Approaching Next Station</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
              Platform {currentApproachingStop.platform}
            </span>
          </div>

          <div className="my-3">
            <div className="text-2xl font-black text-white flex items-center gap-2">
              <span>{currentApproachingStop.stationName}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {currentApproachingStop.stationCode}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>ETA: <strong className="text-white font-mono text-sm">{currentApproachingStop.arrivalTime}</strong></span>
              <span>·</span>
              <span>Halt: {currentApproachingStop.haltMinutes > 0 ? `${currentApproachingStop.haltMinutes} mins` : 'Terminus'}</span>
            </div>
          </div>

          {currentApproachingStop.localSpecialty && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                <Utensils className="h-3 w-3" />
                <span>Station Food: {currentApproachingStop.localSpecialty.dish}</span>
              </div>
              <p className="text-slate-300 text-[11px] truncate mt-0.5">
                {currentApproachingStop.localSpecialty.description}
              </p>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Distance to stop:</span>
            <span className="font-mono text-white font-bold text-sm">
              {Math.max(0, currentApproachingStop.distanceKm - currentKm)} km
            </span>
          </div>
        </div>

        {/* Progress & Wake-up Alarm */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between neon-glow-cyan">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-cyan-400">Journey Distance Progress</span>
            <span className="font-mono text-cyan-300 font-bold">{totalPercent}%</span>
          </div>

          <div className="my-3 space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400">Covered: <strong className="text-white font-mono">{currentKm} km</strong></span>
              <span className="text-slate-400">Remaining: <strong className="text-white font-mono">{remainingKm} km</strong></span>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-2.5 rounded-full transition-all duration-700 shadow"
                style={{ width: `${totalPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className={`h-4 w-4 ${alarm.enabled ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              <div className="text-xs">
                <div className="font-semibold text-white">
                  {alarm.enabled ? `Alarm: ${alarm.stationCode}` : 'Station Alarm Inactive'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {alarm.enabled ? `${alarm.offsetMinutes} mins prior chime` : 'Auto wake-up chime'}
                </div>
              </div>
            </div>
            <button
              onClick={onOpenAlarmModal}
              className="px-3 py-1.5 text-xs rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow"
            >
              {alarm.enabled ? 'Edit' : 'Set Alarm'}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Corridor Stations Tracker */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Corridor Halt Tracker</h3>
            <p className="text-xs text-slate-400">Approaching stops until final terminus</p>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="#animatic-timeline"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('animatic-timeline');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow"
            >
              <Train className="h-3.5 w-3.5" />
              <span>Animatic Timeline View ↓</span>
            </a>
            <button
              onClick={onNavigateToRoute}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 hidden sm:inline"
            >
              View Full Timetable →
            </button>
          </div>
        </div>

        <div className="relative pt-6 pb-2 overflow-x-auto">
          <div className="relative flex justify-between items-start min-w-[500px]">
            {/* Track Line */}
            <div className="absolute top-4 left-6 right-6 h-1.5 bg-slate-800 rounded-full" />
            <div 
              className="absolute top-4 left-6 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `calc(${totalPercent}% * 0.9 + 2%)` }}
            />

            {stops.map((stop, idx) => {
              const isPassed = idx < stopIndex;
              const isCurrent = idx === stopIndex;

              return (
                <div key={stop.stationCode} className="flex flex-col items-center text-center max-w-[100px] z-10">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                      isPassed
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'border-amber-400 bg-amber-500 text-slate-950 font-black scale-110 shadow-lg shadow-amber-500/50 animate-pulse'
                        : 'border-slate-700 bg-slate-900 text-slate-500'
                    }`}
                  >
                    {isCurrent ? <Train className="h-4 w-4" /> : <span className="text-[10px] font-mono">{idx + 1}</span>}
                  </div>

                  <div className="mt-2">
                    <div className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : 'text-slate-200'}`}>
                      {stop.stationCode}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[90px]">
                      {stop.stationName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {stop.arrivalTime}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      PF {stop.platform}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Destination Weather & Deboarding Luggage Reminder Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DestinationWeatherCard
          destinationCity={currentTrain.destName.split(' ')[0]}
          stationCode={currentTrain.destCode}
        />
        <LuggageReminderCard />
      </div>
    </div>
  );
};
