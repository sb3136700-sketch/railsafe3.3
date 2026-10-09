import { TrainDetails, RouteStop, TrainScheduleState } from '../types/railway';

export const ALL_DAYS_ORDERED = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const DAY_ABBRS_BY_INDEX = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const FULL_DAY_NAMES: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

/**
 * Returns the current date & time in Indian Standard Time (IST = UTC + 5:30)
 */
export function getIstDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 5.5);
}

/**
 * Formats a Date to YYYY-MM-DD
 */
export function formatDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date to e.g. "Fri, 9 Oct"
 */
export function formatDateDisplay(date: Date): string {
  const dayName = DAY_ABBRS_BY_INDEX[date.getDay()];
  const dayNum = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[date.getMonth()];
  return `${dayName}, ${dayNum} ${monthName}`;
}

/**
 * Parses time string like "06:00 AM", "10:10 PM", "14:30" into total minutes from 00:00.
 * Returns null for non-time strings like "Source" or "Destination".
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim();
  if (trimmed.toLowerCase() === 'source' || trimmed.toLowerCase() === 'destination') {
    return null;
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3] ? match[3].toLowerCase() : null;

  if (meridiem) {
    if (meridiem === 'pm' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'am' && hours === 12) {
      hours = 0;
    }
  }

  return hours * 60 + minutes;
}

/**
 * Formats minutes into human readable "X hrs Y mins" or "X mins"
 */
export function formatMinutesToHoursMins(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(mins / 60);
  const remMinutes = mins % 60;

  if (hours === 0) {
    return `${remMinutes} min${remMinutes === 1 ? '' : 's'}`;
  }
  if (remMinutes === 0) {
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  return `${hours}h ${remMinutes}m`;
}

/**
 * Checks if a train operates on a given date (using IST day of week)
 */
export function isTrainOperatingOnDate(train: TrainDetails, date: Date): boolean {
  const dayAbbr = DAY_ABBRS_BY_INDEX[date.getDay()];
  return train.runsOnDays.includes(dayAbbr);
}

/**
 * Finds the next scheduled operational day starting from a given date
 */
export function getNextOperatingDate(
  train: TrainDetails,
  fromDate: Date
): { date: Date; dayAbbr: string; fullDayName: string; daysAway: number; dateDisplay: string } | null {
  for (let i = 1; i <= 7; i++) {
    const candidate = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayAbbr = DAY_ABBRS_BY_INDEX[candidate.getDay()];
    if (train.runsOnDays.includes(dayAbbr)) {
      return {
        date: candidate,
        dayAbbr,
        fullDayName: FULL_DAY_NAMES[dayAbbr] || dayAbbr,
        daysAway: i,
        dateDisplay: formatDateDisplay(candidate),
      };
    }
  }
  return null;
}

/**
 * Generates human readable operating days text
 */
export function getOperatingDaysSummary(train: TrainDetails): string {
  if (train.runsOnDays.length === 7) {
    return 'Daily (All 7 Days)';
  }
  return `${train.runsOnDays.length} Days a Week: ${train.runsOnDays.join(', ')}`;
}

/**
 * Accurately calculates the train's journey state based on the current IST time
 * and the train's route timetable.
 */
export function calculateTrainScheduleState(
  train: TrainDetails,
  journeyOriginDate: Date,
  referenceNow?: Date
): TrainScheduleState {
  const now = referenceNow || getIstDate();
  const originDayAbbr = DAY_ABBRS_BY_INDEX[journeyOriginDate.getDay()];
  const originDayName = FULL_DAY_NAMES[originDayAbbr] || originDayAbbr;
  const operatesOnDate = train.runsOnDays.includes(originDayAbbr);
  
  const todayIst = getIstDate();
  const runsToday = isTrainOperatingOnDate(train, todayIst);
  const nextOperating = getNextOperatingDate(train, journeyOriginDate);

  const stops = train.routeStops;
  const originStop = stops[0];
  const terminusStop = stops[stops.length - 1];

  const runsOnDaysText = getOperatingDaysSummary(train);

  const baseResult: TrainScheduleState = {
    operatesOnDate,
    phase: 'NOT_RUNNING_TODAY',
    phaseTitle: 'Train Does Not Operate On This Day',
    phaseDescription: `Train #${train.trainNumber} has no scheduled run on ${originDayName}.`,
    journeyStartTime: train.sourceDeparture,
    journeyStartStation: train.sourceName,
    journeyStartStationCode: train.sourceCode,
    journeyEndTime: train.destArrival,
    journeyEndStation: train.destName,
    journeyEndStationCode: train.destCode,
    runsOnDaysList: train.runsOnDays,
    runsOnDaysText,
    runsToday,
    todayDayName: FULL_DAY_NAMES[DAY_ABBRS_BY_INDEX[todayIst.getDay()]] || '',
    nextOperatingRun: nextOperating
      ? {
          dateDisplay: nextOperating.dateDisplay,
          dayName: nextOperating.fullDayName,
          daysAway: nextOperating.daysAway,
          departureTime: train.sourceDeparture,
        }
      : undefined,
    calculatedStopIndex: 0,
    calculatedProgress: 0,
    currentKm: 0,
    remainingKm: train.totalDistanceKm,
    totalPercent: 0,
    speedKmph: 0,
    approachingStop: stops[1] || stops[0],
    lastDepartedStop: originStop,
  };

  if (!operatesOnDate) {
    return baseResult;
  }

  // Parse origin start and terminus arrival in minutes from origin departure midnight
  const originStartMin = parseTimeToMinutes(train.sourceDeparture) ?? 360; // default 06:00 AM
  const termArrMinRaw = parseTimeToMinutes(train.destArrival) ?? (originStartMin + 480);
  const terminusArrMin = (terminusStop.day - 1) * 1440 + termArrMinRaw;

  // Calculate difference in calendar days between now and journeyOriginDate
  const originMidnight = new Date(journeyOriginDate.getFullYear(), journeyOriginDate.getMonth(), journeyOriginDate.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayOffset = Math.round((nowMidnight - originMidnight) / (24 * 60 * 60 * 1000));

  const nowMinutesFromOriginMidnight = dayOffset * 1440 + now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  // Case 1: Train has NOT started yet today
  if (nowMinutesFromOriginMidnight < originStartMin) {
    const minutesUntil = originStartMin - nowMinutesFromOriginMidnight;
    const formattedUntil = formatMinutesToHoursMins(minutesUntil);
    return {
      ...baseResult,
      phase: 'YET_TO_START',
      phaseTitle: 'Journey Not Started Yet',
      phaseDescription: `Train #${train.trainNumber} begins its journey at ${train.sourceDeparture} from ${train.sourceName} (${train.sourceCode}) Platform ${originStop.platform}. Starts in ${formattedUntil}.`,
      calculatedStopIndex: 0,
      calculatedProgress: 0,
      currentKm: 0,
      remainingKm: train.totalDistanceKm,
      totalPercent: 0,
      speedKmph: 0,
      timeUntilDepartureFormatted: formattedUntil,
      approachingStop: originStop,
      lastDepartedStop: originStop,
    };
  }

  // Case 2: Train has completed its journey
  if (nowMinutesFromOriginMidnight >= terminusArrMin) {
    const minutesSince = nowMinutesFromOriginMidnight - terminusArrMin;
    return {
      ...baseResult,
      phase: 'COMPLETED',
      phaseTitle: 'Journey Completed (Terminated)',
      phaseDescription: `Train #${train.trainNumber} has reached its destination ${train.destName} (${train.destCode}) at ${train.destArrival}.`,
      calculatedStopIndex: stops.length - 1,
      calculatedProgress: 1,
      currentKm: train.totalDistanceKm,
      remainingKm: 0,
      totalPercent: 100,
      speedKmph: 0,
      timeSinceDepartureFormatted: formatMinutesToHoursMins(minutesSince),
      approachingStop: terminusStop,
      lastDepartedStop: stops[stops.length - 2] || originStop,
    };
  }

  // Case 3: In Transit / Halted at Station
  // Build stop timetable minutes
  interface ResolvedStopTiming {
    index: number;
    stop: RouteStop;
    arrivalMin: number;
    departureMin: number;
  }

  const resolvedStops: ResolvedStopTiming[] = stops.map((s, idx) => {
    let arr = parseTimeToMinutes(s.arrivalTime);
    let dep = parseTimeToMinutes(s.departureTime);

    if (idx === 0) {
      dep = dep ?? originStartMin;
      arr = dep;
    } else if (idx === stops.length - 1) {
      arr = arr ?? termArrMinRaw;
      dep = arr;
    } else {
      if (arr === null && dep !== null) arr = dep - (s.haltMinutes || 2);
      if (dep === null && arr !== null) dep = arr + (s.haltMinutes || 2);
      if (arr === null && dep === null) {
        // Linear estimate based on distance
        const frac = s.distanceKm / Math.max(1, train.totalDistanceKm);
        arr = Math.round(originStartMin + (terminusArrMin - originStartMin) * frac);
        dep = arr + (s.haltMinutes || 2);
      }
    }

    return {
      index: idx,
      stop: s,
      arrivalMin: (s.day - 1) * 1440 + (arr ?? originStartMin),
      departureMin: (s.day - 1) * 1440 + (dep ?? originStartMin),
    };
  });

  // Check if currently halted at any station
  for (const item of resolvedStops) {
    if (nowMinutesFromOriginMidnight >= item.arrivalMin && nowMinutesFromOriginMidnight <= item.departureMin) {
      const haltRemaining = Math.max(0, item.departureMin - nowMinutesFromOriginMidnight);
      return {
        ...baseResult,
        phase: 'HALTED_AT_STATION',
        phaseTitle: `Halted at ${item.stop.stationName}`,
        phaseDescription: `Train is stopped on Platform ${item.stop.platform} at ${item.stop.stationName} (${item.stop.stationCode}). Departs at ${item.stop.departureTime} (in ${formatMinutesToHoursMins(haltRemaining)}).`,
        currentHaltedStop: item.stop,
        calculatedStopIndex: item.index,
        calculatedProgress: 0.99,
        currentKm: item.stop.distanceKm,
        remainingKm: Math.max(0, train.totalDistanceKm - item.stop.distanceKm),
        totalPercent: Math.min(100, Math.round((item.stop.distanceKm / train.totalDistanceKm) * 100)),
        speedKmph: 0,
        approachingStop: resolvedStops[item.index + 1]?.stop || item.stop,
        lastDepartedStop: item.stop,
      };
    }
  }

  // Find the segment between two consecutive stops
  for (let i = 0; i < resolvedStops.length - 1; i++) {
    const cur = resolvedStops[i];
    const nxt = resolvedStops[i + 1];

    if (nowMinutesFromOriginMidnight > cur.departureMin && nowMinutesFromOriginMidnight < nxt.arrivalMin) {
      const segDuration = Math.max(1, nxt.arrivalMin - cur.departureMin);
      const elapsedInSeg = nowMinutesFromOriginMidnight - cur.departureMin;
      const progressRatio = Math.max(0.05, Math.min(0.95, elapsedInSeg / segDuration));

      const segKm = nxt.stop.distanceKm - cur.stop.distanceKm;
      const currentKm = Math.round(cur.stop.distanceKm + segKm * progressRatio);
      const remainingKm = Math.max(0, train.totalDistanceKm - currentKm);
      const totalPercent = Math.min(100, Math.round((currentKm / train.totalDistanceKm) * 100));

      const etaMins = Math.max(1, Math.round(nxt.arrivalMin - nowMinutesFromOriginMidnight));

      return {
        ...baseResult,
        phase: 'IN_TRANSIT',
        phaseTitle: 'In Transit',
        phaseDescription: `Running between ${cur.stop.stationName} (departed ${cur.stop.departureTime}) and ${nxt.stop.stationName} (arriving at ${nxt.stop.arrivalTime}, in ${formatMinutesToHoursMins(etaMins)}).`,
        calculatedStopIndex: nxt.index,
        calculatedProgress: progressRatio,
        currentKm,
        remainingKm,
        totalPercent,
        speedKmph: train.avgSpeedKmph,
        lastDepartedStop: cur.stop,
        approachingStop: nxt.stop,
      };
    }
  }

  // Fallback: Default running phase
  return {
    ...baseResult,
    phase: 'IN_TRANSIT',
    phaseTitle: 'In Transit',
    phaseDescription: `Train #${train.trainNumber} is actively in transit towards ${train.destName}.`,
    calculatedStopIndex: 1,
    calculatedProgress: 0.5,
    currentKm: Math.round(train.totalDistanceKm * 0.5),
    remainingKm: Math.round(train.totalDistanceKm * 0.5),
    totalPercent: 50,
    speedKmph: train.avgSpeedKmph,
    lastDepartedStop: originStop,
    approachingStop: stops[1] || terminusStop,
  };
}
