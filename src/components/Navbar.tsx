import React, { useState } from 'react';
import { 
  Train, 
  ShieldAlert, 
  Languages, 
  User, 
  Utensils, 
  FileText,
  Calculator,
  Building2,
  Ticket,
  Menu,
  X,
  PhoneCall,
  Search,
  ExternalLink
} from 'lucide-react';
import { DestinationAlarm, SupportedLanguage, UserProfile } from '../types/railway';
import { TRANSLATIONS, LANGUAGE_OPTIONS } from '../utils/i18n';

interface NavbarProps {
  activeSession: string;
  onNavigateToSession: (sessionId: string) => void;
  alarm: DestinationAlarm;
  onOpenAlarmModal: () => void;
  onOpenAiAssistant: () => void;
  onOpenSosModal: () => void;
  onOpenAuthModal: () => void;
  onOpenComplaintModal: () => void;
  onOpenFoodModal: () => void;
  onOpenTranslateModal: () => void;
  activeTrainNumber: string;
  activeTrainName: string;
  currentLang: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  userProfile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSession,
  onNavigateToSession,
  alarm,
  onOpenAlarmModal,
  onOpenAiAssistant,
  onOpenSosModal,
  onOpenAuthModal,
  onOpenComplaintModal,
  onOpenFoodModal,
  onOpenTranslateModal,
  activeTrainNumber,
  activeTrainName,
  currentLang,
  onChangeLanguage,
  userProfile,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const quickNavItems = [
    { id: 'master-dashboard', label: 'Live Dashboard', number: '01' },
    { id: 'animatic-timeline', label: 'Animatic Timeline', number: '02' },
    { id: 'route-corridor', label: 'Route Corridor', number: '03' },
    { id: 'train-planner', label: 'Train Finder', number: '04' },
    { id: 'station-facilities', label: 'Station Info', number: '05' },
    { id: 'passenger-services', label: 'Passenger Hub', number: '06' },
  ];

  const handleMobileNavClick = (sessionId: string) => {
    onNavigateToSession(sessionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-3 sm:px-6 lg:px-8 gap-3">
        
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            onClick={() => onNavigateToSession('master-dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none rounded cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 neon-glow-amber">
              <Train className="h-5 w-5" strokeWidth={2.3} />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-none">
                TRAVELLING GUIDE
              </span>
              <span className="text-[10px] text-amber-400/90 font-semibold tracking-wide hidden sm:block">
                Indian Railways Master Companion
              </span>
            </div>
          </button>
        </div>

        {/* Current Active Train Quick Status Pill (Center) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-400">Tracking:</span>
          <span className="font-mono font-bold text-amber-400">#{activeTrainNumber}</span>
          <span className="text-slate-300 font-medium truncate max-w-[200px]">{activeTrainName}</span>
        </div>

        {/* Right Action Icons: SOS, Translate, Language, Account */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Neon SOS Emergency Trigger */}
          <button
            onClick={onOpenSosModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/40 neon-glow-red transition-all cursor-pointer animate-pulse"
            title="Emergency SOS / RPF 182 / Police"
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="tracking-wider">SOS</span>
          </button>

          {/* Real-time Translate */}
          <button
            onClick={onOpenTranslateModal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-cyan-500/40 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-semibold transition-colors cursor-pointer"
            title="Multilingual Rail Voice & Text Translate"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>Translate</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="font-bold uppercase text-[11px] text-amber-400">
                {currentLang}
              </span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl z-50 animate-fade-in">
                <div className="text-[10px] text-slate-400 px-2 py-1 font-semibold uppercase">
                  Select Regional Language
                </div>
                {LANGUAGE_OPTIONS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onChangeLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      currentLang === l.code
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[11px] opacity-75 font-mono">{l.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            title="Passenger Profile & Saved Journeys"
          >
            <div className="h-5 w-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
              {userProfile.fullName.charAt(0)}
            </div>
            <span className="hidden md:inline truncate max-w-[80px]">
              {userProfile.fullName.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer (visible on small screens when hamburger opened) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2 animate-fade-in shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Scroll to Journey Session
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickNavItems.map((item) => {
              const isActive = activeSession === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNavClick(item.id)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-black ${isActive ? 'text-slate-950' : 'text-amber-400'}`}>
                    {item.number}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => {
                onOpenFoodModal();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>Food to Berth</span>
            </button>
            <button
              onClick={() => {
                onOpenComplaintModal();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>RailMadad 139</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
