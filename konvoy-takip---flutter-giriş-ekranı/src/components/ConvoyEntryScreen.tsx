import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Navigation,
  PlusCircle,
  KeyRound,
  Radio,
  Shield,
  Zap,
  Sliders,
  ChevronRight,
  Sparkles,
  Users,
  Activity,
} from 'lucide-react';
import { convoySyncService, NetworkStats } from '../services/convoySyncService';
import { ActiveConvoy } from '../types';

interface ConvoyEntryScreenProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
  onQuickJoin: (code: string) => void;
}

export const ConvoyEntryScreen: React.FC<ConvoyEntryScreenProps> = ({
  onCreateClick,
  onJoinClick,
  onQuickJoin,
}) => {
  const [stats, setStats] = useState<NetworkStats>({
    totalDrivers: 0,
    activeConvoysCount: 0,
    pingMs: 34,
  });
  const [activeConvoys, setActiveConvoys] = useState<ActiveConvoy[]>([]);

  useEffect(() => {
    // 1. Subscribe to dynamic stats (Canlı Konvoy sayısı, Sürücü sayısı, Timestamp Ping ms)
    const unsubscribe = convoySyncService.subscribeStats((liveStats) => {
      setStats(liveStats);
      setActiveConvoys(convoySyncService.getAllConvoys());
    });

    // Initial load
    setStats(convoySyncService.getLiveNetworkStats());
    setActiveConvoys(convoySyncService.getAllConvoys());

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 bg-[#080d19] text-slate-100 overflow-hidden select-none font-sans">
      {/* 1. Frosted Ambient Glow & Radar Pulse Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Radar Circles with glass border style */}
        <div className="w-[420px] h-[420px] rounded-full border border-white/[0.08] absolute" />
        <div className="w-[300px] h-[300px] rounded-full border border-white/[0.12] absolute" />
        <div className="w-[180px] h-[180px] rounded-full border border-emerald-400/25 absolute" />

        {/* Rotating sweep line with glass fade */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          className="absolute w-[340px] h-[340px] rounded-full"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.25) 0deg, transparent 60deg, transparent 360deg)',
          }}
        />

        {/* Decorative Vehicle Blips */}
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute top-28 right-16 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/60 ring-2 ring-white/30 flex items-center justify-center"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.8 }}
          className="absolute top-44 left-14 w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60 ring-2 ring-white/20"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, delay: 1.4 }}
          className="absolute bottom-48 right-20 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60 ring-1 ring-white/20"
        />
      </div>

      {/* 2. Top Header Bar (Frosted Glass Pill) */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-md shadow-black/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[11px] font-bold tracking-wider text-emerald-300 font-mono">
            GPS & REALTIME AKTİF
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[10px] text-slate-300 font-mono">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>{stats.pingMs} ms</span>
        </div>
      </div>

      {/* 3. Hero Brand & Logo Area */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-3">
        {/* Animated Frosted App Icon */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative mb-4"
        >
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/40 ring-2 ring-white/40">
            <Navigation className="w-9 h-9 transform -rotate-45" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-slate-900/90 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-lg">
            v2.5
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white font-display drop-shadow-sm">
          KONVOY
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-[240px]">
          Gerçek Zamanlı Grup Sürüşü ve Senkronize Takip
        </p>

        {/* Live Network Stats Strip (Dinamik Veri Tabanı İstatistik Paneli) */}
        <div className="w-full mt-5 px-4 py-3 rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-xl shadow-black/20 flex items-center justify-around text-center">
          {/* Sürücü Sayısı */}
          <div className="flex-1">
            <span className="block text-base font-black text-white font-mono transition-all">
              {stats.totalDrivers}
            </span>
            <span className="text-[10px] font-bold text-slate-300">Sürücü</span>
          </div>

          <div className="w-px h-7 bg-white/20" />

          {/* Canlı Konvoy Sayısı (snapshot.children.length) */}
          <div className="flex-1">
            <span className="block text-base font-black text-emerald-300 font-mono transition-all">
              {stats.activeConvoysCount}
            </span>
            <span className="text-[10px] font-bold text-slate-300">Canlı Konvoy</span>
          </div>

          <div className="w-px h-7 bg-white/20" />

          {/* Dinamik Ping (Milisaniye Cinsinden Gerçek Gecikme) */}
          <div className="flex-1">
            <span className="block text-base font-black text-cyan-300 font-mono transition-all">
              {stats.pingMs} ms
            </span>
            <span className="text-[10px] font-bold text-slate-300">Gecikme (Ping)</span>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons Section */}
      <div className="relative z-10 space-y-3">
        {/* Aktif Odalar (Varsa listelenir, yoksa temiz durum gösterilir) */}
        {activeConvoys.length > 0 && (
          <div className="mb-2 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5 px-1 font-medium">
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <Sparkles className="w-3 h-3" /> Aktif Canlı Odalar ({activeConvoys.length})
              </span>
              <span className="text-[10px] text-slate-400">Tek Tıkla Bağlan</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {activeConvoys.map((room) => (
                <button
                  key={room.code}
                  onClick={() => onQuickJoin(room.code)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl border border-white/15 hover:border-cyan-400/50 transition-all flex items-center gap-2 text-left group shadow-sm"
                >
                  <span className="font-mono text-xs font-bold text-cyan-300">#{room.code}</span>
                  <span className="text-[11px] text-slate-200 group-hover:text-white truncate max-w-[120px]">
                    {room.name}
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded-md font-mono">
                    {room.participants?.length || 1} araç
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 1. BUTTON: KONVOY OLUŞTUR (Frosted Radiant Gradient) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateClick}
          className="w-full py-4 px-5 rounded-2xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-xl shadow-emerald-500/30 border border-white/30 flex items-center justify-center gap-2.5 transition-all font-display cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          <span>Konvoy Oluştur</span>
          <ChevronRight className="w-4 h-4 text-slate-950 ml-auto" />
        </motion.button>

        {/* 2. BUTTON: KONVOYA KATIL (Frosted Glass Button) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onJoinClick}
          className="w-full py-4 px-5 rounded-2xl font-bold text-sm sm:text-base bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-2xl text-white border-2 border-cyan-400/50 hover:border-cyan-400 shadow-xl shadow-cyan-950/30 flex items-center justify-center gap-2.5 transition-all font-display cursor-pointer"
        >
          <KeyRound className="w-5 h-5 text-cyan-300" />
          <span>Konvoya Katıl</span>
          <span className="text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full ml-auto font-mono backdrop-blur-sm">
            4 Hane PIN
          </span>
        </motion.button>

        {/* Mini Feature Badges */}
        <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-300" /> Bas-Konuş Telsiz
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-300" /> Güvenli GPS
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-300" /> Canlı Hız
          </span>
        </div>
      </div>
    </div>
  );
};
