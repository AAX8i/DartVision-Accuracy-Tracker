import React, { useState } from 'react';
import {
  exportStateAsCsv,
  exportStateAsJson,
  getAccuracyTable,
  getOverallSummary,
  importStateFromJson,
  loadState,
  resetAllData,
} from '../utils/storage';
import { DartboardSvg } from './DartboardSvg';
import { Download, Upload, Trash2, Check, AlertTriangle, Trophy, Flame, Table, Info } from 'lucide-react';

interface StatsHistoryViewProps {
  onDataReset: () => void;
}

type CategoryFilter = 'all' | 'number' | 'double' | 'triple' | 'bull';
type AccuracyDisplayMode = 'table' | 'heatmap';

export const StatsHistoryView: React.FC<StatsHistoryViewProps> = ({ onDataReset }) => {
  const [activeTab, setActiveTab] = useState<'accuracy' | 'matches'>('accuracy');
  const [accuracyDisplayMode, setAccuracyDisplayMode] = useState<AccuracyDisplayMode>('table');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const state = loadState();
  const accuracyRows = getAccuracyTable(state.trainingStats);
  const overallSummary = getOverallSummary(state.trainingStats, state.matchHistory);

  const filteredRows = accuracyRows.filter((row) => {
    if (categoryFilter === 'all') return true;
    return row.category === categoryFilter;
  });

  const handleExportJson = () => {
    const jsonStr = exportStateAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dartvision_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice('JSON backup file successfully downloaded');
  };

  const handleExportCsv = () => {
    const csvStr = exportStateAsCsv();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dartvision_stats_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice('CSV spreadsheet file successfully downloaded');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importStateFromJson(content);
      if (res.success) {
        showNotice(res.message);
        onDataReset();
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    setResetStep(1);
    showNotice('All local storage data has been reset');
    onDataReset();
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const inspectedData = hoveredSegment ? state.trainingStats[hoveredSegment] : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pt-1 pb-8 animate-in fade-in">
      {/* Top Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1f2838] pb-4 gap-3">
        <div>
          <div className="text-xs text-slate-400 font-medium">Record Archive & Analytics</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Statistics & Match History
          </h1>
        </div>

        {/* Data Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-8 px-3 bg-[#101622] hover:bg-[#161f2e] border border-[#1f2838] rounded-md text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="h-8 px-3 bg-[#101622] hover:bg-[#161f2e] border border-[#1f2838] rounded-md text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>JSON</span>
          </button>
          <label className="h-8 px-3 bg-[#101622] hover:bg-[#161f2e] border border-[#1f2838] rounded-md text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="h-8 px-3 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-900/50 rounded-md text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition-colors"
            title="Reset all stored data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-xs text-emerald-200 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Summary Telemetry Strip */}
      <div className="bg-[#101622] border border-[#1f2838] rounded-xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1f2838] font-mono-numbers">
        <div className="p-4">
          <span className="text-xs text-slate-400 block font-sans">Overall Accuracy</span>
          <div className="text-2xl font-bold text-emerald-400 mt-0.5">
            {overallSummary.overallAccuracy.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 block">
            {overallSummary.totalHits} / {overallSummary.totalAttempts} hits
          </span>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-400 block font-sans">3-Dart Match Avg</span>
          <div className="text-2xl font-bold text-white mt-0.5">
            {overallSummary.overall3DartAvg.toFixed(1)}
          </div>
          <span className="text-[11px] text-slate-500 block font-sans">
            {overallSummary.totalMatchesPlayed} completed matches
          </span>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-400 block font-sans">Session Logs Count</span>
          <div className="text-2xl font-bold text-white mt-0.5">
            {state.trainingLogs.length}
          </div>
          <span className="text-[11px] text-slate-500 block font-sans">
            Max 500 recent
          </span>
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-400 block font-sans">Device Storage</span>
          <div className="text-2xl font-bold text-cyan-400 mt-0.5">
            100% Offline
          </div>
          <span className="text-[11px] text-slate-500 block font-sans">
            Local browser storage
          </span>
        </div>
      </div>

      {/* Segmented View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-0.5 bg-[#0a0e16] border border-[#1f2838] rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('accuracy')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'accuracy'
                ? 'bg-[#182334] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Segment Accuracy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matches')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'matches'
                ? 'bg-[#182334] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Match History ({state.matchHistory.length})
          </button>
        </div>

        {/* Cadangan 3 UI: Sub-toggle for Tabular Table vs Radial Dartboard Heatmap */}
        {activeTab === 'accuracy' && (
          <div className="flex items-center gap-1 p-0.5 bg-[#0a0e16] border border-[#1f2838] rounded-lg">
            <button
              type="button"
              onClick={() => setAccuracyDisplayMode('table')}
              className={`py-1 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                accuracyDisplayMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setAccuracyDisplayMode('heatmap')}
              className={`py-1 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                accuracyDisplayMode === 'heatmap'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Radial Heatmap</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: Accuracy Views */}
      {activeTab === 'accuracy' && (
        <div className="space-y-4">
          {accuracyDisplayMode === 'table' ? (
            /* Table Mode */
            <div className="space-y-3">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(
                  [
                    ['all', 'All Segments'],
                    ['number', 'Numbers (1–20)'],
                    ['double', 'Doubles'],
                    ['triple', 'Triples'],
                    ['bull', 'Bullseye (IB / OB)'],
                  ] as [CategoryFilter, string][]
                ).map(([cat, label]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`py-1.5 px-3 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-[#1e293b] text-white'
                        : 'bg-[#101622] text-slate-400 hover:text-white border border-[#1f2838]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Clean Data Table */}
              <div className="bg-[#101622] border border-[#1f2838] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#0b0f17] border-b border-[#1f2838] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Target Segment</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Attempts</th>
                        <th className="py-3 px-4 text-right">Hits</th>
                        <th className="py-3 px-4 text-right">Accuracy (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#182232] font-mono-numbers">
                      {filteredRows.map((row) => {
                        const isHigh = row.accuracy >= 50 && row.attempts > 0;
                        return (
                          <tr key={row.targetKey} className="hover:bg-[#131b28] transition-colors">
                            <td className="py-2.5 px-4 font-bold text-white">
                              <span className="font-sans mr-2">{row.label}</span>
                              <span className="text-[11px] text-slate-400 font-mono-numbers">
                                [{row.targetKey}]
                              </span>
                            </td>
                            <td className="py-2.5 px-4 capitalize font-sans text-slate-400">
                              {row.category}
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-300">
                              {row.attempts}
                            </td>
                            <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                              {row.hits}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <span
                                className={`font-bold ${
                                  isHigh
                                    ? 'text-emerald-400'
                                    : row.attempts > 0
                                    ? 'text-amber-400'
                                    : 'text-slate-600'
                                }`}
                              >
                                {row.accuracy.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredRows.every((r) => r.attempts === 0) && (
                  <div className="p-8 text-center space-y-1">
                    <p className="text-slate-400 text-xs">
                      No throws recorded yet for this category (0 / 0 — 0.0%).
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Use the Training tab to start logging practice throws.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Cadangan 3 UI: Radial Target Heatmap Mode */
            <div className="bg-[#101622] border border-[#1f2838] rounded-xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2434] pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Dartboard Accuracy & Frequency Heatmap</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Segments glow from cool navy to fiery red based on your practice hit volume.
                  </p>
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono-numbers text-slate-400">
                  <span>Cold</span>
                  <div className="flex h-3 w-24 rounded overflow-hidden border border-slate-700">
                    <div className="flex-1 bg-[#1e3a5f]" />
                    <div className="flex-1 bg-[#0284c7]" />
                    <div className="flex-1 bg-[#f59e0b]" />
                    <div className="flex-1 bg-[#dc2626]" />
                  </div>
                  <span>Hot</span>
                </div>
              </div>

              {/* Heatmap Board & Inspector Split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 flex justify-center">
                  <DartboardSvg
                    onSegmentSelect={() => {}}
                    heatmapData={state.trainingStats}
                    onHeatmapSegmentHover={(seg) => setHoveredSegment(seg)}
                  />
                </div>

                {/* Live Segment Inspector Card */}
                <div className="md:col-span-5 space-y-3">
                  <div className="bg-[#0b0f17] border border-[#1f2838] rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Segment Inspector</span>
                    </div>

                    {hoveredSegment ? (
                      <div className="space-y-3 animate-in fade-in">
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-black font-mono-numbers text-white">
                            {hoveredSegment}
                          </span>
                          <span className="text-xs text-emerald-400 font-mono-numbers font-bold">
                            {inspectedData && inspectedData.attempts > 0
                              ? `${((inspectedData.hits / inspectedData.attempts) * 100).toFixed(1)}% Accuracy`
                              : '0.0%'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1a2333] font-mono-numbers text-xs">
                          <div className="bg-[#121927] p-2.5 rounded-lg border border-[#1e2738]">
                            <span className="text-[10px] text-slate-400 block font-sans">Total Attempts</span>
                            <span className="text-lg font-bold text-white">
                              {inspectedData?.attempts || 0}
                            </span>
                          </div>
                          <div className="bg-[#121927] p-2.5 rounded-lg border border-[#1e2738]">
                            <span className="text-[10px] text-slate-400 block font-sans">Successful Hits</span>
                            <span className="text-lg font-bold text-emerald-400">
                              {inspectedData?.hits || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-500 text-xs space-y-1">
                        <p>Hover or touch any segment on the board</p>
                        <p className="text-[11px] text-slate-600">to inspect localized target statistics.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Match History */}
      {activeTab === 'matches' && (
        <div className="space-y-3">
          {state.matchHistory.length === 0 ? (
            <div className="bg-[#101622] border border-[#1f2838] rounded-xl p-8 text-center space-y-2">
              <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-semibold text-sm">No Matches Recorded Yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Play an X01 match in Solo or Pass-and-Play mode to save official match records here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.matchHistory.map((m) => {
                const dateStr = new Date(m.date).toLocaleDateString([], {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={m.id}
                    className="bg-[#101622] border border-[#1f2838] rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono-numbers">
                        <span className="font-extrabold text-emerald-400 text-sm">
                          {m.gameType}
                        </span>
                        <span className="text-slate-500 font-sans">·</span>
                        <span className="uppercase text-slate-300 font-sans font-semibold">
                          {m.outMode}-OUT
                        </span>
                        {m.legsToWin && (
                          <>
                            <span className="text-slate-500 font-sans">·</span>
                            <span className="text-amber-400 font-sans font-bold">
                              First to {m.legsToWin} Legs
                            </span>
                          </>
                        )}
                        <span className="text-slate-500 font-sans">·</span>
                        <span className="text-slate-400 font-sans">{dateStr}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Winner: {m.winner}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono-numbers">
                      {m.players.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#0b0f17] border border-[#1b2535] rounded-lg text-xs"
                        >
                          <div className="font-bold text-white font-sans truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                            <span>3-Dart Avg:</span>
                            <span className="text-emerald-400 font-bold">{p.threeDartAvg}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex justify-between">
                            <span>Total Darts:</span>
                            <span className="text-white font-bold">{p.dartsThrown}</span>
                          </div>
                          {p.legsWon !== undefined && (
                            <div className="text-[11px] text-slate-400 flex justify-between">
                              <span>Legs Won:</span>
                              <span className="text-amber-400 font-bold">{p.legsWon}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Two-step Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#101622] border border-rose-900/60 rounded-xl max-w-sm w-full p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-display">
                {resetStep === 1 ? 'Reset Stored Records?' : 'Confirm Data Deletion (Step 2/2)'}
              </h3>
              <p className="text-xs text-slate-400">
                {resetStep === 1
                  ? 'This will clear all match records, practice accuracy logs, and active games from browser storage.'
                  : 'Are you completely sure? This action cannot be undone. Download a JSON backup first if needed.'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetStep(1);
                }}
                className="flex-1 h-10 bg-[#161f2e] hover:bg-[#1f2b3f] text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              {resetStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setResetStep(2)}
                  className="flex-1 h-10 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  className="flex-1 h-10 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Permanently Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
