import { motion } from 'motion/react';
import {
  BedDouble,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Footprints,
  Lock,
  Plus,
  Sparkles,
  Sprout,
  Trash2,
  Trophy,
  Utensils,
  X,
} from 'lucide-react';
import type { MissionItem, UserMode } from '../types/savings';
import { formatRupiah } from '../utils/ledger';

interface MisiViewProps {
  missions: MissionItem[];
  mode: UserMode;
  onClaimMission: (missionId: string) => void;
  onApproveMission: (missionId: string) => void;
  onRejectMission: (missionId: string) => void;
  onDeleteMission: (mission: MissionItem) => void;
  onRequestParentMode: () => void;
  onOpenNewMission: () => void;
}

const MISSION_ICON_MAP = {
  bed: BedDouble,
  plant: Sprout,
  dish: Utensils,
  book: BookOpen,
  broom: Sparkles,
  shoe: Footprints,
};

export function MisiView({
  missions,
  mode,
  onClaimMission,
  onApproveMission,
  onRejectMission,
  onDeleteMission,
  onRequestParentMode,
  onOpenNewMission,
}: MisiViewProps) {
  const pendingCount = missions.filter((m) => m.status === 'pending_approval').length;
  const completedCount = missions.filter((m) => m.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="clay-card-sky rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-800 mb-1">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-bold">Papan Misi &amp; Hadiah</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Bantu Orang Tua, Tambah Saldo!
          </h2>
          <p className="text-sm text-slate-700 mt-1">
            {pendingCount > 0 ? (
              <span>
                Ada <strong className="font-bold text-amber-800 tabular-nums">{pendingCount}</strong> misi menunggu persetujuan Ayah/Bunda
                <span aria-hidden="true"> · </span>
              </span>
            ) : null}
            <span className="tabular-nums">{completedCount} misi sudah selesai</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {mode === 'orang_tua' ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={onOpenNewMission}
              className="clay-button-sky min-h-[48px] px-5 py-3 rounded-2xl text-white font-display font-bold text-base flex items-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            >
              <Plus className="h-5 w-5" />
              <span>Tambah Misi</span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={onRequestParentMode}
              className="clay-button-white min-h-[46px] px-4 py-2.5 rounded-2xl text-slate-800 font-display font-bold text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            >
              <Lock className="h-4 w-4 text-sky-700" />
              <span>Persetujuan Ayah/Bunda</span>
            </motion.button>
          )}
        </div>
      </section>

      {/* Missions Grid */}
      {missions.length === 0 ? (
        <div className="clay-card rounded-3xl p-10 text-center">
          <p className="font-display text-xl font-bold text-slate-800">
            Belum ada misi rumah
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {mode === 'orang_tua'
              ? 'Tekan "Tambah Misi" untuk membuat misi baru bagi anak!'
              : 'Ayah & Bunda dapat menambahkan misi baru lewat Mode Orang Tua.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {missions.map((mission) => {
          const Icon = MISSION_ICON_MAP[mission.iconName] ?? Sparkles;
          const isAvailable = mission.status === 'available';
          const isPending = mission.status === 'pending_approval';
          const isApproved = mission.status === 'approved';

          return (
            <article
              key={mission.id}
              className={`clay-card rounded-3xl p-5 flex flex-col justify-between gap-4 ${
                isApproved ? 'bg-emerald-50/50 border-emerald-200' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-700'
                        : isPending
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">
                      {mission.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 shrink-0">
                  <div className="text-right">
                    <span className="block text-xs font-semibold text-slate-500">Hadiah</span>
                    <span className="font-display text-lg font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                      +{formatRupiah(mission.reward)}
                    </span>
                  </div>
                  {mode === 'orang_tua' && (
                    <button
                      type="button"
                      onClick={() => onDeleteMission(mission)}
                      aria-label={`Hapus misi: ${mission.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action / Status Footer */}
              <div className="pt-1">
                {isAvailable && mode === 'anak' && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => onClaimMission(mission.id)}
                    aria-label={`Klaim Selesai: ${mission.title}`}
                    className="clay-button-coral min-h-[46px] w-full rounded-2xl px-4 py-2.5 text-slate-950 font-display font-bold text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
                  >
                    <Check className="h-5 w-5" />
                    <span>Klaim Selesai</span>
                  </motion.button>
                )}

                {isAvailable && mode === 'orang_tua' && (
                  <div className="min-h-[44px] rounded-2xl bg-slate-100 px-4 py-2.5 flex items-center justify-center text-sm font-semibold text-slate-600">
                    Menunggu dikerjakan oleh anak
                  </div>
                )}

                {isPending && mode === 'anak' && (
                  <div className="min-h-[46px] rounded-2xl bg-amber-50 border-2 border-amber-200 px-4 py-2.5 flex items-center justify-center gap-2 text-amber-900 text-sm font-bold">
                    <Clock className="h-4 w-4 shrink-0 text-amber-700" />
                    <span>Menunggu Persetujuan Ayah/Bunda</span>
                  </div>
                )}

                {isPending && mode === 'orang_tua' && (
                  <div className="flex items-center gap-2.5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => onApproveMission(mission.id)}
                      aria-label={`Setujui Misi: ${mission.title}`}
                      className="clay-button-sky min-h-[46px] flex-1 rounded-2xl px-4 py-2.5 text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Setujui Misi</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => onRejectMission(mission.id)}
                      aria-label={`Tolak misi ${mission.title}`}
                      className="clay-button-white min-h-[46px] px-3.5 py-2.5 rounded-2xl text-slate-700 font-bold text-sm flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
                    >
                      <X className="h-4 w-4" />
                      <span>Ulang</span>
                    </motion.button>
                  </div>
                )}

                {isApproved && (
                  <div className="min-h-[46px] rounded-2xl bg-emerald-100/80 border-2 border-emerald-200 px-4 py-2.5 flex items-center justify-center gap-2 text-emerald-900 text-sm font-bold">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                    <span>Disetujui · Hadiah sudah masuk saldo!</span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
        </div>
      )}
    </div>
  );
}
