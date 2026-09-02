import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Navigation,
  Radio,
  AlertTriangle,
  Users,
  Car,
  Bike,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Compass,
  Gauge,
  MapPin,
  Maximize2,
  Map as MapIcon,
} from 'lucide-react';
import { ActiveConvoy } from '../types';

interface ActiveConvoyViewProps {
  convoy: ActiveConvoy;
  onLeave: () => void;
  onOpenFullScreenMap?: () => void;
}

export const ActiveConvoyView: React.FC<ActiveConvoyViewProps> = ({
  convoy,
  onLeave,
  onOpenFullScreenMap,
}) => {
  const [speed, setSpeed] = useState(convoy.currentSpeed || 84);
  const [isPttActive, setIsPttActive] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [distanceToLeader, setDistanceToLeader] = useState(28);

  // Speed jitter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed((prev) => {
        const delta = (Math.random() - 0.48) * 3;
        return Math.max(60, Math.min(125, Math.round(prev + delta)));
      });
      setDistanceToLeader((prev) => {
        const delta = (Math.random() - 0.5) * 2;
        return Math.max(15, Math.min(50, Math.round(prev + delta)));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(convoy.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#080d19] text-slate-100 overflow-hidden font-sans">
      {/* Top HUD Bar - Frosted Glass Panel */}
      <div className="p-4 bg-white/[0.08] backdrop-blur-2xl border-b border-white/15 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onLeave}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Konvoydan Ayrıl"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-400/40 backdrop-blur-sm">
                #{convoy.code}
              </span>
              <h2 className="text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">
                {convoy.name}
              </h2>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-300" />
              {convoy.destination}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenFullScreenMap && (
            <button
              onClick={onOpenFullScreenMap}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40 text-cyan-200 border border-cyan-400/40 transition-all flex items-center gap-1 text-xs font-bold shadow-md shadow-cyan-950/40"
              title="Tam Ekran Canlı Haritayı Aç"
            >
              <MapIcon className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Canlı Harita</span>
            </button>
          )}
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Kodu Paylaş"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition-colors backdrop-blur-md ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-white/[0.08] border-white/10 text-slate-300 hover:bg-white/[0.14]'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Radar HUD Map Simulation */}
      <div className="relative flex-1 bg-[#080d19] overflow-hidden flex items-center justify-center p-4">
        {/* Floating Top Harita Aç Action Pill */}
        {onOpenFullScreenMap && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenFullScreenMap}
            className="absolute top-3 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-2xl border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 text-xs font-extrabold flex items-center gap-1.5 shadow-xl shadow-black/60 group"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Tam Ekran Canlı GPS Haritası</span>
            <Maximize2 className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
        {/* Ambient background glow for Frosted Glass */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Grid Lines & Radar Waves */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at center, #10b981 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '32px 32px, 48px 48px, 48px 48px',
          }}
        />

        {/* Pulse Radar Rings with glass styling */}
        <div className="absolute w-72 h-72 rounded-full border border-emerald-400/20 animate-ping opacity-25 pointer-events-none" />
        <div className="absolute w-56 h-56 rounded-full border border-cyan-400/30 pointer-events-none" />
        <div className="absolute w-36 h-36 rounded-full border border-white/15 pointer-events-none" />

        {/* Route Highway Ribbon Curve */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path
            d="M 190,480 Q 200,280 200,100"
            fill="none"
            stroke="rgba(16, 185, 129, 0.35)"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <path
            d="M 190,480 Q 200,280 200,100"
            fill="none"
            stroke="#0a1220"
            strokeWidth="32"
          />
          <path
            d="M 190,480 Q 200,280 200,100"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="10 14"
            className="animate-pulse"
          />
        </svg>

        {/* Convoy Vehicles on Road in Formation */}
        <div className="relative z-10 w-full max-w-[280px] h-[340px] flex flex-col justify-between items-center">
          {/* Leader Vehicle */}
          <motion.div
            animate={{ y: [0, -3, 0], x: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            <div className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1 shadow-lg shadow-amber-500/30 ring-1 ring-white/30">
              <Compass className="w-2.5 h-2.5" />
              Lider ({convoy.leaderName.split(' ')[0]})
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/40 ring-2 ring-white/30">
              <Bike className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Distance Indicator - Frosted Glass Pill */}
          <div className="flex items-center gap-1.5 py-0.5 px-2.5 rounded-full bg-white/[0.08] backdrop-blur-xl border border-emerald-400/40 text-[10px] font-mono text-emerald-300 shadow-md">
            <span>↓ {distanceToLeader} metre mesafe</span>
          </div>

          {/* User Vehicle (Follower / Sen) */}
          <motion.div
            animate={{ y: [0, 2, 0], x: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/50 ring-4 ring-emerald-500/30">
              <Car className="w-6 h-6" />
            </div>
            <div className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] mt-1 shadow-md">
              Sen (Araç #2)
            </div>
          </motion.div>
        </div>

        {/* Floating Telemetry Box (Speed & Status) - Frosted Glass Panel */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex gap-2">
          {/* Speed Card */}
          <div className="flex-1 bg-white/[0.08] backdrop-blur-2xl p-3 rounded-2xl border border-white/20 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center text-emerald-300">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono text-white leading-none drop-shadow-sm">
                    {speed}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">KM/S</span>
                </div>
                <span className="text-[10px] text-emerald-300 font-medium">Senkronize Hız</span>
              </div>
            </div>
          </div>

          {/* SOS Alert Button */}
          <button
            onClick={() => setIsSosActive(!isSosActive)}
            className={`p-3 rounded-2xl border backdrop-blur-2xl flex flex-col items-center justify-center transition-all ${
              isSosActive
                ? 'bg-rose-500 text-white border-rose-400 shadow-xl shadow-rose-500/50 animate-pulse'
                : 'bg-white/[0.08] border-white/15 text-slate-300 hover:text-rose-300 hover:border-rose-500/40'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase mt-0.5">SOS</span>
          </button>
        </div>
      </div>

      {/* SOS Active Banner Warning */}
      {isSosActive && (
        <div className="bg-rose-600/90 backdrop-blur-md text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 animate-bounce border-t border-b border-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <span>ACİL DURUM UYARISI: Konvoy liderine ve üyelere bildirim yollandı!</span>
        </div>
      )}

      {/* Bottom PTT Walkie-Talkie & Member Controls - Frosted Glass Container */}
      <div className="p-4 bg-white/[0.07] backdrop-blur-2xl border-t border-white/15 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {convoy.participants.map((p, i) => (
              <div
                key={p.id || i}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white/20 bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase shadow"
                style={{ backgroundColor: p.avatarColor }}
                title={p.name}
              >
                {p.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-300 font-medium">
            {convoy.participants.length} Sürücü
          </span>
        </div>

        {/* PTT (Push-To-Talk) Button */}
        <button
          onMouseDown={() => setIsPttActive(true)}
          onMouseUp={() => setIsPttActive(false)}
          onTouchStart={() => setIsPttActive(true)}
          onTouchEnd={() => setIsPttActive(false)}
          className={`flex-1 max-w-[160px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all select-none backdrop-blur-xl ${
            isPttActive
              ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 scale-95 shadow-xl shadow-cyan-500/40 ring-4 ring-cyan-500/30'
              : 'bg-white/[0.09] hover:bg-white/[0.15] text-slate-200 border border-white/20 shadow-md'
          }`}
        >
          <Radio className={`w-4 h-4 ${isPttActive ? 'animate-pulse text-slate-950' : 'text-cyan-300'}`} />
          <span>{isPttActive ? 'KONUŞUYOR...' : 'BAS-KONUŞ'}</span>
        </button>
      </div>
    </div>
  );
};
