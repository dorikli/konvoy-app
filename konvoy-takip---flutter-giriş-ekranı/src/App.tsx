import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Code2,
  BookOpen,
  Navigation,
  Sparkles,
  Layers,
  Copy,
  Check,
  Zap,
  Map as MapIcon,
} from 'lucide-react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ConvoyEntryScreen } from './components/ConvoyEntryScreen';
import { JoinConvoyModal } from './components/JoinConvoyModal';
import { CreateConvoyModal } from './components/CreateConvoyModal';
import { ActiveConvoyView } from './components/ActiveConvoyView';
import { FullScreenConvoyMap } from './components/FullScreenConvoyMap';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { SetupGuide } from './components/SetupGuide';
import { ActiveConvoy, VehicleType } from './types';
import { convoySyncService } from './services/convoySyncService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'guide' | 'split'>('split');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFullScreenMapOpen, setIsFullScreenMapOpen] = useState(false);
  const [activeConvoy, setActiveConvoy] = useState<ActiveConvoy | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [initialUserCoords, setInitialUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 41.0422,
    lng: 29.0067,
  });

  // Automatically request GPS permission right upon application startup
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setInitialUserCoords(coords);
        },
        (error) => {
          console.warn('Initial GPS permission prompt:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleJoinSuccess = (roomCode: string) => {
    setIsJoinModalOpen(false);
    const joined = convoySyncService.joinConvoy(
      roomCode,
      'Sen',
      'car',
      initialUserCoords
    );
    setActiveConvoy(joined);
    setIsFullScreenMapOpen(true);
    showToast(`Konvoy #${roomCode} Odasına Canlı Olarak Bağlanıldı!`);
  };

  // Triggered when "Konvoy Oluştur" is clicked on the entry screen
  const handleCreateConvoyDirectly = () => {
    const randomPin = convoySyncService.generateRoomCode();
    const newConvoy = convoySyncService.createConvoy(
      randomPin,
      `Konvoy #${randomPin}`,
      'Sen (Lider)',
      'Çeşme Marina & Otoyol Çıkışı',
      initialUserCoords
    );
    setActiveConvoy(newConvoy);
    setIsFullScreenMapOpen(true);
    showToast(`Konvoy #${randomPin} Oluşturuldu & Canlı Harita Açıldı!`);
  };

  const handleCreateSuccess = (data: {
    code: string;
    name: string;
    vehicleType: VehicleType;
    maxMembers: number;
    destination: string;
  }) => {
    setIsCreateModalOpen(false);
    const newConvoy = convoySyncService.createConvoy(
      data.code,
      data.name,
      'Sen (Lider)',
      data.destination,
      initialUserCoords
    );
    setActiveConvoy(newConvoy);
    setIsFullScreenMapOpen(true);
    showToast(`Yeni Konvoy #${data.code} Başlatıldı & Canlı Harita Açıldı!`);
  };

  const currentOrFallbackConvoy: ActiveConvoy = activeConvoy || {
    code: '5291',
    name: 'Konvoy #5291 (Lider)',
    leaderName: 'Sen (Lider)',
    destination: 'Çeşme Marina (İzmir Otoyolu KM 42)',
    totalDistance: '84 km',
    currentSpeed: 88,
    createdAt: 'Şimdi',
    participants: [
      {
        id: 'leader_self',
        name: 'Sen (Lider)',
        vehicle: 'BMW 320i',
        vehicleType: 'car',
        isLeader: true,
        distance: 'Lider',
        speed: 88,
        avatarColor: '#10B981',
        status: 'online',
        lat: initialUserCoords.lat,
        lng: initialUserCoords.lng,
        heading: 45,
      },
    ],
  };


  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Ambient background glowing orbs for Frosted Glass reflection */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-28 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-2/3 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Frosted Glass Header */}
      <header className="sticky top-0 z-40 bg-slate-950/40 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-black/20">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 ring-1 ring-white/30">
            <Navigation className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-wider font-display">
                KONVOY TAKİP
              </span>
              <span className="text-[10px] bg-white/10 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30 backdrop-blur-md shadow-sm">
                Flutter UI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Modern Giriş Ekranı & 4 Haneli Oda PIN Doğrulama
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Live Map Trigger (Frosted Glass Container) */}
        <div className="flex items-center gap-2">
          {/* Quick Launch Fullscreen Live GPS Map Button */}
          <button
            onClick={() => {
              if (!activeConvoy) {
                handleCreateConvoyDirectly();
              } else {
                setIsFullScreenMapOpen(true);
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 via-cyan-500/30 to-emerald-500/30 hover:from-blue-600/50 hover:to-emerald-500/50 text-cyan-200 hover:text-white border border-cyan-400/40 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-950/40 backdrop-blur-xl group"
            title="Tam Ekran Canlı Haritayı Aç (Mavi Nokta GPS)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <MapIcon className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
            <span>Tam Ekran Harita</span>
          </button>

          <div className="flex items-center bg-white/[0.06] backdrop-blur-xl p-1 rounded-xl border border-white/15 text-xs font-semibold shadow-inner">
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'split'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">İkili Görünüm (Önizleme + Kod)</span>
              <span className="sm:hidden">İkili</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobil Önizleme</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'code'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Flutter Kodları</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'guide'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kurulum</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/80 backdrop-blur-2xl border border-emerald-400/50 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-2xl shadow-2xl shadow-emerald-950/60 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content Layouts */}
        {activeTab === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Mobile Simulator */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400 px-2">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Canlı Mobil Simülatör
                </span>
                <span>"Konvoy Oluştur"a basarak haritayı açın</span>
              </div>

              <PhoneSimulator>
                {activeConvoy ? (
                  <ActiveConvoyView
                    convoy={activeConvoy}
                    onLeave={() => setActiveConvoy(null)}
                    onOpenFullScreenMap={() => setIsFullScreenMapOpen(true)}
                  />
                ) : (
                  <ConvoyEntryScreen
                    onCreateClick={handleCreateConvoyDirectly}
                    onJoinClick={() => setIsJoinModalOpen(true)}
                    onQuickJoin={(code) => {
                      setIsJoinModalOpen(true);
                    }}
                  />
                )}
              </PhoneSimulator>
            </div>

            {/* Right: Flutter & Dart Code Repository */}
            <div className="lg:col-span-7 h-[780px]">
              <FlutterCodeViewer />
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white font-display">
                Canlı Flutter Giriş Ekranı Simülatörü
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                "Konvoy Oluştur" butonuna bastığınızda tam ekran canlı GPS haritası ve mavi nokta açılır.
              </p>
            </div>

            <PhoneSimulator>
              {activeConvoy ? (
                <ActiveConvoyView
                  convoy={activeConvoy}
                  onLeave={() => setActiveConvoy(null)}
                  onOpenFullScreenMap={() => setIsFullScreenMapOpen(true)}
                />
              ) : (
                <ConvoyEntryScreen
                  onCreateClick={handleCreateConvoyDirectly}
                  onJoinClick={() => setIsJoinModalOpen(true)}
                  onQuickJoin={(code) => {
                    setIsJoinModalOpen(true);
                  }}
                />
              )}
            </PhoneSimulator>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-[760px]">
            <FlutterCodeViewer />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto py-2">
            <SetupGuide />
          </div>
        )}
      </main>

      {/* 4-Digit PIN Join Modal */}
      <JoinConvoyModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinSuccess={handleJoinSuccess}
      />

      {/* Create Convoy Modal */}
      <CreateConvoyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleCreateSuccess}
      />

      {/* Full-Screen Live GPS Map with Pulsating Blue Dot Location */}
      <FullScreenConvoyMap
        isOpen={isFullScreenMapOpen}
        convoy={currentOrFallbackConvoy}
        onClose={() => setIsFullScreenMapOpen(false)}
      />
    </div>
  );
}
