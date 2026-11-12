import { ActiveMatch, AppState, FinishedMatch, TargetAccuracy, TrainingLogEntry, TrainingStatsMap } from '../types/dart';
import { getTargetCategory } from './dartMath';

const STORAGE_KEY = 'dartvision_v1_state';
const MAX_LOG_RECORDS = 500;

const DEFAULT_STATE: AppState = {
  activeMatch: null,
  matchHistory: [],
  trainingStats: {},
  trainingLogs: [],
};

/**
 * Load complete application state from localStorage
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      activeMatch: parsed.activeMatch || null,
      matchHistory: Array.isArray(parsed.matchHistory) ? parsed.matchHistory : [],
      trainingStats: parsed.trainingStats && typeof parsed.trainingStats === 'object' ? parsed.trainingStats : {},
      trainingLogs: Array.isArray(parsed.trainingLogs) ? parsed.trainingLogs : [],
    };
  } catch (err) {
    console.error('Error loading DartVision state from localStorage:', err);
    return DEFAULT_STATE;
  }
}

/**
 * Save complete application state to localStorage with quota protection
 */
export function saveState(state: AppState): void {
  try {
    // Enforce 500 max logs quota
    let logs = state.trainingLogs;
    if (logs.length > MAX_LOG_RECORDS) {
      logs = logs.slice(-MAX_LOG_RECORDS);
    }

    const payload = JSON.stringify({
      ...state,
      trainingLogs: logs,
    });
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.warn('LocalStorage save failed, attempting prune:', err);
    try {
      // Emergency pruning of older logs to save aggregate stats
      const prunedLogs = state.trainingLogs.slice(-100);
      const reducedPayload = JSON.stringify({
        ...state,
        trainingLogs: prunedLogs,
      });
      localStorage.setItem(STORAGE_KEY, reducedPayload);
    } catch (criticalErr) {
      console.error('LocalStorage critical save error:', criticalErr);
    }
  }
}

/**
 * Save active match state for persistence during play
 */
export function saveActiveMatch(match: ActiveMatch | null): void {
  const current = loadState();
  current.activeMatch = match;
  saveState(current);
}

/**
 * Save completed match into match history and clear active match
 */
export function saveFinishedMatch(match: FinishedMatch): void {
  const current = loadState();
  current.activeMatch = null;
  current.matchHistory.unshift(match);
  saveState(current);
}

/**
 * Record a training turn with 3 throws
 */
export function saveTrainingTurn(throws: { actual: string; target: string; isHit: boolean }[]): void {
  const current = loadState();
  const timestamp = new Date().toISOString();
  const id = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Update training stats aggregate
  const stats: TrainingStatsMap = { ...current.trainingStats };

  for (const th of throws) {
    const targetKey = th.target.toUpperCase().trim();
    if (!targetKey) continue;

    if (!stats[targetKey]) {
      stats[targetKey] = { attempts: 0, hits: 0 };
    }
    stats[targetKey].attempts += 1;
    if (th.isHit) {
      stats[targetKey].hits += 1;
    }

    // Also update parent number category if target was specific e.g. T20 -> also attribute to "20"
    const parsedNumMatch = targetKey.match(/^[SDT](\d{1,2})$/);
    if (parsedNumMatch) {
      const parentNum = parsedNumMatch[1];
      if (!stats[parentNum]) {
        stats[parentNum] = { attempts: 0, hits: 0 };
      }
      stats[parentNum].attempts += 1;
      if (th.isHit) {
        stats[parentNum].hits += 1;
      }
    }
  }

  const logEntry: TrainingLogEntry = {
    id,
    timestamp,
    throws,
  };

  current.trainingStats = stats;
  current.trainingLogs.unshift(logEntry);
  saveState(current);
}

/**
 * Compute aggregated accuracy rows for display
 */
export function getAccuracyTable(stats: TrainingStatsMap): TargetAccuracy[] {
  const rows: TargetAccuracy[] = [];

  // 1 to 20 numbers
  for (let i = 20; i >= 1; i--) {
    const key = i.toString();
    const data = stats[key] || { attempts: 0, hits: 0 };
    const acc = data.attempts > 0 ? (data.hits / data.attempts) * 100 : 0;
    rows.push({
      targetKey: key,
      label: `Number ${key}`,
      category: 'number',
      attempts: data.attempts,
      hits: data.hits,
      accuracy: Math.round(acc * 10) / 10,
    });
  }

  // Common Triples (T20, T19, T18, T17, T16, T15)
  [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10].forEach((n) => {
    const key = `T${n}`;
    const data = stats[key] || { attempts: 0, hits: 0 };
    const acc = data.attempts > 0 ? (data.hits / data.attempts) * 100 : 0;
    rows.push({
      targetKey: key,
      label: `Triple ${n} (${n * 3} pts)`,
      category: 'triple',
      attempts: data.attempts,
      hits: data.hits,
      accuracy: Math.round(acc * 10) / 10,
    });
  });

  // Common Doubles (D20, D16, D10, D8, D12, D18, D4, D2, D1)
  [20, 16, 10, 8, 12, 18, 14, 6, 4, 2, 1].forEach((n) => {
    const key = `D${n}`;
    const data = stats[key] || { attempts: 0, hits: 0 };
    const acc = data.attempts > 0 ? (data.hits / data.attempts) * 100 : 0;
    rows.push({
      targetKey: key,
      label: `Double ${n} (${n * 2} pts)`,
      category: 'double',
      attempts: data.attempts,
      hits: data.hits,
      accuracy: Math.round(acc * 10) / 10,
    });
  });

  // Bullseyes
  const ibData = stats['IB'] || { attempts: 0, hits: 0 };
  const ibAcc = ibData.attempts > 0 ? (ibData.hits / ibData.attempts) * 100 : 0;
  rows.push({
    targetKey: 'IB',
    label: 'Inner Bull / Double Bull (50 pts)',
    category: 'bull',
    attempts: ibData.attempts,
    hits: ibData.hits,
    accuracy: Math.round(ibAcc * 10) / 10,
  });

  const obData = stats['OB'] || { attempts: 0, hits: 0 };
  const obAcc = obData.attempts > 0 ? (obData.hits / obData.attempts) * 100 : 0;
  rows.push({
    targetKey: 'OB',
    label: 'Outer Bull / Single Bull (25 pts)',
    category: 'bull',
    attempts: obData.attempts,
    hits: obData.hits,
    accuracy: Math.round(obAcc * 10) / 10,
  });

  return rows;
}

/**
 * Get overall summary metric numbers
 */
export function getOverallSummary(stats: TrainingStatsMap, matchHistory: FinishedMatch[]) {
  let totalAttempts = 0;
  let totalHits = 0;

  // Sum non-parent distinct throws from all keys
  Object.entries(stats).forEach(([k, v]) => {
    if (!k.match(/^\d+$/)) {
      totalAttempts += v.attempts;
      totalHits += v.hits;
    }
  });

  // If no detailed keys yet, sum numbers
  if (totalAttempts === 0) {
    for (let i = 1; i <= 20; i++) {
      const v = stats[i.toString()];
      if (v) {
        totalAttempts += v.attempts;
        totalHits += v.hits;
      }
    }
  }

  const accuracy = totalAttempts > 0 ? (totalHits / totalAttempts) * 100 : 0;

  // Calculate 3-dart average across recent matches
  let total3DartAvgSum = 0;
  let matchesCount = 0;
  matchHistory.forEach((m) => {
    m.players.forEach((p) => {
      if (p.threeDartAvg > 0) {
        total3DartAvgSum += p.threeDartAvg;
        matchesCount++;
      }
    });
  });
  const avg3Dart = matchesCount > 0 ? total3DartAvgSum / matchesCount : 0;

  return {
    totalAttempts,
    totalHits,
    overallAccuracy: Math.round(accuracy * 10) / 10,
    overall3DartAvg: Math.round(avg3Dart * 10) / 10,
    totalMatchesPlayed: matchHistory.length,
  };
}

/**
 * Export full state as JSON string
 */
export function exportStateAsJson(): string {
  const state = loadState();
  return JSON.stringify(state, null, 2);
}

/**
 * Export training accuracy table and match history as CSV string
 */
export function exportStateAsCsv(): string {
  const state = loadState();
  const accuracyRows = getAccuracyTable(state.trainingStats);

  let csv = '=== DARTVISION ACCURACY STATS ===\n';
  csv += 'Category,Target Segment,Attempts,Hits,Accuracy (%)\n';
  accuracyRows.forEach((r) => {
    csv += `"${r.category}","${r.targetKey}",${r.attempts},${r.hits},${r.accuracy.toFixed(1)}%\n`;
  });

  csv += '\n=== MATCH HISTORY ===\n';
  csv += 'Date,Game Type,Out Mode,Winner,Player Name,Darts Thrown,3-Dart Avg,Highest Turn\n';
  state.matchHistory.forEach((m) => {
    const formattedDate = new Date(m.date).toLocaleDateString();
    m.players.forEach((p) => {
      csv += `"${formattedDate}",${m.gameType},"${m.outMode}","${m.winner}","${p.name}",${p.dartsThrown},${p.threeDartAvg.toFixed(1)},${p.highestTurn}\n`;
    });
  });

  return csv;
}

/**
 * Import state from JSON
 */
export function importStateFromJson(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON file format.' };
    }

    const state: AppState = {
      activeMatch: data.activeMatch || null,
      matchHistory: Array.isArray(data.matchHistory) ? data.matchHistory : [],
      trainingStats: data.trainingStats && typeof data.trainingStats === 'object' ? data.trainingStats : {},
      trainingLogs: Array.isArray(data.trainingLogs) ? data.trainingLogs : [],
    };

    saveState(state);
    return { success: true, message: 'Data backup successfully restored.' };
  } catch (err: any) {
    return { success: false, message: `JSON import error: ${err?.message || 'Corrupted file'}` };
  }
}

/**
 * Reset all stored data
 */
export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
