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
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  activeSession: string;
  onNavigateToSession: (sessionId: string) => void;
  activeTrainNumber: string;
  activeTrainName: string;
  onOpenSosModal: () => void;
  onOpenFoodModal: () => void;
  onOpenComplaintModal: () => void;
  onOpenTicketModal: () => void;
}

interface NavSectionItem {
  id: string;
  number: string;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSession,
  onNavigateToSession,
  activeTrainNumber,
  activeTrainName,
  onOpenSosModal,
  onOpenFoodModal,
  onOpenComplaintModal,
  onOpenTicketModal,
}) => {
  const mainSessions: NavSectionItem[] = [
    {
      id: 'master-dashboard',
      number: '01',
      label: 'Live Dashboard',
      subLabel: 'KPIs, Origin & Days',
      icon: Navigation,
    },
    {
      id: 'animatic-timeline',
      number: '02',
      label: 'Animatic Timeline',
      subLabel: 'Animated Rail View',
      icon: Train,
      badge: 'LIVE',
    },
    {
      id: 'route-corridor',
      number: '03',
      label: 'Route & Corridor',
      subLabel: 'Stops & Timetable',
      icon: Clock,
    },
    {
      id: 'train-planner',
      number: '04',
      label: 'Train Finder',
      subLabel: '7-Day Schedule Matrix',
      icon: Calendar,
    },
    {
      id: 'station-facilities',
      number: '05',
      label: 'Station Directory',
      subLabel: 'Search & Amenities',
      icon: Building2,
      badge: 'SEARCH',
    },
    {
      id: 'passenger-services',
      number: '06',
      label: 'Passenger Hub',
      subLabel: 'PNR, Coach & Fares',
      icon: Ticket,
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-800 bg-slate-950/95 backdrop-blur-md z-30 select-none">
      {/* Brand & Active Train Badge */}
      <div className="p-4 border-b border-slate-800/90">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Train className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-extrabold text-white block tracking-tight truncate">
              TRAVELLING GUIDE
            </span>
            <span className="text-[10px] text-amber-400 font-semibold tracking-wide block">
              Indian Railways Portal
            </span>
          </div>
        </div>

        {/* Selected Train Quick Card */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Current Train</span>
            <span className="text-xs font-bold font-mono text-amber-400 block truncate">
              #{activeTrainNumber}
            </span>
            <span className="text-[11px] text-white block truncate font-medium">
              {activeTrainName}
            </span>
          </div>
          <button
            onClick={() => onNavigateToSession('train-planner')}
            className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold transition-colors cursor-pointer shrink-0"
            title="Change train in finder"
          >
            Change
          </button>
        </div>
      </div>

      {/* Main Navigation Sessions (Scrolls down master page) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Journey Sessions
        </div>

        {mainSessions.map((session) => {
          const isActive = activeSession === session.id;
          const Icon = session.icon;

          return (
            <button
              key={session.id}
              onClick={() => onNavigateToSession(session.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-mono font-bold shrink-0 ${
                  isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400 group-hover:text-amber-400'
                }`}>
                  {session.number}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold truncate flex items-center gap-1.5">
                    <span>{session.label}</span>
                    {session.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {session.badge}
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                    {session.subLabel}
                  </div>
                </div>
              </div>

              <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                isActive ? 'text-slate-950 rotate-90' : 'text-slate-600 group-hover:text-slate-400'
              }`} />
            </button>
          );
        })}

        {/* Quick Utility Links */}
        <div className="pt-4 px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Passenger Services
        </div>

        <button
          onClick={onOpenTicketModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left cursor-pointer"
        >
          <Ticket className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="truncate">IRCTC Ticket Booking</span>
        </button>

        <button
          onClick={onOpenFoodModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left cursor-pointer"
        >
          <Utensils className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="truncate">Order Food to Berth</span>
        </button>

        <button
          onClick={onOpenComplaintModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left cursor-pointer"
        >
          <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="truncate">RailMadad Complaint (139)</span>
        </button>
      </div>

      {/* Bottom Emergency SOS Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <button
          onClick={onOpenSosModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-red-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <PhoneCall className="h-4 w-4 text-red-400 animate-pulse" />
          <span>Emergency SOS (RPF 182)</span>
        </button>
      </div>
    </aside>
  );
};
