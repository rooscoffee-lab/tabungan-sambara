import { motion } from 'motion/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Flame,
  ShieldCheck,
  Star,
  Trash2,
  Wallet,
} from 'lucide-react';
import type { JarKey, LedgerTransaction, SambaraAppState } from '../types/savings';
import { formatRupiah, getTotalBalance } from '../utils/ledger';
import { JarCard } from './JarCard';
import { RollingCounter } from './RollingCounter';
import { SambaraMascot, type MascotMood } from './SambaraMascot';

interface BerandaViewProps {
  state: SambaraAppState;
  mascotMood: MascotMood;
  mascotMessage: string;
  onPokeMascot: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: (defaultJar?: JarKey) => void;
  onDeleteTransaction: (tx: LedgerTransaction) => void;
  onGoToTab: (tab: 'impian' | 'misi' | 'belajar') => void;
}

export function BerandaView({
  state,
  mascotMood,
  mascotMessage,
  onPokeMascot,
  onOpenDeposit,
  onOpenWithdraw,
  onDeleteTransaction,
  onGoToTab,
}: BerandaViewProps) {
  const totalBalance = getTotalBalance(state.jars);
  const pendingMissionsCount = state.missions.filter((m) => m.status === 'pending_approval').length;

  return (
    <div className="space-y-5">
      {/* Top Bento Row: Hero Balance + Sambara Mascot (7 cols) & Ledger + Quick Stats (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Main Hero Card */}
        <section
          aria-label="Ringkasan Tabungan Sambara"
          className="lg:col-span-7 clay-card-sky rounded-3xl p-5 sm:p-7 flex flex-col justify-between gap-6"
        >
          <SambaraMascot
            mood={mascotMood}
            message={mascotMessage}
            onPoke={onPokeMascot}
          />

          <div className="rounded-3xl bg-white/95 p-5 sm:p-6 border-2 border-sky-200/80 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className="text-sm font-bold text-sky-800 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-sky-600" />
                Total Saldo Virtual
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Uang fisik dijaga Ayah &amp; Bunda
              </span>
            </div>

            <div className="my-2">
              <RollingCounter
                value={totalBalance}
                className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={onOpenDeposit}
                className="clay-button-coral min-h-[50px] w-full rounded-2xl px-5 py-3 text-slate-950 font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 whitespace-nowrap"
              >
                <Coins className="h-5 w-5 shrink-0" />
                <span>+ Catat Tabungan</span>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => onOpenWithdraw('jajan')}
                className="clay-button-white min-h-[50px] w-full rounded-2xl px-5 py-3 text-slate-800 font-display text-base font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 whitespace-nowrap"
              >
                <ArrowUpRight className="h-5 w-5 shrink-0 text-orange-600" />
                <span>Tarik Uang (Jajan)</span>
              </motion.button>
            </div>
          </div>
        </section>

        {/* Right Column: Streak + Recent Virtual Ledger */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Compact Gamification Row */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onGoToTab('belajar')}
              className="clay-card rounded-3xl p-4 text-left hover:border-amber-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Flame className="h-5 w-5 fill-amber-400" />
                <span className="text-xs font-bold text-slate-600">Streak Menabung</span>
              </div>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
                {state.streakDays} Hari
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Terus pertahankan!</p>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onGoToTab('misi')}
              className="clay-card rounded-3xl p-4 text-left hover:border-sky-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            >
              <div className="flex items-center gap-2 text-sky-600 mb-1">
                <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                <span className="text-xs font-bold text-slate-600">Poin Bintang</span>
              </div>
              <p className="font-display text-2xl font-bold text-slate-900 tabular-nums">
                {state.starPoints}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {pendingMissionsCount > 0
                  ? `${pendingMissionsCount} misi tunggu persetujuan`
                  : 'Cek Papan Misi'}
              </p>
            </motion.button>
          </div>

          {/* Virtual Ledger History Card */}
          <section
            aria-label="Catatan Transaksi Terakhir"
            className="clay-card flex-1 rounded-3xl p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Buku Catatan Virtual
                </h2>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  {state.transactions.length} catatan
                </span>
              </div>

              {state.transactions.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">
                  Belum ada catatan transaksi. Yuk catat tabungan pertamamu!
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {state.transactions.slice(0, 4).map((tx) => {
                    const isIncome = tx.amount > 0;
                    return (
                      <li key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              isIncome
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {tx.title}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {tx.note || 'Tercatat'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-sm font-extrabold tabular-nums whitespace-nowrap ${
                              isIncome ? 'text-emerald-700' : 'text-orange-700'
                            }`}
                          >
                            {isIncome ? `+${formatRupiah(tx.amount)}` : formatRupiah(tx.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx)}
                            aria-label={`Hapus catatan: ${tx.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Bento Row: 3 Pos Celengan (3-Jar System) */}
      <section aria-label="Pembagian 3 Pos Celengan">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3.5">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              3 Pos Celengan Pintar
            </h2>
            <p className="text-sm text-slate-600">
              Setiap uang yang ditabung otomatis dibagi adil: 70% Impian, 20% Jajan, 10% Berbagi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <JarCard
            jarKey="impian"
            balance={state.jars.impian}
            totalBalance={totalBalance}
            onSelect={() => onGoToTab('impian')}
          />
          <JarCard
            jarKey="jajan"
            balance={state.jars.jajan}
            totalBalance={totalBalance}
            onSelect={(jar) => onOpenWithdraw(jar)}
          />
          <JarCard
            jarKey="berbagi"
            balance={state.jars.berbagi}
            totalBalance={totalBalance}
            onSelect={(jar) => onOpenWithdraw(jar)}
          />
        </div>
      </section>
    </div>
  );
}
