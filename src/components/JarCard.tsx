import { motion } from 'motion/react';
import { Heart, PiggyBank, ShoppingBag } from 'lucide-react';
import type { JarKey } from '../types/savings';
import { formatRupiah } from '../utils/ledger';

interface JarCardProps {
  jarKey: JarKey;
  balance: number;
  totalBalance: number;
  onSelect: (jar: JarKey) => void;
}

const JAR_META: Record<
  JarKey,
  {
    title: string;
    ratioLabel: string;
    description: string;
    liquidColor: string;
    waveColor: string;
    borderColor: string;
    bgTint: string;
    textAccent: string;
    iconBg: string;
    Icon: typeof PiggyBank;
  }
> = {
  impian: {
    title: 'Tabungan Impian',
    ratioLabel: '70%',
    description: 'Untuk membeli barang impian besarmu',
    liquidColor: 'from-sky-400 to-sky-500',
    waveColor: '#38BDF8',
    borderColor: 'border-sky-200',
    bgTint: 'bg-sky-50/70',
    textAccent: 'text-sky-800',
    iconBg: 'bg-sky-100 text-sky-700',
    Icon: PiggyBank,
  },
  jajan: {
    title: 'Jajan & Belanja',
    ratioLabel: '20%',
    description: 'Boleh dipakai jajan atau beli alat tulis',
    liquidColor: 'from-orange-400 to-amber-400',
    waveColor: '#FB923C',
    borderColor: 'border-orange-200',
    bgTint: 'bg-orange-50/70',
    textAccent: 'text-orange-900',
    iconBg: 'bg-orange-100 text-orange-700',
    Icon: ShoppingBag,
  },
  berbagi: {
    title: 'Berbagi / Sedekah',
    ratioLabel: '10%',
    description: 'Untuk membantu teman & sesama',
    liquidColor: 'from-emerald-400 to-green-500',
    waveColor: '#4ADE80',
    borderColor: 'border-emerald-200',
    bgTint: 'bg-emerald-50/70',
    textAccent: 'text-emerald-900',
    iconBg: 'bg-emerald-100 text-emerald-700',
    Icon: Heart,
  },
};

export function JarCard({ jarKey, balance, totalBalance, onSelect }: JarCardProps) {
  const meta = JAR_META[jarKey];
  const Icon = meta.Icon;

  // Fill percentage visual inside the jar (at least 14% when > 0 so liquid is visible)
  const sharePercent = totalBalance > 0 ? Math.round((balance / totalBalance) * 100) : 0;
  const visualHeight = balance <= 0 ? 6 : Math.min(92, Math.max(18, sharePercent + 15));

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(jarKey)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      className={`clay-card w-full rounded-3xl p-4 sm:p-5 text-left transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 ${meta.borderColor}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {meta.title}
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Porsi {meta.ratioLabel}
              <span aria-hidden="true"> · </span>
              <span className="tabular-nums">{sharePercent}% saldo</span>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Animated Liquid Jar Visualization */}
      <div className="flex items-center gap-4">
        <div
          className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border-2 ${meta.borderColor} ${meta.bgTint}`}
          aria-hidden="true"
        >
          {/* Jar Lid */}
          <div className="absolute inset-x-2 top-0 h-2 rounded-b-md bg-slate-200/90 z-10" />
          {/* Animated Liquid Fill */}
          <motion.div
            initial={{ height: '10%' }}
            animate={{ height: `${visualHeight}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 16 }}
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${meta.liquidColor}`}
          >
            {/* Wavy Top Edge */}
            <svg
              viewBox="0 0 120 18"
              preserveAspectRatio="none"
              className="animate-wave -mt-2.5 h-3 w-[140%]"
            >
              <path
                d="M0,10 C20,2 40,18 60,10 C80,2 100,18 120,10 L120,18 L0,18 Z"
                fill={meta.waveColor}
              />
            </svg>
          </motion.div>
          {/* Glass shine highlight */}
          <div className="absolute left-2 top-3 bottom-3 w-1.5 rounded-full bg-white/45 z-10" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 mb-0.5">Isi Celengan</p>
          <p className={`text-xl sm:text-2xl font-extrabold tabular-nums truncate ${meta.textAccent}`}>
            {formatRupiah(balance)}
          </p>
          <p className="text-xs text-slate-600 mt-1.5 leading-snug">
            {meta.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
