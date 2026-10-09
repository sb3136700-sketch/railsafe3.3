import React, { useState } from 'react';
import { 
  Ticket, 
  Calendar, 
  User, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Train, 
  Download, 
  Printer, 
  ExternalLink, 
  Clock, 
  MapPin, 
  Sparkles,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { TrainDetails, UserProfile } from '../types/railway';
import { ALL_TRAINS } from '../data/trainsData';

interface TrainBookingPageProps {
  currentTrain: TrainDetails;
  userProfile: UserProfile;
  onSelectTrain?: (train: TrainDetails) => void;
  onNavigateToLiveTracking?: () => void;
  onNavigateToPnr?: () => void;
}

export const TrainBookingPage: React.FC<TrainBookingPageProps> = ({
  currentTrain,
  userProfile,
  onSelectTrain,
  onNavigateToLiveTracking,
  onNavigateToPnr,
}) => {
  const [selectedTrainNumber, setSelectedTrainNumber] = useState(currentTrain.trainNumber);
  const activeTrain = ALL_TRAINS.find(t => t.trainNumber === selectedTrainNumber) || currentTrain;

  const [journeyDate, setJourneyDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [selectedClass, setSelectedClass] = useState<string>(activeTrain.classes[0] || '3A');
  const [quota, setQuota] = useState<'GN' | 'TQ' | 'LD' | 'SS'>('GN');
  
  // Passenger form
  const [passengerName, setPassengerName] = useState(userProfile.fullName || 'Rahul Sharma');
  const [passengerAge, setPassengerAge] = useState('29');
  const [passengerGender, setPassengerGender] = useState<'M' | 'F' | 'O'>('M');
  const [berthPreference, setBerthPreference] = useState<'LB' | 'MB' | 'UB' | 'SL' | 'SU' | 'WS'>('LB');
  const [passengerPhone, setPassengerPhone] = useState(userProfile.phone || '+91 9876543210');
  
  // Booking confirmation state
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [generatedPnr, setGeneratedPnr] = useState('');
  const [bookedBerth, setBookedBerth] = useState('');
  const [copiedPnr, setCopiedPnr] = useState(false);

  const baseFare = activeTrain.fares[selectedClass as keyof typeof activeTrain.fares] || 1240;
  const tatkalCharge = quota === 'TQ' ? 300 : 0;
  const cateringCharge = 180;
  const gstAmount = Math.round((baseFare + tatkalCharge) * 0.05);
  const totalAmount = baseFare + tatkalCharge + cateringCharge + gstAmount;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate realistic 10-digit Indian Railway PNR
    const prefix = '8' + Math.floor(10 + Math.random() * 89);
    const suffix = Math.floor(100000 + Math.random() * 899999);
    const pnr = `${prefix}${suffix}`;
    
    // Assign coach and berth
    const coachPrefix = selectedClass === '1A' ? 'H1' : selectedClass === '2A' ? 'A1' : selectedClass === '3A' ? 'B2' : selectedClass === 'CC' ? 'C2' : 'S4';
    const seatNumber = Math.floor(12 + Math.random() * 54);
    const berthName = berthPreference === 'LB' ? 'Lower Berth' : berthPreference === 'UB' ? 'Upper Berth' : berthPreference === 'WS' ? 'Window Seat' : 'Side Lower';

    setGeneratedPnr(pnr);
    setBookedBerth(`${coachPrefix} / Seat ${seatNumber} (${berthName})`);
    setIsBookingSuccess(true);
  };

  const handleCopyPnr = () => {
    navigator.clipboard.writeText(generatedPnr);
    setCopiedPnr(true);
    setTimeout(() => setCopiedPnr(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
              <Ticket className="h-4 w-4" />
              <span>IRCTC NEXT-GENERATION E-TICKETING PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Instant Train Ticket Booking
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Book confirmed reserved berths across Vande Bharat, Rajdhani, Shatabdi & Superfast expresses with 1-click IRCTC sync.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.irctc.co.in/nget/train-search"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500/20 to-sky-600/30 border border-sky-400/40 hover:border-sky-400 text-sky-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>IRCTC Web Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Selected Train Info Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-black font-mono">
              <Train className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sky-400">{activeTrain.trainNumber}</span>
                <span className="text-white font-extrabold">{activeTrain.trainName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">{activeTrain.type}</span>
              </div>
              <div className="text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>{activeTrain.sourceName} ({activeTrain.sourceDeparture})</span>
                <span>→</span>
                <span>{activeTrain.destName} ({activeTrain.destArrival})</span>
                <span>·</span>
                <span>{activeTrain.duration}</span>
              </div>
            </div>
          </div>

          {/* Quick Select Train Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Change Train:</span>
            <select
              value={selectedTrainNumber}
              onChange={(e) => {
                setSelectedTrainNumber(e.target.value);
                const t = ALL_TRAINS.find(tr => tr.trainNumber === e.target.value);
                if (t && onSelectTrain) onSelectTrain(t);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs font-semibold text-white focus:border-sky-400 focus:outline-none"
            >
              {ALL_TRAINS.map(t => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  {t.trainNumber} - {t.trainName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SUCCESS TICKET CONFIRMATION VIEW */}
      {isBookingSuccess ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-6 shadow-2xl animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  BOOKING CONFIRMED & E-TICKET ISSUED
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Electronic Reservation Slip (ERS)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-400/20 to-sky-500/30 border border-sky-400/40 hover:border-sky-300 text-sky-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Ticket</span>
              </button>
              <button
                onClick={() => setIsBookingSuccess(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Book Another
              </button>
            </div>
          </div>

          {/* Ticket Body Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
            {/* PNR & Train Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">PNR Number:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-black font-mono text-emerald-400">{generatedPnr}</span>
                  <button
                    onClick={handleCopyPnr}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy PNR"
                  >
                    {copiedPnr ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Train No. & Name:</span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {activeTrain.trainNumber} - {activeTrain.trainName}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Date of Journey:</span>
                <span className="text-sm font-bold text-white block mt-0.5 font-mono">{journeyDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Class & Quota:</span>
                <span className="text-sm font-bold text-sky-300 block mt-0.5 font-mono">
                  {selectedClass} ({quota === 'GN' ? 'General' : quota === 'TQ' ? 'Tatkal' : 'Ladies'})
                </span>
              </div>
            </div>

            {/* Passenger & Berth Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Passenger Name:</span>
                <span className="text-sm font-bold text-white block mt-0.5">{passengerName} ({passengerAge}y, {passengerGender})</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Confirmed Berth / Seat:</span>
                <span className="text-base font-black text-amber-300 block mt-0.5 font-mono">
                  CNF / {bookedBerth}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Total Paid Fare:</span>
                <span className="text-base font-black text-emerald-400 block mt-0.5 font-mono">
                  ₹{totalAmount} (All Inclusive)
                </span>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="text-slate-400">
                A confirmation SMS has been dispatched to <strong className="text-white">{passengerPhone}</strong>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToLiveTracking && (
                  <button
                    onClick={onNavigateToLiveTracking}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/30 border border-emerald-400/40 hover:border-emerald-300 text-emerald-200 font-bold transition-all"
                  >
                    Track Train Live Location →
                  </button>
                )}
                {onNavigateToPnr && (
                  <button
                    onClick={onNavigateToPnr}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all"
                  >
                    View in PNR Status Desk
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BOOKING FORM & JOURNEY CONFIGURATION */
        <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Journey & Passenger Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Date & Class Selector */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 pb-2 border-b border-slate-800">
                <Calendar className="h-4 w-4" />
                <span>STEP 1: SELECT JOURNEY DATE & CLASS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Journey Date (IST)
                  </label>
                  <input
                    type="date"
                    required
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Quota
                  </label>
                  <select
                    value={quota}
                    onChange={(e) => setQuota(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    <option value="GN">General Quota (GN)</option>
                    <option value="TQ">Tatkal Quota (TQ)</option>
                    <option value="LD">Ladies Quota (LD)</option>
                    <option value="SS">Senior Citizen (SS)</option>
                  </select>
                </div>
              </div>

              {/* Class Chips */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Travel Class & Seat Tier:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeTrain.classes.map((cls) => {
                    const fare = activeTrain.fares[cls] || 1200;
                    const isSelected = selectedClass === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 border-sky-400 text-sky-200 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="font-mono font-bold text-sm block text-white">{cls}</span>
                        <span className="text-[11px] text-sky-400 font-mono mt-0.5 block">₹{fare}</span>
                        <span className="text-[10px] text-emerald-400 block mt-1">AVAILABLE - 42</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2: Passenger Information */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 pb-2 border-b border-slate-800">
                <User className="h-4 w-4" />
                <span>STEP 2: PASSENGER INFORMATION</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Full Name (As per Govt Photo ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="110"
                    value={passengerAge}
                    onChange={(e) => setPassengerAge(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-sky-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={passengerGender}
                    onChange={(e) => setPassengerGender(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Transgender</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Berth Preference
                  </label>
                  <select
                    value={berthPreference}
                    onChange={(e) => setBerthPreference(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    <option value="LB">Lower Berth (LB)</option>
                    <option value="MB">Middle Berth (MB)</option>
                    <option value="UB">Upper Berth (UB)</option>
                    <option value="SL">Side Lower (SL)</option>
                    <option value="SU">Side Upper (SU)</option>
                    <option value="WS">Window Seat (WS)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Mobile Number for SMS
                  </label>
                  <input
                    type="tel"
                    required
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-sky-400 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Fare Summary & Confirmation */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl space-y-4 sticky top-20">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 pb-2 border-b border-slate-800">
                <CreditCard className="h-4 w-4" />
                <span>FARE BREAKDOWN & CHECKOUT</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Rail Fare ({selectedClass})</span>
                  <span className="font-mono font-bold text-white">₹{baseFare}</span>
                </div>

                {tatkalCharge > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Tatkal Premium Charge</span>
                    <span className="font-mono font-bold">₹{tatkalCharge}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-300">
                  <span>IRCTC e-Catering Meal Option</span>
                  <span className="font-mono font-bold text-white">₹{cateringCharge}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>GST & Rail Insurance (0.45p)</span>
                  <span className="font-mono font-bold text-white">₹{gstAmount}</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Total Payable Amount</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Instant Book Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-400/20 via-sky-500/30 to-blue-500/30 border border-sky-400/50 hover:border-sky-300 text-sky-200 hover:text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Confirm & Generate E-Ticket</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>100% Secure Payment gateway verified with IRCTC CRIS system</span>
              </div>
            </div>
          </div>

        </form>
      )}
    </div>
  );
};
