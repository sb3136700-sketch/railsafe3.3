import React, { useState, useEffect, useRef } from 'react';
import { 
  Train, 
  Navigation, 
  MapPin, 
  Calendar, 
  LayoutGrid, 
  Ticket, 
  ShieldAlert, 
  Utensils, 
  Bell, 
  Sparkles,
  PhoneCall,
  Search,
  CheckCircle2,
  ArrowRight,
  Compass,
  FileText,
  Languages,
  User,
  Car,
  Calculator,
  Building2,
  CheckSquare,
  ChevronDown,
  Layers,
  ArrowUp
} from 'lucide-react';

import { ALL_TRAINS } from './data/trainsData';
import { TrainDetails, DestinationAlarm, SupportedLanguage, UserProfile } from './types/railway';
import { getUserProfile } from './utils/userStore';
import { TRANSLATIONS } from './utils/i18n';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { JourneyTracker } from './components/JourneyTracker';
import { AnimaticTrainTimeline } from './components/AnimaticTrainTimeline';
import { RouteTimeline } from './components/RouteTimeline';
import { JourneyPlanner } from './components/JourneyPlanner';
import { CoachSeatMap } from './components/CoachSeatMap';
import { PnrChecker } from './components/PnrChecker';
import { TravelUtilities } from './components/TravelUtilities';
import { StationFoodGuide } from './components/StationFoodGuide';
import { NearbyServices } from './components/NearbyServices';
import { AiAssistantPage } from './components/AiAssistantPage';

// Specialized pages
import { PnrStatusPage } from './components/PnrStatusPage';
import { FareCalculatorPage } from './components/FareCalculatorPage';
import { CoachPositionPage } from './components/CoachPositionPage';
import { StationInfoPage } from './components/StationInfoPage';
import { TravelChecklistPage } from './components/TravelChecklistPage';

// Modals
import { AlarmModal } from './components/AlarmModal';
import { SosModal } from './components/SosModal';
import { AuthModal } from './components/AuthModal';
import { RailComplaintModal } from './components/RailComplaintModal';
import { TicketBookingModal } from './components/TicketBookingModal';
import { FoodOrderModal } from './components/FoodOrderModal';
import { RealtimeTranslateModal } from './components/RealtimeTranslateModal';

// Master Session Definitions for Smooth Scrolling
interface SessionNavItem {
  id: string;
  number: string;
  label: string;
  shortLabel: string;
  desc: string;
}

const SCROLL_SESSIONS: SessionNavItem[] = [
  { 
    id: 'master-dashboard', 
    number: '01', 
    label: 'Master Train Dashboard', 
    shortLabel: 'Dashboard',
    desc: 'Live Status, KPI Cards, Origin Departure & Days' 
  },
  { 
    id: 'animatic-timeline', 
    number: '02', 
    label: 'Animatic Train Timeline', 
    shortLabel: 'Animatic Timeline',
    desc: 'Live Motion Track, Locomotive & Signal Simulation' 
  },
  { 
    id: 'route-corridor', 
    number: '03', 
    label: 'Corridor & Timetable', 
    shortLabel: 'Route Corridor',
    desc: 'Full Station Stops, Arrival/Departure & Platforms' 
  },
  { 
    id: 'train-planner', 
    number: '04', 
    label: 'Train Schedule & Days Matrix', 
    shortLabel: 'Train Finder',
    desc: 'Route Search, Start Times & Mon-Sun Days' 
  },
  { 
    id: 'station-facilities', 
    number: '05', 
    label: 'Station Directory & Facilities', 
    shortLabel: 'Station Info',
    desc: 'Search Station, Verified Amenities, Taxi & Transit' 
  },
  { 
    id: 'passenger-services', 
    number: '06', 
    label: 'Passenger Hub & Utilities', 
    shortLabel: 'Passenger Desk',
    desc: 'PNR Status, Coach Layout, Fares & Emergency Desk' 
  },
];

export default function App() {
  const [currentTrain, setCurrentTrain] = useState<TrainDetails>(ALL_TRAINS[0]);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  const [quickSearchNumber, setQuickSearchNumber] = useState('');
  const [activeSession, setActiveSession] = useState<string>('master-dashboard');
  const [passengerHubTab, setPassengerHubTab] = useState<'pnr' | 'coach' | 'fare' | 'checklist'>('pnr');
  const [searchedStationCode, setSearchedStationCode] = useState<string>('NDLS');
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Modals state
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);

  // Destination wake-up alarm state
  const [alarm, setAlarm] = useState<DestinationAlarm>({
    enabled: true,
    stationCode: 'CNB',
    stationName: 'Kanpur Central',
    offsetMinutes: 30,
    soundPlayed: false,
  });

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentApproachingStop = currentTrain.routeStops[1] || currentTrain.routeStops[0];

  // Smooth scroll helper with header offset
  const scrollToSession = (sessionId: string) => {
    setActiveSession(sessionId);
    const element = document.getElementById(sessionId);
    if (element) {
      const yOffset = -90; // offset for sticky navbar + subheader
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  // Scroll listener to update active session and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400);

      const sessionElements = SCROLL_SESSIONS.map((s) => ({
        id: s.id,
        el: document.getElementById(s.id),
      })).filter((item) => item.el !== null);

      const scrollPosition = window.scrollY + 160;

      for (let i = sessionElements.length - 1; i >= 0; i--) {
        const item = sessionElements[i];
        if (item.el && item.el.offsetTop <= scrollPosition) {
          setActiveSession(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Quick train selector handler
  const handleSelectTrain = (train: TrainDetails) => {
    setCurrentTrain(train);
    setSearchedStationCode(train.sourceCode);
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchNumber.trim()) return;
    const found = ALL_TRAINS.find(
      (t) =>
        t.trainNumber.toLowerCase().includes(quickSearchNumber.trim().toLowerCase()) ||
        t.trainName.toLowerCase().includes(quickSearchNumber.trim().toLowerCase())
    );
    if (found) {
      handleSelectTrain(found);
      setQuickSearchNumber('');
      scrollToSession('master-dashboard');
    }
  };

  const handleSetAlarmForStation = (stationCode: string, stationName: string) => {
    setAlarm({
      enabled: true,
      stationCode,
      stationName,
      offsetMinutes: 30,
      soundPlayed: false,
    });
    setIsAlarmModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. TOP HEADER / BRAND BAR */}
      <Navbar
        activeSession={activeSession}
        onNavigateToSession={scrollToSession}
        alarm={alarm}
        onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
        onOpenAiAssistant={() => {}}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
        onOpenFoodModal={() => setIsFoodModalOpen(true)}
        onOpenTranslateModal={() => setIsTranslateModalOpen(true)}
        activeTrainNumber={currentTrain.trainNumber}
        activeTrainName={currentTrain.trainName}
        currentLang={currentLang}
        onChangeLanguage={setCurrentLang}
        userProfile={userProfile}
      />

      {/* 2. BODY LAYOUT WITH LEFT-SIDE NAVIGATION PANEL & COMPLETE SCROLLING WORKSPACE */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        
        {/* LEFT-SIDE NAVIGATION PANEL (Always Accessible) */}
        <Sidebar
          activeSession={activeSession}
          onNavigateToSession={scrollToSession}
          activeTrainNumber={currentTrain.trainNumber}
          activeTrainName={currentTrain.trainName}
          onOpenSosModal={() => setIsSosModalOpen(true)}
          onOpenFoodModal={() => setIsFoodModalOpen(true)}
          onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
          onOpenTicketModal={() => setIsTicketModalOpen(true)}
        />

        {/* RIGHT MAIN CONTENT: ONE COMPLETE SCROLLING PAGE */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 space-y-12">
          
          {/* TOP QUICK SEARCH & ACTION BAR */}
          <section className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Quick Train Navigator
                </span>
                <span className="text-sm font-bold text-white block">
                  Search & Switch Active Train Live Telemetry
                </span>
              </div>
            </div>

            <form onSubmit={handleQuickSearchSubmit} className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={quickSearchNumber}
                onChange={(e) => setQuickSearchNumber(e.target.value)}
                placeholder="Enter Train Number or Name (e.g. 22436, 12002)..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow shrink-0 cursor-pointer"
              >
                Find Train
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => scrollToSession('station-facilities')}
                className="px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-slate-950 hover:bg-slate-900 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Station Search</span>
              </button>

              <button
                onClick={() => scrollToSession('animatic-timeline')}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-slate-950 hover:bg-slate-900 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Train className="h-3.5 w-3.5" />
                <span>Animatic View</span>
              </button>

              <button
                onClick={() => setIsFoodModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Utensils className="h-3.5 w-3.5" />
                <span>Order Food</span>
              </button>
            </div>
          </section>

          {/* SESSION 01: MASTER TRAIN DASHBOARD & KPI CARDS */}
          <section id="master-dashboard" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-black text-sm">
                  01
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">
                    Master Train Dashboard & Real-Time Intelligence
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive single-view telemetry: Live Cruising Speed, Punctuality, Origin Departure IST, Terminus Arrival, and 7-Day Operating Schedule.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Live Telemetry Active
              </span>
            </div>

            <JourneyTracker
              currentTrain={currentTrain}
              allTrains={ALL_TRAINS}
              onSelectTrain={handleSelectTrain}
              alarm={alarm}
              onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
              onNavigateToRoute={() => scrollToSession('route-corridor')}
              onNavigateToNearby={() => scrollToSession('station-facilities')}
              onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
              onOpenFoodModal={() => setIsFoodModalOpen(true)}
              onOpenTicketModal={() => setIsTicketModalOpen(true)}
              userProfile={userProfile}
              onNavigateToPnrStatus={() => {
                setPassengerHubTab('pnr');
                scrollToSession('passenger-services');
              }}
              onNavigateToFareCalculator={() => {
                setPassengerHubTab('fare');
                scrollToSession('passenger-services');
              }}
              onNavigateToCoachPosition={() => {
                setPassengerHubTab('coach');
                scrollToSession('passenger-services');
              }}
              onNavigateToStationInfo={() => scrollToSession('station-facilities')}
              onNavigateToChecklist={() => {
                setPassengerHubTab('checklist');
                scrollToSession('passenger-services');
              }}
            />
          </section>

          {/* SESSION 02: ANIMATIC TRAIN TIMELINE SIMULATION */}
          <section id="animatic-timeline" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black text-sm">
                  02
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">
                    Animatic Train Timeline & Signal Simulation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Interactive motion canvas with dual steel tracks, locomotive engine simulation, railway signals, and audio chimes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => scrollToSession('route-corridor')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 hidden sm:block cursor-pointer"
              >
                Jump to Corridor Schedule ↓
              </button>
            </div>

            <AnimaticTrainTimeline
              currentTrain={currentTrain}
              onSetAlarmForStation={handleSetAlarmForStation}
            />
          </section>

          {/* SESSION 03: ROUTE CORRIDOR & TIMETABLE */}
          <section id="route-corridor" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-black text-sm">
                  03
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">
                    Corridor Schedule & Station Halts
                  </h2>
                  <p className="text-xs text-slate-400">
                    Detailed breakdown of every station stop, arrival/departure timings, halt duration, and platform allocations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => scrollToSession('train-planner')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 hidden sm:block cursor-pointer"
              >
                Jump to Train Finder ↓
              </button>
            </div>

            <RouteTimeline
              currentTrain={currentTrain}
              currentStopIndex={1}
              alarm={alarm}
              onSetAlarmForStation={handleSetAlarmForStation}
            />
          </section>

          {/* SESSION 04: TRAIN FINDER & 7-DAY OPERATING MATRIX */}
          <section id="train-planner" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-black text-sm">
                  04
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">
                    Train Schedule & 7-Day Operating Matrix
                  </h2>
                  <p className="text-xs text-slate-400">
                    Search trains between any stations, check exact journey departure times, and inspect Mon-Sun operating days matrix.
                  </p>
                </div>
              </div>
              <button
                onClick={() => scrollToSession('station-facilities')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 hidden sm:block cursor-pointer"
              >
                Jump to Station Directory ↓
              </button>
            </div>

            <JourneyPlanner
              allTrains={ALL_TRAINS}
              onSelectTrainForTracking={(tr) => {
                handleSelectTrain(tr);
                scrollToSession('master-dashboard');
              }}
              onSelectTrainForRoute={(tr) => {
                handleSelectTrain(tr);
                scrollToSession('route-corridor');
              }}
              onSelectTrainForCoach={(tr) => {
                handleSelectTrain(tr);
                setPassengerHubTab('coach');
                scrollToSession('passenger-services');
              }}
            />
          </section>

          {/* SESSION 05: DEDICATED STATION DIRECTORY & FACILITY RADAR */}
          <section id="station-facilities" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-black text-sm">
                  05
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">
                    Station Search & Verified Amenities Radar
                  </h2>
                  <p className="text-xs text-slate-400">
                    Search any Indian Railways station name or code to load verified platform amenities, waiting lounges, food stalls, and 1-tap local navigation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => scrollToSession('passenger-services')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 hidden sm:block cursor-pointer"
              >
                Jump to Passenger Hub ↓
              </button>
            </div>

            <StationInfoPage
              initialStationCode={searchedStationCode}
              onSelectTrainForDashboard={(trainNum) => {
                const tr = ALL_TRAINS.find((t) => t.trainNumber === trainNum);
                if (tr) {
                  handleSelectTrain(tr);
                  scrollToSession('master-dashboard');
                }
              }}
              onNavigateToAnimatic={() => scrollToSession('animatic-timeline')}
            />
          </section>

          {/* SESSION 06: PASSENGER HUB & INTEGRATED UTILITIES */}
          <section id="passenger-services" className="scroll-mt-24 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-black text-sm">
                  06
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">
                    Passenger Hub & Travel Utilities Desk
                  </h2>
                  <p className="text-xs text-slate-400">
                    Instant PNR query, coach seat configuration, official fare calculator, and pre-departure checklist.
                  </p>
                </div>
              </div>
              <button
                onClick={() => scrollToSession('master-dashboard')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 hidden sm:block cursor-pointer"
              >
                Back to Top (Session 01) ↑
              </button>
            </div>

            {/* Passenger Hub Segmented Navigation */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
              <button
                onClick={() => setPassengerHubTab('pnr')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  passengerHubTab === 'pnr'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Ticket className="h-4 w-4" />
                <span>PNR Status Query</span>
              </button>

              <button
                onClick={() => setPassengerHubTab('coach')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  passengerHubTab === 'coach'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Coach & Seat Map</span>
              </button>

              <button
                onClick={() => setPassengerHubTab('fare')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  passengerHubTab === 'fare'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Calculator className="h-4 w-4" />
                <span>Fare Calculator</span>
              </button>

              <button
                onClick={() => setPassengerHubTab('checklist')}
                className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  passengerHubTab === 'checklist'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Travel Checklist</span>
              </button>
            </div>

            {/* Hub Active Tab Viewport */}
            <div className="pt-2">
              {passengerHubTab === 'pnr' && (
                <PnrChecker
                  onTrackTrainByNumber={(num) => {
                    const tr = ALL_TRAINS.find((t) => t.trainNumber === num) || ALL_TRAINS[0];
                    handleSelectTrain(tr);
                    scrollToSession('master-dashboard');
                  }}
                />
              )}

              {passengerHubTab === 'coach' && (
                <div className="space-y-6">
                  <CoachPositionPage />
                  <div className="pt-6 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-cyan-400" />
                      <span>Interactive Coach & Berth Layout Visualizer for {currentTrain.trainName}</span>
                    </h3>
                    <CoachSeatMap currentTrain={currentTrain} />
                  </div>
                </div>
              )}

              {passengerHubTab === 'fare' && (
                <FareCalculatorPage />
              )}

              {passengerHubTab === 'checklist' && (
                <TravelChecklistPage />
              )}
            </div>

            {/* Emergency Helplines Block */}
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Official Indian Railways 24x7 Helplines</div>
                  <div className="text-slate-300 text-xs">
                    RailMadad Grievance & Medical: <strong className="font-mono text-white">139</strong> · RPF Security: <strong className="font-mono text-white">182</strong> · National Emergency: <strong className="font-mono text-white">112</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsComplaintModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition-colors shadow cursor-pointer"
              >
                File RailMadad Complaint
              </button>
            </div>
          </section>

        </main>
      </div>

      {/* 3. FLOATING SCROLL TO TOP BUTTON */}
      {showScrollToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all cursor-pointer"
          title="Scroll back to top"
        >
          <ArrowUp className="h-5 w-5 stroke-[2.5]" />
        </button>
      )}

      {/* 4. MODALS */}
      {/* Destination Alarm Modal */}
      <AlarmModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        alarm={alarm}
        onSaveAlarm={(newAlarm) => setAlarm(newAlarm)}
        routeStops={currentTrain.routeStops}
        currentStopIndex={1}
      />

      {/* SOS Emergency Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        currentTrain={currentTrain}
        currentStation={currentApproachingStop}
        userProfile={userProfile}
      />

      {/* Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setUserProfile(getUserProfile());
        }}
        userProfile={userProfile}
        onUpdateProfile={(updated: UserProfile) => setUserProfile(updated)}
        onTrackSavedJourney={(trainNumber: string) => {
          const found = ALL_TRAINS.find((t) => t.trainNumber === trainNumber);
          if (found) {
            handleSelectTrain(found);
            setIsAuthModalOpen(false);
            scrollToSession('master-dashboard');
          }
        }}
      />

      {/* RailMadad Complaint Modal */}
      <RailComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        currentTrain={currentTrain}
        currentStation={currentApproachingStop}
        userProfile={userProfile}
      />

      {/* Ticket Booking Modal */}
      <TicketBookingModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        currentTrain={currentTrain}
        userProfile={userProfile}
        onNavigateToPnr={() => {
          setIsTicketModalOpen(false);
          setPassengerHubTab('pnr');
          scrollToSession('passenger-services');
        }}
      />

      {/* Food Order Modal */}
      <FoodOrderModal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        currentTrain={currentTrain}
        currentStation={currentApproachingStop}
        userProfile={userProfile}
      />

      {/* Multilingual Voice/Text Translate Modal */}
      <RealtimeTranslateModal
        isOpen={isTranslateModalOpen}
        onClose={() => setIsTranslateModalOpen(false)}
      />
    </div>
  );
}
