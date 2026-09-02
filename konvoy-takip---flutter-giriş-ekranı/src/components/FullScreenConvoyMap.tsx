import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import {
  Navigation,
  Compass,
  Gauge,
  Radio,
  Share2,
  Check,
  X,
  MapPin,
  Layers,
  Crosshair,
  AlertTriangle,
  Users,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Route as RouteIcon,
  Sparkles,
  Car,
  Bike,
  ShieldCheck,
  RotateCcw,
  Wifi,
  Activity,
  Send,
  UserMinus,
  Crown,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  Coffee,
  Fuel,
  AlertOctagon,
  Mic,
  Flame,
  Trash2,
  BellRing,
  Flag,
} from 'lucide-react';
import { ActiveConvoy, BreakPoint, ConvoyHazard, ConvoyParticipant, VoiceMessage } from '../types';
import { calculateDistanceMeters, convoySyncService, formatDistance, playAudioTone } from '../services/convoySyncService';
import { NavigationSearchBar } from './NavigationSearchBar';

interface FullScreenConvoyMapProps {
  isOpen: boolean;
  convoy: ActiveConvoy;
  onClose: () => void;
  onUpdateConvoy?: (updated: ActiveConvoy) => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  isSimulated: boolean;
}

// Generate distinct SVG vehicle symbols for map markers
function getVehicleIconSvg(type: string): string {
  switch (type) {
    case 'motorcycle':
      return `
        <svg class="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H5c-2.8 0-5 2.2-5 5s2.2 5 5 5c2.46 0 4.45-1.69 4.9-4h4.2c.45 2.31 2.44 4 4.9 4 2.8 0 5-2.2 5-5 0-2.61-1.92-4.78-4.56-4.97zM7.82 15C7.4 16.15 6.28 17 5 17c-1.63 0-3-1.37-3-3s1.37-3 3-3c1.28 0 2.4.85 2.82 2H5v2h2.82zm11.18 2c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
      `;
    case 'suv':
      return `
        <svg class="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      `;
    case 'sport':
      return `
        <svg class="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-11 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM22 15v-3.5L19.4 5.3C19.1 4.5 18.3 4 17.5 4h-11c-.8 0-1.6.5-1.9 1.3L2 11.5V15c0 .6.4 1 1 1h1.1c.4 1.7 2 3 3.9 3s3.5-1.3 3.9-3h4.2c.4 1.7 2 3 3.9 3s3.5-1.3 3.9-3H21c.6 0 1-.4 1-1z"/>
        </svg>
      `;
    case 'truck':
      return `
        <svg class="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 1c-2.76 0-5 2.24-5 5v1H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h1.1c.45 1.72 2 3 3.9 3s3.45-1.28 3.9-3h2.2c.45 1.72 2 3 3.9 3s3.45-1.28 3.9-3H21c.55 0 1-.45 1-1V6c0-2.76-2.24-5-5-5zM9 19c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm9 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
        </svg>
      `;
    case 'car':
    default:
      return `
        <svg class="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
        </svg>
      `;
  }
}

// Default initial coordinate (Istanbul Bosphorus Scenic Highway or Izmir Coastal Way)
const DEFAULT_COORDS = {
  lat: 41.0422,
  lng: 29.0067,
};

// Tile Layer configurations (OpenStreetMap default without API key)
const MAP_LAYERS = {
  streets: {
    name: 'OpenStreetMap (Google Maps Stili)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  cartoVoyager: {
    name: 'Açık Şehir & Otoyol',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
  satellite: {
    name: 'Uydu Hibrit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{n}',
    attribution: '&copy; Esri, Earthstar Geographics',
  },
  dark: {
    name: 'Karanlık Gece Modu',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
};

export const FullScreenConvoyMap: React.FC<FullScreenConvoyMapProps> = ({
  isOpen,
  convoy: initialConvoy,
  onClose,
  onUpdateConvoy,
}) => {
  const [currentConvoy, setCurrentConvoy] = useState<ActiveConvoy>(initialConvoy);
  const [leaderUpdatedToast, setLeaderUpdatedToast] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [isKickedModalOpen, setIsKickedModalOpen] = useState(false);
  const [showBreakPointModal, setShowBreakPointModal] = useState(false);
  const [showHazardModal, setShowHazardModal] = useState(false);
  const [activeHazardAlert, setActiveHazardAlert] = useState<ConvoyHazard | null>(null);
  const [breakawayWarning, setBreakawayWarning] = useState<{ name: string; distMeters: number } | null>(null);
  const [followerLaggingAlert, setFollowerLaggingAlert] = useState<number | null>(null);
  const [incomingVoiceToast, setIncomingVoiceToast] = useState<VoiceMessage | null>(null);

  // Check if current user is leader
  const isCurrentUserLeader =
    initialConvoy?.leaderName?.includes('Sen') ||
    initialConvoy?.participants?.some((p) => p.isLeader && (p.name.includes('Sen') || p.id === 'leader_self'));

  // Sync with prop changes
  useEffect(() => {
    setCurrentConvoy(initialConvoy);
    if (initialConvoy?.destinationLat && initialConvoy?.destinationLng) {
      setDestCoords({
        lat: initialConvoy.destinationLat,
        lng: initialConvoy.destinationLng,
        name: initialConvoy.destination || 'Belirlenen Hedef',
      });
    }
  }, [initialConvoy]);

  // Subscribe to real-time room updates (Destination, Kicks, Clear Route, Hazards, Breakpoints, Voice)
  useEffect(() => {
    if (!isOpen || !initialConvoy?.code) return;
    const unsubscribe = convoySyncService.subscribe(initialConvoy.code, (updated) => {
      setCurrentConvoy(updated);
      onUpdateConvoy?.(updated);

      // 1. Check if current user was kicked by leader
      if (!isCurrentUserLeader && updated.kickedUserIds && updated.kickedUserIds.length > 0) {
        const myName = 'Sen';
        const isMeKicked = updated.kickedUserIds.some(
          (k) => k === myName || k.includes('Sen') || k.startsWith('user_')
        );
        if (isMeKicked && !isKickedModalOpen) {
          setIsKickedModalOpen(true);
        }
      }

      // 2. Check if route was cleared by leader or other device
      if (!updated.destinationLat && !updated.destinationLng) {
        setDestCoords({ lat: 0, lng: 0, name: '' });
        if (routeLineRef.current) {
          routeLineRef.current.remove();
          routeLineRef.current = null;
        }
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.remove();
          destinationMarkerRef.current = null;
        }
        setRouteInfo({ distanceKm: '0 km', durationMin: 0, isLoading: false, error: null });
      } else if (updated.destinationLat && updated.destinationLng) {
        // If destination was updated by Leader or another tab
        setDestCoords((prev) => {
          if (
            Math.abs(prev.lat - updated.destinationLat!) > 0.0001 ||
            Math.abs(prev.lng - updated.destinationLng!) > 0.0001 ||
            prev.name !== updated.destination
          ) {
            setLeaderUpdatedToast(
              `🎯 Konvoy Lideri Yeni Hedef Belirledi: ${updated.destination}`
            );
            setTimeout(() => setLeaderUpdatedToast(null), 4500);
            return {
              lat: updated.destinationLat!,
              lng: updated.destinationLng!,
              name: updated.destination,
            };
          }
          return prev;
        });
      }

      // 3. Check incoming Voice Message (PTT)
      if (updated.lastVoiceMessage && updated.lastVoiceMessage.senderId !== 'self') {
        const msg = updated.lastVoiceMessage;
        setIncomingVoiceToast(msg);
        playAudioTone('ptt_end');
        setTimeout(() => setIncomingVoiceToast(null), 4500);
      }
    });
    return () => unsubscribe();
  }, [isOpen, initialConvoy?.code, onUpdateConvoy, isCurrentUserLeader, isKickedModalOpen]);

  const convoy = currentConvoy;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const memberMarkersRef = useRef<L.Marker[]>([]);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const breakPointMarkerRef = useRef<L.Marker | null>(null);
  const hazardMarkersRef = useRef<L.Marker[]>([]);

  const [activeLayerType, setActiveLayerType] = useState<keyof typeof MAP_LAYERS>('streets');
  const [copied, setCopied] = useState(false);
  const [isPttActive, setIsPttActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ConvoyParticipant | null>(null);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'requesting' | 'active' | 'denied' | 'error'>('requesting');
  const hasCenteredOnUserRef = useRef<boolean>(false);
  const hasSetInitialNearbyDestRef = useRef<boolean>(false);

  // Kick member function for Leader
  const handleKickMember = (memberId: string, memberName: string) => {
    const updated = convoySyncService.kickParticipant(convoy.code, memberId);
    if (updated) {
      setCurrentConvoy(updated);
      onUpdateConvoy?.(updated);
      setActionToast(`🛑 ${memberName} konvoydan çıkarıldı.`);
      setTimeout(() => setActionToast(null), 3500);
    }
  };

  // Feature 1: Clear Route and Pin Function (Rotayı ve Hedefi Temizle)
  const handleClearRoute = () => {
    const updated = convoySyncService.clearDestination(convoy.code);
    if (updated) {
      setCurrentConvoy(updated);
      onUpdateConvoy?.(updated);
    }
    setDestCoords({ lat: 0, lng: 0, name: '' });
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }
    setRouteInfo({
      distanceKm: '0 km',
      durationMin: 0,
      isLoading: false,
      error: null,
    });

    // Haritayı kullanıcının kendi canlı konumuna odakla (başka bir yere kaymasın)
    if (mapInstanceRef.current && userLocation && userLocation.lat && userLocation.lng) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15.5, { animate: true });
    }

    setActionToast('🧹 Rota ve hedef pini temizlendi (Tüm konvoy senkronize)');
    setTimeout(() => setActionToast(null), 3500);
  };

  // Feature 2: Push-to-Talk (PTT) Walkie-Talkie Handlers
  const handleStartPtt = () => {
    setIsPttActive(true);
    playAudioTone('ptt_start');
  };

  const handleEndPtt = () => {
    if (!isPttActive) return;
    setIsPttActive(false);
    const senderName = isCurrentUserLeader ? (convoy.leaderName || 'Konvoy Lideri') : 'Sen';
    const voiceMsg: VoiceMessage = {
      id: `voice_${Date.now()}`,
      senderId: 'self',
      senderName,
      timestamp: Date.now(),
      durationSec: 3,
    };
    convoySyncService.sendVoiceMessage(convoy.code, voiceMsg);
    setActionToast('🎙️ Telsiz anonsunuz konvoya iletildi');
    setTimeout(() => setActionToast(null), 2500);
  };

  // Feature 4: Ortak Mola Noktası Belirleme
  const handleSetBreakPoint = (name: string, type: 'coffee' | 'fuel' | 'restaurant' | 'view') => {
    const targetLat = destCoords.lat || userLocation.lat + 0.015;
    const targetLng = destCoords.lng || userLocation.lng + 0.015;
    const bp: BreakPoint = {
      id: `bp_${Date.now()}`,
      name: name || 'Ortak Mola & Dinlenme Alanı',
      lat: targetLat,
      lng: targetLng,
      type,
      setBy: convoy.leaderName || 'Lider',
      createdAt: Date.now(),
    };
    const updated = convoySyncService.setBreakPoint(convoy.code, bp);
    if (updated) {
      setCurrentConvoy(updated);
      onUpdateConvoy?.(updated);
    }
    setShowBreakPointModal(false);
    setActionToast(`☕ Ortak Mola Noktası Belirlendi: ${bp.name}`);
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleClearBreakPoint = () => {
    const updated = convoySyncService.clearBreakPoint(convoy.code);
    if (updated) {
      setCurrentConvoy(updated);
      onUpdateConvoy?.(updated);
    }
    if (breakPointMarkerRef.current) {
      breakPointMarkerRef.current.remove();
      breakPointMarkerRef.current = null;
    }
    setActionToast('☕ Mola noktası kaldırıldı.');
    setTimeout(() => setActionToast(null), 3000);
  };

  // Feature 5: Radar ve Tehlike Bildirimi
  const handleReportHazard = (type: 'radar' | 'accident' | 'roadwork' | 'hazard', title: string) => {
    const hazard: ConvoyHazard = {
      id: `haz_${Date.now()}`,
      type,
      title: title || (type === 'radar' ? 'Radar / Hız Tuzağı' : 'Trafik Kazası'),
      lat: userLocation.lat + 0.003,
      lng: userLocation.lng + 0.003,
      reportedBy: isCurrentUserLeader ? (convoy.leaderName || 'Lider') : 'Konvoy Sürücüsü',
      reportedAt: Date.now(),
    };
    const updated = convoySyncService.reportHazard(convoy.code, hazard);
    if (updated) {
      setCurrentConvoy(updated);
      onUpdateConvoy?.(updated);
    }
    setShowHazardModal(false);
    setActionToast(`🚨 ${hazard.title} konvoy haritasına işlendi!`);
    setTimeout(() => setActionToast(null), 4000);
  };

  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: string;
    durationMin: number;
    isLoading: boolean;
    error: string | null;
  }>({
    distanceKm: '...',
    durationMin: 0,
    isLoading: true,
    error: null,
  });

  // User Live Geolocation State
  const [userLocation, setUserLocation] = useState<UserLocation>({
    lat: DEFAULT_COORDS.lat,
    lng: DEFAULT_COORDS.lng,
    accuracy: 10,
    speed: 0,
    heading: 0,
    altitude: null,
    isSimulated: false,
  });

  // Destination Coordinates (default or user clicked)
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number; name: string }>({
    lat: DEFAULT_COORDS.lat + 0.042,
    lng: DEFAULT_COORDS.lng + 0.048,
    name: convoy.destination || 'Çeşme Marina & Otoyol Çıkışı',
  });

  // Copy PIN helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(convoy.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Center map on user blue dot
  const handleCenterOnUser = useCallback(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [userLocation]);

  // Fit all convoy members and destination
  const handleFitConvoyBounds = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const points: L.LatLngExpression[] = [
      [userLocation.lat, userLocation.lng],
      [destCoords.lat, destCoords.lng],
    ];
    const bounds = L.latLngBounds(points);
    mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80] });
  }, [userLocation, destCoords]);

  // Real-time Geolocation Watcher (STRICTLY REAL GPS, NO FAKE SIMULATION)
  useEffect(() => {
    if (!isOpen) return;

    if (!('geolocation' in navigator)) {
      console.warn('Geolocation is not supported by browser.');
      setGpsStatus('error');
      return;
    }

    setGpsStatus('requesting');
    let watchId: number;

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, speed, heading, altitude } = pos.coords;
      const calculatedSpeed = speed !== null && speed > 0 ? Math.round(speed * 3.6) : 0; // real km/h
      const calculatedHeading = heading !== null ? Math.round(heading) : 0;

      setGpsStatus('active');
      setUserLocation({
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
        speed: calculatedSpeed,
        heading: calculatedHeading,
        altitude: altitude !== null ? Math.round(altitude) : null,
        isSimulated: false,
      });

      // 1. Center map immediately on user's real location upon first GPS fix
      if (!hasCenteredOnUserRef.current) {
        hasCenteredOnUserRef.current = true;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15.5, { animate: true });
        }
      }

      // 2. If no custom destination was defined in the convoy, create a nearby destination relative to real user
      if (!hasSetInitialNearbyDestRef.current && (!initialConvoy?.destinationLat || !initialConvoy?.destinationLng)) {
        hasSetInitialNearbyDestRef.current = true;
        const nearbyDest = {
          lat: latitude + 0.024,
          lng: longitude + 0.028,
          name: convoy.destination || 'Konvoy Hedefi & Mola Noktası',
        };
        setDestCoords(nearbyDest);
        fetchOsrmRoute(latitude, longitude, nearbyDest.lat, nearbyDest.lng);
      }

      // Broadcast position to all other connected convoy devices in real time
      if (initialConvoy?.code) {
        convoySyncService.updateMyLiveLocation(
          initialConvoy.code,
          'leader_self',
          latitude,
          longitude,
          calculatedSpeed,
          calculatedHeading
        );
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn('Geolocation permission error or unavailable:', err.message);
      if (err.code === err.PERMISSION_DENIED) {
        setGpsStatus('denied');
      } else {
        setGpsStatus('error');
      }
    };

    // First get quick initial position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // Then continuously watch live position strictly from device GPS
    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    });

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isOpen, initialConvoy?.code, initialConvoy?.destinationLat, initialConvoy?.destinationLng]);

  // Real Road Routing via OSRM (Open-Source Routing Machine)
  const fetchOsrmRoute = useCallback(async (startLat: number, startLng: number, endLat: number, endLng: number) => {
    // If destination coordinates are not set (e.g. Cleared route), remove all polylines and exit
    if (!endLat || !endLng || endLat === 0 || endLng === 0) {
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
      setRouteInfo({
        distanceKm: '0 km',
        durationMin: 0,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      setRouteInfo((prev) => ({ ...prev, isLoading: true, error: null }));
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OSRM API hatası: ${response.status}`);
      }

      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const primaryRoute = data.routes[0];
        const coordinates: [number, number][] = primaryRoute.geometry.coordinates; // [lng, lat]
        
        // Convert to Leaflet [lat, lng] format
        const leafletCoords: L.LatLngExpression[] = coordinates.map(([lng, lat]) => [lat, lng]);

        if (mapInstanceRef.current) {
          if (!routeLineRef.current) {
            routeLineRef.current = L.polyline(leafletCoords, {
              color: '#06b6d4',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(mapInstanceRef.current);
          } else {
            routeLineRef.current.setLatLngs(leafletCoords);
          }
        }

        const distanceInKm = (primaryRoute.distance / 1000).toFixed(1);
        const durationInMinutes = Math.round(primaryRoute.duration / 60);

        setRouteInfo({
          distanceKm: `${distanceInKm} km`,
          durationMin: durationInMinutes,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Uygun karayolu rotası bulunamadı');
      }
    } catch (err: any) {
      console.warn('OSRM routing fetch failed:', err.message);
      setRouteInfo((prev) => ({
        ...prev,
        isLoading: false,
        error: 'OSRM rota servisine erişilemedi (Düz bağlantı kullanılıyor)',
      }));

      // Fallback straight line if network/service fails
      if (mapInstanceRef.current) {
        const fallbackCoords: L.LatLngExpression[] = [
          [startLat, startLng],
          [endLat, endLng],
        ];
        if (!routeLineRef.current) {
          routeLineRef.current = L.polyline(fallbackCoords, {
            color: '#06b6d4',
            weight: 5,
            opacity: 0.7,
            dashArray: '4, 8',
          }).addTo(mapInstanceRef.current);
        } else {
          routeLineRef.current.setLatLngs(fallbackCoords);
        }
      }
    }
  }, []);

  // Leader / User selects a new destination (via search bar or map click)
  const handleSelectDestination = useCallback(
    (place: { name: string; lat: number; lng: number; address?: string }) => {
      setDestCoords({
        lat: place.lat,
        lng: place.lng,
        name: place.name,
      });

      // Synchronize across all members of this convoy room code
      if (initialConvoy?.code) {
        convoySyncService.updateDestination(
          initialConvoy.code,
          place.name,
          place.lat,
          place.lng,
          place.address
        );
      }

      // Calculate new real road route immediately
      fetchOsrmRoute(userLocation.lat, userLocation.lng, place.lat, place.lng);

      // Pan/fit map to cover user and destination
      if (mapInstanceRef.current) {
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [place.lat, place.lng],
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 });
      }
    },
    [initialConvoy?.code, userLocation.lat, userLocation.lng, fetchOsrmRoute]
  );

  // Fetch real road route whenever user GPS location or destination coords change
  useEffect(() => {
    if (!isOpen) return;
    fetchOsrmRoute(userLocation.lat, userLocation.lng, destCoords.lat, destCoords.lng);
  }, [isOpen, userLocation.lat, userLocation.lng, destCoords.lat, destCoords.lng, fetchOsrmRoute]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      tileLayerRef.current = L.tileLayer(MAP_LAYERS[activeLayerType].url, {
        maxZoom: 19,
      }).addTo(map);

      // Add custom zoom controls at top-right
      L.control
        .zoom({
          position: 'topright',
        })
        .addTo(map);

      mapInstanceRef.current = map;

      // Allow user to click anywhere on map to set new convoy destination
      map.on('click', (e: L.LeafletMouseEvent) => {
        handleSelectDestination({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          name: `Nokta (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`,
        });
      });
    }

    // Force map to resize nicely when modal opens
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 300);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update Tile Layer if changed
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(MAP_LAYERS[activeLayerType].url);
  }, [activeLayerType]);

  // Update User Pulsating Blue Dot Marker and Accuracy Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const blueDotHtml = `
      <div class="user-live-location-marker">
        <div class="blue-dot-pulse"></div>
        <div class="blue-dot-pulse-secondary"></div>
        <div class="blue-dot-heading-arrow" style="transform: rotate(${userLocation.heading || 0}deg) translateY(-8px);"></div>
        <div class="blue-dot-core"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: blueDotHtml,
      className: 'custom-blue-dot-icon',
      iconSize: [60, 60],
      iconAnchor: [30, 30],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: customIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarkerRef.current.bindPopup(`
        <div class="p-2.5 text-slate-100 font-sans">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse"></span>
            <strong class="text-sm font-bold text-blue-400">Sen (Canlı GPS Konumun)</strong>
          </div>
          <div class="text-xs text-slate-300 space-y-1">
            <div>Hız: <strong class="text-white">${userLocation.speed || 0} km/s</strong></div>
            <div>Hassasiyet: <strong class="text-emerald-400">±${userLocation.accuracy}m</strong></div>
            <div>Konvoy Kodu: <strong class="text-cyan-300 font-mono">#${convoy.code}</strong></div>
          </div>
        </div>
      `);
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      userMarkerRef.current.setIcon(customIcon);
    }

    // Accuracy Circle
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: Math.max(20, userLocation.accuracy),
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(map);
    } else {
      accuracyCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      accuracyCircleRef.current.setRadius(Math.max(20, userLocation.accuracy));
    }
  }, [userLocation, convoy.code]);

  // Update Destination & All Convoy Vehicles Markers with distinct colors & car icons
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Destination Pin (Only when valid destination exists)
    if (destCoords.lat && destCoords.lng && destCoords.lat !== 0 && destCoords.lng !== 0 && Boolean(destCoords.name)) {
      const destIcon = L.divIcon({
        html: `
          <div class="flex flex-col items-center">
            <div class="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase shadow-lg shadow-emerald-500/40 mb-0.5 border border-white/40">
              Varış
            </div>
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/50 ring-2 ring-white/40">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
        `,
        className: 'dest-marker-icon',
        iconSize: [80, 70],
        iconAnchor: [40, 65],
      });

      if (!destinationMarkerRef.current) {
        destinationMarkerRef.current = L.marker([destCoords.lat, destCoords.lng], {
          icon: destIcon,
        }).addTo(map);

        destinationMarkerRef.current.bindPopup(`
          <div class="p-2 text-slate-100 font-sans">
            <strong class="text-sm text-emerald-400 font-bold">Hedef Noktası</strong>
            <p class="text-xs text-slate-300 mt-1">${destCoords.name}</p>
          </div>
        `);
      } else {
        destinationMarkerRef.current.setLatLng([destCoords.lat, destCoords.lng]);
      }
    } else {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }
    }

    // Clear old member markers
    memberMarkersRef.current.forEach((m) => m.remove());
    memberMarkersRef.current = [];

    // Render every participant in the convoy with their unique vehicle icon & color
    convoy.participants.forEach((p, idx) => {
      // If participant is the primary user and is the leader at index 0, user already has the blue dot,
      // but let's also give peers exact positions or realistic positions along the route
      if (p.id === 'leader_self' || (p.isLeader && idx === 0)) return;

      const pLat = p.lat !== undefined ? p.lat : userLocation.lat - (idx + 1) * 0.0018;
      const pLng = p.lng !== undefined ? p.lng : userLocation.lng - (idx + 1) * 0.0015;
      const pHeading = p.heading || userLocation.heading || 45;
      const vehicleSvg = getVehicleIconSvg(p.vehicleType || 'car');

      const memberIcon = L.divIcon({
        html: `
          <div class="flex flex-col items-center group cursor-pointer">
            <!-- Top Floating Name & Speed Pill -->
            <div class="px-2.5 py-0.5 rounded-full bg-slate-900/95 border border-white/20 text-white font-bold text-[10px] shadow-lg mb-1 flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
              <span class="w-2 h-2 rounded-full shadow-sm" style="background-color: ${p.avatarColor}"></span>
              <span>${p.name.split(' ')[0]}</span>
              <span class="text-emerald-400 font-mono text-[9px]">${p.speed || 85} km/s</span>
            </div>

            <!-- Vehicle Icon Container with Custom Color and Directional Heading -->
            <div class="relative flex items-center justify-center">
              <div 
                class="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 font-bold shadow-2xl ring-2 ring-white/50 transition-transform duration-300 hover:scale-110" 
                style="background: ${p.avatarColor}; box-shadow: 0 0 16px ${p.avatarColor}80;"
              >
                <div style="transform: rotate(${pHeading}deg); transition: transform 0.3s ease;">
                  ${vehicleSvg}
                </div>
              </div>
              
              <!-- Trailing Live Pulse Dot -->
              <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-950 border border-white/40 flex items-center justify-center">
                <span class="w-2 h-2 rounded-full animate-ping" style="background-color: ${p.avatarColor}"></span>
              </div>
            </div>
          </div>
        `,
        className: 'member-marker-icon',
        iconSize: [90, 80],
        iconAnchor: [45, 65],
      });

      const memberMarker = L.marker([pLat, pLng], { icon: memberIcon }).addTo(map);
      memberMarker.bindPopup(`
        <div class="p-3 text-slate-100 font-sans min-w-[200px]">
          <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 rounded-full ring-2 ring-white/30" style="background-color: ${p.avatarColor}"></span>
              <strong class="text-sm font-bold text-white">${p.name}</strong>
            </div>
            <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
              Canlı GPS
            </span>
          </div>

          <div class="text-xs text-slate-300 space-y-1.5">
            <div class="flex justify-between">
              <span class="text-slate-400">Araç Modeli:</span>
              <strong class="text-white">${p.vehicle}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Anlık Hız:</span>
              <strong class="text-emerald-400 font-mono">${p.speed || 85} km/s</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Konum Mesafesi:</span>
              <strong class="text-cyan-300 font-mono">${p.distance || 'Senkronize'}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Enlem / Boylam:</span>
              <span class="text-slate-400 font-mono text-[10px]">${pLat.toFixed(4)}, ${pLng.toFixed(4)}</span>
            </div>
          </div>
        </div>
      `);
      memberMarkersRef.current.push(memberMarker);
    });
    // Break Point Marker (Coffee / Fuel)
    if (convoy.breakPoint) {
      const bp = convoy.breakPoint;
      const bpIcon = L.divIcon({
        html: `
          <div class="flex flex-col items-center group cursor-pointer animate-bounce">
            <div class="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-lg mb-1 flex items-center gap-1 whitespace-nowrap">
              <span>☕ Mola Alanı</span>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-2xl ring-4 ring-amber-400/40">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
              </svg>
            </div>
          </div>
        `,
        className: 'breakpoint-marker-icon',
        iconSize: [80, 75],
        iconAnchor: [40, 65],
      });

      if (!breakPointMarkerRef.current) {
        breakPointMarkerRef.current = L.marker([bp.lat, bp.lng], { icon: bpIcon }).addTo(map);
        breakPointMarkerRef.current.bindPopup(`
          <div class="p-3 text-slate-100 font-sans min-w-[180px]">
            <strong class="text-sm text-amber-400 font-bold block mb-1">☕ Ortak Mola Noktası</strong>
            <p class="text-xs text-white">${bp.name}</p>
            <p class="text-[10px] text-slate-400 mt-1">Belirleyen: ${bp.setBy}</p>
          </div>
        `);
      } else {
        breakPointMarkerRef.current.setLatLng([bp.lat, bp.lng]);
      }
    } else if (breakPointMarkerRef.current) {
      breakPointMarkerRef.current.remove();
      breakPointMarkerRef.current = null;
    }

    // Hazards Markers (Radar / Accident / Roadwork)
    hazardMarkersRef.current.forEach((h) => h.remove());
    hazardMarkersRef.current = [];

    if (convoy.hazards && convoy.hazards.length > 0) {
      convoy.hazards.forEach((haz) => {
        const hazIcon = L.divIcon({
          html: `
            <div class="flex flex-col items-center group cursor-pointer">
              <div class="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] shadow-lg mb-1 flex items-center gap-1 whitespace-nowrap animate-pulse">
                <span>⚠️ ${haz.type === 'radar' ? 'RADAR' : 'TEHLİKE'}</span>
              </div>
              <div class="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-2xl ring-4 ring-rose-500/50">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>
          `,
          className: 'hazard-marker-icon',
          iconSize: [80, 75],
          iconAnchor: [40, 65],
        });

        const hMarker = L.marker([haz.lat, haz.lng], { icon: hazIcon }).addTo(map);
        hMarker.bindPopup(`
          <div class="p-3 text-slate-100 font-sans min-w-[180px]">
            <strong class="text-sm text-rose-400 font-bold block mb-1">⚠️ ${haz.title}</strong>
            <p class="text-xs text-slate-300">Bildiren: ${haz.reportedBy}</p>
            <span class="text-[10px] text-amber-400 font-semibold block mt-1">Konvoy güvenliği için dikkatli sürün!</span>
          </div>
        `);
        hazardMarkersRef.current.push(hMarker);
      });
    }
  }, [userLocation.lat, userLocation.lng, userLocation.heading, destCoords, convoy.participants, convoy.breakPoint, convoy.hazards]);

  // Real-time Distance & Breakaway Monitoring Loop ("Konvoydan Koptun" & "Radar Yakınlığı")
  useEffect(() => {
    if (!isOpen) return;

    // 1. Breakaway Monitoring (> 500 meters)
    const leader = convoy.participants.find((p) => p.isLeader || p.id === 'leader_self');
    const leaderLat = leader?.lat ?? (isCurrentUserLeader ? userLocation.lat : DEFAULT_COORDS.lat);
    const leaderLng = leader?.lng ?? (isCurrentUserLeader ? userLocation.lng : DEFAULT_COORDS.lng);

    if (isCurrentUserLeader) {
      let brokenFollower: { name: string; distMeters: number } | null = null;
      convoy.participants.forEach((p) => {
        if (p.isLeader || p.id === 'leader_self') return;
        const pLat = p.lat ?? userLocation.lat - 0.005;
        const pLng = p.lng ?? userLocation.lng - 0.005;
        const dist = calculateDistanceMeters(userLocation.lat, userLocation.lng, pLat, pLng);
        if (dist > 500) {
          brokenFollower = { name: p.name, distMeters: dist };
        }
      });

      if (brokenFollower) {
        setBreakawayWarning(brokenFollower);
      } else {
        setBreakawayWarning(null);
      }
    } else {
      const distToLeader = calculateDistanceMeters(userLocation.lat, userLocation.lng, leaderLat, leaderLng);
      if (distToLeader > 500) {
        setFollowerLaggingAlert(distToLeader);
      } else {
        setFollowerLaggingAlert(null);
      }
    }

    // 2. Radar and Hazard Proximity Alert (Within 1000m / 1km)
    if (convoy.hazards && convoy.hazards.length > 0) {
      const nearHazard = convoy.hazards.find((h) => {
        const d = calculateDistanceMeters(userLocation.lat, userLocation.lng, h.lat, h.lng);
        return d <= 1000;
      });

      if (nearHazard) {
        if (!activeHazardAlert || activeHazardAlert.id !== nearHazard.id) {
          setActiveHazardAlert(nearHazard);
          playAudioTone('radar_warning');
        }
      } else {
        setActiveHazardAlert(null);
      }
    }
  }, [userLocation.lat, userLocation.lng, convoy.participants, convoy.hazards, isCurrentUserLeader, isOpen, activeHazardAlert]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070b14] text-slate-100 animate-in fade-in duration-300 font-sans">
      {/* Top Floating Glass HUD Header & Navigation Search Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Prominent Room Code & Convoy Info Pill */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-2xl px-3.5 py-2 rounded-2xl border border-white/20 shadow-2xl shadow-black/50 pointer-events-auto ring-1 ring-white/10">
            {/* 1-Click Copyable Room PIN Badge */}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 font-mono text-xs font-black text-emerald-300 bg-emerald-950/90 px-3 py-1.5 rounded-xl border border-emerald-400/50 shadow-md hover:bg-emerald-900/90 transition-all cursor-pointer group"
              title="Konvoy Kodunu Kopyala"
            >
              <span>Konvoy Kodu:</span>
              <span className="text-white text-sm tracking-wider underline decoration-emerald-400">
                {convoy.code}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-emerald-400/80 group-hover:text-emerald-300 ml-0.5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-extrabold text-white leading-tight truncate max-w-[120px] sm:max-w-[180px]">
                  {convoy.name}
                </h2>
                {isCurrentUserLeader && (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" /> Lider
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-[160px]">{destCoords.name}</span>
              </p>
            </div>

            <div className="h-5 w-px bg-white/15 mx-0.5 hidden sm:block" />

            {/* GPS Live Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-[11px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-300">GPS Canlı</span>
            </div>
          </div>

          {/* Center Real Road Distance & Travel Time HUD Pill */}
          <div className="pointer-events-auto hidden lg:flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-2xl px-3.5 py-2 rounded-2xl border border-emerald-400/30 shadow-2xl text-xs font-semibold ring-1 ring-white/10">
            <div className="flex items-center gap-1 text-emerald-300">
              <RouteIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mesafe:</span>
              <span className="font-mono font-bold text-white text-xs">
                {routeInfo.isLoading ? '...' : routeInfo.distanceKm}
              </span>
            </div>
            <div className="h-3.5 w-px bg-white/15" />
            <div className="flex items-center gap-1 text-cyan-300">
              <span>Süre:</span>
              <span className="font-mono font-bold text-white text-xs">
                {routeInfo.isLoading ? '...' : `~${routeInfo.durationMin} dk`}
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Konvoydakiler Butonu */}
            <button
              onClick={() => setShowMembersDrawer(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-2xl border border-emerald-400/40 text-emerald-300 hover:text-white transition-all shadow-xl active:scale-95 group cursor-pointer"
              title="Konvoydaki Kişileri Listele"
            >
              <div className="relative">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {convoy.participants.length}
                </span>
              </div>
              <span className="text-xs font-bold font-display hidden sm:inline">Konvoydakiler</span>
            </button>

            {/* Layer Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/20 text-slate-200 hover:text-white hover:bg-white/[0.12] transition-all shadow-xl"
                title="Harita Katmanı"
              >
                <Layers className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showLayerMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-3xl border border-white/20 rounded-2xl p-2 shadow-2xl z-50 space-y-1"
                  >
                    {(Object.keys(MAP_LAYERS) as Array<keyof typeof MAP_LAYERS>).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveLayerType(key);
                          setShowLayerMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          activeLayerType === key
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate">{MAP_LAYERS[key].name}</span>
                        {activeLayerType === key && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Share Code */}
            <button
              onClick={handleCopyCode}
              className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/20 text-slate-200 hover:text-white hover:bg-white/[0.12] transition-all shadow-xl flex items-center gap-1.5"
              title="Konvoy Kodunu Kopyala"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close Map & Return */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-2xl border border-rose-500/40 text-rose-300 hover:text-white transition-all shadow-xl"
              title="Haritayı Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Prominent Crisp White "Nereye Gitmek İstiyorsunuz?" Navigation Search Bar */}
        <div className="pointer-events-auto w-full flex justify-center px-1">
          <NavigationSearchBar
            onSelectDestination={handleSelectDestination}
            userCoords={{ lat: userLocation.lat, lng: userLocation.lng }}
            currentDestinationName={destCoords.name}
            isLeader={isCurrentUserLeader}
          />
        </div>

        {/* Row 3: Quick Action Badges (Clear Route, Break Point, Radar Report) */}
        <div className="pointer-events-auto w-full flex flex-wrap items-center justify-center gap-2 px-2">
          {/* 1. Clear Route / Pin Button */}
          {Boolean(destCoords.name) && (
            <button
              onClick={handleClearRoute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-500/50 text-rose-200 hover:text-white text-xs font-bold shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer animate-in fade-in"
              title="Rotayı ve Hedef İşaretçisini Sıfırla"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Rotayı/Pini Temizle</span>
            </button>
          )}

          {/* 2. Break Point (Ortak Mola Noktası) Button */}
          {convoy.breakPoint ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-400/50 text-amber-200 text-xs font-bold shadow-lg backdrop-blur-md">
              <Coffee className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="truncate max-w-[130px]">Mola: {convoy.breakPoint.name}</span>
              {isCurrentUserLeader && (
                <button
                  onClick={handleClearBreakPoint}
                  className="ml-1 p-0.5 hover:bg-white/20 rounded text-rose-300"
                  title="Mola Noktasını Kaldır"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            isCurrentUserLeader && (
              <button
                onClick={() => setShowBreakPointModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-400/40 text-amber-300 hover:text-white text-xs font-bold shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                title="Konvoya Ortak Mola Noktası Belirle"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>Mola Belirle</span>
              </button>
            )
          )}

          {/* 3. Report Radar / Hazard Button */}
          <button
            onClick={() => setShowHazardModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            title="Radar veya Tehlike Bildir"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Tehlike / Radar Bildir</span>
          </button>
        </div>

        {/* Priority Proximity & Breakaway Alert Badges */}
        <AnimatePresence>
          {/* A. Follower Breakaway Alert (>500m behind leader) */}
          {followerLaggingAlert !== null && !isCurrentUserLeader && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-auto mx-auto max-w-md bg-amber-600/95 backdrop-blur-2xl text-white px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-300 flex items-center justify-between gap-3 text-xs font-bold animate-pulse"
            >
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-200 shrink-0" />
                <span>UYARI: Konvoydan Koptunuz! (Liderden ~{Math.round(followerLaggingAlert)}m geridesiniz)</span>
              </div>
            </motion.div>
          )}

          {/* B. Leader Alert (Follower > 500m behind) */}
          {breakawayWarning && isCurrentUserLeader && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-auto mx-auto max-w-md bg-rose-600/95 backdrop-blur-2xl text-white px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-rose-300 flex items-center justify-between gap-3 text-xs font-bold animate-pulse"
            >
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-200 shrink-0" />
                <span>DİKKAT: {breakawayWarning.name} konvoydan koptu! (~{Math.round(breakawayWarning.distMeters)}m geride)</span>
              </div>
            </motion.div>
          )}

          {/* C. Radar & Hazard Proximity Warning (Within 1km) */}
          {activeHazardAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto mx-auto max-w-md bg-gradient-to-r from-red-600 to-rose-700 backdrop-blur-2xl text-white px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-yellow-300 flex items-center justify-between gap-3 text-xs font-black ring-4 ring-rose-500/30"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-yellow-300 animate-bounce shrink-0" />
                <span>DİKKAT: 1 KM İçinde {activeHazardAlert.title} Tespit Edildi!</span>
              </div>
            </motion.div>
          )}

          {/* D. Incoming PTT Voice Message Toast */}
          {incomingVoiceToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="pointer-events-auto mx-auto max-w-md bg-cyan-600/95 backdrop-blur-2xl text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-cyan-300 flex items-center justify-between gap-3 text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-200 animate-spin shrink-0" />
                <span>📻 {incomingVoiceToast.senderName} Telsiz Anonsu Yaptı</span>
              </div>
            </motion.div>
          )}

          {/* E. Action / Leader Update Toast */}
          {(leaderUpdatedToast || actionToast) && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="pointer-events-auto mx-auto max-w-lg bg-emerald-600/95 backdrop-blur-2xl text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center justify-between gap-3 text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-200 animate-pulse shrink-0" />
                <span>{leaderUpdatedToast || actionToast}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Full-Screen Leaflet Map Canvas */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Top-Right Recenter & Route Refresh Buttons */}
        <div className="absolute top-28 right-4 z-30 flex flex-col gap-2.5">
          {/* Konvoydakiler Sağ Buton */}
          <button
            onClick={() => setShowMembersDrawer(true)}
            className="p-3 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-emerald-400/50 text-emerald-300 hover:text-white hover:bg-emerald-600/30 transition-all shadow-2xl active:scale-95 flex items-center justify-center cursor-pointer"
            title="Konvoydakiler Listesi"
          >
            <Users className="w-5 h-5 text-emerald-400" />
          </button>

          <button
            onClick={handleCenterOnUser}
            className="p-3 rounded-2xl bg-slate-900/85 backdrop-blur-2xl border border-white/20 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/20 transition-all shadow-2xl active:scale-95 group"
            title="Mavi Noktama Odaklan (Gerçek GPS)"
          >
            <Crosshair className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          <button
            onClick={handleFitConvoyBounds}
            className="p-3 rounded-2xl bg-slate-900/85 backdrop-blur-2xl border border-white/20 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20 transition-all shadow-2xl active:scale-95"
            title="Tüm Rotayı Ekrana Sığdır"
          >
            <RouteIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => fetchOsrmRoute(userLocation.lat, userLocation.lng, destCoords.lat, destCoords.lng)}
            className="p-3 rounded-2xl bg-slate-900/85 backdrop-blur-2xl border border-white/20 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-2xl active:scale-95"
            title="OSRM Sokak Rotasını Yeniden Hesapla"
          >
            <RotateCcw className={`w-5 h-5 ${routeInfo.isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Floating Left Live Telemetry HUD Card (Speedometer & Coordinates) */}
        <div className="absolute top-28 left-4 z-30 max-w-[260px] sm:max-w-[300px] pointer-events-none">
          <div className="bg-slate-900/85 backdrop-blur-2xl p-4 rounded-3xl border border-white/20 shadow-2xl shadow-black/60 pointer-events-auto ring-1 ring-white/10 space-y-3">
            {/* Speed & Heading Block */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center text-emerald-300 shadow-md">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-white leading-none tracking-tight">
                      {userLocation.speed || 0}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">KM/S</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Canlı GPS Hızı
                  </span>
                </div>
              </div>

              {/* Heading Direction Compass */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-xs font-mono font-bold text-cyan-300">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{userLocation.heading || 0}°</span>
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">GPS Açısı</span>
              </div>
            </div>

            {/* Real Road Navigation Details */}
            <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-medium">OSRM Mesafesi:</span>
                <span className="text-cyan-300 font-mono font-bold">{routeInfo.distanceKm}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-medium">Tahmini Süre:</span>
                <span className="text-emerald-400 font-mono font-bold">~{routeInfo.durationMin} dakika</span>
              </div>
            </div>

            {/* Live Pulse Indicator Tip */}
            <div className="flex items-center justify-between text-[10px] text-slate-300 bg-blue-500/10 border border-blue-500/25 px-2.5 py-1.5 rounded-xl">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/50 animate-ping" />
                Mavi Nokta: Gerçek Konum
              </span>
              <span className="font-mono text-blue-300">±{userLocation.accuracy}m</span>
            </div>
          </div>
        </div>

        {/* SOS Emergency Alert Active Floating Banner */}
        {isSosActive && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-rose-600/90 backdrop-blur-2xl text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-rose-400 flex items-center gap-3 animate-bounce">
            <AlertTriangle className="w-5 h-5 text-amber-200 animate-spin" />
            <div className="text-xs font-bold">
              <span>ACİL DURUM UYARISI: Konvoy liderine canlı koordinat iletildi!</span>
            </div>
          </div>
        )}
      </div>

      {/* Kicked Alert Modal for Follower */}
      <AnimatePresence>
        {isKickedModalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 shadow-2xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-display">
                  Konvoydan Çıkarıldınız
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Konvoy lideri tarafından bu gruptan çıkarıldınız. Harita sonlandırılıyor ve ana ekrana yönlendiriliyorsunuz.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-500/30 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Ana Ekrana Dön</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-Over / Drawer: Konvoydakiler (Right Side Panel) */}
      <AnimatePresence>
        {showMembersDrawer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-slate-900 border-l border-white/20 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white font-display">
                        Konvoydakiler
                      </h3>
                      <p className="text-xs text-slate-400">
                        {convoy.participants.length} Aktif Sürücü Bağlı
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMembersDrawer(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isCurrentUserLeader && (
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Konvoy liderisiniz. İstemediğiniz sürücülerin yanındaki kırmızı "Çıkar" butonuna basarak gruptan atabilirsiniz.</span>
                  </div>
                )}

                {/* Participant List */}
                <div className="space-y-2.5 pt-2">
                  {convoy.participants.map((p) => {
                    const isSelf = p.name === 'Sen' || p.name.includes('Sen') || p.id === 'leader_self';
                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-between gap-3 hover:border-emerald-400/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-md shrink-0"
                            style={{ backgroundColor: p.avatarColor }}
                          >
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{p.name}</span>
                              {p.isLeader ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5" /> Lider
                                </span>
                              ) : isSelf ? (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 text-[10px] font-bold">
                                  Sen
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium">
                              <span>{p.vehicle}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-mono">{p.speed || 85} km/s</span>
                            </div>
                          </div>
                        </div>

                        {/* Red Kick Button (Only for Leader to remove non-leader participants) */}
                        {isCurrentUserLeader && !p.isLeader && !isSelf && (
                          <button
                            onClick={() => handleKickMember(p.id, p.name)}
                            className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                            title="Konvoydan Çıkar / At"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Çıkar</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowMembersDrawer(false)}
                  className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer"
                >
                  Listeyi Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Control Deck (PTT Walkie-Talkie, SOS, Members & Actions) */}
      <div className="p-4 bg-slate-900/80 backdrop-blur-3xl border-t border-white/15 z-30 flex flex-wrap items-center justify-between gap-3 shadow-2xl ring-1 ring-white/10">
        {/* Convoy Members Trigger */}
        <div
          onClick={() => setShowMembersDrawer(true)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex -space-x-2.5 overflow-hidden">
            {convoy.participants.map((p, i) => (
              <div
                key={p.id || i}
                className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase shadow-md group-hover:scale-110 transition-transform"
                style={{ backgroundColor: p.avatarColor }}
              >
                {p.name.charAt(0)}
              </div>
            ))}
          </div>
          <div>
            <span className="text-xs font-bold text-white block group-hover:text-emerald-300 transition-colors">
              {convoy.participants.length} Araç Konvoyda
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Konvoydakileri Yönet
            </span>
          </div>
        </div>

        {/* Center/Right Action Deck */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
          {/* SOS Toggle */}
          <button
            onClick={() => setIsSosActive(!isSosActive)}
            className={`px-3.5 py-2.5 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-all backdrop-blur-2xl ${
              isSosActive
                ? 'bg-rose-500 text-white border-rose-400 shadow-xl shadow-rose-500/50 animate-pulse'
                : 'bg-white/[0.08] hover:bg-white/[0.14] text-rose-300 border-white/15'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">SOS Acil</span>
          </button>

          {/* Mute Audio */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-slate-300 hover:text-white transition-all backdrop-blur-2xl"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Push To Talk Walkie Talkie Button */}
          <button
            onMouseDown={handleStartPtt}
            onMouseUp={handleEndPtt}
            onTouchStart={handleStartPtt}
            onTouchEnd={handleEndPtt}
            className={`flex-1 max-w-[200px] py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all select-none backdrop-blur-2xl shadow-xl font-display cursor-pointer active:scale-95 ${
              isPttActive
                ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 scale-95 shadow-2xl shadow-cyan-500/50 ring-4 ring-cyan-500/30'
                : 'bg-white/[0.10] hover:bg-white/[0.16] text-white border border-white/20'
            }`}
          >
            <Mic className={`w-4 h-4 ${isPttActive ? 'animate-bounce text-slate-950' : 'text-cyan-300'}`} />
            <span>{isPttActive ? 'KONUŞUYORSUNUZ...' : 'TELSİZ BAS-KONUŞ'}</span>
          </button>
        </div>
      </div>

      {/* Break Point Modal (Ortak Mola Noktası Seçimi) */}
      <AnimatePresence>
        {showBreakPointModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="max-w-md w-full bg-slate-900 border border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-display">Ortak Mola Noktası</h3>
                    <p className="text-xs text-slate-400">Tüm konvoyun haritasında işaretlenecektir</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBreakPointModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => handleSetBreakPoint('Kahve & Dinlenme Tesisi', 'coffee')}
                  className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-left transition-all group"
                >
                  <Coffee className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                  <strong className="text-xs font-bold text-white block">Kahve & Dinlenme</strong>
                  <span className="text-[10px] text-slate-400">Tesis ve çay molası</span>
                </button>

                <button
                  onClick={() => handleSetBreakPoint('Benzinlik & Yakıt İkmalı', 'fuel')}
                  className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-left transition-all group"
                >
                  <Fuel className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <strong className="text-xs font-bold text-white block">Yakıt & İstasyon</strong>
                  <span className="text-[10px] text-slate-400">Benzin ve lastik kontrolü</span>
                </button>

                <button
                  onClick={() => handleSetBreakPoint('Yemek & Restoran Molası', 'restaurant')}
                  className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-left transition-all group"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <strong className="text-xs font-bold text-white block">Yemek Molası</strong>
                  <span className="text-[10px] text-slate-400">Toplu öğle/akşam yemeği</span>
                </button>

                <button
                  onClick={() => handleSetBreakPoint('Manzara & Fotoğraf Noktası', 'view')}
                  className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-left transition-all group"
                >
                  <Sparkles className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <strong className="text-xs font-bold text-white block">Manzara Noktası</strong>
                  <span className="text-[10px] text-slate-400">Hatıra fotoğrafı ve mola</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowBreakPointModal(false)}
                  className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  Vazgeç
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hazard Report Modal (Radar ve Yol Tehlikesi Bildirme) */}
      <AnimatePresence>
        {showHazardModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-display">Tehlike veya Radar Bildir</h3>
                    <p className="text-xs text-slate-400">Konvoydaki diğer sürücüler anında 1 km kala uyarılır</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHazardModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => handleReportHazard('radar', 'Mobil Radar / Hız Kontrolü')}
                  className="w-full p-3.5 rounded-2xl bg-slate-800/90 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/40 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-white block">Mobil Radar / Hız Tuzağı</strong>
                      <span className="text-[10px] text-slate-400">Hız limiti kontrol noktası</span>
                    </div>
                  </div>
                  <span className="text-rose-400 text-xs font-bold">Bildir →</span>
                </button>

                <button
                  onClick={() => handleReportHazard('accident', 'Kaza / Tıkanıklık')}
                  className="w-full p-3.5 rounded-2xl bg-slate-800/90 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-white block">Trafik Kazası / Yol Kapalı</strong>
                      <span className="text-[10px] text-slate-400">Şerit daralması veya çarpışma</span>
                    </div>
                  </div>
                  <span className="text-amber-400 text-xs font-bold">Bildir →</span>
                </button>

                <button
                  onClick={() => handleReportHazard('roadwork', 'Yol Çalışması / Çukur / Bozuk Zemin')}
                  className="w-full p-3.5 rounded-2xl bg-slate-800/90 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-400/40 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-white block">Yol Çalışması & Çukur</strong>
                      <span className="text-[10px] text-slate-400">Mıcır, yağ veya bozuk asfalt</span>
                    </div>
                  </div>
                  <span className="text-yellow-400 text-xs font-bold">Bildir →</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowHazardModal(false)}
                  className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
