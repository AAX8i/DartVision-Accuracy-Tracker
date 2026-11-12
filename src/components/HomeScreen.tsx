import React from 'react';
import { PlayCircle, BarChart3, ArrowRight, Crosshair, ChevronRight } from 'lucide-react';
import { ActiveMatch, FinishedMatch, TrainingStatsMap } from '../types/dart';
import { getOverallSummary } from '../utils/storage';

interface HomeScreenProps {
  onSelectMode: (mode: 'x01' | 'training' | 'stats') => void;
  activeMatch: ActiveMatch | null;
  matchHistory: FinishedMatch[];
  trainingStats: TrainingStatsMap;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMode,
  activeMatch,
  matchHistory,
  trainingStats,
}) => {
  const summary = getOverallSummary(trainingStats, matchHistory);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pt-2 pb-6 animate-in fade-in">
      {/* Active Tournament Match Banner (If In Progress) */}
      {activeMatch && !activeMatch.isCompleted && (
        <div className="bg-[#101726] border border-emerald-500/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                Match In Progress
              </span>
              <span>·</span>
              <span className="font-mono-numbers">{activeMatch.gameType}</span>
              <span>·</span>
              <span className="capitalize">{activeMatch.outMode}-Out</span>
            </div>
            <h3 className="text-xl font-extrabold text-white font-display">
              {activeMatch.players[activeMatch.activePlayerIndex]?.name}'s Turn:{' '}
              <span className="text-emerald-400 font-mono-numbers">
                {activeMatch.players[activeMatch.activePlayerIndex]?.remainingScore}
              </span>{' '}
              pts remaining
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onSelectMode('x01')}
            className="h-10 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-2 whitespace-nowrap active:scale-[0.98] transition-all"
          >
            <span>Resume Scoreboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Console Header */}
      <div className="border-b border-[#1f2838] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Dart Scoring Console & Accuracy Tracker</span>
          <span>·</span>
          <span>100% Offline Local Storage</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Match & Practice Arena
          </h1>
          <div className="text-xs text-slate-400">
            Standard <span className="text-slate-200 font-semibold">Clockface 20</span> · Double-Out & Vision AI
          </div>
        </div>
      </div>

      {/* Quick Launchpad Grid (3 Distinct Modalities) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: X01 Match Play */}
        <div
          onClick={() => onSelectMode('x01')}
          className="group cursor-pointer bg-[#101622] hover:bg-[#141c2c] border border-[#1f2a3c] hover:border-emerald-500/50 rounded-xl p-5 flex flex-col justify-between gap-6 transition-all"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#182234] border border-[#26354d] flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors font-display">
                X01 Match Play
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated 101, 501, or 1001 scoring for 1–4 local players with Bust detection and dynamic Checkout routes.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 pt-2 border-t border-[#1a2332]">
            <span>Start Match</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Module 2: Training & Accuracy Log */}
        <div
          onClick={() => onSelectMode('training')}
          className="group cursor-pointer bg-[#101622] hover:bg-[#141c2c] border border-[#1f2a3c] hover:border-emerald-500/50 rounded-xl p-5 flex flex-col justify-between gap-6 transition-all"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#182234] border border-[#26354d] flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
              <Crosshair className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors font-display">
                Accuracy Training
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log 3-dart free-throw routines, track intended targets (Hit/Miss), and measure objective accuracy percentages per segment.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 pt-2 border-t border-[#1a2332]">
            <span>Start Training Session</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Module 3: Analytics & Archive */}
        <div
          onClick={() => onSelectMode('stats')}
          className="group cursor-pointer bg-[#101622] hover:bg-[#141c2c] border border-[#1f2a3c] hover:border-emerald-500/50 rounded-xl p-5 flex flex-col justify-between gap-6 transition-all"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#182234] border border-[#26354d] flex items-center justify-center text-amber-400 group-hover:border-amber-500/40 transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors font-display">
                Stats & Archive
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accuracy breakdown tables for numbers 1–20, Doubles, Triples, Bullseyes, match logs, and JSON/CSV backup export.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 pt-2 border-t border-[#1a2332]">
            <span>View Records</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Quantitative Telemetry Strip */}
      <div className="bg-[#101622] border border-[#1f2838] rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-[#1f2838] grid grid-cols-1 sm:grid-cols-4">
        <div className="p-4 sm:p-5">
          <span className="text-xs text-slate-400 block">Training Accuracy</span>
          <div className="text-2xl font-bold font-mono-numbers text-emerald-400 mt-1">
            {summary.overallAccuracy.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono-numbers block mt-0.5">
            {summary.totalHits} / {summary.totalAttempts} targets hit
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-xs text-slate-400 block">3-Dart Match Average</span>
          <div className="text-2xl font-bold font-mono-numbers text-white mt-1">
            {summary.overall3DartAvg.toFixed(1)}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Based on completed matches
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-xs text-slate-400 block">Matches Completed</span>
          <div className="text-2xl font-bold font-mono-numbers text-white mt-1">
            {summary.totalMatchesPlayed}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Stored locally on device
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-xs text-slate-400 block">Logged Target Segments</span>
          <div className="text-2xl font-bold font-mono-numbers text-white mt-1">
            {trainingStats ? Object.keys(trainingStats).length : 0} segments
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Ready for CSV / JSON export
          </span>
        </div>
      </div>
    </div>
  );
};
