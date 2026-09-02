import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Smartphone } from 'lucide-react';

interface PhoneSimulatorProps {
  children: React.ReactNode;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ children }) => {
  const [time, setTime] = useState('14:32');
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Device frame toggle & status controls - Frosted Glass Container */}
      <div className="flex items-center gap-2 mb-3 bg-white/[0.06] backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/15 text-xs text-slate-300 shadow-lg shadow-black/20">
        <span className="text-slate-400 font-medium text-[11px]">Önizleme Cihazı:</span>
        <button
          onClick={() => setDeviceType('ios')}
          className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
            deviceType === 'ios'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          iOS (iPhone 16 Pro)
        </button>
        <button
          onClick={() => setDeviceType('android')}
          className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
            deviceType === 'android'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          Android (Pixel 9)
        </button>
      </div>

      {/* Realistic Smartphone Shell with frosted border glow */}
      <div className="relative w-[360px] sm:w-[390px] h-[740px] sm:h-[780px] bg-slate-950/90 backdrop-blur-3xl rounded-[48px] p-3 shadow-2xl shadow-emerald-950/40 border-2 border-white/20 ring-1 ring-emerald-500/20 flex flex-col justify-between overflow-hidden">
        {/* Dynamic Island / Android Punch Hole */}
        {deviceType === 'ios' ? (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black/90 rounded-full z-40 flex items-center justify-between px-2.5 shadow-md border border-white/10 backdrop-blur-md">
            <div className="w-3 h-3 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/10" />
          </div>
        ) : (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/90 rounded-full z-40 border border-white/10 shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
          </div>
        )}

        {/* Screen Display Container */}
        <div className="relative w-full h-full bg-[#080d19]/90 backdrop-blur-2xl rounded-[38px] overflow-hidden flex flex-col border border-white/10 shadow-2xl">
          {/* Status Bar */}
          <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs font-semibold text-slate-200 z-30 shrink-0 bg-transparent select-none">
            <span className="font-mono text-[13px] font-bold">{time}</span>
            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5 text-slate-300" />
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Render Active Mobile Content */}
          <div className="relative flex-1 overflow-hidden">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="h-6 flex items-center justify-center shrink-0 bg-transparent z-30">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
