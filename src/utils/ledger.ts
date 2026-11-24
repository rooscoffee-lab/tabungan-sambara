import type {
  JarBalances,
  JarKey,
  LedgerTransaction,
  QuizQuestion,
  SambaraAppState,
  SavingsGoal,
} from '../types/savings';

export const PARENT_PIN = '1234';

export const JAR_RATIOS: Record<JarKey, number> = {
  impian: 0.7,
  jajan: 0.2,
  berbagi: 0.1,
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-seragam',
    itemTitle: 'Buku Tulis & Pensil Baru',
    scenario: 'Buku tulismu sudah penuh semua dan besok ada pelajaran Matematika di sekolah.',
    correctAnswer: 'kebutuhan',
    explanation: 'Tepat! Alat tulis untuk belajar di sekolah adalah kebutuhan pokok yang wajib didahulukan.',
    points: 20,
  },
  {
    id: 'q-mainan',
    itemTitle: 'Gantungan Kunci Robot Koleksi',
    scenario: 'Di depan sekolah ada gantungan kunci robot edisi baru, padahal di rumah sudah punya 4.',
    correctAnswer: 'keinginan',
    explanation: 'Pintar! Barang koleksi yang tidak mendesak termasuk keinginan. Uangnya bisa ditabung dulu!',
    points: 20,
  },
  {
    id: 'q-sepatu',
    itemTitle: 'Sepatu Sekolah yang Solnya Lepas',
    scenario: 'Sepatu sekolahmu sobek dan basah saat dipakai jalan ke kelas.',
    correctAnswer: 'kebutuhan',
    explanation: 'Benar sekali! Sepatu yang layak untuk ke sekolah adalah kebutuhan agar kaki terlindungi.',
    points: 20,
  },
];

export function formatRupiah(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('id-ID').format(abs);
  return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

export function getTotalBalance(jars: JarBalances): number {
  return jars.impian + jars.jajan + jars.berbagi;
}

/**
 * Splits a deposit into 70% Impian, 20% Jajan, 10% Berbagi without losing remainder Rupiah.
 */
export function splitDepositIntoJars(amount: number): JarBalances {
  if (amount <= 0) {
    return { impian: 0, jajan: 0, berbagi: 0 };
  }
  const jajan = Math.floor(amount * JAR_RATIOS.jajan);
  const berbagi = Math.floor(amount * JAR_RATIOS.berbagi);
  const impian = amount - jajan - berbagi;
  return { impian, jajan, berbagi };
}

export function estimateWeeksToGoal(goal: SavingsGoal, weeklyAverageSavings: number): number {
  const remaining = Math.max(0, goal.targetAmount - goal.collectedAmount);
  if (remaining === 0) return 0;
  // 70% of weekly savings goes to Tabungan Impian
  const effectiveWeeklyGoalRate = Math.max(5000, Math.round(weeklyAverageSavings * JAR_RATIOS.impian));
  return Math.ceil(remaining / effectiveWeeklyGoalRate);
}

export function formatEtaLabel(weeks: number): string {
  if (weeks <= 0) return 'Target Tercapai!';
  if (weeks === 1) return 'Sekitar 1 minggu lagi';
  if (weeks < 4) return `Sekitar ${weeks} minggu lagi`;
  const months = Math.round(weeks / 4);
  if (months === 1) return 'Sekitar 1 bulan lagi';
  return `Sekitar ${months} bulan lagi`;
}

export function createInitialState(): SambaraAppState {
  // Initial total = Rp 150.000 (70% = 105.000, 20% = 30.000, 10% = 15.000)
  return {
    childName: 'Sambara',
    jars: {
      impian: 105000,
      jajan: 30000,
      berbagi: 15000,
    },
    weeklyAverageSavings: 35000,
    streakDays: 7,
    starPoints: 120,
    transactions: [
      {
        id: 'tx-1',
        type: 'deposit',
        title: 'Sisa Uang Jajan Mingguan',
        amount: 25000,
        dateISO: '2026-11-17T08:30:00.000Z',
        note: 'Disimpan oleh Bunda',
      },
      {
        id: 'tx-2',
        type: 'mission_reward',
        title: 'Misi: Membantu Cuci Piring',
        amount: 5000,
        dateISO: '2026-11-16T14:15:00.000Z',
        note: 'Disetujui Ayah',
      },
      {
        id: 'tx-3',
        type: 'withdraw',
        title: 'Beli Es Krim Bareng Teman',
        amount: -10000,
        jar: 'jajan',
        dateISO: '2026-11-15T15:00:00.000Z',
        note: 'Dari Pos Jajan & Belanja',
      },
    ],
    goals: [
      {
        id: 'goal-komik',
        title: 'Buku Komik Sains Seru',
        iconName: 'book',
        targetAmount: 85000,
        collectedAmount: 65000,
        accentColor: 'sky',
      },
      {
        id: 'goal-futsal',
        title: 'Sepatu Futsal Keren',
        iconName: 'shoe',
        targetAmount: 250000,
        collectedAmount: 110000,
        accentColor: 'coral',
      },
      {
        id: 'goal-sepeda',
        title: 'Sepeda Gunung Mini',
        iconName: 'bike',
        targetAmount: 850000,
        collectedAmount: 220000,
        accentColor: 'emerald',
      },
    ],
    missions: [
      {
        id: 'misi-kasur',
        title: 'Merapikan Tempat Tidur',
        description: 'Rapikan bantal dan lipat selimut setiap pagi sebelum berangkat sekolah.',
        reward: 2000,
        iconName: 'bed',
        status: 'available',
      },
      {
        id: 'misi-tanaman',
        title: 'Menyiram Tanaman Teras',
        description: 'Siram semua pot bunga dan tanaman cabai di teras rumah pada sore hari.',
        reward: 3000,
        iconName: 'plant',
        status: 'available',
      },
      {
        id: 'misi-piring',
        title: 'Membantu Cuci Piring',
        description: 'Cuci gelas dan piring makan malam bersama Bunda di dapur.',
        reward: 5000,
        iconName: 'dish',
        status: 'pending_approval',
      },
      {
        id: 'misi-sepatu',
        title: 'Menyemir & Merapikan Sepatu',
        description: 'Bersihkan sepatu sekolah dan susun rapi di rak sepatu.',
        reward: 4000,
        iconName: 'shoe',
        status: 'available',
      },
    ],
    badges: [
      {
        id: 'badge-pemula',
        title: 'Penabung Pemula',
        subtitle: 'Setoran Pertama',
        howToEarn: 'Berhasil mencatat tabungan virtual pertama kali bersama Ayah/Bunda.',
        iconName: 'star',
        unlocked: true,
        unlockedDate: '10 Nov 2026',
        color: 'amber',
      },
      {
        id: 'badge-streak',
        title: 'Anti Jajan Impulsif',
        subtitle: '7 Hari Menabung',
        howToEarn: 'Menyisihkan uang jajan 7 hari berturut-turut tanpa bolong!',
        iconName: 'flame',
        unlocked: true,
        unlockedDate: '17 Nov 2026',
        color: 'coral',
      },
      {
        id: 'badge-bersih',
        title: 'Pahlawan Kebersihan',
        subtitle: 'Selesaikan Misi Rumah',
        howToEarn: 'Rajin membantu tugas rumah tangga dan disetujui oleh orang tua.',
        iconName: 'shield',
        unlocked: true,
        unlockedDate: '16 Nov 2026',
        color: 'emerald',
      },
      {
        id: 'badge-berbagi',
        title: 'Anak Dermawan',
        subtitle: 'Pos Berbagi Rp 25.000',
        howToEarn: 'Kumpulkan minimal Rp 25.000 di Pos Berbagi / Sedekah untuk membantu sesama.',
        iconName: 'heart',
        unlocked: false,
        color: 'sky',
      },
    ],
    quizCompletedIds: [],
  };
}

export function applyDeposit(
  state: SambaraAppState,
  amount: number,
  note: string,
  sourceType: 'deposit' | 'mission_reward' = 'deposit',
  customTitle?: string
): SambaraAppState {
  if (amount <= 0) return state;
  const split = splitDepositIntoJars(amount);
  const nextJars: JarBalances = {
    impian: state.jars.impian + split.impian,
    jajan: state.jars.jajan + split.jajan,
    berbagi: state.jars.berbagi + split.berbagi,
  };
  const newTx: LedgerTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: sourceType,
    title: customTitle ?? (note.trim() || 'Setoran Tabungan'),
    amount,
    dateISO: new Date().toISOString(),
    note: sourceType === 'mission_reward' ? 'Hadiah Misi Disetujui' : 'Uang tunai dipegang Orang Tua',
  };

  // Unlock Anak Dermawan badge if berbagi reaches 25,000
  const nextBadges = state.badges.map((b) =>
    b.id === 'badge-berbagi' && !b.unlocked && nextJars.berbagi >= 25000
      ? { ...b, unlocked: true, unlockedDate: 'Hari Ini' }
      : b
  );

  return {
    ...state,
    jars: nextJars,
    streakDays: sourceType === 'deposit' ? state.streakDays + 1 : state.streakDays,
    starPoints: state.starPoints + 10,
    transactions: [newTx, ...state.transactions].slice(0, 20),
    badges: nextBadges,
  };
}

export function applyWithdrawal(
  state: SambaraAppState,
  amount: number,
  jar: JarKey,
  note: string
): { nextState: SambaraAppState; error?: string } {
  if (amount <= 0) {
    return { nextState: state, error: 'Nominal harus lebih dari Rp 0.' };
  }
  if (amount > state.jars[jar]) {
    const jarLabel =
      jar === 'impian' ? 'Tabungan Impian' : jar === 'jajan' ? 'Jajan & Belanja' : 'Berbagi / Sedekah';
    return {
      nextState: state,
      error: `Saldo di pos ${jarLabel} hanya ${formatRupiah(state.jars[jar])}.`,
    };
  }
  const nextJars: JarBalances = {
    ...state.jars,
    [jar]: state.jars[jar] - amount,
  };
  const newTx: LedgerTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'withdraw',
    title: note.trim() || 'Tarik Uang Jajan',
    amount: -amount,
    jar,
    dateISO: new Date().toISOString(),
    note:
      jar === 'jajan'
        ? 'Dari Pos Jajan & Belanja'
        : jar === 'berbagi'
        ? 'Disalurkan dari Pos Berbagi'
        : 'Dari Pos Tabungan Impian',
  };
  return {
    nextState: {
      ...state,
      jars: nextJars,
      transactions: [newTx, ...state.transactions].slice(0, 20),
    },
  };
}

export function allocateToGoal(
  state: SambaraAppState,
  goalId: string,
  amount: number
): { nextState: SambaraAppState; reachedTarget: boolean; error?: string } {
  if (amount <= 0) {
    return { nextState: state, reachedTarget: false, error: 'Nominal alokasi harus lebih dari Rp 0.' };
  }
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) {
    return { nextState: state, reachedTarget: false, error: 'Target impian tidak ditemukan.' };
  }
  const remainingNeeded = Math.max(0, goal.targetAmount - goal.collectedAmount);
  if (remainingNeeded === 0) {
    return { nextState: state, reachedTarget: true, error: 'Target impian ini sudah penuh tercapai!' };
  }
  const actualAmount = Math.min(amount, remainingNeeded);
  if (actualAmount > state.jars.impian) {
    return {
      nextState: state,
      reachedTarget: false,
      error: `Saldo Pos Tabungan Impian hanya ${formatRupiah(state.jars.impian)}.`,
    };
  }

  const nextGoals = state.goals.map((g) =>
    g.id === goalId ? { ...g, collectedAmount: g.collectedAmount + actualAmount } : g
  );
  const updatedGoal = nextGoals.find((g) => g.id === goalId)!;
  const reachedTarget = updatedGoal.collectedAmount >= updatedGoal.targetAmount;

  const newTx: LedgerTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'goal_allocation',
    title: `Alokasi ke ${goal.title}`,
    amount: -actualAmount,
    jar: 'impian',
    dateISO: new Date().toISOString(),
    note: reachedTarget ? 'Target Impian Tercapai!' : 'Masuk ke Celengan Impian',
  };

  return {
    nextState: {
      ...state,
      jars: {
        ...state.jars,
        impian: state.jars.impian - actualAmount,
      },
      goals: nextGoals,
      starPoints: state.starPoints + (reachedTarget ? 50 : 15),
      transactions: [newTx, ...state.transactions].slice(0, 20),
    },
    reachedTarget,
  };
}

export function claimMission(state: SambaraAppState, missionId: string): SambaraAppState {
  return {
    ...state,
    missions: state.missions.map((m) =>
      m.id === missionId && m.status === 'available'
        ? { ...m, status: 'pending_approval', completedAtISO: new Date().toISOString() }
        : m
    ),
  };
}

export function approveMission(state: SambaraAppState, missionId: string): SambaraAppState {
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission || mission.status !== 'pending_approval') return state;

  const updatedMissions = state.missions.map((m) =>
    m.id === missionId ? { ...m, status: 'approved' as const } : m
  );

  const deposited = applyDeposit(
    { ...state, missions: updatedMissions },
    mission.reward,
    mission.title,
    'mission_reward',
    `Misi: ${mission.title}`
  );

  return deposited;
}

export function rejectMission(state: SambaraAppState, missionId: string): SambaraAppState {
  return {
    ...state,
    missions: state.missions.map((m) =>
      m.id === missionId && m.status === 'pending_approval'
        ? { ...m, status: 'available', completedAtISO: undefined }
        : m
    ),
  };
}

export function deleteTransaction(state: SambaraAppState, transactionId: string): SambaraAppState {
  return {
    ...state,
    transactions: state.transactions.filter((tx) => tx.id !== transactionId),
  };
}

export function deleteGoal(state: SambaraAppState, goalId: string): SambaraAppState {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return state;
  const shouldRefund = goal.collectedAmount > 0 && goal.collectedAmount < goal.targetAmount;
  return {
    ...state,
    jars: shouldRefund
      ? { ...state.jars, impian: state.jars.impian + goal.collectedAmount }
      : state.jars,
    goals: state.goals.filter((g) => g.id !== goalId),
  };
}

export function deleteMission(state: SambaraAppState, missionId: string): SambaraAppState {
  return {
    ...state,
    missions: state.missions.filter((m) => m.id !== missionId),
  };
}

export function createEmptyState(): SambaraAppState {
  const base = createInitialState();
  return {
    childName: base.childName,
    jars: {
      impian: 0,
      jajan: 0,
      berbagi: 0,
    },
    weeklyAverageSavings: 35000,
    streakDays: 0,
    starPoints: 0,
    transactions: [],
    goals: [],
    missions: [],
    badges: base.badges.map((b) => ({
      ...b,
      unlocked: false,
      unlockedDate: undefined,
    })),
    quizCompletedIds: [],
  };
}

export function verifyParentPin(pin: string): boolean {
  return pin.trim() === PARENT_PIN;
}

