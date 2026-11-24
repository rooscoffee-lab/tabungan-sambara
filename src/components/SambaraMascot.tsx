import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export type MascotMood = 'idle' | 'celebrate' | 'encourage';

interface SambaraMascotProps {
  mood: MascotMood;
  message: string;
  onPoke?: () => void;
}

export function SambaraMascot({ mood, message, onPoke }: SambaraMascotProps) {
  const isCelebrating = mood === 'celebrate';

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5">
      {/* Interactive SVG Mascot Button */}
      <motion.button
        type="button"
        onClick={onPoke}
        aria-label="Sapa maskot Sambara"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
        animate={
          isCelebrating
            ? {
                y: [0, -18, 0, -10, 0],
                rotate: [0, -4, 4, -2, 0],
              }
            : {
                y: [0, -5, 0],
              }
        }
        transition={
          isCelebrating
            ? { duration: 0.9, ease: 'easeOut' }
            : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative shrink-0 cursor-pointer rounded-3xl p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400"
      >
        {/* Subtle sky backdrop glow under mascot */}
        <div
          aria-hidden="true"
          className="absolute inset-x-3 bottom-1 h-4 rounded-full bg-sky-900/15 blur-sm"
        />

        {/* Custom Flat-3D Indonesian Elementary Boy SVG ("Sambara") */}
        <svg
          width="116"
          height="136"
          viewBox="0 0 120 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-sm"
          role="img"
          aria-label="Ilustrasi Sambara anak SD Indonesia yang ceria"
        >
          <defs>
            <linearGradient id="skinGrad" x1="40" y1="20" x2="80" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F1BA93" />
              <stop offset="100%" stopColor="#DE9B6F" />
            </linearGradient>
            <linearGradient id="shirtGrad" x1="30" y1="72" x2="90" y2="112" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="shortsGrad" x1="35" y1="104" x2="85" y2="132" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
            <linearGradient id="capGrad" x1="35" y1="6" x2="85" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>

          {/* Left Leg */}
          <rect x="41" y="114" width="13" height="16" rx="6" fill="#DE9B6F" />
          {/* Left Sock & Shoe */}
          <rect x="41" y="123" width="13" height="6" rx="2" fill="#FFFFFF" />
          <path d="M36 129C36 126.5 38.5 125 42 125H54C55.5 125 56 126.5 56 129C56 131.5 54 133 51 133H39C37 133 36 131.5 36 129Z" fill="#1E293B" />

          {/* Right Leg */}
          <rect x="66" y="114" width="13" height="16" rx="6" fill="#DE9B6F" />
          {/* Right Sock & Shoe */}
          <rect x="66" y="123" width="13" height="6" rx="2" fill="#FFFFFF" />
          <path d="M64 129C64 126.5 64.5 125 66 125H78C81.5 125 84 126.5 84 129C84 131.5 83 133 81 133H69C66 133 64 131.5 64 129Z" fill="#1E293B" />

          {/* Left Arm (stationary gentle swing) */}
          <motion.g
            animate={isCelebrating ? { rotate: [0, -25, 10, -20, 0] } : { rotate: [0, 3, 0] }}
            transition={{ duration: isCelebrating ? 0.8 : 2.8, repeat: isCelebrating ? 0 : Infinity }}
            style={{ originX: '34px', originY: '78px' }}
          >
            <path d="M35 75C27 77 21 86 22 94C23 99 28 100 32 97L37 86L35 75Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="26" cy="97" r="6" fill="#E6A87C" />
          </motion.g>

          {/* Right Arm (waves happily!) */}
          <motion.g
            animate={
              isCelebrating
                ? { rotate: [0, -55, -20, -60, 0] }
                : mood === 'encourage'
                ? { rotate: [0, -35, -15, -35, 0] }
                : { rotate: [0, -8, 0] }
            }
            transition={{
              duration: isCelebrating ? 0.85 : 2.5,
              repeat: isCelebrating ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            style={{ originX: '86px', originY: '78px' }}
          >
            <path d="M85 75C93 77 99 86 98 94C97 99 92 100 88 97L83 86L85 75Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="94" cy="97" r="6" fill="#E6A87C" />
          </motion.g>

          {/* Red SD Shorts (Celana Merah Hati) */}
          <path d="M35 102H85L88 118C88 120 86.5 121 84.5 121H64L60 112L56 121H35.5C33.5 121 32 120 32 118L35 102Z" fill="url(#shortsGrad)" />
          {/* Belt */}
          <rect x="35" y="100" width="50" height="5" rx="2" fill="#334155" />
          <rect x="56" y="99.5" width="8" height="6" rx="1.5" fill="#FACC15" />

          {/* White SD Shirt (Kemeja Putih SD) */}
          <path d="M34 73C34 69 38 66 44 66H76C82 66 86 69 86 73L85 101H35L34 73Z" fill="url(#shirtGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Shirt Collar */}
          <path d="M46 66L60 76L74 66" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Red SD Tie (Dasi Merah) */}
          <path d="M57 73H63L65 92L60 97L55 92L57 73Z" fill="#DC2626" />
          <polygon points="56,70 64,70 62,74 58,74" fill="#B91C1C" />
          {/* Shirt Pocket with Gold Star Crest */}
          <rect x="68" y="79" width="11" height="11" rx="2.5" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.2" />
          <circle cx="73.5" cy="84.5" r="2.2" fill="#FACC15" />

          {/* Neck */}
          <rect x="54" y="59" width="12" height="10" rx="4" fill="#D58E62" />

          {/* Ears */}
          <circle cx="33" cy="45" r="5.5" fill="#DE9B6F" />
          <circle cx="87" cy="45" r="5.5" fill="#DE9B6F" />

          {/* Head */}
          <rect x="34" y="19" width="52" height="47" rx="23" fill="url(#skinGrad)" />

          {/* Rosy Cheeks */}
          <ellipse cx="43" cy="49" rx="4.5" ry="2.8" fill="#FB7185" fillOpacity="0.38" />
          <ellipse cx="77" cy="49" rx="4.5" ry="2.8" fill="#FB7185" fillOpacity="0.38" />

          {/* Hair */}
          <path
            d="M34 36C34 22 45 14 60 14C75 14 86 22 86 36C82 30 74 28 60 28C46 28 38 30 34 36Z"
            fill="#1E293B"
          />

          {/* SD Cap (Topi SD Merah Putih) */}
          <path d="M36 26C37 14 47 8 60 8C73 8 83 14 84 26H36Z" fill="url(#capGrad)" />
          {/* White front panel of SD cap */}
          <path d="M48 25C49 16 54 11 60 11C66 11 71 16 72 25H48Z" fill="#FFFFFF" />
          {/* Cap Badge */}
          <circle cx="60" cy="18.5" r="3.2" fill="#FACC15" />
          {/* Cap Brim / Visor */}
          <path d="M34 26C44 22 76 22 88 27C89 28.5 87 30 83 29.5C72 28 48 28 37 29.5C34 29.5 32.5 27.5 34 26Z" fill="#991B1B" />

          {/* Eyes (Animated Blink in Idle, Happy Arcs when Celebrating) */}
          {isCelebrating ? (
            <>
              <path d="M44 43C46 39 50 39 52 43" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M68 43C70 39 74 39 76 43" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
            </>
          ) : (
            <motion.g
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                duration: 3.8,
                times: [0, 0.92, 0.95, 0.98, 1],
                repeat: Infinity,
              }}
              style={{ originY: '42px' }}
            >
              <circle cx="48" cy="42" r="3.8" fill="#1E293B" />
              <circle cx="49.2" cy="40.8" r="1.3" fill="#FFFFFF" />
              <circle cx="72" cy="42" r="3.8" fill="#1E293B" />
              <circle cx="73.2" cy="40.8" r="1.3" fill="#FFFFFF" />
            </motion.g>
          )}

          {/* Eyebrows */}
          <path d="M43 35.5C45.5 34 49.5 34 52 35.5" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <path d="M68 35.5C70.5 34 74.5 34 77 35.5" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

          {/* Mouth */}
          {isCelebrating ? (
            <path d="M52 51C55 58 65 58 68 51Z" fill="#991B1B" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
          ) : (
            <path d="M53 52C56 56.5 64 56.5 67 52" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" />
          )}
        </svg>

        {isCelebrating && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0.8, 1.2, 1], opacity: 1 }}
            className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-amber-900 shadow-md"
            aria-hidden="true"
          >
            <Sparkles className="h-4 w-4" />
          </motion.span>
        )}
      </motion.button>

      {/* Dynamic Speech Bubble */}
      <div className="relative flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl bg-white px-4 py-3 border-2 border-sky-200 shadow-sm"
          >
            {/* Speech bubble pointer arrow on desktop */}
            <div
              aria-hidden="true"
              className="hidden sm:block absolute -left-2.5 bottom-5 h-4 w-4 rotate-45 border-l-2 border-b-2 border-sky-200 bg-white"
            />
            {/* Speech bubble pointer arrow on mobile */}
            <div
              aria-hidden="true"
              className="sm:hidden absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 border-l-2 border-t-2 border-sky-200 bg-white"
            />
            <p className="text-xs font-bold text-sky-700 mb-0.5">Sambara bilang:</p>
            <p className="text-sm sm:text-[15px] font-semibold text-slate-800 leading-snug">
              "{message}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
