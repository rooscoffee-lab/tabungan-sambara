import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Coins,
  Home,
  Lock,
  RotateCcw,
  ShieldCheck,
  Target,
  Trophy,
  UserCheck,
} from 'lucide-react';
import type {
  AppTab,
  JarKey,
  LedgerTransaction,
  MissionItem,
  SambaraAppState,
  SavingsGoal,
  UserMode,
} from './types/savings';
import {
  allocateToGoal,
  applyDeposit,
  applyWithdrawal,
  approveMission,
  claimMission,
  createEmptyState,
  createInitialState,
  deleteGoal,
  deleteMission,
  deleteTransaction,
  formatRupiah,
  rejectMission,
} from './utils/ledger';
import { BerandaView } from './components/BerandaView';
import { ImpianView } from './components/ImpianView';
import { MisiView } from './components/MisiView';
import { BelajarView } from './components/BelajarView';
import { CelebrationEffects } from './components/CelebrationEffects';
import type { MascotMood } from './components/SambaraMascot';
import {
  AddGoalModal,
  AddMissionModal,
  AllocateGoalModal,
  CatatTabunganModal,
  ConfirmDeleteModal,
  ParentPinModal,
  ResetDataModal,
  TarikUangModal,
} from './components/Modals';

const STORAGE_KEY = 'tabungan_sambara_state_v1';

const TAB_GREETINGS: Record<AppTab, string> = {
  beranda: 'Halo! Yuk sisihkan uang jajan hari ini ke celenganmu!',
  impian: 'Sedikit demi sedikit, lama-lama impianmu pasti tercapai!',
  misi: 'Rajin membantu Ayah & Bunda bisa menambah saldo tabunganmu lho!',
  belajar: 'Ayo kumpulkan semua lencana dan jawab kuis cerdasnya!',
};

const POKE_MESSAGES = [
  'Semangat menabung hari ini! Setiap koin sangat berarti!',
  'Ingat aturan pintar: bedakan antara kebutuhan dan keinginan ya!',
  'Sudah cek misi rumah hari ini? Lumayan buat tambah saldo!',
  'Pos Berbagi membantu kita jadi anak yang dermawan!',
];

function loadSavedState(): SambaraAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as SambaraAppState;
    if (!parsed || !parsed.jars || !Array.isArray(parsed.goals)) {
      return createInitialState();
    }
    return parsed;
  } catch {
    return createInitialState();
  }
}

export default function App() {
  const [state, setState] = useState<SambaraAppState>(loadSavedState);
  const [activeTab, setActiveTab] = useState<AppTab>('beranda');
  const [mode, setMode] = useState<UserMode>('anak');

  // Mascot & celebration state
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState(TAB_GREETINGS.beranda);
  const [burstKey, setBurstKey] = useState(0);
  const [coinFlightKey, setCoinFlightKey] = useState(0);
  const [bannerText, setBannerText] = useState<string | null>(null);
  const [pokeIndex, setPokeIndex] = useState(0);

  // Modals state
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawConfig, setWithdrawConfig] = useState<{ open: boolean; jar: JarKey }>({
    open: false,
    jar: 'jajan',
  });
  const [goalToFund, setGoalToFund] = useState<SavingsGoal | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newMissionOpen, setNewMissionOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: 'transaction'; item: LedgerTransaction }
    | { kind: 'goal'; item: SavingsGoal }
    | { kind: 'mission'; item: MissionItem }
    | null
  >(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const triggerCelebration = (
    message: string,
    banner: string,
    withCoins = false
  ) => {
    setMascotMood('celebrate');
    setMascotMessage(message);
    setBurstKey((k) => k + 1);
    if (withCoins) {
      setCoinFlightKey((k) => k + 1);
    }
    setBannerText(banner);
    window.setTimeout(() => {
      setMascotMood('idle');
    }, 1800);
    window.setTimeout(() => {
      setBannerText(null);
    }, 2600);
  };

  const handleSwitchTab = (tab: AppTab) => {
    setActiveTab(tab);
    setMascotMood('encourage');
    setMascotMessage(TAB_GREETINGS[tab]);
    window.setTimeout(() => setMascotMood('idle'), 900);
  };

  const handlePokeMascot = () => {
    const nextMsg = POKE_MESSAGES[pokeIndex % POKE_MESSAGES.length];
    setPokeIndex((i) => i + 1);
    setMascotMood('encourage');
    setMascotMessage(nextMsg);
    window.setTimeout(() => setMascotMood('idle'), 900);
  };

  const handleDepositSubmit = (amount: number, note: string) => {
    setState((prev) => applyDeposit(prev, amount, note, 'deposit'));
    triggerCelebration(
      `Hore! Tabungan bertambah ${formatRupiah(amount)}!`,
      `+${formatRupiah(amount)} Berhasil Dicatat!`,
      true
    );
  };

  const handleWithdrawSubmit = (amount: number, jar: JarKey, note: string): string | undefined => {
    const res = applyWithdrawal(state, amount, jar, note);
    if (res.error) return res.error;
    setState(res.nextState);
    setBannerText(`Penarikan ${formatRupiah(amount)} dicatat!`);
    window.setTimeout(() => setBannerText(null), 2200);
    return undefined;
  };

  const handleAllocateGoalSubmit = (goalId: string, amount: number): string | undefined => {
    const res = allocateToGoal(state, goalId, amount);
    if (res.error) return res.error;
    setState(res.nextState);
    if (res.reachedTarget) {
      triggerCelebration(
        'Yey!! Target impianmu sudah 100% tercapai! Keren banget!',
        'Target Impian Tercapai 100%!',
        true
      );
    } else {
      triggerCelebration(
        `Mantap! ${formatRupiah(amount)} masuk ke celengan impianmu!`,
        `+${formatRupiah(amount)} Dialokasikan ke Impian!`,
        true
      );
    }
    return undefined;
  };

  const handleClaimMission = (missionId: string) => {
    setState((prev) => claimMission(prev, missionId));
    setBannerText('Misi diklaim! Menunggu persetujuan Ayah/Bunda.');
    window.setTimeout(() => setBannerText(null), 2500);
  };

  const handleApproveMission = (missionId: string) => {
    const mission = state.missions.find((m) => m.id === missionId);
    setState((prev) => approveMission(prev, missionId));
    if (mission) {
      triggerCelebration(
        `Asyik! Misi "${mission.title}" disetujui, saldo bertambah ${formatRupiah(mission.reward)}!`,
        `Misi Disetujui! +${formatRupiah(mission.reward)}`,
        true
      );
    }
  };

  const handleRejectMission = (missionId: string) => {
    setState((prev) => rejectMission(prev, missionId));
  };

  const handleCreateGoal = (goalData: Omit<SavingsGoal, 'id' | 'collectedAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      collectedAmount: 0,
    };
    setState((prev) => ({ ...prev, goals: [newGoal, ...prev.goals] }));
    setBannerText(`Impian "${newGoal.title}" ditambahkan!`);
    window.setTimeout(() => setBannerText(null), 2200);
  };

  const handleCreateMission = (missionData: Omit<MissionItem, 'id' | 'status'>) => {
    const newMission: MissionItem = {
      ...missionData,
      id: `misi-${Date.now()}`,
      status: 'available',
    };
    setState((prev) => ({ ...prev, missions: [newMission, ...prev.missions] }));
    setBannerText(`Misi "${newMission.title}" diterbitkan!`);
    window.setTimeout(() => setBannerText(null), 2200);
  };

  const handleAnswerQuizCorrect = (questionId: string, points: number) => {
    setState((prev) => {
      if (prev.quizCompletedIds.includes(questionId)) return prev;
      return {
        ...prev,
        starPoints: prev.starPoints + points,
        quizCompletedIds: [...prev.quizCompletedIds, questionId],
      };
    });
    setBurstKey((k) => k + 1);
  };

  const handleResetQuiz = () => {
    setState((prev) => ({ ...prev, quizCompletedIds: [] }));
  };

  const handleResetDemo = () => {
    const fresh = createInitialState();
    setState(fresh);
    setMode('anak');
    setActiveTab('beranda');
    setMascotMood('idle');
    setMascotMessage(TAB_GREETINGS.beranda);
    setBannerText('Data demo berhasil diatur ulang!');
    window.setTimeout(() => setBannerText(null), 2200);
  };

  const handleClearAllToZero = () => {
    const empty = createEmptyState();
    setState(empty);
    setActiveTab('beranda');
    setMascotMood('encourage');
    setMascotMessage('Semua data sudah dibersihkan. Yuk mulai menabung dari Rp 0!');
    setBannerText('Semua data dihapus · Mulai dari Rp 0');
    window.setTimeout(() => setMascotMood('idle'), 1200);
    window.setTimeout(() => setBannerText(null), 2400);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'transaction') {
      setState((prev) => deleteTransaction(prev, pendingDelete.item.id));
      setBannerText('Catatan transaksi dihapus');
    } else if (pendingDelete.kind === 'goal') {
      const refunded =
        pendingDelete.item.collectedAmount > 0 &&
        pendingDelete.item.collectedAmount < pendingDelete.item.targetAmount;
      setState((prev) => deleteGoal(prev, pendingDelete.item.id));
      setBannerText(
        refunded
          ? `Target dihapus · ${formatRupiah(pendingDelete.item.collectedAmount)} kembali ke Pos Impian`
          : 'Target impian dihapus'
      );
    } else if (pendingDelete.kind === 'mission') {
      setState((prev) => deleteMission(prev, pendingDelete.item.id));
      setBannerText('Misi berhasil dihapus');
    }
    window.setTimeout(() => setBannerText(null), 2400);
  };

  const handleModeButtonClick = () => {
    if (mode === 'anak') {
      setPinModalOpen(true);
    } else {
      setMode('anak');
      setBannerText('Kembali ke Mode Anak');
      window.setTimeout(() => setBannerText(null), 1800);
    }
  };

  const navItems: { id: AppTab; label: string; Icon: typeof Home }[] = [
    { id: 'beranda', label: 'Beranda', Icon: Home },
    { id: 'impian', label: 'Impian', Icon: Target },
    { id: 'misi', label: 'Misi', Icon: Trophy },
    { id: 'belajar', label: 'Belajar', Icon: Award },
  ];

  const pendingApprovals = state.missions.filter((m) => m.status === 'pending_approval').length;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 pb-28">
      {/* Celebration Overlay */}
      <CelebrationEffects
        burstKey={burstKey}
        coinFlightKey={coinFlightKey}
        bannerText={bannerText}
      />

      {/* Compact Sticky Top Header (h-14 = 56px, respects 15% mobile sticky cap) */}
      <header className="sticky top-0 z-30 h-14 bg-[#FFFDF7]/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
              <Coins className="h-5 w-5 text-amber-300" />
            </span>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Tabungan Sambara
            </span>
          </div>

          {/* Right Controls: Reset Data + Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              aria-label="Reset atau hapus data"
              className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>Reset</span>
            </button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handleModeButtonClick}
              aria-label={mode === 'anak' ? 'Ganti ke Mode Orang Tua' : 'Kembali ke Mode Anak'}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap border-2 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                mode === 'orang_tua'
                  ? 'bg-sky-600 border-sky-700 text-white shadow-sm'
                  : 'bg-white border-slate-300 text-slate-800 hover:border-sky-400'
              }`}
            >
              {mode === 'orang_tua' ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  <span>Mode Orang Tua</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 text-sky-600" />
                  <span>Mode Anak</span>
                  <Lock className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Parent Mode Helper Strip (inline, non-sticky) */}
      {mode === 'orang_tua' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="rounded-2xl bg-sky-100/80 border-2 border-sky-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-semibold text-sky-950">
            <span>
              Anda sedang berada di <strong>Mode Orang Tua</strong>. Anda dapat menyetujui misi anak dan menambah misi baru.
            </span>
            <button
              type="button"
              onClick={() => handleSwitchTab('misi')}
              className="font-bold text-sky-800 underline cursor-pointer whitespace-nowrap"
            >
              Buka Papan Misi ({pendingApprovals} menunggu)
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === 'beranda' && (
            <BerandaView
              state={state}
              mascotMood={mascotMood}
              mascotMessage={mascotMessage}
              onPokeMascot={handlePokeMascot}
              onOpenDeposit={() => setDepositOpen(true)}
              onOpenWithdraw={(jar = 'jajan') => setWithdrawConfig({ open: true, jar })}
              onDeleteTransaction={(tx) => setPendingDelete({ kind: 'transaction', item: tx })}
              onGoToTab={(tab) => handleSwitchTab(tab)}
            />
          )}

          {activeTab === 'impian' && (
            <ImpianView
              goals={state.goals}
              impianJarBalance={state.jars.impian}
              weeklyAverageSavings={state.weeklyAverageSavings}
              onSelectGoalToFund={(goal) => setGoalToFund(goal)}
              onDeleteGoal={(goal) => setPendingDelete({ kind: 'goal', item: goal })}
              onOpenNewGoal={() => setNewGoalOpen(true)}
            />
          )}

          {activeTab === 'misi' && (
            <MisiView
              missions={state.missions}
              mode={mode}
              onClaimMission={handleClaimMission}
              onApproveMission={handleApproveMission}
              onRejectMission={handleRejectMission}
              onDeleteMission={(mission) => setPendingDelete({ kind: 'mission', item: mission })}
              onRequestParentMode={() => setPinModalOpen(true)}
              onOpenNewMission={() => setNewMissionOpen(true)}
            />
          )}

          {activeTab === 'belajar' && (
            <BelajarView
              streakDays={state.streakDays}
              starPoints={state.starPoints}
              badges={state.badges}
              quizCompletedIds={state.quizCompletedIds}
              onAnswerQuizCorrect={handleAnswerQuizCorrect}
              onResetQuiz={handleResetQuiz}
            />
          )}
        </motion.div>
      </main>

      {/* Floating Bottom Navigation Bar (4 Main Tabs, compact h-16 = 64px) */}
      <nav
        aria-label="Navigasi Utama"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-24px)] max-w-md"
      >
        <div className="h-16 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.12)] px-2 grid grid-cols-4 items-center gap-1">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            const showPendingBadge = id === 'misi' && pendingApprovals > 0;
            return (
              <motion.button
                key={id}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSwitchTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative min-h-[48px] rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                  isActive
                    ? 'bg-sky-100 text-sky-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {showPendingBadge && (
                    <span
                      aria-label={`${pendingApprovals} misi menunggu persetujuan`}
                      className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-extrabold text-white tabular-nums"
                    >
                      {pendingApprovals}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] leading-none whitespace-nowrap ${isActive ? 'font-extrabold' : 'font-semibold'}`}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      <CatatTabunganModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSubmit={handleDepositSubmit}
      />

      <TarikUangModal
        open={withdrawConfig.open}
        defaultJar={withdrawConfig.jar}
        jars={state.jars}
        onClose={() => setWithdrawConfig((prev) => ({ ...prev, open: false }))}
        onSubmit={handleWithdrawSubmit}
      />

      <AllocateGoalModal
        goal={goalToFund}
        impianJarBalance={state.jars.impian}
        onClose={() => setGoalToFund(null)}
        onSubmit={handleAllocateGoalSubmit}
      />

      <ParentPinModal
        open={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={() => {
          setMode('orang_tua');
          setBannerText('Mode Orang Tua Aktif!');
          window.setTimeout(() => setBannerText(null), 2000);
        }}
      />

      <AddGoalModal
        open={newGoalOpen}
        onClose={() => setNewGoalOpen(false)}
        onCreate={handleCreateGoal}
      />

      <AddMissionModal
        open={newMissionOpen}
        onClose={() => setNewMissionOpen(false)}
        onCreate={handleCreateMission}
      />

      <ResetDataModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onResetToDemo={handleResetDemo}
        onClearAllToZero={handleClearAllToZero}
      />

      <ConfirmDeleteModal
        open={!!pendingDelete}
        title={
          pendingDelete?.kind === 'transaction'
            ? 'Hapus Catatan Transaksi?'
            : pendingDelete?.kind === 'goal'
            ? 'Hapus Target Impian?'
            : 'Hapus Misi?'
        }
        description={
          pendingDelete?.kind === 'transaction'
            ? `Catatan "${pendingDelete.item.title}" akan dihapus dari Buku Catatan Virtual. Saldo pos celenganmu tidak berubah.`
            : pendingDelete?.kind === 'goal'
            ? pendingDelete.item.collectedAmount > 0 &&
              pendingDelete.item.collectedAmount < pendingDelete.item.targetAmount
              ? `Target "${pendingDelete.item.title}" akan dihapus dan dana terkumpul sebesar ${formatRupiah(pendingDelete.item.collectedAmount)} akan dikembalikan ke Pos Tabungan Impian.`
              : `Target impian "${pendingDelete.item.title}" akan dihapus dari daftar.`
            : pendingDelete?.kind === 'mission'
            ? `Misi "${pendingDelete.item.title}" akan dihapus dari Papan Misi.`
            : ''
        }
        confirmLabel="Ya, Hapus"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
