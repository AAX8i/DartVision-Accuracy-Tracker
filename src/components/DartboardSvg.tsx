import React, { useState, useRef } from 'react';
import { CLOCKWISE_NUMBERS, RED_NUMBERS, parseSegment } from '../utils/dartMath';
import { DartThrow } from '../types/dart';
import { RotateCcw, ZoomIn, ZoomOut, Target, Flame } from 'lucide-react';

interface DartboardSvgProps {
  onSegmentSelect: (throwData: DartThrow) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  disabled?: boolean;
  currentTurnDarts?: DartThrow[];
  heatmapData?: Record<string, { attempts: number; hits: number }>;
  onHeatmapSegmentHover?: (segment: string | null) => void;
}

export const DartboardSvg: React.FC<DartboardSvgProps> = ({
  onSegmentSelect,
  onUndo,
  canUndo = false,
  disabled = false,
  currentTurnDarts = [],
  heatmapData,
  onHeatmapSegmentHover,
}) => {
  const [selectedMultiplier, setSelectedMultiplier] = useState<'AUTO' | 'S' | 'D' | 'T'>('AUTO');
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Touch Loupe State
  const [loupeState, setLoupeState] = useState<{
    x: number;
    y: number;
    svgX: number;
    svgY: number;
    segmentCode: string;
    label: string;
    score: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Dartboard dimensions in SVG coordinate space
  const R_IB = 8;         // Inner bull (red, 50 pts)
  const R_OB = 19;        // Outer bull (green, 25 pts)
  const R_T_INNER = 97;   // Triple inner radius
  const R_T_OUTER = 107;  // Triple outer radius
  const R_D_INNER = 162;  // Double inner radius
  const R_D_OUTER = 170;  // Double outer radius
  const R_BOARD = 216;    // Number wire outer circle radius

  const polarToCartesian = (radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: radius * Math.cos(angleInRadians),
      y: radius * Math.sin(angleInRadians),
    };
  };

  const describeWedge = (r1: number, r2: number, startAngle: number, endAngle: number) => {
    const p1 = polarToCartesian(r2, startAngle);
    const p2 = polarToCartesian(r2, endAngle);
    const p3 = polarToCartesian(r1, endAngle);
    const p4 = polarToCartesian(r1, startAngle);

    return [
      `M ${p1.x} ${p1.y}`,
      `A ${r2} ${r2} 0 0 1 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${r1} ${r1} 0 0 0 ${p4.x} ${p4.y}`,
      'Z',
    ].join(' ');
  };

  // Helper to compute dart pin coordinates on SVG
  const getDartPinPosition = (dart: DartThrow, dartIndex: number) => {
    if (dart.segment === 'MISS') return null;
    if (dart.segment === 'IB') {
      const jitterAngle = dartIndex * 120;
      return polarToCartesian(dartIndex === 0 ? 0 : 4, jitterAngle);
    }
    if (dart.segment === 'OB') {
      const angle = dartIndex * 110 + 35;
      return polarToCartesian(13, angle);
    }

    const numMatch = dart.segment.match(/^[SDT](\d+)$/);
    if (!numMatch) return null;
    const num = parseInt(numMatch[1], 10);
    const clockIndex = CLOCKWISE_NUMBERS.indexOf(num);
    if (clockIndex === -1) return null;

    const baseAngle = clockIndex * 18;
    const jitterAngle = baseAngle + (dartIndex - 1) * 3.8;

    let radius = 135; // Default outer single
    if (dart.segment.startsWith('T')) {
      radius = (R_T_INNER + R_T_OUTER) / 2;
    } else if (dart.segment.startsWith('D')) {
      radius = (R_D_INNER + R_D_OUTER) / 2;
    } else if (dart.segment.startsWith('S')) {
      // Alternate between inner and outer single for realism
      radius = dartIndex % 2 === 0 ? 134 : 62;
    }

    return polarToCartesian(radius, jitterAngle);
  };

  // Heatmap Color Interpolation
  const maxHeatmapAttempts = heatmapData
    ? Math.max(...Object.values(heatmapData).map((d) => d.attempts || 0), 1)
    : 1;

  const getHeatmapColor = (segmentCode: string, defaultColor: string) => {
    if (!heatmapData) return defaultColor;
    const stat = heatmapData[segmentCode];
    if (!stat || stat.attempts === 0) return '#101726'; // Subdued inactive

    const ratio = Math.min(stat.attempts / maxHeatmapAttempts, 1);
    if (ratio < 0.25) return '#1e3a5f'; // Cold blue
    if (ratio < 0.55) return '#0284c7'; // Active cyan
    if (ratio < 0.8) return '#f59e0b';  // Warm amber
    return '#dc2626';                   // Hot crimson red
  };

  const handleSegmentClick = (segmentCode: string) => {
    if (disabled) return;

    let finalCode = segmentCode;

    if (selectedMultiplier !== 'AUTO') {
      const match = segmentCode.match(/^[SDT](\d+)$/);
      if (match) {
        const num = match[1];
        finalCode = `${selectedMultiplier}${num}`;
      }
    }

    setActiveHighlight(finalCode);
    setTimeout(() => setActiveHighlight(null), 250);

    const parsed = parseSegment(finalCode);
    onSegmentSelect(parsed);
  };

  // Pointer movement tracking for Touch Loupe (Cadangan 5)
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (disabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const relX = clientX - rect.left - rect.width / 2;
    const relY = clientY - rect.top - rect.height / 2;

    const svgRadiusRatio = 450 / rect.width;
    const svgX = relX * svgRadiusRatio;
    const svgY = relY * svgRadiusRatio;

    const r = Math.sqrt(svgX * svgX + svgY * svgY);
    if (r > R_BOARD + 10) {
      setLoupeState(null);
      if (onHeatmapSegmentHover) onHeatmapSegmentHover(null);
      return;
    }

    // Compute angle from top (12 o'clock = 0 deg)
    let angle = (Math.atan2(svgY, svgX) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    let segmentCode = 'MISS';
    let label = 'Miss (0 pts)';
    let score = 0;

    if (r <= R_IB) {
      segmentCode = 'IB';
      label = 'Double Bull (50 pts)';
      score = 50;
    } else if (r <= R_OB) {
      segmentCode = 'OB';
      label = 'Outer Bull (25 pts)';
      score = 25;
    } else if (r <= R_D_OUTER) {
      const wedgeIndex = Math.floor(((angle + 9) % 360) / 18);
      const num = CLOCKWISE_NUMBERS[wedgeIndex];

      if (r >= R_D_INNER && r <= R_D_OUTER) {
        segmentCode = `D${num}`;
        label = `Double ${num} (${num * 2} pts)`;
        score = num * 2;
      } else if (r >= R_T_INNER && r <= R_T_OUTER) {
        segmentCode = `T${num}`;
        label = `Triple ${num} (${num * 3} pts)`;
        score = num * 3;
      } else {
        segmentCode = `S${num}`;
        label = `Single ${num} (${num} pts)`;
        score = num;
      }
    }

    setLoupeState({
      x: clientX - rect.left,
      y: clientY - rect.top,
      svgX,
      svgY,
      segmentCode,
      label,
      score,
    });

    if (onHeatmapSegmentHover) {
      onHeatmapSegmentHover(segmentCode);
    }
  };

  const handlePointerLeave = () => {
    setLoupeState(null);
    if (onHeatmapSegmentHover) onHeatmapSegmentHover(null);
  };

  const pinColors = [
    { bg: '#38bdf8', text: '#090d14', border: '#7dd3fc', label: '1' },
    { bg: '#f59e0b', text: '#090d14', border: '#fcd34d', label: '2' },
    { bg: '#10b981', text: '#090d14', border: '#6ee7b7', label: '3' },
  ];

  return (
    <div className="flex flex-col items-center w-full select-none">
      {/* Console Multiplier Toolbar & View Options */}
      <div className="flex items-center justify-between w-full max-w-sm mb-3 text-xs">
        <div className="flex items-center bg-[#090d14] border border-[#1f2838] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setSelectedMultiplier('AUTO')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              selectedMultiplier === 'AUTO'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auto Hit
          </button>
          <button
            type="button"
            onClick={() => setSelectedMultiplier('S')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              selectedMultiplier === 'S'
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1x Single
          </button>
          <button
            type="button"
            onClick={() => setSelectedMultiplier('D')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              selectedMultiplier === 'D'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2x Double
          </button>
          <button
            type="button"
            onClick={() => setSelectedMultiplier('T')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              selectedMultiplier === 'T'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3x Treble
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          title={isZoomed ? 'Zoom Out' : 'Zoom In'}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#090d14] border border-[#1f2838] hover:border-[#334155] rounded-lg text-slate-300 transition-colors"
        >
          {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
          <span className="font-mono-numbers text-[11px]">{isZoomed ? '1.0x' : '1.4x'}</span>
        </button>
      </div>

      {/* High-Precision Sisal Dartboard SVG Container */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden transition-all duration-300 flex items-center justify-center rounded-full border-4 border-[#121927] shadow-2xl ${
          isZoomed
            ? 'w-[340px] h-[340px] sm:w-[400px] sm:h-[400px]'
            : 'w-[310px] h-[310px] sm:w-[360px] sm:h-[360px]'
        }`}
        style={{ touchAction: 'none' }}
      >
        <svg
          viewBox={isZoomed ? '-140 -140 280 280' : '-225 -225 450 450'}
          className="w-full h-full cursor-crosshair transition-transform duration-300"
          style={{ transformOrigin: 'center' }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {/* Matte Number Ring Background */}
            <radialGradient id="ringBg" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="#0a0e17" />
              <stop offset="98%" stopColor="#111724" />
              <stop offset="100%" stopColor="#080b12" />
            </radialGradient>

            {/* Dart Pin Drop Shadow Filter */}
            <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Outer Black Board Ring */}
          <circle cx="0" cy="0" r={R_BOARD} fill="url(#ringBg)" stroke="#222c3d" strokeWidth="2.5" />

          {/* 20 Clockface Wedges */}
          {CLOCKWISE_NUMBERS.map((num, i) => {
            const startAngle = i * 18 - 9;
            const endAngle = i * 18 + 9;
            const isRedNumber = RED_NUMBERS.has(num);

            // Sisal bristle colors or Heatmap overrides
            const defaultDoubleColor = isRedNumber ? '#c5221f' : '#137333';
            const defaultTripleColor = isRedNumber ? '#c5221f' : '#137333';
            const defaultSingleColor = isRedNumber ? '#141824' : '#ede8db';

            const dCode = `D${num}`;
            const tCode = `T${num}`;
            const sCode = `S${num}`;

            const doubleFill = getHeatmapColor(dCode, defaultDoubleColor);
            const tripleFill = getHeatmapColor(tCode, defaultTripleColor);
            const singleFill = getHeatmapColor(sCode, defaultSingleColor);

            const isDoubleActive = activeHighlight === dCode;
            const isTripleActive = activeHighlight === tCode;
            const isSingleActive = activeHighlight === sCode;

            const textPos = polarToCartesian(193, i * 18);

            return (
              <g key={`seg-${num}`}>
                {/* Double Ring (D) */}
                <path
                  d={describeWedge(R_D_INNER, R_D_OUTER, startAngle, endAngle)}
                  fill={isDoubleActive ? '#38bdf8' : doubleFill}
                  stroke="#334155"
                  strokeWidth="1.2"
                  className="transition-colors hover:brightness-125 active:brightness-150"
                  onClick={() => handleSegmentClick(dCode)}
                >
                  <title>{`Double ${num} (${num * 2} pts)`}</title>
                </path>

                {/* Outer Single Wedge (S) */}
                <path
                  d={describeWedge(R_T_OUTER, R_D_INNER, startAngle, endAngle)}
                  fill={isSingleActive ? '#38bdf8' : singleFill}
                  stroke="#334155"
                  strokeWidth="1.2"
                  className="transition-colors hover:brightness-110 active:brightness-125"
                  onClick={() => handleSegmentClick(sCode)}
                >
                  <title>{`Single ${num} (${num} pts)`}</title>
                </path>

                {/* Triple Ring (T) */}
                <path
                  d={describeWedge(R_T_INNER, R_T_OUTER, startAngle, endAngle)}
                  fill={isTripleActive ? '#38bdf8' : tripleFill}
                  stroke="#334155"
                  strokeWidth="1.2"
                  className="transition-colors hover:brightness-125 active:brightness-150"
                  onClick={() => handleSegmentClick(tCode)}
                >
                  <title>{`Triple ${num} (${num * 3} pts)`}</title>
                </path>

                {/* Inner Single Wedge (S) */}
                <path
                  d={describeWedge(R_OB, R_T_INNER, startAngle, endAngle)}
                  fill={isSingleActive ? '#38bdf8' : singleFill}
                  stroke="#334155"
                  strokeWidth="1.2"
                  className="transition-colors hover:brightness-110 active:brightness-125"
                  onClick={() => handleSegmentClick(sCode)}
                >
                  <title>{`Single ${num} (${num} pts)`}</title>
                </path>

                {/* Outer Wire Ring White Numeral */}
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="22"
                  fontWeight="800"
                  fontFamily="'Outfit', sans-serif"
                  className="pointer-events-none select-none"
                >
                  {num}
                </text>
              </g>
            );
          })}

          {/* Outer Bull (25 pts - Tournament Green or Heatmap) */}
          <circle
            cx="0"
            cy="0"
            r={R_OB}
            fill={activeHighlight === 'OB' ? '#38bdf8' : getHeatmapColor('OB', '#137333')}
            stroke="#475569"
            strokeWidth="1.2"
            className="transition-colors hover:brightness-125 active:brightness-150 cursor-pointer"
            onClick={() => handleSegmentClick('OB')}
          >
            <title>Outer Bull (25 pts)</title>
          </circle>

          {/* Inner Bull (50 pts - Double Bull Red or Heatmap) */}
          <circle
            cx="0"
            cy="0"
            r={R_IB}
            fill={activeHighlight === 'IB' ? '#38bdf8' : getHeatmapColor('IB', '#c5221f')}
            stroke="#94a3b8"
            strokeWidth="1.2"
            className="transition-colors hover:brightness-125 active:brightness-150 cursor-pointer"
            onClick={() => handleSegmentClick('IB')}
          >
            <title>Inner Bull / Double Bull (50 pts)</title>
          </circle>

          {/* Center Hub Wire Ping */}
          <circle cx="0" cy="0" r="1.5" fill="#f8fafc" pointerEvents="none" />

          {/* Cadangan 2: Physical Dart Pin Markers (①, ②, ③) */}
          {currentTurnDarts.map((dart, idx) => {
            const pos = getDartPinPosition(dart, idx);
            if (!pos) return null;
            const style = pinColors[idx % 3];

            return (
              <g
                key={`pin-${idx}-${dart.segment}`}
                className="animate-in zoom-in-50 duration-200 pointer-events-none"
                filter="url(#pinShadow)"
              >
                {/* Needle Point Line */}
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={pos.x + 3}
                  y2={pos.y - 7}
                  stroke="#e2e8f0"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Outer Glow Halo */}
                <circle cx={pos.x + 3} cy={pos.y - 7} r="7" fill={style.bg} fillOpacity="0.4" />

                {/* Solid Dart Barrel Head */}
                <circle
                  cx={pos.x + 3}
                  cy={pos.y - 7}
                  r="5"
                  fill={style.bg}
                  stroke={style.border}
                  strokeWidth="1"
                />

                {/* Dart Number Label (1, 2, 3) */}
                <text
                  x={pos.x + 3}
                  y={pos.y - 7}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={style.text}
                  fontSize="7"
                  fontWeight="900"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {style.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Cadangan 5: Magnifier Touch Loupe Floating Element */}
        {loupeState && !disabled && (
          <div
            className="absolute pointer-events-none z-30 flex flex-col items-center transform -translate-x-1/2 -translate-y-full transition-all duration-75"
            style={{
              left: `${loupeState.x}px`,
              top: `${Math.max(16, loupeState.y - 12)}px`,
            }}
          >
            {/* Loupe Lens */}
            <div className="w-14 h-14 rounded-full border-2 border-emerald-400 bg-[#090d14]/90 backdrop-blur-md shadow-2xl flex items-center justify-center p-1 relative overflow-hidden">
              <div className="text-center font-mono-numbers">
                <div className="text-[13px] font-black text-emerald-300 leading-none">
                  {loupeState.segmentCode}
                </div>
                <div className="text-[9px] font-bold text-slate-300 leading-none mt-0.5">
                  {loupeState.score}p
                </div>
              </div>
              <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-ping pointer-events-none" />
            </div>

            {/* Little Anchor Triangle */}
            <div className="w-2 h-2 bg-emerald-400 rotate-45 transform -translate-y-1 shadow-sm" />
          </div>
        )}

        {/* 3 Darts Filled Overlay */}
        {currentTurnDarts.length >= 3 && !disabled && (
          <div className="absolute inset-0 bg-[#090d14]/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center rounded-full pointer-events-none">
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
              3 Darts Recorded
            </span>
            <span className="text-slate-300 text-[11px] mt-0.5">Confirm turn to advance</span>
          </div>
        )}
      </div>

      {/* Bottom Console Controls (Miss & Undo) */}
      <div className="flex items-center gap-2.5 w-full max-w-sm mt-3">
        <button
          type="button"
          onClick={() => handleSegmentClick('MISS')}
          disabled={disabled || currentTurnDarts.length >= 3}
          className="flex-1 h-10 px-3 bg-[#111722] hover:bg-[#161f2e] disabled:opacity-30 disabled:pointer-events-none border border-[#1f2838] rounded-lg text-slate-300 font-semibold text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Target className="w-3.5 h-3.5 text-rose-400" />
          <span>MISS (0 PTS)</span>
        </button>

        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || disabled}
            className="h-10 px-4 bg-[#111722] hover:bg-[#161f2e] disabled:opacity-30 disabled:pointer-events-none border border-[#1f2838] rounded-lg text-amber-400 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
            title="Undo last dart throw"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>UNDO</span>
          </button>
        )}
      </div>
    </div>
  );
};
