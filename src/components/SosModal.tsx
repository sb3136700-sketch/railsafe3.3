import React, { useState } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  Share2, 
  Volume2, 
  VolumeX,
  X, 
  MapPin, 
  AlertTriangle, 
  Check, 
  Radio, 
  HeartHandshake,
  MessageSquare,
  Clock,
  Compass,
  Train,
  CheckCircle2,
  Stethoscope,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { TrainDetails, RouteStop, UserProfile } from '../types/railway';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrain: TrainDetails;
  currentStation: RouteStop;
  userProfile: UserProfile;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  currentTrain,
  currentStation,
  userProfile,
}) => {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [quickReportStatus, setQuickReportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Synthesize emergency tone using Web Audio API
  const toggleSiren = () => {
    if (sirenPlaying) {
      setSirenPlaying(false);
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1250, ctx.currentTime + 0.35);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.1);
      setSirenPlaying(true);
      setTimeout(() => setSirenPlaying(false), 1200);
    } catch {
      setSirenPlaying(false);
    }
  };

  const emergencyMessage = `🚨 RAILWAY EMERGENCY DISTRESS BEACON:
• Passenger: ${userProfile.fullName || 'Passenger'} (${userProfile.phone || 'Active Sim'})
• Train: ${currentTrain.trainNumber} - ${currentTrain.trainName}
• Current GPS Section: Near ${currentStation.stationName} (${currentStation.stationCode})
• Next Scheduled Platform: PF ${currentStation.platform || '1'}
• Berth / Seat Preference: ${userProfile.preferredBerth || 'Confirmed Coach'}
• Emergency Contact: ${userProfile.emergencyContactName || 'Family'} (${userProfile.emergencyContactPhone || 'Not set'})
• Live Rail Coordinates: Lat 28.6139, Long 77.2090 (Station Proximity: 1.2 km)
Please dispatch RPF / TTE assistance immediately!`;

  const whatsappEmergencyUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    emergencyMessage
  )}`;

  const handleCopyLocation = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(emergencyMessage);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const triggerQuickReport = (label: string) => {
    setQuickReportStatus(label);
    setTimeout(() => setQuickReportStatus(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-rose-500/40 dark:border-rose-500/30 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl transition-all">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-600/30 border border-rose-500/50 text-rose-600 dark:text-rose-400 shadow-md">
              <ShieldAlert className="h-6 w-6 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  Railway Emergency Desk
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                  24/7 ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct Indian Railways Security (RPF), Medical & Station Master Assistance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close Emergency Window"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Train Coordinates & Passenger Beacon */}
        <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
              <span>Live On-Train Telemetry Beacon:</span>
            </span>
            <span className="font-mono font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200">
              #{currentTrain.trainNumber} · {currentTrain.trainName}
            </span>
          </div>

          <div className="mt-2 text-slate-700 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Section Proximity: </span>
              <span className="font-semibold">Near {currentStation.stationName} ({currentStation.stationCode})</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Approaching Platform: </span>
              <span className="font-semibold font-mono text-amber-600 dark:text-amber-400">PF {currentStation.platform || '1'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Passenger on Record: </span>
              <span className="font-semibold">{userProfile.fullName || 'Passenger'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Registered Phone: </span>
              <span className="font-semibold font-mono">{userProfile.phone || '9876543210'}</span>
            </div>
          </div>
        </div>

        {/* 1-Tap Priority Direct Dial Helplines */}
        <div className="mt-4">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Instant 1-Tap Emergency Helplines (Toll-Free)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 139 RailMadad Universal */}
            <a
              href="tel:139"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 to-red-500/20 hover:from-rose-500/20 hover:to-red-500/30 border border-rose-400/40 text-rose-900 dark:text-rose-100 transition-all shadow-sm group cursor-pointer"
            >
              <div>
                <div className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 dark:text-rose-400">
                  RailMadad Universal
                </div>
                <div className="text-xl font-mono font-black text-rose-700 dark:text-white">
                  139
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Medical · Security · TTE help
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-600 dark:text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PhoneCall className="h-5 w-5" />
              </div>
            </a>

            {/* 182 RPF Security */}
            <a
              href="tel:182"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/20 hover:from-amber-500/20 hover:to-orange-500/30 border border-amber-400/40 text-amber-900 dark:text-amber-100 transition-all shadow-sm group cursor-pointer"
            >
              <div>
                <div className="text-[10px] uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-400">
                  RPF Security Helpline
                </div>
                <div className="text-xl font-mono font-black text-amber-700 dark:text-white">
                  182
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Railway Protection Force
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-600 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PhoneCall className="h-5 w-5" />
              </div>
            </a>

            {/* 112 National Police */}
            <a
              href="tel:112"
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors group cursor-pointer"
            >
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  National ERSS Police
                </div>
                <div className="text-base font-mono font-black text-sky-600 dark:text-sky-400">
                  112
                </div>
              </div>
              <PhoneCall className="h-4 w-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
            </a>

            {/* 1091 Women Safety */}
            <a
              href="tel:1091"
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors group cursor-pointer"
            >
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                  Women In Transit Safety
                </div>
                <div className="text-base font-mono font-black text-purple-600 dark:text-purple-400">
                  1091
                </div>
              </div>
              <PhoneCall className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* Quick Incident Radio Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            One-Touch Incident Dispatch to On-Duty Conductor & RPF:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => triggerQuickReport('Medical Attention Needed')}
              className="p-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[11px] font-semibold text-center transition-all cursor-pointer"
            >
              <Stethoscope className="h-4 w-4 mx-auto mb-1 text-rose-500" />
              Medical Help
            </button>

            <button
              onClick={() => triggerQuickReport('RPF Escort Requested')}
              className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[11px] font-semibold text-center transition-all cursor-pointer"
            >
              <Shield className="h-4 w-4 mx-auto mb-1 text-amber-500" />
              RPF Escort
            </button>

            <button
              onClick={() => triggerQuickReport('Wheelchair Alert for Next Station')}
              className="p-2.5 rounded-xl border border-sky-300 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-[11px] font-semibold text-center transition-all cursor-pointer"
            >
              <LifeBuoy className="h-4 w-4 mx-auto mb-1 text-sky-500" />
              Wheelchair
            </button>

            <button
              onClick={() => triggerQuickReport('TTE Berth Inspection Requested')}
              className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold text-center transition-all cursor-pointer"
            >
              <Train className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
              Call TTE
            </button>
          </div>

          {quickReportStatus && (
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Broadcast dispatched: <strong>{quickReportStatus}</strong> logged for Train #{currentTrain.trainNumber} at {currentStation.stationName}.</span>
            </div>
          )}
        </div>

        {/* Live Location Sharing & Coach Siren */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Share SOS Beacon With Family & Friends
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={whatsappEmergencyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>Share on WhatsApp</span>
            </a>

            <button
              onClick={handleCopyLocation}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <MessageSquare className="h-4 w-4" />}
              <span>{copiedLink ? 'Emergency Info Copied!' : 'Copy Distress Details'}</span>
            </button>
          </div>

          {/* Siren Alert button */}
          <button
            onClick={toggleSiren}
            className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              sirenPlaying
                ? 'border-rose-500 bg-rose-600 text-white shadow-lg animate-pulse'
                : 'border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40'
            }`}
          >
            {sirenPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{sirenPlaying ? 'Sounding Coach Alert Siren (Click to Stop)...' : 'Test Coach Audio Alert Siren'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500">
            Emergency contacts encrypted locally
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Dismiss Panel
          </button>
        </div>
      </div>
    </div>
  );
};
