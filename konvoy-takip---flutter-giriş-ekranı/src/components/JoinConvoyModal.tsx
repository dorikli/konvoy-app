import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, KeyRound, ArrowRight, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { convoySyncService } from '../services/convoySyncService';
import { ActiveConvoy } from '../types';

interface JoinConvoyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (roomCode: string) => void;
}

export const JoinConvoyModal: React.FC<JoinConvoyModalProps> = ({
  isOpen,
  onClose,
  onJoinSuccess,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [liveConvoys, setLiveConvoys] = useState<ActiveConvoy[]>([]);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setActiveIndex(0);
      setError(null);
      setIsLoading(false);
      setIsSuccess(false);
      setLiveConvoys(convoySyncService.getAllConvoys());
      setTimeout(() => {
        inputRefs[0]?.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric digit
    const cleaned = val.replace(/[^0-9]/g, '');
    if (!cleaned && val !== '') return;

    const newDigits = [...digits];
    const char = cleaned.slice(-1);
    newDigits[index] = char;
    setDigits(newDigits);
    setError(null);

    if (char && index < 3) {
      setActiveIndex(index + 1);
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        setActiveIndex(index - 1);
        inputRefs[index - 1]?.current?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs[index - 1]?.current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      setActiveIndex(index + 1);
      inputRefs[index + 1]?.current?.focus();
    } else if (e.key === 'Enter') {
      handleJoin();
    }
  };

  const handleKeypadPress = (key: string) => {
    setError(null);
    if (key === 'backspace') {
      const lastFilledIndex = digits.map((d, i) => (d ? i : -1)).filter(i => i !== -1).pop();
      if (lastFilledIndex !== undefined && lastFilledIndex >= 0) {
        const newDigits = [...digits];
        newDigits[lastFilledIndex] = '';
        setDigits(newDigits);
        setActiveIndex(lastFilledIndex);
        inputRefs[lastFilledIndex]?.current?.focus();
      }
      return;
    }

    if (key === 'clear') {
      setDigits(['', '', '', '']);
      setActiveIndex(0);
      inputRefs[0]?.current?.focus();
      return;
    }

    // Number key
    const firstEmptyIndex = digits.findIndex(d => d === '');
    if (firstEmptyIndex !== -1) {
      const newDigits = [...digits];
      newDigits[firstEmptyIndex] = key;
      setDigits(newDigits);
      if (firstEmptyIndex < 3) {
        setActiveIndex(firstEmptyIndex + 1);
        inputRefs[firstEmptyIndex + 1]?.current?.focus();
      } else {
        inputRefs[firstEmptyIndex]?.current?.blur();
      }
    }
  };

  const handleJoin = (presetCode?: string) => {
    const code = presetCode || digits.join('');
    if (code.length !== 4) {
      setError('Lütfen 4 haneli oda kodunu eksiksiz girin.');
      return;
    }

    if (code === '0000') {
      setError('Bu oda bulunamadı veya konvoy sona erdi.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onJoinSuccess(code);
      }, 500);
    }, 800);
  };

  const selectDemoRoom = (code: string) => {
    const chars = code.split('').slice(0, 4);
    setDigits(chars);
    setActiveIndex(3);
    handleJoin(code);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-md bg-slate-900/75 backdrop-blur-3xl border-t sm:border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl shadow-emerald-950/50 text-slate-100 overflow-hidden ring-1 ring-white/10"
      >
        {/* Glow ambient background orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Mobile handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-400/40 backdrop-blur-xl flex items-center justify-center text-cyan-300 shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white font-display">
                Konvoya Katıl
              </h3>
              <p className="text-xs text-slate-300">
                4 haneli oda PIN kodunu giriniz
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

        {/* 4-Digit Input Boxes (Frosted Glass Inputs) */}
        <div className="my-6">
          <div className="flex justify-center gap-3 sm:gap-4">
            {digits.map((digit, idx) => {
              const isFocused = activeIndex === idx;
              const hasVal = digit !== '';
              return (
                <div key={idx} className="relative">
                  <input
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onFocus={() => setActiveIndex(idx)}
                    className={`w-14 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-mono font-bold rounded-2xl backdrop-blur-xl transition-all outline-none border ${
                      isFocused
                        ? 'border-emerald-400 ring-4 ring-emerald-500/25 text-emerald-300 scale-105 shadow-xl shadow-emerald-500/30 bg-white/[0.12]'
                        : hasVal
                        ? 'border-cyan-400/70 text-white bg-white/[0.10] shadow-md shadow-cyan-950/30'
                        : 'border-white/15 text-slate-400 bg-white/[0.05] hover:border-white/30'
                    }`}
                  />
                  {/* Subtle placeholder indicator */}
                  {!hasVal && !isFocused && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-white/20" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center justify-center gap-2 text-rose-300 text-xs font-medium bg-rose-500/15 border border-rose-500/30 py-2 px-3 rounded-xl backdrop-blur-md"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Rooms Quick Selector (Frosted Glass Container) */}
        {liveConvoys.length > 0 && (
          <div className="mb-5 bg-white/[0.05] backdrop-blur-xl p-3 rounded-2xl border border-white/15 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                Aktif Canlı Konvoylar
              </span>
              <span className="text-[11px] text-slate-400">Tıklayıp Otomatik Gir</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto">
              {liveConvoys.map((room) => (
                <button
                  key={room.code}
                  onClick={() => selectDemoRoom(room.code)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-cyan-400/50 backdrop-blur-md transition-all text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/40">
                      #{room.code}
                    </span>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate max-w-[150px] sm:max-w-[180px]">
                      {room.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 flex items-center gap-1">
                    {room.participants?.length || 1} araç
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => handleJoin()}
          disabled={isLoading || digits.join('').length !== 4}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all font-display ${
            digits.join('').length === 4
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-xl shadow-emerald-500/30 border border-white/30 active:scale-[0.98]'
              : 'bg-white/[0.06] text-slate-500 border border-white/10 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Bağlanılıyor...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>Odaya Girildi!</span>
            </>
          ) : (
            <>
              <span>Odaya Bağlan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Built-in Keypad for touch devices or simulator convenience */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="grid grid-cols-3 gap-1.5 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'C') handleKeypadPress('clear');
                  else if (key === '⌫') handleKeypadPress('backspace');
                  else handleKeypadPress(key);
                }}
                className={`py-2 text-sm font-semibold rounded-xl backdrop-blur-md transition-all ${
                  key === 'C'
                    ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/25 active:scale-95'
                    : key === '⌫'
                    ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/25 active:scale-95'
                    : 'bg-white/[0.07] text-slate-200 hover:bg-white/[0.14] border border-white/10 hover:text-white active:scale-95'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
