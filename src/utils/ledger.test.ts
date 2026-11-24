import test from 'node:test';
import assert from 'node:assert/strict';
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
  estimateWeeksToGoal,
  formatRupiah,
  getTotalBalance,
  splitDepositIntoJars,
  verifyParentPin,
} from './ledger';

test('initial state has exact Rp 150.000 split 70/20/10', () => {
  const state = createInitialState();
  assert.equal(getTotalBalance(state.jars), 150000);
  assert.equal(state.jars.impian, 105000);
  assert.equal(state.jars.jajan, 30000);
  assert.equal(state.jars.berbagi, 15000);
});

test('splitDepositIntoJars preserves exact Rupiah sum even on odd amounts', () => {
  const split = splitDepositIntoJars(12345);
  assert.equal(split.impian + split.jajan + split.berbagi, 12345);
  const split50k = splitDepositIntoJars(50000);
  assert.deepEqual(split50k, { impian: 35000, jajan: 10000, berbagi: 5000 });
});

test('applyDeposit adds to jars, increments streak, and logs transaction', () => {
  const initial = createInitialState();
  const next = applyDeposit(initial, 50000, 'Uang saku Kakek');
  assert.equal(getTotalBalance(next.jars), 200000);
  assert.equal(next.jars.impian, 140000);
  assert.equal(next.jars.jajan, 40000);
  assert.equal(next.jars.berbagi, 20000);
  assert.equal(next.streakDays, initial.streakDays + 1);
  assert.equal(next.transactions[0].title, 'Uang saku Kakek');
});

test('applyWithdrawal validates balance and deducts from selected jar', () => {
  const initial = createInitialState();
  const tooMuch = applyWithdrawal(initial, 50000, 'jajan', 'Beli mainan');
  assert.ok(tooMuch.error);
  assert.equal(tooMuch.nextState.jars.jajan, 30000);

  const valid = applyWithdrawal(initial, 10000, 'jajan', 'Beli roti');
  assert.equal(valid.error, undefined);
  assert.equal(valid.nextState.jars.jajan, 20000);
  assert.equal(getTotalBalance(valid.nextState.jars), 140000);
});

test('allocateToGoal moves money from Tabungan Impian to goal and detects completion', () => {
  const initial = createInitialState();
  // Buku Komik Sains has target 85,000 and collected 65,000 -> needs 20,000
  const res = allocateToGoal(initial, 'goal-komik', 20000);
  assert.equal(res.error, undefined);
  assert.equal(res.reachedTarget, true);
  assert.equal(res.nextState.jars.impian, 85000);
  const goal = res.nextState.goals.find((g) => g.id === 'goal-komik')!;
  assert.equal(goal.collectedAmount, 85000);
});

test('mission lifecycle: claim -> approve updates balance', () => {
  const initial = createInitialState();
  const claimed = claimMission(initial, 'misi-kasur');
  assert.equal(
    claimed.missions.find((m) => m.id === 'misi-kasur')?.status,
    'pending_approval'
  );
  const approved = approveMission(claimed, 'misi-kasur');
  assert.equal(
    approved.missions.find((m) => m.id === 'misi-kasur')?.status,
    'approved'
  );
  assert.equal(getTotalBalance(approved.jars), 152000);
});

test('estimateWeeksToGoal and formatRupiah behave accurately', () => {
  const state = createInitialState();
  const komik = state.goals[0]; // remaining 20,000; 70% of 35,000 = 24,500/wk -> 1 week
  assert.equal(estimateWeeksToGoal(komik, state.weeklyAverageSavings), 1);
  assert.equal(formatRupiah(150000), 'Rp 150.000');
  assert.equal(verifyParentPin('1234'), true);
  assert.equal(verifyParentPin('9999'), false);
});

test('deleteTransaction removes entry from transaction list', () => {
  const initial = createInitialState();
  const next = deleteTransaction(initial, 'tx-1');
  assert.equal(next.transactions.length, initial.transactions.length - 1);
  assert.equal(next.transactions.some((tx) => tx.id === 'tx-1'), false);
});

test('deleteGoal refunds unreached collectedAmount to Pos Impian and removes goal', () => {
  const initial = createInitialState();
  // Buku Komik Sains has collectedAmount 65,000 (< 85,000), jars.impian is 105,000
  const next = deleteGoal(initial, 'goal-komik');
  assert.equal(next.goals.length, initial.goals.length - 1);
  assert.equal(next.goals.some((g) => g.id === 'goal-komik'), false);
  assert.equal(next.jars.impian, 170000);
});

test('deleteMission removes mission from list', () => {
  const initial = createInitialState();
  const next = deleteMission(initial, 'misi-kasur');
  assert.equal(next.missions.length, initial.missions.length - 1);
  assert.equal(next.missions.some((m) => m.id === 'misi-kasur'), false);
});

test('createEmptyState resets balances, streak, goals, missions, transactions, and badges', () => {
  const empty = createEmptyState();
  assert.equal(getTotalBalance(empty.jars), 0);
  assert.equal(empty.streakDays, 0);
  assert.equal(empty.starPoints, 0);
  assert.equal(empty.transactions.length, 0);
  assert.equal(empty.goals.length, 0);
  assert.equal(empty.missions.length, 0);
  assert.equal(empty.badges.every((b) => !b.unlocked), true);
});

