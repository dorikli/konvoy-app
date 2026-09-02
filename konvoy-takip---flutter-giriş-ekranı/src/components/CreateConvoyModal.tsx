import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, PlusCircle, RefreshCw, Car, Bike, Truck, ShieldCheck, Users, Compass, Check } from 'lucide-react';
import { VehicleType } from '../types';

interface CreateConvoyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (convoyData: {
    code: string;
    name: string;
    vehicleType: VehicleType;
    maxMembers: number;
    destination: string;
  }) => void;
}

export const CreateConvoyModal: React.FC<CreateConvoyModalProps> = ({
  isOpen,
  onClose,
  onCreateSuccess,
}) => {
  const [name, setName] = useState('Hafta Sonu Ege Turu');
  const [destination, setDestination] = useState('Çeşme Marina (İzmir)');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [maxMembers, setMaxMembers] = useState(6);
  const [code, setCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [isCopied, setIsCopied] = useState(false);

  const generateNewCode = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setCode(newCode);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSuccess({
      code,
      name: name.trim() || 'Yeni Konvoy Grubu',
      vehicleType,
      maxMembers,
      destination: destination.trim() || 'Hedef Belirlenmedi',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-3xl border-t sm:border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl shadow-emerald-950/50 text-slate-100 max-h-[90vh] overflow-y-auto ring-1 ring-white/10"
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 backdrop-blur-xl flex items-center justify-center text-emerald-300 shadow-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white font-display">
                Konvoy Oluştur
              </h3>
              <p className="text-xs text-slate-300">
                Yeni bir sürüş odası kurun ve kodu paylaşın
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Generated PIN Code Highlight - Frosted Glass Card */}
          <div className="bg-white/[0.06] backdrop-blur-2xl p-4 rounded-2xl border border-white/20 shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-300 block mb-0.5">
                Konvoy Katılım Kodu (4 Hane)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-mono font-extrabold text-white tracking-widest drop-shadow-sm">
                  #{code}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-400/40 backdrop-blur-sm">
                  Otomatik
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={generateNewCode}
                title="Yeni Kod Üret"
                className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-300 hover:text-white border border-white/15 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Kodu Kopyala"
                className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 transition-colors"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <span className="text-xs font-semibold px-1">Kopyala</span>}
              </button>
            </div>
          </div>

          {/* Konvoy Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Konvoy Başlığı / Grubu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Hafta Sonu Boğaz Turu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/15 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 text-sm text-white outline-none transition-all"
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-300" />
              Hedef / Varış Noktası
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Örn: Çeşme Marina, Uludağ Zirve..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-sm text-white outline-none transition-all"
            />
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Birincil Araç Tipi
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'car' as VehicleType, label: 'Otomobil', icon: Car },
                { type: 'motorcycle' as VehicleType, label: 'Motosiklet', icon: Bike },
                { type: 'suv' as VehicleType, label: '4x4 SUV', icon: Truck },
                { type: 'truck' as VehicleType, label: 'Karavan', icon: Truck },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = vehicleType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setVehicleType(item.type)}
                    className={`py-2 px-1.5 rounded-xl border backdrop-blur-md flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold shadow-md shadow-emerald-950/30'
                        : 'bg-white/[0.05] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Participants Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Maksimum Araç Sayısı
              </span>
              <span className="text-emerald-300 font-mono font-bold">{maxMembers} Araç</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* GPS Status Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/10 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Lider olarak konvoy hız ve konum senkronizasyonunu yönetirsiniz.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-xl shadow-emerald-500/30 border border-white/30 transition-all active:scale-[0.98] font-display"
          >
            Konvoyu Başlat & Odayı Aç
          </button>
        </form>
      </motion.div>
    </div>
  );
};
