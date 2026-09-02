import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  X,
  Loader2,
  Navigation,
  Fuel,
  Coffee,
  Utensils,
  Compass,
  Building,
  CheckCircle2,
  Radio,
  Send,
  Waves,
  Trees,
} from 'lucide-react';
import { calculateDistanceMeters, formatDistance } from '../services/convoySyncService';

export interface SearchResultPlace {
  place_id: string | number;
  display_name: string;
  name: string;
  lat: number;
  lon: number;
  type?: string;
  category?: string;
  address?: {
    city?: string;
    town?: string;
    suburb?: string;
    road?: string;
    state?: string;
    country?: string;
  };
}

interface NavigationSearchBarProps {
  onSelectDestination: (place: { name: string; lat: number; lng: number; address?: string }) => void;
  userCoords: { lat: number; lng: number };
  currentDestinationName?: string;
  isLeader?: boolean;
}

// Popular quick search categories for road trips & convoys
const QUICK_SEARCH_PRESETS = [
  { label: 'Akaryakıt & Benzinlik', query: 'Benzinlik', icon: Fuel, color: 'text-amber-500' },
  { label: 'Dinlenme & Mola Yeri', query: 'Dinlenme Tesisi', icon: Coffee, color: 'text-orange-500' },
  { label: 'Restoran / Yemek', query: 'Restoran', icon: Utensils, color: 'text-rose-500' },
  { label: 'Marina & Sahil', query: 'Marina', icon: Waves, color: 'text-cyan-500' },
  { label: 'Kadıköy', query: 'Kadıköy, İstanbul', icon: Building, color: 'text-emerald-500' },
  { label: 'Çeşme Marina', query: 'Çeşme Marina, İzmir', icon: Compass, color: 'text-blue-500' },
];

export const NavigationSearchBar: React.FC<NavigationSearchBarProps> = ({
  onSelectDestination,
  userCoords,
  currentDestinationName,
  isLeader = true,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justSelected, setJustSelected] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform geocoding search with Nominatim OpenStreetMap API
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Cancel previous ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Nominatim search endpoint with priority viewbox near current user location
      const viewboxParam = userCoords.lat && userCoords.lng
        ? `&viewbox=${userCoords.lng - 0.5},${userCoords.lat + 0.5},${userCoords.lng + 0.5},${userCoords.lat - 0.5}&bounded=0`
        : '';
      
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&addressdetails=1&limit=7&accept-language=tr,en${viewboxParam}`;

      const res = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Arama servisi yanıt vermedi (${res.status})`);
      }

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const formatted: SearchResultPlace[] = data.map((item: any) => {
          // Extract a human readable short name
          let cleanName = item.name || item.display_name.split(',')[0];
          if (!cleanName || cleanName.trim() === '') {
            cleanName = item.display_name.split(',').slice(0, 2).join(', ');
          }

          return {
            place_id: item.place_id,
            display_name: item.display_name,
            name: cleanName,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: item.type,
            category: item.class,
            address: item.address,
          };
        });

        // Sort by closest distance to user
        if (userCoords.lat && userCoords.lng) {
          formatted.sort((a, b) => {
            const distA = calculateDistanceMeters(userCoords.lat, userCoords.lng, a.lat, a.lon);
            const distB = calculateDistanceMeters(userCoords.lat, userCoords.lng, b.lat, b.lon);
            return distA - distB;
          });
        }

        setResults(formatted);
        setIsOpen(true);
      } else {
        setResults([]);
        setErrorMsg('Sonuç bulunamadı. Lütfen farklı bir yer adı veya ilçe deneyin.');
        setIsOpen(true);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Nominatim search error:', err.message);
        setErrorMsg('Yer araması yapılırken bağlantı gecikti.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search when user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle selecting a place
  const handleSelect = (place: SearchResultPlace) => {
    setJustSelected(place.name);
    setQuery(place.name);
    setIsOpen(false);

    onSelectDestination({
      name: place.name,
      lat: place.lat,
      lng: place.lon,
      address: place.display_name,
    });

    setTimeout(() => {
      setJustSelected(null);
    }, 4000);
  };

  // Get place category icon
  const getPlaceIcon = (item: SearchResultPlace) => {
    const text = (item.display_name + ' ' + (item.type || '') + ' ' + (item.category || '')).toLowerCase();
    if (text.includes('fuel') || text.includes('benzin') || text.includes('petrol') || text.includes('opet') || text.includes('shell')) {
      return <Fuel className="w-4 h-4 text-amber-500" />;
    }
    if (text.includes('cafe') || text.includes('kahve') || text.includes('coffee') || text.includes('starbucks')) {
      return <Coffee className="w-4 h-4 text-orange-500" />;
    }
    if (text.includes('restaurant') || text.includes('restoran') || text.includes('lokanta') || text.includes('kebap') || text.includes('yemek')) {
      return <Utensils className="w-4 h-4 text-rose-500" />;
    }
    if (text.includes('marina') || text.includes('sahil') || text.includes('deniz') || text.includes('plaj') || text.includes('beach')) {
      return <Waves className="w-4 h-4 text-cyan-500" />;
    }
    if (text.includes('park') || text.includes('orman') || text.includes('doga') || text.includes('camp')) {
      return <Trees className="w-4 h-4 text-emerald-500" />;
    }
    return <MapPin className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto z-40">
      {/* Crisp White Stylish Search Bar */}
      <div className="relative flex items-center bg-white text-slate-900 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-slate-200/80 transition-all duration-300 focus-within:ring-4 focus-within:ring-emerald-500/25 focus-within:border-emerald-500">
        {/* Left Navigation / Search Icon */}
        <div className="pl-4 pr-2 text-slate-400 flex items-center justify-center shrink-0">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-emerald-600" />
          )}
        </div>

        {/* Text Input */}
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onFocus={() => {
            if (results.length > 0 || query.length > 0) setIsOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Nereye Gitmek İstiyorsunuz? (Örn: Kadıköy, Benzinlik, Marina)"
          className="w-full py-3.5 pr-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent border-none outline-none"
        />

        {/* Right Clear or Status Button */}
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              searchInputRef.current?.focus();
            }}
            className="p-2 mr-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Temizle"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="mr-3 shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">Canlı Konvoy Rotası</span>
          </div>
        )}
      </div>

      {/* Instant Notification Toast when a destination is selected */}
      <AnimatePresence>
        {justSelected && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="mt-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl shadow-xl flex items-center justify-between gap-2 text-xs font-bold border border-emerald-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>
                Hedef Seçildi: <strong>{justSelected}</strong> & Tüm Konvoyla Eşitlendi!
              </span>
            </div>
            <span className="text-[10px] bg-emerald-800/60 px-2 py-0.5 rounded-md font-mono">
              OSRM Rotası Çizildi
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Autocomplete Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200/90 overflow-hidden z-50 text-slate-900"
          >
            {/* Header info badge */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                {isLeader ? 'Konvoy Lideri Rota Belirleme' : 'Konvoy Hedef Arama'}
              </span>
              <span className="text-[11px] text-slate-400">OpenStreetMap & OSRM</span>
            </div>

            {/* Quick Category Chips */}
            <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_SEARCH_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setQuery(preset.query);
                      performSearch(preset.query);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all shrink-0 hover:border-emerald-300"
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${preset.color}`} />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Results List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {isLoading && results.length === 0 && (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  <span className="text-xs font-semibold">Yer ve mekanlar aranıyor...</span>
                </div>
              )}

              {errorMsg && !isLoading && (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <p className="font-semibold text-slate-700">{errorMsg}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Yukarıdaki hızlı kategorilerden birine tıklayarak da aratabilirsiniz.
                  </p>
                </div>
              )}

              {results.map((place) => {
                const distanceMeters =
                  userCoords.lat && userCoords.lng
                    ? calculateDistanceMeters(userCoords.lat, userCoords.lng, place.lat, place.lon)
                    : 0;

                return (
                  <button
                    key={place.place_id}
                    onClick={() => handleSelect(place)}
                    className="w-full text-left p-3.5 hover:bg-emerald-50/80 transition-colors flex items-start gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100/70 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      {getPlaceIcon(place)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                          {place.name}
                        </h4>
                        {distanceMeters > 0 && (
                          <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md shrink-0">
                            {formatDistance(distanceMeters)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                        {place.display_name}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span>Koordinat: {place.lat.toFixed(4)}, {place.lon.toFixed(4)}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
                          Rotayı Çiz & Konvoya Gönder <Send className="w-2.5 h-2.5 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Sync Footer Note */}
            <div className="p-2.5 bg-slate-100/80 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                Liderin seçtiği rota tüm konvoy takipçilerine canlı eşitlenir
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-0.5"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
