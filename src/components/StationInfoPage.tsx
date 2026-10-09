import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  ExternalLink, 
  Navigation,
  Compass,
  Train,
  Clock,
  Layers,
  Utensils,
  Hotel,
  Car,
  HeartPulse,
  Info,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { getStationDetails, VERIFIED_STATIONS_DATA, StationFacilityData } from '../services/stationService';
import { MAJOR_STATIONS, FAMOUS_STATION_FOODS, ALL_TRAINS } from '../data/trainsData';

interface StationInfoPageProps {
  initialStationCode?: string;
  onSelectTrainForDashboard?: (trainNumber: string) => void;
  onNavigateToAnimatic?: () => void;
}

export const StationInfoPage: React.FC<StationInfoPageProps> = ({
  initialStationCode,
  onSelectTrainForDashboard,
  onNavigateToAnimatic,
}) => {
  const [searchInput, setSearchInput] = useState(initialStationCode || '');
  const [selectedStation, setSelectedStation] = useState<StationFacilityData>(() => {
    if (initialStationCode) {
      const found = getStationDetails(initialStationCode);
      if (found) return found;
    }
    return VERIFIED_STATIONS_DATA[0]; // NDLS default
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'facilities' | 'trains' | 'food' | 'transit'>('overview');

  // Trigger search on form submit
  const performSearch = (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setSearchFeedback(null);

    // Simulate snappy high-speed directory lookup with visual feedback
    setTimeout(() => {
      const details = getStationDetails(query.trim());
      if (details) {
        setSelectedStation(details);
        setSearchFeedback(`Loaded verified data for ${details.stationName} (${details.stationCode})`);
      } else {
        setSearchFeedback(`No exact match for "${query}". Displaying closest Indian Railways terminal.`);
      }
      setIsLoading(false);
    }, 280);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchInput);
  };

  // Quick switch from chips
  const handleSelectQuickStation = (st: StationFacilityData) => {
    setSearchInput(st.stationCode);
    setSelectedStation(st);
    setSearchFeedback(`Viewing verified amenities for ${st.stationName}`);
  };

  // Find trains passing through or originating/terminating at this station
  const relatedTrains = ALL_TRAINS.filter(t => 
    t.sourceCode === selectedStation.stationCode ||
    t.destCode === selectedStation.stationCode ||
    t.routeStops.some(s => s.stationCode === selectedStation.stationCode)
  );

  // Find famous food items for this station
  const stationFood = FAMOUS_STATION_FOODS.find(f => f.stationCode === selectedStation.stationCode);

  const facilitiesList = [
    { key: 'restroom', label: 'Restrooms / Toilets', icon: '🚻', available: selectedStation.facilities.restroom, desc: 'Clean western & Indian toilets with paid deluxe executive options.' },
    { key: 'food', label: 'Food Plaza / IRCTC Canteen', icon: '🍴', available: selectedStation.facilities.food, desc: 'Jan Aahaar, food courts, and branded fast-food kiosks.' },
    { key: 'waitingRoom', label: 'AC & General Waiting Rooms', icon: '🪑', available: selectedStation.facilities.waitingRoom, desc: 'Free passenger seating + pay-and-use air conditioned lounge.' },
    { key: 'atm', label: 'Station ATM Kiosks', icon: '🏧', available: selectedStation.facilities.atm, desc: 'Nationalized bank ATMs near main concourse and entrance.' },
    { key: 'parking', label: '2-Wheeler / Car Parking', icon: '🅿️', available: selectedStation.facilities.parking, desc: '24x7 automated pay-and-park facilities at circulating area.' },
    { key: 'medical', label: 'Emergency Medical Booth', icon: '🏥', available: selectedStation.facilities.medical, desc: 'First aid assistance booth with emergency ambulance link.' },
    { key: 'taxi', label: 'Prepaid Taxi Stand', icon: '🚕', available: selectedStation.facilities.taxi, desc: 'Traffic police supervised prepaid booth & Ola/Uber pickup.' },
    { key: 'auto', label: 'Auto Rickshaw Stand', icon: '🛺', available: selectedStation.facilities.auto, desc: 'Dedicated queue and meter/fixed rate rickshaw stands.' },
    { key: 'accessibility', label: 'Wheelchair & Ramp Access', icon: '♿', available: selectedStation.facilities.accessibility, desc: 'Braille signage, ramps, battery-operated buggy for seniors.' },
    { key: 'wifi', label: 'RailWire High-Speed Wi-Fi', icon: '📶', available: selectedStation.facilities.wifi, desc: '30 mins high-speed free internet powered by Google / RailTel.' },
    { key: 'water', label: 'RO Drinking Water Booths', icon: '💧', available: selectedStation.facilities.water, desc: 'Water vending machines at Rs 5/litre + free cold water taps.' },
    { key: 'cloakRoom', label: 'Cloak Room / Luggage Lock', icon: '🧳', available: selectedStation.facilities.cloakRoom, desc: 'Verified luggage safekeeping service for valid ticket holders.' },
    { key: 'executiveLounge', label: 'IRCTC Executive Lounge', icon: '🛋️', available: selectedStation.facilities.executiveLounge, desc: 'Buffet meals, recliners, showers, and Wi-Fi lounge.' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. STATION SEARCH CONSOLE (Dynamic query loads detailed station profile) */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
              <Building2 className="h-4 w-4" />
              <span>INDIAN RAILWAYS STATION DIRECTORY & FACILITY RADAR</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Station Search & Live Amenities Guide
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Search any Indian Railways station name or 3-4 letter code (e.g. NDLS, CNB, MAS, SBC, HWH) to instantly load platform layouts, food specialities, taxi stands, and transit links.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              Active Station: <strong className="text-amber-400">{selectedStation.stationCode}</strong>
            </span>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search station by name or code (e.g. New Delhi, CNB, Mumbai Central, Howrah, Chennai)..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading Station...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search Station</span>
              </>
            )}
          </button>
        </form>

        {searchFeedback && (
          <div className="mt-2 text-[11px] text-amber-400/90 font-medium flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            <span>{searchFeedback}</span>
          </div>
        )}

        {/* Quick Station Selection Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1">Major Hubs:</span>
          {VERIFIED_STATIONS_DATA.map((st) => {
            const isSelected = selectedStation.stationCode === st.stationCode;
            return (
              <button
                key={st.stationCode}
                type="button"
                onClick={() => handleSelectQuickStation(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="font-mono font-bold mr-1">{st.stationCode}</span>
                <span>{st.city}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMICALLY LOADED STATION DETAILS VIEW */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl relative">
        {/* Top Station Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 border border-amber-500/40 text-amber-400 font-black font-mono text-xl shadow-inner shrink-0">
              {selectedStation.stationCode}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold font-mono">
                  Station Code: {selectedStation.stationCode}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedStation.city}, {selectedStation.state}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-emerald-400 font-semibold">
                  ● Verified Indian Railways Terminal
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                {selectedStation.stationName}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Total Platforms: <strong className="text-white font-mono">{selectedStation.platforms} Platforms</strong></span>
                <span>·</span>
                <span>Coordinates: <span className="font-mono text-slate-300">{selectedStation.latitude}° N, {selectedStation.longitude}° E</span></span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Google Maps Navigation & Animatic Timeline */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={selectedStation.navigationLinks.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0"
            >
              <Navigation className="h-4 w-4" />
              <span>Google Maps Navigation</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            {onNavigateToAnimatic && (
              <button
                onClick={onNavigateToAnimatic}
                className="h-10 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-500/40 bg-slate-950 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                <Train className="h-4 w-4" />
                <span>Animatic Timeline</span>
              </button>
            )}
          </div>
        </div>

        {/* Station Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Overview & Quick Services
          </button>

          <button
            onClick={() => setActiveSubTab('facilities')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'facilities'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Station Amenities & Facilities ({facilitiesList.filter(f => f.available).length})
          </button>

          <button
            onClick={() => setActiveSubTab('trains')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'trains'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Trains at this Station ({relatedTrains.length})
          </button>

          {stationFood && (
            <button
              onClick={() => setActiveSubTab('food')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeSubTab === 'food'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Famous Station Food Specialties
            </button>
          )}
        </div>

        {/* SUBTAB 1: OVERVIEW & QUICK ACTIONS */}
        {activeSubTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Quick Navigation Cards */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                1-Tap Station Transit & Emergency Links:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <a
                  href={selectedStation.navigationLinks.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 text-center transition-all group"
                >
                  <Compass className="h-5 w-5 text-cyan-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">Directions</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Turn-by-turn map</span>
                </a>

                <a
                  href={selectedStation.navigationLinks.hospitalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-red-500/50 text-center transition-all group"
                >
                  <HeartPulse className="h-5 w-5 text-red-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">Nearby Hospital</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Emergency clinics</span>
                </a>

                <a
                  href={selectedStation.navigationLinks.restaurantUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/50 text-center transition-all group"
                >
                  <Utensils className="h-5 w-5 text-amber-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">Food & Dining</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Outside station</span>
                </a>

                <a
                  href={selectedStation.navigationLinks.hotelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-indigo-500/50 text-center transition-all group"
                >
                  <Hotel className="h-5 w-5 text-indigo-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">IRCTC Rooms</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Retiring rooms</span>
                </a>

                <a
                  href={selectedStation.navigationLinks.cabUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-lime-500/50 text-center transition-all group"
                >
                  <Car className="h-5 w-5 text-lime-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">Book Cab</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Ola / Uber pickup</span>
                </a>

                <a
                  href={selectedStation.navigationLinks.autoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-yellow-500/50 text-center transition-all group"
                >
                  <span className="text-xl block mb-1">🛺</span>
                  <span className="text-xs font-bold text-white block">Prepaid Auto</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Local transport</span>
                </a>
              </div>
            </div>

            {/* Quick KPI Overview for Station */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px] font-semibold mb-1">Platform Count</div>
                <div className="text-2xl font-black font-mono text-white">{selectedStation.platforms} Active Platforms</div>
                <div className="text-slate-500 text-[11px] mt-1">High-level passenger handling facilities</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px] font-semibold mb-1">High Speed Connectivity</div>
                <div className="text-2xl font-black text-emerald-400">RailWire Wi-Fi</div>
                <div className="text-slate-500 text-[11px] mt-1">Free 30m high-speed access across all platforms</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[11px] font-semibold mb-1">Executive Comfort</div>
                <div className="text-2xl font-black text-cyan-400">
                  {selectedStation.facilities.executiveLounge ? 'AC Lounge Available' : 'Standard Waiting Hall'}
                </div>
                <div className="text-slate-500 text-[11px] mt-1">Buffet dining & charging points available</div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: VERIFIED FACILITIES LIST */}
        {activeSubTab === 'facilities' && (
          <div className="mt-6">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Verified Station Amenities & Availability:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {facilitiesList.map((f) => (
                <div
                  key={f.key}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                    f.available
                      ? 'border-slate-800 bg-slate-950 text-slate-200'
                      : 'border-slate-900 bg-slate-950/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{f.label}</span>
                        {f.available ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    f.available ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {f.available ? 'Operational' : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: TRAINS CALLING AT THIS STATION */}
        {activeSubTab === 'trains' && (
          <div className="mt-6 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trains connected with {selectedStation.stationName}:
            </div>

            {relatedTrains.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                No currently loaded companion trains call directly at this stop. You can search the Train Schedule & Days Matrix in Session 04.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relatedTrains.map((t) => (
                  <div
                    key={t.trainNumber}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-amber-400">
                          {t.trainNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {t.type}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {t.trainName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <span>{t.sourceCode} ({t.sourceDeparture})</span>
                        <span>→</span>
                        <span>{t.destCode} ({t.destArrival})</span>
                      </div>
                    </div>

                    {onSelectTrainForDashboard && (
                      <button
                        onClick={() => onSelectTrainForDashboard(t.trainNumber)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        Track Live
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 4: FAMOUS STATION FOOD */}
        {activeSubTab === 'food' && stationFood && (
          <div className="mt-6 p-5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
              <Utensils className="h-4 w-4" />
              <span>FAMOUS REGIONAL RAILWAY SPECIALTY</span>
            </div>
            <h3 className="text-lg font-black text-white">
              {stationFood.dish}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {stationFood.description}
            </p>
            <div className="mt-3 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
              <span>📍 Platform Tip:</span>
              <span className="text-slate-300">{stationFood.platformTip}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
