import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, KeyRound, Lock, PlusCircle, RotateCcw, Target, Trash2, Wallet, X } from 'lucide-react';
import type { JarBalances, JarKey, MissionItem, SavingsGoal } from '../types/savings';
import { formatRupiah, splitDepositIntoJars, verifyParentPin } from '../utils/ledger';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function ModalShell({ open, onClose, title, children }: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none', transition: { duration: 0.15 } }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96, transition: { duration: 0.14 } }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#FFFDF7] border-2 border-slate-200 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-xl font-bold text-slate-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup modal"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* 1. Catat Tabungan Modal */
interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, note: string) => void;
}

const DEPOSIT_PRESETS = [5000, 10000, 20000, 50000];

export function CatatTabunganModal({ open, onClose, onSubmit }: DepositModalProps) {
  const [amountStr, setAmountStr] = useState('10000');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmountStr('10000');
      setNote('');
      setError('');
    }
  }, [open]);

  const numericAmount = Math.max(0, Math.round(Number(amountStr) || 0));
  const preview = splitDepositIntoJars(numericAmount);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (numericAmount < 500) {
      setError('Minimal catat tabungan Rp 500 ya!');
      return;
    }
    onSubmit(numericAmount, note);
    onClose();
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Catat Tabungan Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="block text-xs font-bold text-slate-600 mb-2">Pilih Cepat</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DEPOSIT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmountStr(String(preset));
                  setError('');
                }}
                className={`min-h-[44px] rounded-2xl px-2 py-2 text-xs font-extrabold tabular-nums border-2 transition-colors cursor-pointer ${
                  numericAmount === preset
                    ? 'bg-sky-100 border-sky-500 text-sky-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300'
                }`}
              >
                {formatRupiah(preset)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="deposit-amount" className="block text-sm font-bold text-slate-800 mb-1.5">
            Nominal Uang (Rp)
          </label>
          <input
            id="deposit-amount"
            type="number"
            min={500}
            step={500}
            value={amountStr}
            onChange={(e) => {
              setAmountStr(e.target.value);
              setError('');
            }}
            className="w-full min-h-[48px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-lg font-extrabold text-slate-900 tabular-nums focus:border-sky-500 focus:outline-none"
            placeholder="Contoh: 20000"
          />
        </div>

        <div>
          <label htmlFor="deposit-note" className="block text-sm font-bold text-slate-800 mb-1.5">
            Catatan Sumber Uang
          </label>
          <input
            id="deposit-note"
            type="text"
            maxLength={60}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[46px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-sky-500 focus:outline-none"
            placeholder="Misal: Sisa uang jajan, hadiah dari Kakek"
          />
        </div>

        {/* Live 70/20/10 Split Preview */}
        <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3.5 space-y-1.5">
          <p className="text-xs font-bold text-sky-900">Pembagian Otomatis ke 3 Pos:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-600 block">Impian 70%</span>
              <strong className="text-sky-800 tabular-nums">{formatRupiah(preview.impian)}</strong>
            </div>
            <div>
              <span className="text-slate-600 block">Jajan 20%</span>
              <strong className="text-orange-700 tabular-nums">{formatRupiah(preview.jajan)}</strong>
            </div>
            <div>
              <span className="text-slate-600 block">Berbagi 10%</span>
              <strong className="text-emerald-700 tabular-nums">{formatRupiah(preview.berbagi)}</strong>
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.94 }}
          className="clay-button-coral min-h-[50px] w-full rounded-2xl px-5 py-3 text-slate-950 font-display text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Simpan ke Celengan</span>
        </motion.button>
      </form>
    </ModalShell>
  );
}

/* 2. Tarik Uang (Jajan) Modal */
interface WithdrawModalProps {
  open: boolean;
  defaultJar: JarKey;
  jars: JarBalances;
  onClose: () => void;
  onSubmit: (amount: number, jar: JarKey, note: string) => string | undefined;
}

export function TarikUangModal({
  open,
  defaultJar,
  jars,
  onClose,
  onSubmit,
}: WithdrawModalProps) {
  const [jar, setJar] = useState<JarKey>(defaultJar);
  const [amountStr, setAmountStr] = useState('5000');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setJar(defaultJar);
      setAmountStr('5000');
      setNote('');
      setError('');
    }
  }, [open, defaultJar]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numericAmount = Math.max(0, Math.round(Number(amountStr) || 0));
    const errMsg = onSubmit(numericAmount, jar, note);
    if (errMsg) {
      setError(errMsg);
    } else {
      onClose();
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Tarik Uang (Minta ke Ayah/Bunda)">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="block text-sm font-bold text-slate-800 mb-2">Ambil dari Pos Mana?</span>
          <div className="grid grid-cols-1 gap-2">
            {(
              [
                { key: 'jajan', label: 'Jajan & Belanja (20%)' },
                { key: 'berbagi', label: 'Berbagi / Sedekah (10%)' },
                { key: 'impian', label: 'Tabungan Impian (70%)' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setJar(item.key);
                  setError('');
                }}
                className={`min-h-[46px] rounded-2xl px-4 py-2.5 flex items-center justify-between border-2 text-sm font-bold cursor-pointer ${
                  jar === item.key
                    ? 'bg-orange-50 border-orange-500 text-orange-950'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className="tabular-nums font-extrabold">{formatRupiah(jars[item.key])}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="withdraw-amount" className="block text-sm font-bold text-slate-800 mb-1.5">
            Nominal Penarikan (Rp)
          </label>
          <input
            id="withdraw-amount"
            type="number"
            min={500}
            step={500}
            value={amountStr}
            onChange={(e) => {
              setAmountStr(e.target.value);
              setError('');
            }}
            className="w-full min-h-[48px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-lg font-extrabold text-slate-900 tabular-nums focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="withdraw-note" className="block text-sm font-bold text-slate-800 mb-1.5">
            Untuk Membeli Apa?
          </label>
          <input
            id="withdraw-note"
            type="text"
            maxLength={60}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[46px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:outline-none"
            placeholder="Misal: Beli es krim atau sedekah Jumat"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.94 }}
          className="clay-button-sky min-h-[50px] w-full rounded-2xl px-5 py-3 text-white font-display text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wallet className="h-5 w-5" />
          <span>Catat Penarikan</span>
        </motion.button>
      </form>
    </ModalShell>
  );
}

/* 3. Allocate to Goal Modal */
interface AllocateGoalModalProps {
  goal: SavingsGoal | null;
  impianJarBalance: number;
  onClose: () => void;
  onSubmit: (goalId: string, amount: number) => string | undefined;
}

export function AllocateGoalModal({
  goal,
  impianJarBalance,
  onClose,
  onSubmit,
}: AllocateGoalModalProps) {
  const remainingNeeded = goal ? Math.max(0, goal.targetAmount - goal.collectedAmount) : 0;
  const suggested = Math.min(impianJarBalance, remainingNeeded, 20000);
  const [amountStr, setAmountStr] = useState(String(suggested));
  const [error, setError] = useState('');

  useEffect(() => {
    if (goal) {
      const rem = Math.max(0, goal.targetAmount - goal.collectedAmount);
      setAmountStr(String(Math.min(impianJarBalance, rem)));
      setError('');
    }
  }, [goal, impianJarBalance]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    const numericAmount = Math.max(0, Math.round(Number(amountStr) || 0));
    const errMsg = onSubmit(goal.id, numericAmount);
    if (errMsg) {
      setError(errMsg);
    } else {
      onClose();
    }
  };

  return (
    <ModalShell open={!!goal} onClose={onClose} title="Tambah ke Target Impian">
      {goal && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-4 space-y-1">
            <p className="font-display text-lg font-bold text-slate-900">{goal.title}</p>
            <p className="text-xs font-semibold text-slate-600 tabular-nums">
              Kekurangan target: <strong className="text-sky-800">{formatRupiah(remainingNeeded)}</strong>
            </p>
            <p className="text-xs font-semibold text-slate-600 tabular-nums">
              Saldo Pos Impian tersedia: <strong className="text-emerald-700">{formatRupiah(impianJarBalance)}</strong>
            </p>
          </div>

          <div>
            <label htmlFor="goal-alloc-amount" className="block text-sm font-bold text-slate-800 mb-1.5">
              Nominal Alokasi (Rp)
            </label>
            <input
              id="goal-alloc-amount"
              type="number"
              min={500}
              step={500}
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value);
                setError('');
              }}
              className="w-full min-h-[48px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-lg font-extrabold text-slate-900 tabular-nums focus:border-sky-500 focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.94 }}
            className="clay-button-coral min-h-[50px] w-full rounded-2xl px-5 py-3 text-slate-950 font-display text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Target className="h-5 w-5" />
            <span>Masukkan ke Impian</span>
          </motion.button>
        </form>
      )}
    </ModalShell>
  );
}

/* 4. Parent PIN Modal (1234) */
interface ParentPinModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ParentPinModal({ open, onClose, onSuccess }: ParentPinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPin('');
      setError('');
    }
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (verifyParentPin(pin)) {
      onSuccess();
      onClose();
    } else {
      setError('PIN salah! Coba masukkan PIN demo: 1234');
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Masuk ke Mode Orang Tua">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-4 flex items-start gap-3">
          <Lock className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700">
            <p className="font-bold text-slate-900">Khusus Ayah &amp; Bunda</p>
            <p className="mt-0.5">
              Masukkan 4 digit PIN untuk menyetujui misi anak atau menambah misi baru. (PIN Demo:{' '}
              <strong className="font-extrabold text-sky-900 tabular-nums">1234</strong>)
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="parent-pin-input" className="block text-sm font-bold text-slate-800 mb-1.5">
            PIN Orang Tua
          </label>
          <input
            id="parent-pin-input"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            autoFocus
            className="w-full min-h-[52px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-center text-2xl font-extrabold tracking-[0.4em] text-slate-900 tabular-nums focus:border-sky-500 focus:outline-none"
            placeholder="••••"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.94 }}
          className="clay-button-sky min-h-[50px] w-full rounded-2xl px-5 py-3 text-white font-display text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <KeyRound className="h-5 w-5" />
          <span>Buka Mode Orang Tua</span>
        </motion.button>
      </form>
    </ModalShell>
  );
}

/* 5. Add New Goal Modal */
interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (goal: Omit<SavingsGoal, 'id' | 'collectedAmount'>) => void;
}

export function AddGoalModal({ open, onClose, onCreate }: AddGoalModalProps) {
  const [title, setTitle] = useState('');
  const [targetStr, setTargetStr] = useState('100000');
  const [iconName, setIconName] = useState<SavingsGoal['iconName']>('backpack');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setTargetStr('100000');
      setIconName('backpack');
      setError('');
    }
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const targetAmount = Math.round(Number(targetStr) || 0);
    if (!title.trim()) {
      setError('Tuliskan nama barang impianmu dulu ya!');
      return;
    }
    if (targetAmount < 5000) {
      setError('Harga target minimal Rp 5.000.');
      return;
    }
    onCreate({
      title: title.trim(),
      targetAmount,
      iconName,
      accentColor: 'amber',
    });
    onClose();
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Buat Impian Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-goal-title" className="block text-sm font-bold text-slate-800 mb-1.5">
            Nama Barang Impian
          </label>
          <input
            id="new-goal-title"
            type="text"
            maxLength={40}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            className="w-full min-h-[46px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-sky-500 focus:outline-none"
            placeholder="Misal: Tas Sekolah Astronot"
          />
        </div>

        <div>
          <label htmlFor="new-goal-target" className="block text-sm font-bold text-slate-800 mb-1.5">
            Harga Target (Rp)
          </label>
          <input
            id="new-goal-target"
            type="number"
            min={5000}
            step={1000}
            value={targetStr}
            onChange={(e) => {
              setTargetStr(e.target.value);
              setError('');
            }}
            className="w-full min-h-[46px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-base font-extrabold text-slate-900 tabular-nums focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="new-goal-icon" className="block text-sm font-bold text-slate-800 mb-1.5">
            Kategori Ikon
          </label>
          <select
            id="new-goal-icon"
            value={iconName}
            onChange={(e) => setIconName(e.target.value as SavingsGoal['iconName'])}
            className="w-full min-h-[46px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-sky-500 focus:outline-none"
          >
            <option value="backpack">Tas &amp; Perlengkapan Sekolah</option>
            <option value="book">Buku &amp; Komik</option>
            <option value="bike">Sepeda &amp; Olahraga</option>
            <option value="shoe">Sepatu</option>
            <option value="lego">Mainan Edukatif</option>
            <option value="guitar">Alat Musik</option>
          </select>
        </div>

        {error && (
          <p role="alert" className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.94 }}
          className="clay-button-sky min-h-[50px] w-full rounded-2xl px-5 py-3 text-white font-display text-base font-bold cursor-pointer"
        >
          Simpan Impian Baru
        </motion.button>
      </form>
    </ModalShell>
  );
}

/* 6. Add New Mission Modal (Parent Mode) */
interface AddMissionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (mission: Omit<MissionItem, 'id' | 'status'>) => void;
}

export function AddMissionModal({ open, onClose, onCreate }: AddMissionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardStr, setRewardStr] = useState('3000');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setRewardStr('3000');
      setError('');
    }
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const reward = Math.round(Number(rewardStr) || 0);
    if (!title.trim()) {
      setError('Nama misi harus diisi.');
      return;
    }
    if (reward < 500) {
      setError('Hadiah minimal Rp 500.');
      return;
    }
    onCreate({
      title: title.trim(),
      description: description.trim() || 'Kerjakan dengan semangat dan rapi!',
      reward,
      iconName: 'broom',
    });
    onClose();
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Tambah Misi Anak Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-mission-title" className="block text-sm font-bold text-slate-800 mb-1.5">
            Judul Misi
          </label>
          <input
            id="new-mission-title"
            type="text"
            maxLength={50}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            className="w-full min-h-[46px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-sky-500 focus:outline-none"
            placeholder="Misal: Membaca Buku Cerita 15 Menit"
          />
        </div>

        <div>
          <label htmlFor="new-mission-desc" className="block text-sm font-bold text-slate-800 mb-1.5">
            Petunjuk Singkat
          </label>
          <input
            id="new-mission-desc"
            type="text"
            maxLength={90}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[46px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-sky-500 focus:outline-none"
            placeholder="Misal: Ceritakan kembali isi bukunya ke Bunda"
          />
        </div>

        <div>
          <label htmlFor="new-mission-reward" className="block text-sm font-bold text-slate-800 mb-1.5">
            Hadiah Saldo Virtual (Rp)
          </label>
          <input
            id="new-mission-reward"
            type="number"
            min={500}
            step={500}
            value={rewardStr}
            onChange={(e) => {
              setRewardStr(e.target.value);
              setError('');
            }}
            className="w-full min-h-[46px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-base font-extrabold text-slate-900 tabular-nums focus:border-sky-500 focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.94 }}
          className="clay-button-sky min-h-[50px] w-full rounded-2xl px-5 py-3 text-white font-display text-base font-bold cursor-pointer"
        >
          Terbitkan Misi
        </motion.button>
      </form>
    </ModalShell>
  );
}

/* 7. Reset & Hapus Semua Data Modal */
interface ResetDataModalProps {
  open: boolean;
  onClose: () => void;
  onResetToDemo: () => void;
  onClearAllToZero: () => void;
}

export function ResetDataModal({
  open,
  onClose,
  onResetToDemo,
  onClearAllToZero,
}: ResetDataModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="Reset &amp; Hapus Data">
      <div className="space-y-4">
        <p className="text-sm text-slate-700 leading-relaxed">
          Pilih cara mengatur ulang data <strong>Tabungan Sambara</strong> di perangkat ini:
        </p>

        <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-4 space-y-3">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Reset ke Data Demo Awal
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Mengembalikan saldo contoh Rp 150.000, daftar impian, misi rumah, dan lencana awal.
            </p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onResetToDemo();
              onClose();
            }}
            className="clay-button-sky min-h-[46px] w-full rounded-2xl px-4 py-2.5 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset ke Data Demo</span>
          </motion.button>
        </div>

        <div className="rounded-2xl bg-rose-50 border-2 border-rose-200 p-4 space-y-3">
          <div>
            <h3 className="font-display text-base font-bold text-rose-950">
              Hapus Semua Data (Mulai dari Rp 0)
            </h3>
            <p className="text-xs text-rose-800 mt-0.5">
              Mengosongkan seluruh saldo pos celengan, catatan transaksi, target impian, dan daftar misi agar bisa mulai dari nol.
            </p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onClearAllToZero();
              onClose();
            }}
            className="min-h-[46px] w-full rounded-2xl px-4 py-2.5 bg-rose-600 hover:bg-rose-700 border-2 border-rose-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_0_0_#9f1239] active:translate-y-0.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Hapus Semua Data (Rp 0)</span>
          </motion.button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="clay-button-white min-h-[44px] w-full rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 cursor-pointer"
        >
          Batal
        </button>
      </div>
    </ModalShell>
  );
}

/* 8. Confirm Delete Item Modal */
interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-rose-50 border-2 border-rose-200 p-4 flex items-start gap-3">
          <Trash2 className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-950 leading-relaxed">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="clay-button-white min-h-[46px] rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-700 cursor-pointer"
          >
            Batal
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="min-h-[46px] rounded-2xl px-4 py-2.5 bg-rose-600 hover:bg-rose-700 border-2 border-rose-700 text-white font-display font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_0_0_#9f1239]"
          >
            <Trash2 className="h-4 w-4" />
            <span>{confirmLabel}</span>
          </motion.button>
        </div>
      </div>
    </ModalShell>
  );
}

