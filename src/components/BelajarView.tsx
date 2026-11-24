import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  CheckCircle2,
  Flame,
  Heart,
  HelpCircle,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Trophy,
  XCircle,
} from 'lucide-react';
import type { BadgeItem } from '../types/savings';
import { QUIZ_QUESTIONS } from '../utils/ledger';

interface BelajarViewProps {
  streakDays: number;
  starPoints: number;
  badges: BadgeItem[];
  quizCompletedIds: string[];
  onAnswerQuizCorrect: (questionId: string, points: number) => void;
  onResetQuiz: () => void;
}

const BADGE_ICON_MAP = {
  star: Star,
  shield: Shield,
  sparkles: Sparkles,
  heart: Heart,
  trophy: Trophy,
  flame: Flame,
};

const BADGE_COLOR_MAP = {
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
  sky: 'bg-sky-100 text-sky-700 border-sky-300',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  coral: 'bg-orange-100 text-orange-700 border-orange-300',
};

const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function BelajarView({
  streakDays,
  starPoints,
  badges,
  quizCompletedIds,
  onAnswerQuizCorrect,
  onResetQuiz,
}: BelajarViewProps) {
  const [flippedBadgeIds, setFlippedBadgeIds] = useState<Record<string, boolean>>({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<'kebutuhan' | 'keinginan' | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[quizIndex];
  const allQuizDone = quizIndex >= QUIZ_QUESTIONS.length;

  const toggleFlip = (id: string) => {
    setFlippedBadgeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChooseAnswer = (choice: 'kebutuhan' | 'keinginan') => {
    if (!currentQuestion || selectedChoice !== null) return;
    setSelectedChoice(choice);
    if (choice === currentQuestion.correctAnswer) {
      onAnswerQuizCorrect(currentQuestion.id, currentQuestion.points);
    }
  };

  const handleNextQuestion = () => {
    setSelectedChoice(null);
    setQuizIndex((prev) => prev + 1);
  };

  const handleRestartQuiz = () => {
    setSelectedChoice(null);
    setQuizIndex(0);
    onResetQuiz();
  };

  const activeDaysCount = Math.min(7, streakDays % 7 === 0 && streakDays > 0 ? 7 : streakDays % 7);

  return (
    <div className="space-y-6">
      {/* Top Bento Row: Streak Menabung & Quiz Mini */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Streak Card (5 cols) */}
        <section
          aria-label="Streak Menabung"
          className="lg:col-span-5 clay-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 bg-gradient-to-br from-amber-50/70 to-white border-amber-200"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500 fill-amber-400" />
                Streak Menabung
              </span>
              <span className="text-sm font-extrabold text-amber-800 flex items-center gap-1 tabular-nums">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                {starPoints} Bintang
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-slate-900 tabular-nums">
                {streakDays} Hari
              </span>
              <span className="text-sm font-semibold text-slate-600">berturut-turut!</span>
            </div>
            <p className="text-sm text-slate-600 mt-1.5">
              Menyisihkan uang jajan setiap hari membuat impianmu makin cepat tercapai.
            </p>
            <div className="mt-3 rounded-2xl bg-white/90 border border-amber-200 px-3.5 py-2.5 text-xs font-semibold text-amber-900">
              Target berikutnya: <strong className="font-extrabold">14 Hari</strong> · Bonus +50 Bintang
            </div>
          </div>

          {/* 7-day Streak Indicator */}
          <div className="grid grid-cols-7 gap-2 pt-2">
            {DAYS_OF_WEEK.map((day, idx) => {
              const lit = idx < activeDaysCount;
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-transform ${
                      lit
                        ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                    aria-label={`${day}: ${lit ? 'Sudah menabung' : 'Belum'}`}
                  >
                    <Flame className={`h-5 w-5 ${lit ? 'fill-orange-500 text-orange-600' : ''}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{day}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Mini Quiz: Kebutuhan vs Keinginan (7 cols) */}
        <section
          aria-label="Kuis Mini Kebutuhan vs Keinginan"
          className="lg:col-span-7 clay-card-sky rounded-3xl p-5 sm:p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-sky-900">
              <HelpCircle className="h-5 w-5 text-sky-600" />
              <h2 className="font-display text-xl font-bold">
                Kuis Cerdas: Kebutuhan vs Keinginan
              </h2>
            </div>
            {!allQuizDone && (
              <span className="text-xs font-bold text-sky-800 tabular-nums whitespace-nowrap">
                Soal {quizIndex + 1} / {QUIZ_QUESTIONS.length}
              </span>
            )}
          </div>

          {allQuizDone ? (
            <div className="rounded-3xl bg-white p-6 border-2 border-sky-200 text-center space-y-3 my-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Trophy className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                Hebat! Kuis Selesai
              </h3>
              <p className="text-sm text-slate-600">
                Kamu sudah menyelesaikan semua pertanyaan! Total soal terjawab benar:{' '}
                <strong className="tabular-nums text-sky-800">
                  {quizCompletedIds.length} / {QUIZ_QUESTIONS.length}
                </strong>
              </p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={handleRestartQuiz}
                className="clay-button-white min-h-[44px] px-5 py-2.5 rounded-2xl font-display font-bold text-sm text-slate-800 inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Main Lagi</span>
              </motion.button>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-5 border-2 border-sky-200 space-y-4">
              <div>
                <p className="text-xs font-bold text-sky-700 mb-1">Situasi:</p>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {currentQuestion.itemTitle}
                </h3>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {currentQuestion.scenario}
                </p>
              </div>

              {/* Choice Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  disabled={selectedChoice !== null}
                  onClick={() => handleChooseAnswer('kebutuhan')}
                  className={`min-h-[48px] rounded-2xl px-4 py-3 font-display font-bold text-base border-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                    selectedChoice === 'kebutuhan'
                      ? currentQuestion.correctAnswer === 'kebutuhan'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                        : 'bg-rose-100 border-rose-400 text-rose-950'
                      : 'bg-sky-50 border-sky-200 text-sky-950 hover:bg-sky-100 disabled:opacity-60'
                  }`}
                >
                  Kebutuhan (Penting)
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  disabled={selectedChoice !== null}
                  onClick={() => handleChooseAnswer('keinginan')}
                  className={`min-h-[48px] rounded-2xl px-4 py-3 font-display font-bold text-base border-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 ${
                    selectedChoice === 'keinginan'
                      ? currentQuestion.correctAnswer === 'keinginan'
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                        : 'bg-rose-100 border-rose-400 text-rose-950'
                      : 'bg-orange-50 border-orange-200 text-orange-950 hover:bg-orange-100 disabled:opacity-60'
                  }`}
                >
                  Keinginan (Bisa Ditunda)
                </motion.button>
              </div>

              {/* Answer Feedback */}
              {selectedChoice !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 ${
                    selectedChoice === currentQuestion.correctAnswer
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {selectedChoice === currentQuestion.correctAnswer ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    <div className="text-sm">
                      <p className="font-bold">
                        {selectedChoice === currentQuestion.correctAnswer
                          ? `Benar! +${currentQuestion.points} Bintang`
                          : 'Kurang tepat, yuk belajar bareng!'}
                      </p>
                      <p className="text-slate-700 mt-0.5">{currentQuestion.explanation}</p>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={handleNextQuestion}
                    className="clay-button-sky min-h-[44px] px-4 py-2 rounded-xl text-white font-display font-bold text-sm shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    {quizIndex + 1 >= QUIZ_QUESTIONS.length ? 'Lihat Hasil' : 'Soal Berikutnya'}
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Koleksi Lencana (3D Flip Interactive Cards) */}
      <section aria-label="Koleksi Lencana">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3.5">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-6 w-6 text-amber-500" />
              Koleksi Lencana Sambara
            </h2>
            <p className="text-sm text-slate-600">
              Klik kartu lencana untuk membalik dan melihat cara mendapatkannya!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {badges.map((badge) => {
            const Icon = BADGE_ICON_MAP[badge.iconName] ?? Award;
            const isFlipped = !!flippedBadgeIds[badge.id];
            const colorClass = BADGE_COLOR_MAP[badge.color];

            return (
              <div key={badge.id} className="perspective-1000 h-44">
                <button
                  type="button"
                  onClick={() => toggleFlip(badge.id)}
                  aria-pressed={isFlipped}
                  aria-label={`Lencana ${badge.title}: ${badge.unlocked ? 'Sudah terbuka' : 'Terkunci'}. Klik untuk balik kartu.`}
                  className="relative h-full w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400 rounded-3xl"
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    className="preserve-3d relative h-full w-full"
                  >
                    {/* Front Face */}
                    <div
                      className={`backface-hidden clay-card absolute inset-0 rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-3 ${
                        badge.unlocked ? '' : 'opacity-80 bg-slate-50'
                      }`}
                    >
                      <div
                        className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${
                          badge.unlocked
                            ? colorClass
                            : 'bg-slate-200 text-slate-500 border-slate-300'
                        }`}
                      >
                        <Icon className="h-8 w-8" />
                        {!badge.unlocked && (
                          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white">
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-slate-900">
                          {badge.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {badge.unlocked
                            ? `Terbuka · ${badge.unlockedDate}`
                            : badge.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Back Face (3D Flipped) */}
                    <div className="backface-hidden rotate-y-180 clay-card-sky absolute inset-0 rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-2">
                      <span className="text-xs font-bold text-sky-800">Cara Meraih Lencana</span>
                      <h4 className="font-display text-base font-bold text-slate-900">
                        {badge.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-snug">
                        {badge.howToEarn}
                      </p>
                      <span className="text-xs font-bold text-sky-700 mt-1">
                        Klik untuk balik lagi
                      </span>
                    </div>
                  </motion.div>
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
