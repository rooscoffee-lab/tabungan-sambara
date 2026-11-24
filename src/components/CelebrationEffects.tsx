import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles } from 'lucide-react';

interface CelebrationEffectsProps {
  burstKey: number;
  coinFlightKey: number;
  bannerText?: string | null;
}

const CONFETTI_PIECES = [
  { id: 1, x: -160, y: -120, color: '#FACC15', rotate: 45, size: 12 },
  { id: 2, x: -110, y: -165, color: '#38BDF8', rotate: 120, size: 10 },
  { id: 3, x: -55, y: -140, color: '#4ADE80', rotate: -60, size: 12 },
  { id: 4, x: 0, y: -180, color: '#FB923C', rotate: 90, size: 14 },
  { id: 5, x: 60, y: -145, color: '#FACC15', rotate: 150, size: 11 },
  { id: 6, x: 115, y: -160, color: '#38BDF8', rotate: -40, size: 12 },
  { id: 7, x: 165, y: -110, color: '#4ADE80', rotate: 75, size: 10 },
  { id: 8, x: -140, y: -60, color: '#FB923C', rotate: -110, size: 10 },
  { id: 9, x: 140, y: -65, color: '#FACC15', rotate: 30, size: 12 },
  { id: 10, x: -80, y: -90, color: '#F43F5E', rotate: 60, size: 9 },
  { id: 11, x: 85, y: -95, color: '#F43F5E', rotate: -80, size: 9 },
];

const FLYING_COINS = [
  { id: 1, delay: 0, startX: -90, startY: 140 },
  { id: 2, delay: 0.08, startX: -30, startY: 160 },
  { id: 3, delay: 0.16, startX: 35, startY: 150 },
  { id: 4, delay: 0.24, startX: 90, startY: 135 },
];

export function CelebrationEffects({
  burstKey,
  coinFlightKey,
  bannerText,
}: CelebrationEffectsProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden flex items-center justify-center"
      aria-live="polite"
    >
      {/* Confetti Burst */}
      <AnimatePresence>
        {burstKey > 0 && (
          <div key={`burst-${burstKey}`} className="relative">
            {CONFETTI_PIECES.map((piece) => (
              <motion.div
                key={piece.id}
                initial={{ x: 0, y: 20, scale: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: piece.x,
                  y: [20, piece.y, piece.y + 180],
                  scale: [0, 1.2, 0.8],
                  opacity: [1, 1, 0],
                  rotate: piece.rotate * 2,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                  borderRadius: piece.id % 2 === 0 ? '9999px' : '3px',
                }}
                className="absolute shadow-sm"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Flying Gold Coins Animation */}
      <AnimatePresence>
        {coinFlightKey > 0 && (
          <div key={`coins-${coinFlightKey}`} className="relative">
            {FLYING_COINS.map((coin) => (
              <motion.div
                key={coin.id}
                initial={{ x: coin.startX, y: coin.startY, scale: 0.6, opacity: 0 }}
                animate={{
                  x: [coin.startX, coin.startX * 0.3, 0],
                  y: [coin.startY, -60, -140],
                  scale: [0.8, 1.25, 0.4],
                  opacity: [0, 1, 0],
                  rotateY: [0, 360, 720],
                }}
                transition={{
                  duration: 0.9,
                  delay: coin.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 border-2 border-amber-600 text-amber-950 shadow-lg"
              >
                <Coins className="h-5 w-5" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Cheerful Toast Banner */}
      <AnimatePresence>
        {bannerText && (
          <motion.div
            key={bannerText}
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-5 py-3 text-white shadow-xl border-2 border-amber-300"
          >
            <Sparkles className="h-5 w-5 text-amber-300 shrink-0" />
            <span className="text-sm font-bold whitespace-nowrap">{bannerText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
