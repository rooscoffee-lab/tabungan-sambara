import { motion } from 'motion/react';
import {
  Backpack,
  Bike,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Footprints,
  Gamepad2,
  Music,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import type { SavingsGoal } from '../types/savings';
import { estimateWeeksToGoal, formatEtaLabel, formatRupiah } from '../utils/ledger';

interface ImpianViewProps {
  goals: SavingsGoal[];
  impianJarBalance: number;
  weeklyAverageSavings: number;
  onSelectGoalToFund: (goal: SavingsGoal) => void;
  onDeleteGoal: (goal: SavingsGoal) => void;
  onOpenNewGoal: () => void;
}

const GOAL_ICON_MAP = {
  bike: Bike,
  book: BookOpen,
  shoe: Footprints,
  backpack: Backpack,
  lego: Gamepad2,
  guitar: Music,
};

const COLOR_STYLES = {
  sky: {
    iconBg: 'bg-sky-100 text-sky-700',
    bar: 'bg-gradient-to-r from-sky-400 to-sky-600',
    track: 'bg-sky-100',
  },
  coral: {
    iconBg: 'bg-orange-100 text-orange-700',
    bar: 'bg-gradient-to-r from-orange-400 to-amber-500',
    track: 'bg-orange-100',
  },
  emerald: {
    iconBg: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-gradient-to-r from-emerald-400 to-green-600',
    track: 'bg-emerald-100',
  },
  amber: {
    iconBg: 'bg-amber-100 text-amber-800',
    bar: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    track: 'bg-amber-100',
  },
};

export function ImpianView({
  goals,
  impianJarBalance,
  weeklyAverageSavings,
  onSelectGoalToFund,
  onDeleteGoal,
  onOpenNewGoal,
}: ImpianViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="clay-card-sky rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-800 mb-1">
            <Target className="h-5 w-5" />
            <span className="text-sm font-bold">Celengan Impian</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Wujudkan Barang Impianmu
          </h2>
          <p className="text-sm text-slate-700 mt-1">
            Saldo Pos Tabungan Impian siap dialokasikan:{' '}
            <strong className="font-extrabold text-sky-900 tabular-nums">
              {formatRupiah(impianJarBalance)}
            </strong>
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onOpenNewGoal}
          className="clay-button-sky min-h-[48px] px-5 py-3 rounded-2xl text-white font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          <Plus className="h-5 w-5" />
          <span>Impian Baru</span>
        </motion.button>
      </section>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="clay-card rounded-3xl p-10 text-center">
          <p className="font-display text-xl font-bold text-slate-800">
            Belum ada target impian
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Tekan "+ Impian Baru" untuk menambahkan barang yang ingin kamu tabung!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const Icon = GOAL_ICON_MAP[goal.iconName] ?? Target;
            const style = COLOR_STYLES[goal.accentColor] ?? COLOR_STYLES.sky;
            const percent = Math.min(
              100,
              Math.round((goal.collectedAmount / Math.max(1, goal.targetAmount)) * 100)
            );
            const isReached = goal.collectedAmount >= goal.targetAmount;
            const weeksLeft = estimateWeeksToGoal(goal, weeklyAverageSavings);
            const remainingAmount = Math.max(0, goal.targetAmount - goal.collectedAmount);

            return (
              <article
                key={goal.id}
                className="clay-card rounded-3xl p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.iconBg}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold text-slate-900 leading-snug truncate">
                          {goal.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 tabular-nums">
                          Target {formatRupiah(goal.targetAmount)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal)}
                      aria-label={`Hapus target: ${goal.title}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Collected & Percent */}
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                      {formatRupiah(goal.collectedAmount)}
                    </span>
                    <span className="text-sm font-bold text-sky-700 tabular-nums">
                      {percent}%
                    </span>
                  </div>

                  {/* Shimmer Progress Bar */}
                  <div
                    className={`relative h-4 w-full overflow-hidden rounded-full ${style.track}`}
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progres ${goal.title}`}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className={`relative h-full rounded-full ${style.bar} overflow-hidden`}
                    >
                      <div className="animate-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent skew-x-[-20deg]" />
                    </motion.div>
                  </div>

                  {/* Automatic ETA Info */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    {isReached ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 font-bold">
                          Target Tercapai! Siap dibeli bersama Ayah/Bunda
                        </span>
                      </>
                    ) : (
                      <>
                        <CalendarClock className="h-4 w-4 text-sky-600 shrink-0" />
                        <span>
                          {formatEtaLabel(weeksLeft)}
                          <span aria-hidden="true"> · </span>
                          Kurang {formatRupiah(remainingAmount)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {isReached ? (
                  <div className="min-h-[46px] rounded-2xl bg-emerald-50 border-2 border-emerald-200 px-4 py-2.5 flex items-center justify-center gap-2 text-emerald-800 font-display font-bold text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Impian Berhasil Terkumpul!</span>
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => onSelectGoalToFund(goal)}
                    disabled={impianJarBalance <= 0}
                    aria-label={`Tambah ke Target: ${goal.title}`}
                    className="clay-button-coral min-h-[46px] w-full rounded-2xl px-4 py-2.5 text-slate-950 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah ke Target</span>
                  </motion.button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
