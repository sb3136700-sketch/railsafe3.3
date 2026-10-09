import React, { useState } from 'react';
import { 
  Train, 
  ShieldAlert, 
  Languages, 
  User, 
  Utensils, 
  FileText,
  Building2,
  Ticket,
  Menu,
  X,
  CreditCard,
  Sun,
  Moon,
  Compass,
  Clock,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { DestinationAlarm, SupportedLanguage, UserProfile } from '../types/railway';
import { TRANSLATIONS, LANGUAGE_OPTIONS } from '../utils/i18n';
import { AppPageTab } from './Sidebar';
import { useTheme } from '../utils/themeContext';

interface NavbarProps {
  activePage: AppPageTab;
  onSelectPage: (page: AppPageTab) => void;
  alarm: DestinationAlarm;
  onOpenAlarmModal: () => void;
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
  activePage,
  onSelectPage,
  alarm,
  onOpenAlarmModal,
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
  const { theme, toggleTheme } = useTheme();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const topNavTabs: { id: AppPageTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Live Dashboard', icon: Train },
    { id: 'booking', label: 'Book Ticket', icon: CreditCard },
    { id: 'animatic', label: 'Animatic View', icon: Clock },
    { id: 'corridor', label: 'Route & Halts', icon: Clock },
    { id: 'planner', label: 'Train Finder', icon: Train },
    { id: 'station', label: 'Station Info', icon: Building2 },
    { id: 'pnr', label: 'PNR Status', icon: Ticket },
  ];

  const handleMobileNavClick = (page: AppPageTab) => {
    onSelectPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-3 sm:px-6 lg:px-8 gap-3">
        
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            onClick={() => onSelectPage('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none rounded cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-600 dark:text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
              <Train className="h-5 w-5" strokeWidth={2.3} />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white block leading-none">
                TRAVELLING GUIDE
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold tracking-wide hidden sm:block">
                Indian Railways Master Companion
              </span>
            </div>
          </button>
        </div>

        {/* Center: Top Page Navigation Tabs for Instant Page Switching */}
        <nav className="hidden xl:flex items-center gap-1">
          {topNavTabs.map((tab) => {
            const isActive = activePage === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectPage(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/15 to-blue-500/20 border border-sky-400/50 text-sky-800 dark:text-sky-200 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons: SOS, Dark/Light Mode, Translate, Language, Account */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* HIGH-QUALITY REFINED SOS BUTTON (Non-messy, crisp, reassuring) */}
          <button
            onClick={onOpenSosModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-200 text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer group"
            title="Indian Railways Emergency Helpline (RPF 182 / RailMadad 139)"
          >
            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">SOS 139</span>
          </button>

          {/* DARK & LIGHT THEME TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Dark and Light Mode"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Real-time Regional Language Translator Button */}
          <button
            onClick={onOpenTranslateModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-300 dark:border-sky-500/40 text-sky-800 dark:text-sky-200 text-xs font-semibold transition-all cursor-pointer"
            title="Language Converter & Multilingual Railway Voice"
          >
            <Languages className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Translator</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="font-bold uppercase text-[11px] text-amber-600 dark:text-amber-400">
                {currentLang}
              </span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-2xl z-50 animate-fade-in">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 px-2 py-1 font-semibold uppercase">
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
                        ? 'bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-400/30 text-amber-900 dark:text-amber-200 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[11px] opacity-75 font-mono">{l.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account / Profile */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            title="Passenger Profile & Saved Journeys"
          >
            <div className="h-5 w-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">
              {userProfile.fullName ? userProfile.fullName.charAt(0) : 'P'}
            </div>
            <span className="hidden md:inline truncate max-w-[80px]">
              {userProfile.fullName ? userProfile.fullName.split(' ')[0] : 'Profile'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer (visible on small screens when hamburger opened) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Select Railway Page
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-700" />}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {topNavTabs.map((item) => {
              const isActive = activePage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileNavClick(item.id)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-500/20 border-sky-400 text-sky-800 dark:text-sky-200 font-bold'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => {
                onOpenFoodModal();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>Food to Berth</span>
            </button>
            <button
              onClick={() => {
                onOpenComplaintModal();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
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
