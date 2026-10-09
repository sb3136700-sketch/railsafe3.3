import React, { useState, useEffect } from 'react';
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
  CreditCard, 
  Layers, 
  ArrowUp,
  Clock,
  Radio,
  Gauge,
  Volume2
} from 'lucide-react';

import { ALL_TRAINS } from './data/trainsData';
import { TrainDetails, DestinationAlarm, SupportedLanguage, UserProfile } from './types/railway';
import { getUserProfile } from './utils/userStore';
import { TRANSLATIONS } from './utils/i18n';

import { Navbar } from './components/Navbar';
import { Sidebar, AppPageTab } from './components/Sidebar';
import { JourneyTracker } from './components/JourneyTracker';
import { AnimaticTrainTimeline } from './components/AnimaticTrainTimeline';
import { RouteTimeline } from './components/RouteTimeline';
import { JourneyPlanner } from './components/JourneyPlanner';
import { CoachSeatMap } from './components/CoachSeatMap';
import { PnrChecker } from './components/PnrChecker';
import { StationFoodGuide } from './components/StationFoodGuide';
import { AiAssistantPage } from './components/AiAssistantPage';

// Multi-Page Modules
import { TrainBookingPage } from './components/TrainBookingPage';
import { StationInfoPage } from './components/StationInfoPage';
import { FareCalculatorPage } from './components/FareCalculatorPage';
import { CoachPositionPage } from './components/CoachPositionPage';
import { TravelChecklistPage } from './components/TravelChecklistPage';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';

// Modals
import { AlarmModal } from './components/AlarmModal';
import { SosModal } from './components/SosModal';
import { AuthModal } from './components/AuthModal';
import { RailComplaintModal } from './components/RailComplaintModal';
import { TicketBookingModal } from './components/TicketBookingModal';
import { FoodOrderModal } from './components/FoodOrderModal';
import { RealtimeTranslateModal } from './components/RealtimeTranslateModal';

export default function App() {
  const [activePage, setActivePage] = useState<AppPageTab>('dashboard');
  const [currentTrain, setCurrentTrain] = useState<TrainDetails>(ALL_TRAINS[0]);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  const [quickSearchNumber, setQuickSearchNumber] = useState('');
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

  const currentApproachingStop = currentTrain.routeStops[1] || currentTrain.routeStops[0];

  // Scroll listener for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // When switching pages, scroll viewport to top smoothly
  const handleSelectPage = (page: AppPageTab) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      handleSelectPage('dashboard');
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white transition-colors duration-200">
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <Navbar
        activePage={activePage}
        onSelectPage={handleSelectPage}
        alarm={alarm}
        onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
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

      {/* 2. BODY LAYOUT: LEFT SIDEBAR + INDEPENDENT PAGE VIEWPORT */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        
        {/* LEFT-SIDE NAVIGATION PANEL (Always Accessible) */}
        <Sidebar
          activePage={activePage}
          onSelectPage={handleSelectPage}
          activeTrainNumber={currentTrain.trainNumber}
          activeTrainName={currentTrain.trainName}
          onOpenSosModal={() => setIsSosModalOpen(true)}
          onOpenFoodModal={() => setIsFoodModalOpen(true)}
          onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
        />

        {/* RIGHT MAIN CONTENT: MULTIPLE PAGES SWITCHED VIA BUTTON ACTIONS */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 space-y-6">
          
          {/* TOP QUICK STATUS & SEARCH STRIP */}
          <section className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 transition-colors">
            {/* Live Indicator */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                    Quick Train Navigator
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    GPS Active
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-white block">
                  Switch Active Train or Find Station
                </span>
              </div>
            </div>

            {/* Train Search Input */}
            <form onSubmit={handleQuickSearchSubmit} className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={quickSearchNumber}
                onChange={(e) => setQuickSearchNumber(e.target.value)}
                placeholder="Enter Train Number or Name (e.g. 22436, 12002)..."
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
              >
                Find Train
              </button>
            </form>

            {/* Quick Pill Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSelectPage('booking')}
                className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/15 border border-sky-300 dark:border-sky-400/30 text-sky-800 dark:text-sky-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-sm"
              >
                <CreditCard className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />
                <span>Book Ticket</span>
              </button>

              <button
                onClick={() => handleSelectPage('station')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-400/30 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-sm"
              >
                <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                <span>Station Info</span>
              </button>

              <button
                onClick={() => handleSelectPage('animatic')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-400/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-sm"
              >
                <Train className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
                <span>Animatic View</span>
              </button>

              <button
                onClick={() => handleSelectPage('food')}
                className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-500/15 border border-orange-300 dark:border-orange-400/30 text-orange-800 dark:text-orange-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-sm"
              >
                <Utensils className="h-3.5 w-3.5 text-orange-600 dark:text-orange-300" />
                <span>Food Guide</span>
              </button>
            </div>
          </section>

          {/* PAGE VIEWPORT (Conditionally loads active page module) */}
          
          {/* 1. LIVE DASHBOARD PAGE */}
          {activePage === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-black text-sm">
                    01
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      Live Dashboard & Train Telemetry
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cruising speed, punctuality, origin departure IST, destination terminus & 7-day operating schedule.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectPage('booking')}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/20 border border-sky-300 dark:border-sky-400/40 text-sky-800 dark:text-sky-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-sm"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Book This Train →</span>
                </button>
              </div>

              <JourneyTracker
                currentTrain={currentTrain}
                allTrains={ALL_TRAINS}
                onSelectTrain={handleSelectTrain}
                alarm={alarm}
                onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
                onNavigateToRoute={() => handleSelectPage('corridor')}
                onNavigateToNearby={() => handleSelectPage('station')}
                onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
                onOpenFoodModal={() => setIsFoodModalOpen(true)}
                onOpenTicketModal={() => handleSelectPage('booking')}
                userProfile={userProfile}
                onNavigateToPnrStatus={() => handleSelectPage('pnr')}
                onNavigateToFareCalculator={() => handleSelectPage('fare')}
                onNavigateToCoachPosition={() => handleSelectPage('coach')}
                onNavigateToStationInfo={() => handleSelectPage('station')}
                onNavigateToChecklist={() => handleSelectPage('checklist')}
              />
            </div>
          )}

          {/* 2. TRAIN BOOKING PAGE */}
          {activePage === 'booking' && (
            <div className="space-y-6 animate-fade-in">
              <TrainBookingPage
                currentTrain={currentTrain}
                userProfile={userProfile}
                onSelectTrain={handleSelectTrain}
                onNavigateToLiveTracking={() => handleSelectPage('dashboard')}
                onNavigateToPnr={() => handleSelectPage('pnr')}
              />
            </div>
          )}

          {/* 3. ANIMATIC TIMELINE PAGE */}
          {activePage === 'animatic' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-black text-sm">
                    03
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      Animatic Train Timeline & Signal Simulation
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Interactive motion canvas with dual steel tracks, locomotive engine simulation, railway signals, and audio chimes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectPage('corridor')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  View Route Timetable →
                </button>
              </div>

              <AnimaticTrainTimeline
                currentTrain={currentTrain}
                onSetAlarmForStation={handleSetAlarmForStation}
              />
            </div>
          )}

          {/* 4. ROUTE CORRIDOR PAGE */}
          {activePage === 'corridor' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-mono font-black text-sm">
                    04
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      Corridor Schedule & Station Halts
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Detailed breakdown of every station stop, arrival/departure timings, halt duration, and platform allocations.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectPage('planner')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Open Train Finder →
                </button>
              </div>

              <RouteTimeline
                currentTrain={currentTrain}
                currentStopIndex={1}
                alarm={alarm}
                onSetAlarmForStation={handleSetAlarmForStation}
              />
            </div>
          )}

          {/* 5. TRAIN FINDER & 7-DAY MATRIX PAGE */}
          {activePage === 'planner' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-black text-sm">
                    05
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      Train Schedule & 7-Day Operating Matrix
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Search trains between any stations, check exact journey departure times, and inspect Mon-Sun operating days matrix.
                    </p>
                  </div>
                </div>
              </div>

              <JourneyPlanner
                allTrains={ALL_TRAINS}
                onSelectTrainForTracking={(tr) => {
                  handleSelectTrain(tr);
                  handleSelectPage('dashboard');
                }}
                onSelectTrainForRoute={(tr) => {
                  handleSelectTrain(tr);
                  handleSelectPage('corridor');
                }}
                onSelectTrainForCoach={(tr) => {
                  handleSelectTrain(tr);
                  handleSelectPage('coach');
                }}
              />
            </div>
          )}

          {/* 6. STATION DIRECTORY PAGE */}
          {activePage === 'station' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-black text-sm">
                    06
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      Station Search & Verified Amenities Radar
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Search any Indian Railways station name or code to load verified platform amenities, waiting lounges, food stalls, and 1-tap local navigation.
                    </p>
                  </div>
                </div>
              </div>

              <StationInfoPage
                initialStationCode={searchedStationCode}
                onSelectTrainForDashboard={(trainNum) => {
                  const tr = ALL_TRAINS.find((t) => t.trainNumber === trainNum);
                  if (tr) {
                    handleSelectTrain(tr);
                    handleSelectPage('dashboard');
                  }
                }}
                onNavigateToAnimatic={() => handleSelectPage('animatic')}
              />
            </div>
          )}

          {/* 7. PNR STATUS PAGE */}
          {activePage === 'pnr' && (
            <div className="space-y-6 animate-fade-in">
              <PnrChecker
                onTrackTrainByNumber={(num) => {
                  const tr = ALL_TRAINS.find((t) => t.trainNumber === num) || ALL_TRAINS[0];
                  handleSelectTrain(tr);
                  handleSelectPage('dashboard');
                }}
              />
            </div>
          )}

          {/* 8. COACH & BERTH MAP PAGE */}
          {activePage === 'coach' && (
            <div className="space-y-6 animate-fade-in">
              <CoachPositionPage />
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-sky-500" />
                  <span>Interactive Coach & Berth Layout Visualizer for {currentTrain.trainName}</span>
                </h3>
                <CoachSeatMap currentTrain={currentTrain} />
              </div>
            </div>
          )}

          {/* 9. FARE CALCULATOR PAGE */}
          {activePage === 'fare' && (
            <div className="space-y-6 animate-fade-in">
              <FareCalculatorPage />
            </div>
          )}

          {/* 10. TRAVEL CHECKLIST PAGE */}
          {activePage === 'checklist' && (
            <div className="space-y-6 animate-fade-in">
              <TravelChecklistPage />
            </div>
          )}

          {/* 11. STATION FOOD GUIDE PAGE */}
          {activePage === 'food' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 font-mono font-black text-sm">
                    11
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      Station Food & Platform Catering Guide
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Iconic regional dishes, platform stalls, and IRCTC approved delivery to your berth.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFoodModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Utensils className="h-3.5 w-3.5" />
                  <span>Order Food to Berth</span>
                </button>
              </div>

              <StationFoodGuide />
            </div>
          )}

          {/* 12. RAILMADAD ASSISTANCE PAGE */}
          {activePage === 'madad' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-black text-sm">
                    12
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                      RailMadad Passenger Grievance & Security Desk
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Official portal for 24/7 security assistance, medical emergencies, coach cleanliness, and lost baggage.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsComplaintModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>File Official Incident</span>
                </button>
              </div>

              {/* Dedicated RailMadad Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Security (RPF)</h4>
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-bold">Dial 182 / 139</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    For theft, unruly passengers, unauthorized hawkers, or women safety in coaches.
                  </p>
                  <button
                    onClick={() => setIsSosModalOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                  >
                    Open Emergency SOS
                  </button>
                </div>

                <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Coach Cleanliness</h4>
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">Clean My Coach</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    Request cleaning of toilets, doorway trash, aisle sweep, or fresh linen replacement.
                  </p>
                  <button
                    onClick={() => setIsComplaintModalOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold hover:bg-amber-100 cursor-pointer"
                  >
                    Request Coach Cleaning
                  </button>
                </div>

                <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-2xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <PhoneCall className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Medical Help at Next Stop</h4>
                      <span className="text-xs text-sky-600 dark:text-sky-400 font-mono font-bold">Station Doctor</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    First-aid kit onboard with TTE, and medical doctor dispatched to next halt platform.
                  </p>
                  <button
                    onClick={() => setIsComplaintModalOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30 text-xs font-bold hover:bg-sky-100 cursor-pointer"
                  >
                    Request Station Medical Team
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 13. AI COMPANION DEDICATED PAGE */}
          {activePage === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              <AiAssistantPage
                currentTrain={currentTrain}
                currentStation={currentApproachingStop}
              />
            </div>
          )}

        </main>
      </div>

      {/* 3. FLOATING AI ASSISTANT IN BOTTOM-RIGHT CORNER */}
      <FloatingAiAssistant
        currentTrain={currentTrain}
        currentStation={currentApproachingStop}
        onNavigateToAiPage={() => handleSelectPage('ai')}
      />

      {/* 4. FLOATING SCROLL TO TOP BUTTON */}
      {showScrollToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-40 h-11 w-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-white flex items-center justify-center shadow-xl backdrop-blur-md transition-all cursor-pointer"
          title="Scroll back to top"
        >
          <ArrowUp className="h-5 w-5 stroke-[2.5]" />
        </button>
      )}

      {/* 5. MODALS */}
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
            handleSelectPage('dashboard');
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
          handleSelectPage('pnr');
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
        currentLang={currentLang}
        onChangeLanguage={setCurrentLang}
      />
    </div>
  );
}
