import React from 'react';
import { 
  Train, 
  Navigation, 
  MapPin, 
  Calendar, 
  Ticket, 
  Calculator, 
  Building2, 
  LayoutGrid, 
  Utensils, 
  PhoneCall, 
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Compass,
  CheckSquare,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../utils/themeContext';

export type AppPageTab = 
  | 'dashboard'
  | 'booking'
  | 'animatic'
  | 'corridor'
  | 'planner'
  | 'station'
  | 'pnr'
  | 'coach'
  | 'fare'
  | 'checklist'
  | 'food'
  | 'madad'
  | 'ai';

interface SidebarProps {
  activePage: AppPageTab;
  onSelectPage: (page: AppPageTab) => void;
  activeTrainNumber: string;
  activeTrainName: string;
  onOpenSosModal: () => void;
  onOpenFoodModal: () => void;
  onOpenComplaintModal: () => void;
}

interface NavMenuItem {
  id: AppPageTab;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  activeTrainNumber,
  activeTrainName,
  onOpenSosModal,
  onOpenFoodModal,
  onOpenComplaintModal,
}) => {
  const { theme } = useTheme();

  const mainNavItems: NavMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Live Dashboard',
      subLabel: 'KPIs, Speed & Origin IST',
      icon: Navigation,
      badge: 'LIVE',
      badgeColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
    },
    {
      id: 'booking',
      label: 'Train Booking',
      subLabel: 'IRCTC Reserved E-Tickets',
      icon: CreditCard,
      badge: 'BOOK',
      badgeColor: 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-400/40',
    },
    {
      id: 'animatic',
      label: 'Animatic Timeline',
      subLabel: 'Simulated Rails & Engine',
      icon: Train,
    },
    {
      id: 'corridor',
      label: 'Route & Corridor',
      subLabel: 'Station Stops & Halts',
      icon: Clock,
    },
    {
      id: 'planner',
      label: 'Train Finder',
      subLabel: '7-Day Frequency Matrix',
      icon: Calendar,
    },
    {
      id: 'station',
      label: 'Station Directory',
      subLabel: 'Search & Verified Amenities',
      icon: Building2,
    },
    {
      id: 'pnr',
      label: 'PNR Status Desk',
      subLabel: 'Confirmed Berths & Charting',
      icon: Ticket,
    },
    {
      id: 'coach',
      label: 'Coach & Berth Map',
      subLabel: 'Interactive Seat Layout',
      icon: LayoutGrid,
    },
    {
      id: 'fare',
      label: 'Fare Calculator',
      subLabel: 'Dynamic Slab Estimation',
      icon: Calculator,
    },
    {
      id: 'checklist',
      label: 'Travel Checklist',
      subLabel: 'Luggage & Journey Prep',
      icon: CheckSquare,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-30 select-none transition-colors">
      
      {/* Brand & Active Train Badge */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-600 dark:text-amber-400 font-black shadow-sm">
            <Train className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white block tracking-tight truncate">
              TRAVELLING GUIDE
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold tracking-wide block">
              Indian Railways Portal
            </span>
          </div>
        </div>

        {/* Selected Train Quick Card */}
        <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">Tracking Train</span>
            <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 block truncate">
              #{activeTrainNumber}
            </span>
            <span className="text-[11px] text-slate-800 dark:text-slate-200 block truncate font-medium">
              {activeTrainName}
            </span>
          </div>
          <button
            onClick={() => onSelectPage('planner')}
            className="text-[10px] px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-400/30 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white font-bold transition-all cursor-pointer shrink-0"
            title="Search different train"
          >
            Change
          </button>
        </div>
      </div>

      {/* Main Multi-Page Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        <div className="px-2 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Railway Modules
        </div>

        {mainNavItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-500/20 border border-sky-300 dark:border-sky-400/50 text-sky-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-mono font-bold shrink-0 transition-colors ${
                  isActive 
                    ? 'bg-sky-200/50 dark:bg-sky-400/20 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-400/40' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 border border-slate-200 dark:border-slate-800'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold truncate flex items-center gap-1.5">
                    <span className={isActive ? 'text-sky-900 dark:text-sky-200' : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider border ${
                        item.badgeColor || 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-400/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-sky-700 dark:text-sky-300/70' : 'text-slate-500'}`}>
                    {item.subLabel}
                  </div>
                </div>
              </div>

              <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                isActive ? 'text-sky-600 dark:text-sky-300 translate-x-0.5' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'
              }`} />
            </button>
          );
        })}

        {/* Quick Utility Triggers */}
        <div className="pt-4 px-2 pb-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Quick Services
        </div>

        <button
          onClick={() => onSelectPage('food')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
            activePage === 'food'
              ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-400/40'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Utensils className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate">Station Food & Catering</span>
          </div>
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </button>

        <button
          onClick={() => onSelectPage('madad')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
            activePage === 'madad'
              ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 font-bold border border-indigo-300 dark:border-indigo-400/40'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="truncate">RailMadad Help (139)</span>
          </div>
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </button>

        <button
          onClick={() => onSelectPage('ai')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
            activePage === 'ai'
              ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-900 dark:text-sky-200 font-bold border border-sky-300 dark:border-sky-400/40'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="h-4 w-4 text-sky-500 shrink-0" />
            <span className="truncate">AI Rail Assistant Desk</span>
          </div>
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </button>
      </div>

      {/* Bottom High-Quality SOS Trigger (Reassuring, non-messy) */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <button
          onClick={onOpenSosModal}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs font-bold transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="text-left truncate">
              <div className="leading-tight font-extrabold text-[11px]">Emergency SOS</div>
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-medium">RPF 182 · Rail 139</div>
            </div>
          </div>
          <PhoneCall className="h-3.5 w-3.5 text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
        </button>
      </div>
    </aside>
  );
};
