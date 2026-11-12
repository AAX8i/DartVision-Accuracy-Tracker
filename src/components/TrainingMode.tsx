import React, { useState } from 'react';
import { DartboardSvg } from './DartboardSvg';
import { CameraScanModal } from './CameraScanModal';
import { evaluateTargetHit, isDoubleDart, parseSegment } from '../utils/dartMath';
import { saveTrainingTurn, loadState } from '../utils/storage';
import { DartThrow, TrainingDrillType } from '../types/dart';
import {
  Target,
  Camera,
  Check,
  RotateCcw,
  Save,
  Crosshair,
  ChevronRight,
  Flame,
  Award,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface TrainingSlot {
  actual: DartThrow | null;
  target: string;
  isHit: boolean;
}

export const TrainingMode: React.FC = () => {
  // Drill selection
  const [activeDrill, setActiveDrill] = useState<TrainingDrillType>('free-throw');

  // --- FREE-THROW MODE STATE ---
  const [freeSlots, setFreeSlots] = useState<TrainingSlot[]>([
    { actual: null, target: '20', isHit: false },
    { actual: null, target: '20', isHit: false },
    { actual: null, target: '20', isHit: false },
  ]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [sessionTurnsSaved, setSessionTurnsSaved] = useState(0);
  const [turnFeedback, setTurnFeedback] = useState<string | null>(null);

  // --- AROUND THE CLOCK STATE ---
  // Sequence: 1 to 20, then Bull (OB/IB)
  const [atcTargetNum, setAtcTargetNum] = useState<number>(1);
  const [atcDartsThrown, setAtcDartsThrown] = useState<number>(0);
  const [atcTurnDarts, setAtcTurnDarts] = useState<DartThrow[]>([]);
  const [atcCompleted, setAtcCompleted] = useState<boolean>(false);

  // --- BOB'S 27 STATE ---
  // Starts at 27 pts, throws 3 darts at D1 to D20
  const [bobsTargetNum, setBobsTargetNum] = useState<number>(1);
  const [bobsScore, setBobsScore] = useState<number>(27);
  const [bobsTurnDarts, setBobsTurnDarts] = useState<DartThrow[]>([]);
  const [bobsGameOver, setBobsGameOver] = useState<boolean>(false);
  const [bobsCompleted, setBobsCompleted] = useState<boolean>(false);

  // --- 121 CHECKOUT CHALLENGE STATE ---
  const [c121Target, setC121Target] = useState<number>(121);
  const [c121Remaining, setC121Remaining] = useState<number>(121);
  const [c121DartsLeft, setC121DartsLeft] = useState<number>(9);
  const [c121TurnDarts, setC121TurnDarts] = useState<DartThrow[]>([]);
  const [c121Streak, setC121Streak] = useState<number>(0);
  const [c121Feedback, setC121Feedback] = useState<string | null>(null);

  // Vision AI modal
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const state = loadState();

  // ---------------- FREE-THROW HANDLERS ----------------
  const handleFreeDartSelect = (dart: DartThrow) => {
    let targetIndex = activeSlotIndex;
    if (freeSlots[targetIndex]?.actual !== null) {
      const nextEmpty = freeSlots.findIndex((s) => s.actual === null);
      if (nextEmpty !== -1) {
        targetIndex = nextEmpty;
      }
    }

    if (targetIndex >= 3) return;

    const currentSlot = freeSlots[targetIndex];
    const targetCandidate = currentSlot.target || '20';
    const isHit = evaluateTargetHit(dart.segment, targetCandidate);

    const updated = [...freeSlots];
    updated[targetIndex] = {
      actual: dart,
      target: targetCandidate,
      isHit,
    };
    setFreeSlots(updated);

    if (targetIndex < 2) {
      setActiveSlotIndex(targetIndex + 1);
    }
  };

  const handleFreeSaveTurn = () => {
    const isComplete = freeSlots.every((s) => s.actual !== null);
    if (!isComplete) return;

    const throwsToSave = freeSlots.map((s) => ({
      actual: s.actual!.segment,
      target: s.target,
      isHit: s.isHit,
    }));

    saveTrainingTurn(throwsToSave);
    const turnHits = freeSlots.filter((s) => s.isHit).length;
    setSessionTurnsSaved((prev) => prev + 1);
    setTurnFeedback(`Training turn saved! (${turnHits}/3 hits on target)`);

    setFreeSlots([
      { actual: null, target: freeSlots[0].target, isHit: false },
      { actual: null, target: freeSlots[1].target, isHit: false },
      { actual: null, target: freeSlots[2].target, isHit: false },
    ]);
    setActiveSlotIndex(0);

    setTimeout(() => {
      setTurnFeedback(null);
    }, 2500);
  };

  // ---------------- AROUND THE CLOCK HANDLERS ----------------
  const handleAtcDart = (dart: DartThrow) => {
    if (atcCompleted || atcTurnDarts.length >= 3) return;

    const targetStr = atcTargetNum === 21 ? 'OB' : atcTargetNum.toString();
    const isHit = atcTargetNum === 21
      ? dart.segment === 'OB' || dart.segment === 'IB'
      : dart.number === atcTargetNum;

    const newTurn = [...atcTurnDarts, dart];
    setAtcTurnDarts(newTurn);
    setAtcDartsThrown((prev) => prev + 1);

    if (isHit) {
      if (atcTargetNum >= 21) {
        setAtcCompleted(true);
      } else {
        setAtcTargetNum((prev) => prev + 1);
      }
    }
  };

  const handleAtcNextTurn = () => {
    setAtcTurnDarts([]);
  };

  const handleAtcReset = () => {
    setAtcTargetNum(1);
    setAtcDartsThrown(0);
    setAtcTurnDarts([]);
    setAtcCompleted(false);
  };

  // ---------------- BOB'S 27 HANDLERS ----------------
  const handleBobsDart = (dart: DartThrow) => {
    if (bobsGameOver || bobsCompleted || bobsTurnDarts.length >= 3) return;
    const newTurn = [...bobsTurnDarts, dart];
    setBobsTurnDarts(newTurn);
  };

  const handleBobsConfirmTurn = () => {
    if (bobsTurnDarts.length === 0) return;

    const targetDouble = `D${bobsTargetNum}`;
    const doubleValue = bobsTargetNum * 2;
    const hits = bobsTurnDarts.filter((d) => d.segment === targetDouble).length;

    let newScore = bobsScore;
    if (hits > 0) {
      newScore += hits * doubleValue;
    } else {
      newScore -= doubleValue;
    }

    setBobsScore(newScore);

    if (newScore <= 0) {
      setBobsGameOver(true);
    } else if (bobsTargetNum >= 20) {
      setBobsCompleted(true);
    } else {
      setBobsTargetNum((prev) => prev + 1);
    }
    setBobsTurnDarts([]);
  };

  const handleBobsReset = () => {
    setBobsTargetNum(1);
    setBobsScore(27);
    setBobsTurnDarts([]);
    setBobsGameOver(false);
    setBobsCompleted(false);
  };

  // ---------------- 121 CHECKOUT HANDLERS ----------------
  const handleC121Dart = (dart: DartThrow) => {
    if (c121DartsLeft <= 0 || c121TurnDarts.length >= 3) return;

    const newThrows = [...c121TurnDarts, dart];
    setC121TurnDarts(newThrows);
    setC121DartsLeft((prev) => prev - 1);

    const newRemaining = c121Remaining - dart.score;

    if (newRemaining === 0 && isDoubleDart(dart)) {
      // Completed!
      setC121Feedback(`Checked out ${c121Target}! Advancing to ${c121Target + 1}.`);
      setC121Streak((prev) => prev + 1);
      const nextTarget = c121Target + 1;
      setC121Target(nextTarget);
      setC121Remaining(nextTarget);
      setC121DartsLeft(9);
      setC121TurnDarts([]);
      setTimeout(() => setC121Feedback(null), 3000);
      return;
    }

    if (newRemaining < 0 || newRemaining === 1 || (newRemaining === 0 && !isDoubleDart(dart))) {
      // Bust on this dart
      setC121Feedback(`Bust! Restoring remaining score.`);
      setTimeout(() => {
        setC121Remaining(c121Remaining);
        setC121Feedback(null);
      }, 1200);
    } else {
      setC121Remaining(newRemaining);
    }
  };

  const handleC121Reset = () => {
    setC121Target(121);
    setC121Remaining(121);
    setC121DartsLeft(9);
    setC121TurnDarts([]);
    setC121Streak(0);
    setC121Feedback(null);
  };

  // Active turn darts to pass to SVG dartboard
  const getActiveTurnDarts = () => {
    switch (activeDrill) {
      case 'free-throw':
        return freeSlots.map((s) => s.actual).filter((d): d is DartThrow => d !== null);
      case 'around-the-clock':
        return atcTurnDarts;
      case 'bobs-27':
        return bobsTurnDarts;
      case '121-checkout':
        return c121TurnDarts;
    }
  };

  const handleActiveDartSelect = (dart: DartThrow) => {
    switch (activeDrill) {
      case 'free-throw':
        handleFreeDartSelect(dart);
        break;
      case 'around-the-clock':
        handleAtcDart(dart);
        break;
      case 'bobs-27':
        handleBobsDart(dart);
        break;
      case '121-checkout':
        handleC121Dart(dart);
        break;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 pt-1 pb-6 animate-in fade-in">
      {/* Top Header & International Drills Bar */}
      <div className="border-b border-[#1f2838] pb-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <div className="text-xs text-slate-400 font-medium">Precision Practice Studio</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Training Drills & Accuracy
            </h1>
          </div>
          <div className="text-xs text-slate-400 font-mono-numbers">
            Saved Logs: <span className="text-emerald-400 font-bold">{state.trainingLogs.length}</span> entries
          </div>
        </div>

        {/* Cadangan 5 UX: International Practice Drill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveDrill('free-throw')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeDrill === 'free-throw'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#101622] text-slate-400 hover:text-white border border-[#1f2838]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Free-Throw Target Log</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDrill('around-the-clock')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeDrill === 'around-the-clock'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#101622] text-slate-400 hover:text-white border border-[#1f2838]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Around the Clock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDrill('bobs-27')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeDrill === 'bobs-27'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#101622] text-slate-400 hover:text-white border border-[#1f2838]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Bob's 27 (Doubles)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDrill('121-checkout')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeDrill === '121-checkout'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#101622] text-slate-400 hover:text-white border border-[#1f2838]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>121 Checkout Challenge</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Active Drill Console (Col 1 to 5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* DRILL 1: FREE-THROW ACCURACY */}
          {activeDrill === 'free-throw' && (
            <div className="bg-[#101622] border border-[#1f2838] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">3 Training Throws</span>
                <span className="text-emerald-400 font-mono-numbers font-bold">
                  {freeSlots.filter((s) => s.isHit).length} / 3 Hits
                </span>
              </div>

              {turnFeedback && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-xs text-emerald-200 font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{turnFeedback}</span>
                </div>
              )}

              {/* 3 Throw Slots */}
              <div className="space-y-2">
                {freeSlots.map((slot, index) => {
                  const isCurrent = activeSlotIndex === index && !slot.actual;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                        slot.actual
                          ? slot.isHit
                            ? 'bg-[#12221b] border-emerald-500/70'
                            : 'bg-[#1a1215] border-rose-900/60'
                          : isCurrent
                          ? 'bg-[#121927] border-slate-600'
                          : 'bg-[#0d121c] border-[#1a2333]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 text-center font-mono-numbers text-xs font-bold text-slate-500">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">
                            Target: <span className="text-white font-mono-numbers">{slot.target}</span>
                          </div>
                          <div className="text-sm font-extrabold font-mono-numbers text-white mt-0.5">
                            {slot.actual ? slot.actual.segment : 'Waiting...'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {slot.actual ? (
                          <span
                            className={`text-xs font-bold font-mono-numbers px-2.5 py-1 rounded-md uppercase ${
                              slot.isHit
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-900'
                            }`}
                          >
                            {slot.isHit ? 'HIT' : 'MISS'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            {['20', 'T20', 'D20', 'OB'].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  const upd = [...freeSlots];
                                  upd[index].target = t;
                                  setFreeSlots(upd);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono-numbers font-bold border ${
                                  slot.target === t
                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                    : 'bg-[#141b28] text-slate-400 border-[#222d40]'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                {freeSlots.every((s) => s.actual !== null) && (
                  <button
                    type="button"
                    onClick={handleFreeSaveTurn}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Training Turn to Archive</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="w-full h-10 bg-[#141b28] hover:bg-[#1a2334] text-emerald-400 border border-[#232f45] rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Dartboard with Vision AI</span>
                </button>
              </div>
            </div>
          )}

          {/* DRILL 2: AROUND THE CLOCK */}
          {activeDrill === 'around-the-clock' && (
            <div className="bg-[#101622] border border-[#1f2838] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Around The Clock Target</span>
                <span className="text-cyan-400 font-mono-numbers font-bold">
                  {atcDartsThrown} Darts Thrown
                </span>
              </div>

              <div className="p-6 bg-[#0a0f18] border border-cyan-500/40 rounded-xl text-center space-y-1">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                  Current Target Segment
                </span>
                <div className="text-6xl font-black font-mono-numbers text-white tracking-tight">
                  {atcTargetNum === 21 ? 'BULL' : atcTargetNum}
                </div>
                <div className="text-xs text-cyan-300 font-medium">
                  {atcCompleted
                    ? 'Clock Completed! Spectacular shooting.'
                    : `Hit ${atcTargetNum === 21 ? 'Outer or Inner Bull' : `number ${atcTargetNum}`} to advance`}
                </div>
              </div>

              {/* Progress Bar (1 to 21) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers">
                  <span>Progress</span>
                  <span>{Math.round(((atcTargetNum - 1) / 21) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-[#141b28] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${((atcTargetNum - 1) / 21) * 100}%` }}
                  />
                </div>
              </div>

              {/* Turn Throws */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">This Turn:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-[#1f2838] bg-[#0c1018] text-center font-mono-numbers"
                    >
                      <span className="text-[10px] text-slate-500 block uppercase">Dart {i + 1}</span>
                      <span className="text-base font-bold text-white">
                        {atcTurnDarts[i]?.segment || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {atcTurnDarts.length >= 3 && !atcCompleted && (
                <button
                  type="button"
                  onClick={handleAtcNextTurn}
                  className="w-full h-10 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Next 3 Darts</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleAtcReset}
                className="w-full h-9 bg-[#141b28] hover:bg-[#1a2334] text-slate-400 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Clock</span>
              </button>
            </div>
          )}

          {/* DRILL 3: BOB'S 27 (DOUBLES) */}
          {activeDrill === 'bobs-27' && (
            <div className="bg-[#101622] border border-[#1f2838] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">Bob's 27 Doubles Challenge</span>
                <span className="text-amber-400 font-mono-numbers font-bold">
                  Target: D{bobsTargetNum}
                </span>
              </div>

              <div
                className={`p-6 rounded-xl border text-center space-y-1 ${
                  bobsGameOver
                    ? 'bg-rose-950/40 border-rose-800'
                    : 'bg-[#0a0f18] border-amber-500/40'
                }`}
              >
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                  Current Score
                </span>
                <div
                  className={`text-6xl font-black font-mono-numbers tracking-tight ${
                    bobsScore <= 10 ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {bobsScore}
                </div>
                <div className="text-xs text-slate-300">
                  {bobsGameOver
                    ? 'Game Over! Score fell below 0.'
                    : bobsCompleted
                    ? 'Congratulations! You conquered all 20 doubles.'
                    : `Target: Double ${bobsTargetNum} (+${bobsTargetNum * 2} pts per hit, -${bobsTargetNum * 2} if miss all 3)`}
                </div>
              </div>

              {/* Turn Throws */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Throws at D{bobsTargetNum}:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => {
                    const dart = bobsTurnDarts[i];
                    const isHit = dart && dart.segment === `D${bobsTargetNum}`;
                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border text-center font-mono-numbers ${
                          dart
                            ? isHit
                              ? 'border-emerald-500 bg-[#12221b]'
                              : 'border-rose-900 bg-[#1a1215]'
                            : 'border-[#1f2838] bg-[#0c1018]'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 block uppercase">Dart {i + 1}</span>
                        <span className="text-base font-bold text-white">{dart ? dart.segment : '—'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!bobsGameOver && !bobsCompleted && bobsTurnDarts.length > 0 && (
                <button
                  type="button"
                  onClick={handleBobsConfirmTurn}
                  className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Target D{bobsTargetNum}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleBobsReset}
                className="w-full h-9 bg-[#141b28] hover:bg-[#1a2334] text-slate-400 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Bob's 27</span>
              </button>
            </div>
          )}

          {/* DRILL 4: 121 CHECKOUT CHALLENGE */}
          {activeDrill === '121-checkout' && (
            <div className="bg-[#101622] border border-[#1f2838] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">121 Checkout Challenge</span>
                <span className="text-emerald-400 font-mono-numbers font-bold">
                  Streak: {c121Streak}
                </span>
              </div>

              {c121Feedback && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-xs text-emerald-200 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{c121Feedback}</span>
                </div>
              )}

              <div className="p-6 bg-[#0a0f18] border border-emerald-500/40 rounded-xl text-center space-y-1">
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                  Target: {c121Target} (Remaining: {c121Remaining})
                </span>
                <div className="text-6xl font-black font-mono-numbers text-white tracking-tight">
                  {c121Remaining}
                </div>
                <div className="text-xs text-slate-300">
                  {c121DartsLeft} Darts Remaining · Double-Out finish required
                </div>
              </div>

              {/* Turn Throws */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Turn Throws:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-[#1f2838] bg-[#0c1018] text-center font-mono-numbers"
                    >
                      <span className="text-[10px] text-slate-500 block uppercase">Dart {i + 1}</span>
                      <span className="text-base font-bold text-white">
                        {c121TurnDarts[i]?.segment || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {c121TurnDarts.length >= 3 && c121DartsLeft > 0 && (
                <button
                  type="button"
                  onClick={() => setC121TurnDarts([])}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Continue Next 3 Darts</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {c121DartsLeft <= 0 && (
                <div className="space-y-2">
                  <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-lg text-xs text-rose-300 text-center font-semibold">
                    Ran out of darts! Resetting back to 121.
                  </div>
                  <button
                    type="button"
                    onClick={handleC121Reset}
                    className="w-full h-10 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: High-Precision Dartboard (Col 6 to 12) */}
        <div className="lg:col-span-7 bg-[#101622] border border-[#1f2838] rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[460px]">
          <DartboardSvg
            onSegmentSelect={handleActiveDartSelect}
            onUndo={() => {
              if (activeDrill === 'free-throw' && activeSlotIndex > 0) {
                const prevIndex = activeSlotIndex - 1;
                const upd = [...freeSlots];
                upd[prevIndex].actual = null;
                upd[prevIndex].isHit = false;
                setFreeSlots(upd);
                setActiveSlotIndex(prevIndex);
              }
            }}
            canUndo={activeDrill === 'free-throw' && activeSlotIndex > 0}
            currentTurnDarts={getActiveTurnDarts()}
            disabled={
              (activeDrill === 'free-throw' && freeSlots.every((s) => s.actual !== null)) ||
              (activeDrill === 'bobs-27' && (bobsGameOver || bobsCompleted)) ||
              (activeDrill === '121-checkout' && c121DartsLeft <= 0)
            }
          />
        </div>
      </div>

      {/* Vision AI Camera Modal */}
      <CameraScanModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onConfirmScore={(throws) => {
          throws.forEach((d) => handleActiveDartSelect(d));
        }}
      />
    </div>
  );
};
