import { DartThrow } from '../types/dart';

// Standard Clockface numbering starting at 12 o'clock and moving clockwise
export const CLOCKWISE_NUMBERS: number[] = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

// Segments where double/triple rings are RED on standard boards
export const RED_NUMBERS = new Set([20, 18, 13, 10, 2, 3, 7, 8, 14, 12]);

/**
 * Parse standard dart segment code into a DartThrow object
 */
export function parseSegment(rawCode: string): DartThrow {
  if (!rawCode) {
    return { segment: 'MISS', score: 0, number: 0, multiplier: 0 };
  }

  const code = rawCode.trim().toUpperCase();

  if (code === 'MISS' || code === '0' || code === 'M') {
    return { segment: 'MISS', score: 0, number: 0, multiplier: 0 };
  }

  // Inner Bull / Double Bull (50 pts, red, counts as double)
  if (code === 'IB' || code === 'BULL' || code === 'DB' || code === 'D25' || code === 'DOUBLE BULL') {
    return { segment: 'IB', score: 50, number: 25, multiplier: 2 };
  }

  // Outer Bull / Single Bull (25 pts, green)
  if (code === 'OB' || code === 'SB' || code === 'S25' || code === '25' || code === 'SINGLE BULL') {
    return { segment: 'OB', score: 25, number: 25, multiplier: 1 };
  }

  // Triple (T1 - T20)
  const tripleMatch = code.match(/^T(\d{1,2})$/);
  if (tripleMatch) {
    const num = parseInt(tripleMatch[1], 10);
    if (num >= 1 && num <= 20) {
      return { segment: `T${num}`, score: num * 3, number: num, multiplier: 3 };
    }
  }

  // Double (D1 - D20)
  const doubleMatch = code.match(/^D(\d{1,2})$/);
  if (doubleMatch) {
    const num = parseInt(doubleMatch[1], 10);
    if (num >= 1 && num <= 20) {
      return { segment: `D${num}`, score: num * 2, number: num, multiplier: 2 };
    }
  }

  // Single (S1 - S20)
  const singleMatch = code.match(/^S(\d{1,2})$/);
  if (singleMatch) {
    const num = parseInt(singleMatch[1], 10);
    if (num >= 1 && num <= 20) {
      return { segment: `S${num}`, score: num * 1, number: num, multiplier: 1 };
    }
  }

  // Plain number (e.g. "20" -> S20)
  const plainNum = parseInt(code, 10);
  if (!isNaN(plainNum) && plainNum >= 1 && plainNum <= 20) {
    return { segment: `S${plainNum}`, score: plainNum, number: plainNum, multiplier: 1 };
  }

  return { segment: 'MISS', score: 0, number: 0, multiplier: 0 };
}

/**
 * Check if a dart qualifies as a Double for Double-Out finishes
 * (D1-D20 or Inner Bull IB which is 50 pts double bull)
 */
export function isDoubleDart(dart: DartThrow): boolean {
  return dart.multiplier === 2 && (dart.segment.startsWith('D') || dart.segment === 'IB');
}

/**
 * Bogey numbers under 170 that cannot be checked out with 3 darts
 */
export const BOGEY_NUMBERS = new Set([169, 168, 166, 165, 163, 162, 159]);

/**
 * Canonical checkout guide table for Double-Out
 */
const CANONICAL_CHECKOUTS: Record<number, string> = {
  170: 'T20 T20 BULL',
  167: 'T20 T19 BULL',
  164: 'T20 T18 BULL',
  161: 'T20 T17 BULL',
  160: 'T20 T20 D20',
  158: 'T20 T20 D19',
  157: 'T20 T19 D20',
  156: 'T20 T20 D18',
  155: 'T20 T19 D19',
  154: 'T20 T18 D20',
  153: 'T20 T19 D18',
  152: 'T20 T20 D16',
  151: 'T20 T17 D20',
  150: 'T20 T18 D18',
  149: 'T20 T19 D16',
  148: 'T20 T20 D14',
  147: 'T20 T17 D18',
  146: 'T20 T18 D16',
  145: 'T20 T15 D20',
  144: 'T20 T20 D12',
  143: 'T20 T17 D16',
  142: 'T20 T14 D20',
  141: 'T20 T19 D12',
  140: 'T20 T20 D10',
  139: 'T20 T13 D20',
  138: 'T20 T18 D12',
  137: 'T19 T16 D16',
  136: 'T20 T20 D8',
  135: 'T20 T17 D12',
  134: 'T20 T14 D16',
  133: 'T20 T19 D8',
  132: 'T20 T16 D12',
  131: 'T20 T13 D16',
  130: 'T20 T18 D8',
  129: 'T19 T16 D12',
  128: 'T18 T14 D16',
  127: 'T20 T17 D8',
  126: 'T19 T19 D6',
  125: '25 T20 D20',
  124: 'T20 T16 D8',
  123: 'T19 T16 D9',
  122: 'T18 T20 D4',
  121: 'T20 T11 D14',
  120: 'T20 S20 D20',
  119: 'T19 T10 D16',
  118: 'T20 S18 D20',
  117: 'T20 S17 D20',
  116: 'T20 S16 D20',
  115: 'T20 S15 D20',
  114: 'T20 S14 D20',
  113: 'T19 S16 D20',
  112: 'T20 S12 D20',
  111: 'T20 S19 D16',
  110: 'T20 S18 D16',
  109: 'T20 S17 D16',
  108: 'T20 S16 D16',
  107: 'T19 S18 D16',
  106: 'T20 S14 D16',
  105: 'T20 S13 D16',
  104: 'T18 S18 D16',
  103: 'T20 S3 D20',
  102: 'T20 S10 D16',
  101: 'T17 S18 D16',
  100: 'T20 D20',
  99: 'T19 S10 D16',
  98: 'T20 D19',
  97: 'T19 D20',
  96: 'T20 D18',
  95: 'T19 D19',
  94: 'T18 D20',
  93: 'T19 D18',
  92: 'T20 D16',
  91: 'T17 D20',
  90: 'T18 D18',
  89: 'T19 D16',
  88: 'T16 D20',
  87: 'T17 D18',
  86: 'T18 D16',
  85: 'T15 D20',
  84: 'T20 D12',
  83: 'T17 D16',
  82: 'T14 D20',
  81: 'T19 D12',
  80: 'T20 D10',
  79: 'T13 D20',
  78: 'T18 D12',
  77: 'T15 D16',
  76: 'T20 D8',
  75: 'T17 D12',
  74: 'T14 D16',
  73: 'T19 D8',
  72: 'T16 D12',
  71: 'T13 D16',
  70: 'T10 D20',
  69: 'T15 D12',
  68: 'T20 D4',
  67: 'T17 D8',
  66: 'T10 D18',
  65: '25 D20',
  64: 'T16 D8',
  63: 'T13 D12',
  62: 'T10 D16',
  61: 'T15 D8',
  60: 'S20 D20',
  59: 'S19 D20',
  58: 'S18 D20',
  57: 'S17 D20',
  56: 'S16 D20',
  55: 'S15 D20',
  54: 'S14 D20',
  53: 'S13 D20',
  52: 'S12 D20',
  51: 'S11 D20',
  50: 'BULL',
  49: 'S9 D20',
  48: 'S16 D16',
  47: 'S15 D16',
  46: 'S6 D20',
  45: 'S13 D16',
  44: 'S12 D16',
  43: 'S3 D20',
  42: 'S10 D16',
  41: 'S9 D16',
  40: 'D20',
  39: 'S7 D16',
  38: 'D19',
  37: 'S5 D16',
  36: 'D18',
  35: 'S3 D16',
  34: 'D17',
  33: 'S1 D16',
  32: 'D16',
  31: 'S15 D8',
  30: 'D15',
  29: 'S13 D8',
  28: 'D14',
  27: 'S11 D8',
  26: 'D13',
  25: 'S9 D8',
  24: 'D12',
  23: 'S7 D8',
  22: 'D11',
  21: 'S5 D8',
  20: 'D10',
  19: 'S3 D8',
  18: 'D9',
  17: 'S1 D8',
  16: 'D8',
  15: 'S7 D4',
  14: 'D7',
  13: 'S5 D4',
  12: 'D6',
  11: 'S3 D4',
  10: 'D5',
  9: 'S1 D4',
  8: 'D4',
  7: 'S3 D2',
  6: 'D3',
  5: 'S1 D2',
  4: 'D2',
  3: 'S1 D1',
  2: 'D1',
};

/**
 * Get dynamic checkout suggestion based on remaining points and remaining darts in current turn
 */
export function getCheckoutSuggestion(remainingScore: number, dartsRemainingInTurn: number = 3): string | null {
  if (remainingScore < 2) return null;
  if (remainingScore > 170) return null;
  if (BOGEY_NUMBERS.has(remainingScore)) return null;

  // 1 Dart remaining in turn
  if (dartsRemainingInTurn === 1) {
    if (remainingScore === 50) return 'BULL';
    if (remainingScore <= 40 && remainingScore % 2 === 0) {
      return `D${remainingScore / 2}`;
    }
    return null; // Cannot finish with 1 dart if odd or > 40 (except 50)
  }

  // 2 Darts remaining in turn
  if (dartsRemainingInTurn === 2) {
    if (remainingScore === 50) return 'BULL';
    if (remainingScore <= 40 && remainingScore % 2 === 0) {
      return `D${remainingScore / 2}`;
    }
    if (remainingScore <= 110) {
      // Find single or triple + double finish
      // Check if standard checkout is 2 darts
      const std = CANONICAL_CHECKOUTS[remainingScore];
      if (std) {
        const parts = std.split(' ');
        if (parts.length <= 2) return std;
      }
      // Calculate 2-dart finish:
      // Try single first for simple scores
      for (let s = 1; s <= 20; s++) {
        const rem = remainingScore - s;
        if (rem === 50) return `S${s} BULL`;
        if (rem > 0 && rem <= 40 && rem % 2 === 0) {
          return `S${s} D${rem / 2}`;
        }
      }
      // Try triple
      for (let t = 20; t >= 1; t--) {
        const rem = remainingScore - t * 3;
        if (rem === 50) return `T${t} BULL`;
        if (rem > 0 && rem <= 40 && rem % 2 === 0) {
          return `T${t} D${rem / 2}`;
        }
      }
    }
    return null;
  }

  // 3 Darts remaining in turn
  return CANONICAL_CHECKOUTS[remainingScore] || null;
}

/**
 * Check if actual dart hit matches intended target
 */
export function evaluateTargetHit(actualSegment: string, intendedTarget: string): boolean {
  if (!actualSegment || !intendedTarget) return false;
  const actual = actualSegment.toUpperCase().trim();
  const target = intendedTarget.toUpperCase().trim();

  if (actual === 'MISS' || actual === '0') return false;

  // Exact match
  if (actual === target) return true;

  // Target is general number (e.g. "20", "19", "1")
  const targetNum = parseInt(target, 10);
  if (!isNaN(targetNum) && targetNum >= 1 && targetNum <= 20) {
    // Matches if actual is S{targetNum}, D{targetNum}, or T{targetNum}
    const actualParsed = parseSegment(actual);
    return actualParsed.number === targetNum;
  }

  // Target is Bullseye in general ("BULL" or "25")
  if (target === 'BULL' || target === '25' || target === 'BULLSEYE') {
    return actual === 'IB' || actual === 'OB';
  }

  // Specific Double, Triple, or Bull match
  return false;
}

/**
 * Get category grouping for a target
 */
export function getTargetCategory(targetKey: string): 'number' | 'single' | 'double' | 'triple' | 'bull' {
  const t = targetKey.toUpperCase().trim();
  if (t === 'IB' || t === 'OB' || t === 'BULL' || t === '25') return 'bull';
  if (t.startsWith('T')) return 'triple';
  if (t.startsWith('D')) return 'double';
  if (t.startsWith('S')) return 'single';
  return 'number';
}
