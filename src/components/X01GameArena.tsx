import React, { useState, useEffect } from 'react';
import { ActiveMatch, ArenaInputMode, DartThrow, FinishedMatch, GameScore, OutMode, Player, TurnRecord } from '../types/dart';
import { DartboardSvg } from './DartboardSvg';
import { CameraScanModal } from './CameraScanModal';
import { getCheckoutSuggestion, isDoubleDart, parseSegment } from '../utils/dartMath';
import { saveActiveMatch, saveFinishedMatch } from '../utils/storage';
import {
  Trophy,
  Camera,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Play,
  Users,
  Settings2,
  Plus,
  Trash2,
  Keyboard,
  Compass,
  CheckCircle2,
  Delete,
  Sparkles,
  Award
} from 'lucide-react';

interface X01GameArenaProps {
  initialActiveMatch: ActiveMatch | null;
  onMatchFinished: () => void;
}

const COMMON_PRESETS = [26, 41, 45, 60, 81, 85, 100, 140, 180];

export const X01GameArena: React.FC<X01GameArenaProps> = ({
  initialActiveMatch,
  onMatchFinished,
}) => {
  // Setup State
  const [isSettingUp, setIsSettingUp] = useState<boolean>(!initialActiveMatch);
  const [selectedGameType, setSelectedGameType] = useState<GameScore>(501);
  const [selectedOutMode, setSelectedOutMode] = useState<OutMode>('double');
  const [selectedLegsToWin, setSelectedLegsToWin] = useState<number>(3); // First to 3 legs (Best of 5)
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);

  // Active Match State
  const [match, setMatch] = useState<ActiveMatch | null>(initialActiveMatch);
  const [currentTurnDarts, setCurrentTurnDarts] = useState<DartThrow[]>(
    initialActiveMatch?.currentTurnDarts || []
  );
  const [bustMessage, setBustMessage] = useState<string | null>(null);
  const [legNotice, setLegNotice] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Cadangan 2 UX: Dual Input Mode (Dartboard vs Numpad)
  const [inputMode, setInputMode] = useState<ArenaInputMode>(
    initialActiveMatch?.inputMode || 'dartboard'
  );
  const [numpadValue, setNumpadValue] = useState<string>('');

  useEffect(() => {
    if (initialActiveMatch) {
      setMatch(initialActiveMatch);
      setCurrentTurnDarts(initialActiveMatch.currentTurnDarts || []);
      setInputMode(initialActiveMatch.inputMode || 'dartboard');
      setIsSettingUp(false);
    }
  }, [initialActiveMatch]);

  const updateMatchState = (updated: ActiveMatch | null) => {
    setMatch(updated);
    saveActiveMatch(updated);
  };

  const addPlayer = () => {
    if (playerNames.length < 4) {
      setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 1) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, val: string) => {
    const updated = [...playerNames];
    updated[index] = val;
    setPlayerNames(updated);
  };

  const handleStartMatch = () => {
    const players: Player[] = playerNames.map((name, idx) => ({
      id: `p_${idx}_${Date.now()}`,
      name: name.trim() || `Player ${idx + 1}`,
      remainingScore: selectedGameType,
      initialScore: selectedGameType,
      dartsThrown: 0,
      totalScoreScored: 0,
      highestTurn: 0,
      legsWon: 0,
      turns: [],
    }));

    const newMatch: ActiveMatch = {
      id: `match_${Date.now()}`,
      date: new Date().toISOString(),
      gameType: selectedGameType,
      outMode: selectedOutMode,
      legsToWin: selectedLegsToWin,
      currentLeg: 1,
      legStarterIndex: 0,
      players,
      activePlayerIndex: 0,
      currentTurnDarts: [],
      turnHistory: [],
      isCompleted: false,
      inputMode,
    };

    setCurrentTurnDarts([]);
    setBustMessage(null);
    setLegNotice(null);
    setNumpadValue('');
    updateMatchState(newMatch);
    setIsSettingUp(false);
  };

  const activePlayer = match ? match.players[match.activePlayerIndex] : null;
  const currentTurnSum = currentTurnDarts.reduce((sum, d) => sum + d.score, 0);
  const previewRemaining = activePlayer ? activePlayer.remainingScore - currentTurnSum : 0;
  const dartsLeftInTurn = 3 - currentTurnDarts.length;

  // Cadangan 4: Smart Adaptive Checkout Pathways
  const checkoutAdvice =
    activePlayer && match?.outMode === 'double' && previewRemaining > 1 && previewRemaining <= 170
      ? getCheckoutSuggestion(previewRemaining, dartsLeftInTurn)
      : null;

  // Secondary Fallback Route if single is hit instead of triple
  const getFallbackRoute = (remaining: number) => {
    if (remaining > 170 || remaining < 2) return null;
    if (remaining >= 101 && remaining <= 130) {
      const singleHitLeft = remaining - 20;
      const subCheckout = getCheckoutSuggestion(singleHitLeft, 2);
      if (subCheckout) {
        return {
          condition: 'If Single 20 hit instead of T20',
          route: subCheckout,
        };
      }
    } else if (remaining >= 41 && remaining <= 80) {
      const singleHitLeft = remaining - (remaining > 60 ? 20 : 10);
      const subCheckout = getCheckoutSuggestion(singleHitLeft, 2);
      if (subCheckout) {
        return {
          condition: `If Single ${remaining > 60 ? 20 : 10} hit`,
          route: subCheckout,
        };
      }
    }
    return null;
  };

  const fallbackAdvice = activePlayer ? getFallbackRoute(previewRemaining) : null;

  // Record a dart throw from Dartboard
  const handleRecordDart = (dart: DartThrow) => {
    if (!match || !activePlayer || currentTurnDarts.length >= 3 || match.isCompleted) return;

    setBustMessage(null);
    const newThrows = [...currentTurnDarts, dart];
    setCurrentTurnDarts(newThrows);

    const newSum = newThrows.reduce((sum, d) => sum + d.score, 0);
    const newRemaining = activePlayer.remainingScore - newSum;

    let isBust = false;
    let bustReason = '';

    if (match.outMode === 'double') {
      if (newRemaining < 0) {
        isBust = true;
        bustReason = 'Score exceeded remaining points.';
      } else if (newRemaining === 1) {
        isBust = true;
        bustReason = '1 point remaining (impossible to finish on a Double).';
      } else if (newRemaining === 0 && !isDoubleDart(dart)) {
        isBust = true;
        bustReason = `Final dart (${dart.segment}) was not a Double or Bullseye.`;
      }
    } else {
      if (newRemaining < 0) {
        isBust = true;
        bustReason = 'Score exceeded remaining points.';
      }
    }

    if (isBust) {
      setBustMessage(`BUST! ${bustReason} Score restored to ${activePlayer.remainingScore}.`);
      setTimeout(() => {
        commitTurn(newThrows, true);
      }, 1300);
      return;
    }

    // Check Victory / Leg Won
    if (newRemaining === 0) {
      setTimeout(() => {
        handleLegWon(newThrows);
      }, 250);
    }
  };

  // Cadangan 2 UX: Quick Numpad submission
  const handleNumpadSubmit = () => {
    if (!match || !activePlayer || !numpadValue) return;

    const turnScore = parseInt(numpadValue, 10);
    if (isNaN(turnScore) || turnScore < 0 || turnScore > 180) {
      setBustMessage('Score must be between 0 and 180.');
      return;
    }

    const newRemaining = activePlayer.remainingScore - turnScore;
    let isBust = false;
    let bustReason = '';

    if (match.outMode === 'double') {
      if (newRemaining < 0) {
        isBust = true;
        bustReason = 'Score exceeded remaining points.';
      } else if (newRemaining === 1) {
        isBust = true;
        bustReason = '1 point remaining (impossible to finish on a Double).';
      }
    } else {
      if (newRemaining < 0) {
        isBust = true;
        bustReason = 'Score exceeded remaining points.';
      }
    }

    // Synthesize 3 dummy darts matching turn total for logging
    const s1 = Math.round(turnScore / 3);
    const s2 = Math.round((turnScore - s1) / 2);
    const s3 = turnScore - s1 - s2;
    const synthThrows: DartThrow[] = [
      { segment: `S${s1}`, score: s1, multiplier: 1 },
      { segment: `S${s2}`, score: s2, multiplier: 1 },
      { segment: `S${s3}`, score: s3, multiplier: 1 },
    ];

    setNumpadValue('');

    if (isBust) {
      setBustMessage(`BUST! ${bustReason} Score restored to ${activePlayer.remainingScore}.`);
      setTimeout(() => {
        commitTurn(synthThrows, true);
      }, 1300);
      return;
    }

    if (newRemaining === 0) {
      handleLegWon(synthThrows);
    } else {
      commitTurn(synthThrows, false);
    }
  };

  const handleUndoDart = () => {
    if (currentTurnDarts.length > 0) {
      setCurrentTurnDarts(currentTurnDarts.slice(0, -1));
      setBustMessage(null);
    }
  };

  const commitTurn = (throws: DartThrow[], isBust: boolean = false) => {
    if (!match || !activePlayer) return;

    const turnScore = throws.reduce((sum, d) => sum + d.score, 0);
    const dartsThrownThisTurn = throws.length;

    const newRemainingScore = isBust
      ? activePlayer.remainingScore
      : activePlayer.remainingScore - turnScore;

    const updatedPlayers = [...match.players];
    const playerToUpdate = { ...activePlayer };

    playerToUpdate.dartsThrown += dartsThrownThisTurn;
    if (!isBust) {
      playerToUpdate.totalScoreScored += turnScore;
      playerToUpdate.remainingScore = newRemainingScore;
      if (turnScore > playerToUpdate.highestTurn) {
        playerToUpdate.highestTurn = turnScore;
      }
    }

    const turnRecord: TurnRecord = {
      playerIndex: match.activePlayerIndex,
      turnNumber: playerToUpdate.turns.length + 1,
      throws,
      turnTotal: isBust ? 0 : turnScore,
      isBust,
      scoreBeforeTurn: activePlayer.remainingScore,
      scoreAfterTurn: newRemainingScore,
    };
    playerToUpdate.turns = [...playerToUpdate.turns, turnRecord];
    updatedPlayers[match.activePlayerIndex] = playerToUpdate;

    const nextPlayerIndex = (match.activePlayerIndex + 1) % match.players.length;

    const updatedMatch: ActiveMatch = {
      ...match,
      players: updatedPlayers,
      activePlayerIndex: nextPlayerIndex,
      currentTurnDarts: [],
      turnHistory: [turnRecord, ...match.turnHistory],
    };

    setCurrentTurnDarts([]);
    setBustMessage(null);
    updateMatchState(updatedMatch);
  };

  // Cadangan 3 UX: Leg & Match Management
  const handleLegWon = (winningThrows: DartThrow[]) => {
    if (!match || !activePlayer) return;

    const finalTurnScore = winningThrows.reduce((sum, d) => sum + d.score, 0);
    const dartsThrownThisTurn = winningThrows.length;

    const updatedPlayers = [...match.players];
    const playerToUpdate = { ...activePlayer };

    playerToUpdate.dartsThrown += dartsThrownThisTurn;
    playerToUpdate.totalScoreScored += finalTurnScore;
    playerToUpdate.remainingScore = 0;
    playerToUpdate.legsWon = (playerToUpdate.legsWon || 0) + 1;

    if (finalTurnScore > playerToUpdate.highestTurn) {
      playerToUpdate.highestTurn = finalTurnScore;
    }

    updatedPlayers[match.activePlayerIndex] = playerToUpdate;

    // Check if player has achieved enough legs to win the entire match
    if (playerToUpdate.legsWon >= match.legsToWin) {
      playerToUpdate.isWinner = true;

      const finishedRecord: FinishedMatch = {
        id: match.id,
        date: match.date,
        gameType: match.gameType,
        outMode: match.outMode,
        legsToWin: match.legsToWin,
        winner: playerToUpdate.name,
        players: updatedPlayers.map((p) => {
          const avg = p.dartsThrown > 0 ? (p.totalScoreScored / p.dartsThrown) * 3 : 0;
          return {
            name: p.name,
            finalScore: p.remainingScore,
            dartsThrown: p.dartsThrown,
            threeDartAvg: Math.round(avg * 10) / 10,
            highestTurn: p.highestTurn,
            legsWon: p.legsWon,
          };
        }),
      };

      saveFinishedMatch(finishedRecord);

      const completedMatch: ActiveMatch = {
        ...match,
        players: updatedPlayers,
        isCompleted: true,
        winnerName: playerToUpdate.name,
      };

      updateMatchState(completedMatch);
      onMatchFinished();
    } else {
      // Leg won, prepare next leg
      const nextLegNum = match.currentLeg + 1;
      const nextStarter = (match.legStarterIndex + 1) % match.players.length;

      setLegNotice(
        `Leg ${match.currentLeg} won by ${playerToUpdate.name}! (${playerToUpdate.legsWon} / ${match.legsToWin} legs)`
      );

      // Reset all players remaining scores for next leg
      const resetForNextLeg = updatedPlayers.map((p) => ({
        ...p,
        remainingScore: match.gameType,
      }));

      const nextLegMatch: ActiveMatch = {
        ...match,
        players: resetForNextLeg,
        currentLeg: nextLegNum,
        legStarterIndex: nextStarter,
        activePlayerIndex: nextStarter,
        currentTurnDarts: [],
      };

      setCurrentTurnDarts([]);
      setBustMessage(null);
      updateMatchState(nextLegMatch);

      setTimeout(() => {
        setLegNotice(null);
      }, 3500);
    }
  };

  // Setup Form Screen
  if (isSettingUp || !match) {
    return (
      <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-8 animate-in fade-in">
        <div className="border-b border-[#1f2838] pb-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium">X01 Match Setup</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            New Match Configuration
          </h1>
        </div>

        {/* 1. Game Score Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Starting Score
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([101, 501, 1001] as GameScore[]).map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setSelectedGameType(score)}
                className={`py-3 px-4 rounded-lg font-bold font-mono-numbers text-lg border transition-all ${
                  selectedGameType === score
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-[#101622] border-[#1f2838] text-slate-300 hover:border-slate-700'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Match Length (Cadangan 3: Legs to Win) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Match Length (Legs to Win)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { legs: 1, label: 'Single Leg' },
              { legs: 2, label: 'Best of 3' },
              { legs: 3, label: 'Best of 5' },
              { legs: 4, label: 'Best of 7' },
            ].map(({ legs, label }) => (
              <button
                key={legs}
                type="button"
                onClick={() => setSelectedLegsToWin(legs)}
                className={`py-2.5 px-2 rounded-lg border text-center transition-all ${
                  selectedLegsToWin === legs
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-[#101622] border-[#1f2838] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-extrabold text-base font-mono-numbers">{legs}</div>
                <div className="text-[10px] text-slate-200 mt-0.5">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Out Rule Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Finishing Rule (Out Mode)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedOutMode('double')}
              className={`p-3.5 rounded-lg border text-left transition-all ${
                selectedOutMode === 'double'
                  ? 'bg-[#12221b] border-emerald-500 text-white'
                  : 'bg-[#101622] border-[#1f2838] text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm text-white">Double-Out (Standard)</div>
              <div className="text-[11px] text-slate-400 mt-1">Must finish on a Double or Bullseye (50 pts)</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOutMode('single')}
              className={`p-3.5 rounded-lg border text-left transition-all ${
                selectedOutMode === 'single'
                  ? 'bg-[#12221b] border-emerald-500 text-white'
                  : 'bg-[#101622] border-[#1f2838] text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm text-white">Single-Out (Casual)</div>
              <div className="text-[11px] text-slate-400 mt-1">Can finish on any dart reaching exactly 0</div>
            </button>
          </div>
        </div>

        {/* 4. Player Names Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Players List ({playerNames.length} / 4)</span>
            </label>
            {playerNames.length < 4 && (
              <button
                type="button"
                onClick={addPlayer}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Player</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {playerNames.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs font-mono-numbers font-bold text-slate-500">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayerName(idx, e.target.value)}
                  placeholder={`Player Name ${idx + 1}`}
                  className="flex-1 bg-[#101622] border border-[#1f2838] focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none"
                />
                {playerNames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove player"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        <button
          type="button"
          onClick={handleStartMatch}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Match ({selectedGameType} · First to {selectedLegsToWin} Legs)</span>
        </button>
      </div>
    );
  }

  // Victory Celebration Screen
  if (match.isCompleted && match.winnerName) {
    const winner = match.players.find((p) => p.name === match.winnerName) || match.players[0];
    const winnerAvg = winner.dartsThrown > 0 ? (winner.totalScoreScored / winner.dartsThrown) * 3 : 0;

    return (
      <div className="w-full max-w-xl mx-auto space-y-6 pt-4 pb-8 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
            Match {match.gameType} Champion
          </div>
          <h2 className="text-3xl font-extrabold text-white font-display">
            {match.winnerName} Wins!
          </h2>
          <p className="text-xs text-slate-400">
            Finished with {winner.legsWon} legs won · Completed in {winner.dartsThrown} darts
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-[#101622] border border-[#1f2838] rounded-xl p-4 font-mono-numbers">
          <div>
            <span className="text-[11px] text-slate-400 block font-sans">3-Dart Avg</span>
            <span className="text-xl font-bold text-emerald-400">{winnerAvg.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-sans">Total Darts</span>
            <span className="text-xl font-bold text-white">{winner.dartsThrown}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-sans">Highest Turn</span>
            <span className="text-xl font-bold text-amber-400">{winner.highestTurn}</span>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#101622] border border-[#1f2838] rounded-xl overflow-hidden text-left">
          <div className="px-4 py-2.5 bg-[#0b0f17] border-b border-[#1f2838] text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tournament Aggregate Summary
          </div>
          <div className="divide-y divide-[#1f2838]">
            {match.players.map((p, i) => {
              const avg = p.dartsThrown > 0 ? (p.totalScoreScored / p.dartsThrown) * 3 : 0;
              return (
                <div key={i} className="px-4 py-3 flex items-center justify-between text-xs font-mono-numbers">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-500">#{i + 1}</span>
                    <span className="font-bold text-white font-sans text-sm">{p.name}</span>
                    {p.name === match.winnerName && (
                      <span className="text-[10px] text-amber-400 font-sans font-bold">CHAMPION</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{p.legsWon} Legs Won</span>
                    <span className="text-slate-500 block text-[11px]">Avg: {avg.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Post-match Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleStartMatch}
            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSettingUp(true)}
            className="flex-1 h-11 bg-[#101622] hover:bg-[#161f2e] text-slate-300 border border-[#1f2838] rounded-lg font-semibold text-xs transition-all"
          >
            <span>New Match Setup</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Tournament Match Arena: 2-Column Split Console
  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 pt-1 pb-6 animate-in fade-in">
      {/* Top Header Strip with Legs Info & Input Toggle */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-b border-[#1f2838] pb-3 gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="font-bold text-white font-mono-numbers text-sm">{match.gameType}</span>
          <span>·</span>
          <span className="uppercase text-slate-300 font-bold">{match.outMode}-OUT</span>
          <span>·</span>
          <span className="text-amber-400 font-bold font-mono-numbers">
            Leg {match.currentLeg} (First to {match.legsToWin})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Cadangan 2: Dual Input Mode Switch */}
          <div className="flex items-center bg-[#090d14] border border-[#1f2838] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setInputMode('dartboard')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                inputMode === 'dartboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Dartboard</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('numpad')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                inputMode === 'numpad'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Quick Numpad</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Change match settings? Current progress will be saved.')) {
                setIsSettingUp(true);
              }
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Leg Won Floating Banner */}
      {legNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-center text-xs text-emerald-200 font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>{legNotice}</span>
        </div>
      )}

      {/* Players Header Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {match.players.map((p, idx) => {
          const isActive = idx === match.activePlayerIndex;
          const avg = p.dartsThrown > 0 ? (p.totalScoreScored / p.dartsThrown) * 3 : 0;
          return (
            <div
              key={p.id}
              className={`p-3 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-[#101726] border-emerald-500/80 shadow-sm ring-1 ring-emerald-500/40'
                  : 'bg-[#0d121c] border-[#1a2333] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white truncate max-w-[100px]">{p.name}</span>
                <span className="text-[10px] font-extrabold text-amber-400 font-mono-numbers">
                  {p.legsWon} / {match.legsToWin} Legs
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono-numbers text-white tracking-tight">
                {isActive ? previewRemaining : p.remainingScore}
              </div>
              <div className="text-[10px] text-slate-500 font-mono-numbers mt-0.5">
                Avg: {avg.toFixed(1)} · {p.dartsThrown} darts
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Desktop Grid (Left: Scoreboard Console, Right: Input Engine) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Digital Scoreboard Console (Col 1 to 5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Scoreboard Display Box */}
          <div className="bg-[#101622] border border-[#1f2838] rounded-xl p-5 text-center space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-400">Remaining Score</span>
              <span className="text-white font-bold">{activePlayer?.name} (Turn)</span>
            </div>

            {/* Giant Numerals with Oche Legibility */}
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl sm:text-7xl font-extrabold font-mono-numbers text-white tracking-tight">
                {previewRemaining}
              </span>
              {currentTurnSum > 0 && (
                <span className="text-lg font-bold font-mono-numbers text-emerald-400">
                  (-{currentTurnSum})
                </span>
              )}
            </div>

            {/* Cadangan 4: Smart Adaptive Checkout Pathway Cards */}
            {checkoutAdvice && (
              <div className="bg-[#0b141e] border border-emerald-500/40 rounded-xl p-3.5 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Primary Checkout Route (Plan A)</span>
                  </div>
                  <span className="text-[10px] font-mono-numbers text-slate-400">
                    {previewRemaining} pts
                  </span>
                </div>
                <div className="text-base font-black font-mono-numbers text-white tracking-wider">
                  {checkoutAdvice}
                </div>

                {/* Adaptive Fallback Plan B */}
                {fallbackAdvice && (
                  <div className="pt-2 border-t border-[#182736] text-[11px] text-amber-300 flex items-center justify-between">
                    <span className="text-slate-400">{fallbackAdvice.condition}:</span>
                    <span className="font-mono-numbers font-bold text-amber-300">
                      {fallbackAdvice.route}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Bust Alert Banner */}
            {bustMessage && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/60 rounded-lg text-xs text-rose-200 font-semibold flex items-center justify-center gap-2 animate-bounce">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{bustMessage}</span>
              </div>
            )}

            {/* 3 Dart Slots in Turn Buffer (Visible in Dartboard Mode) */}
            {inputMode === 'dartboard' && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-slate-400 text-left font-medium">Current Turn Throws:</div>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((slotIdx) => {
                    const dart = currentTurnDarts[slotIdx];
                    const isCurrentTarget = slotIdx === currentTurnDarts.length;
                    return (
                      <div
                        key={slotIdx}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          dart
                            ? 'border-emerald-500/60 bg-[#12201b]'
                            : isCurrentTarget
                            ? 'border-slate-600 bg-[#141b28]'
                            : 'border-[#1f2838] bg-[#0c1018]'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          Dart {slotIdx + 1}
                        </span>
                        <span className="text-lg font-extrabold font-mono-numbers text-white block mt-0.5">
                          {dart ? dart.segment : '—'}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-400 block">
                          {dart ? `${dart.score} pts` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Turn Actions: Scan Camera & Confirm Turn */}
            <div className="flex flex-col gap-2 pt-2">
              {inputMode === 'dartboard' && currentTurnDarts.length > 0 && (
                <button
                  type="button"
                  onClick={() => commitTurn(currentTurnDarts, false)}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <span>Confirm Turn ({currentTurnSum} Pts)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="w-full h-10 bg-[#141b28] hover:bg-[#1a2334] text-emerald-400 border border-[#232f45] rounded-lg font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Scan Board With Vision AI</span>
              </button>
            </div>
          </div>

          {/* Chalkboard History (Recent Turns in Match) */}
          {match.turnHistory.length > 0 && (
            <div className="bg-[#101622] border border-[#1f2838] rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Match Turn History
              </div>
              <div className="divide-y divide-[#1a2332] max-h-48 overflow-y-auto">
                {match.turnHistory.slice(0, 5).map((t, idx) => {
                  const player = match.players[t.playerIndex];
                  return (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs font-mono-numbers">
                      <div>
                        <span className="text-white font-sans font-semibold mr-2">{player?.name}</span>
                        <span className="text-slate-400 text-[11px]">
                          {t.throws.map((th) => th.segment).join(' + ')}
                        </span>
                      </div>
                      <div className="text-right">
                        {t.isBust ? (
                          <span className="text-rose-400 font-bold">BUST</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">+{t.turnTotal}</span>
                        )}
                        <span className="text-slate-500 text-[10px] block">
                          Remaining: {t.scoreAfterTurn}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Input Engine (Col 6 to 12) */}
        <div className="lg:col-span-7 bg-[#101622] border border-[#1f2838] rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[460px]">
          {inputMode === 'dartboard' ? (
            <DartboardSvg
              onSegmentSelect={handleRecordDart}
              onUndo={handleUndoDart}
              canUndo={currentTurnDarts.length > 0}
              currentTurnDarts={currentTurnDarts}
              disabled={currentTurnDarts.length >= 3 || match.isCompleted}
            />
          ) : (
            /* Cadangan 2 UX: Quick Numpad Entry */
            <div className="w-full max-w-sm space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Quick Turn Total Score
                </span>
                <div className="h-14 bg-[#090d14] border border-[#1f2838] rounded-xl flex items-center justify-center px-4 font-mono-numbers text-3xl font-extrabold text-white">
                  {numpadValue || '0'}
                </div>
              </div>

              {/* Quick Preset Score Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-500 font-medium">Common Darts Scores:</div>
                <div className="grid grid-cols-5 gap-1.5 font-mono-numbers text-xs">
                  {COMMON_PRESETS.map((pScore) => (
                    <button
                      key={pScore}
                      type="button"
                      onClick={() => setNumpadValue(pScore.toString())}
                      className="h-8 bg-[#131b29] hover:bg-[#1a2538] border border-[#222f46] rounded-md font-bold text-slate-200 active:scale-95 transition-all"
                    >
                      {pScore}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNumpadValue('0')}
                    className="h-8 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-900/50 rounded-md font-bold text-rose-300 active:scale-95 transition-all"
                  >
                    0
                  </button>
                </div>
              </div>

              {/* Numeric Keypad Grid */}
              <div className="grid grid-cols-3 gap-2 font-mono-numbers">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => {
                      if (numpadValue.length < 3) {
                        setNumpadValue((prev) => (prev === '0' ? digit.toString() : prev + digit));
                      }
                    }}
                    className="h-12 bg-[#101726] hover:bg-[#152033] border border-[#1f2c42] rounded-lg text-lg font-extrabold text-white active:scale-95 transition-all shadow-sm"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setNumpadValue('')}
                  className="h-12 bg-[#0e1420] hover:bg-[#141b2a] border border-[#1f2838] rounded-lg text-xs font-bold text-slate-400 active:scale-95 transition-all"
                >
                  CLEAR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (numpadValue.length < 3 && numpadValue !== '') {
                      setNumpadValue((prev) => prev + '0');
                    }
                  }}
                  className="h-12 bg-[#101726] hover:bg-[#152033] border border-[#1f2c42] rounded-lg text-lg font-extrabold text-white active:scale-95 transition-all shadow-sm"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setNumpadValue((prev) => prev.slice(0, -1))}
                  className="h-12 bg-[#0e1420] hover:bg-[#141b2a] border border-[#1f2838] rounded-lg flex items-center justify-center text-slate-400 active:scale-95 transition-all"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Submit Turn Button */}
              <button
                type="button"
                onClick={handleNumpadSubmit}
                disabled={!numpadValue}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Turn ({numpadValue || 0} pts)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vision AI Scan Modal */}
      <CameraScanModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onConfirmScore={(throws) => {
          throws.forEach((d) => handleRecordDart(d));
        }}
      />
    </div>
  );
};
