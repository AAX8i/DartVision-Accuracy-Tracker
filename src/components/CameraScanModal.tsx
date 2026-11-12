import React, { useState, useRef } from 'react';
import { Camera, Check, X, ShieldAlert, RefreshCw, ChevronDown, CheckCircle } from 'lucide-react';
import { parseSegment } from '../utils/dartMath';
import { DartThrow } from '../types/dart';

interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmScore: (darts: DartThrow[]) => void;
}

const COMMON_SEGMENTS = [
  'T20', 'S20', 'D20',
  'T19', 'S19', 'D19',
  'T18', 'S18', 'D18',
  'T17', 'S17', 'D17',
  'T16', 'S16', 'D16',
  'IB', 'OB', 'MISS',
];

// Helper to provide quick neighbor suggestions for fast 1-tap correction
const getQuickNeighbors = (seg: string): string[] => {
  const match = seg.match(/^[SDT](\d+)$/);
  if (match) {
    const num = match[1];
    const isT = seg.startsWith('T');
    const isD = seg.startsWith('D');
    const isS = seg.startsWith('S');

    const alts: string[] = [];
    if (!isS) alts.push(`S${num}`);
    if (!isT) alts.push(`T${num}`);
    if (!isD) alts.push(`D${num}`);
    alts.push('MISS');
    return alts.slice(0, 3);
  }
  if (seg === 'IB') return ['OB', 'S20', 'MISS'];
  if (seg === 'OB') return ['IB', 'S20', 'MISS'];
  return ['S20', 'T20', 'S1'];
};

export const CameraScanModal: React.FC<CameraScanModalProps> = ({
  isOpen,
  onClose,
  onConfirmScore,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedSegments, setDetectedSegments] = useState<string[]>(['MISS', 'MISS', 'MISS']);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const [analysisNotes, setAnalysisNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('Failed to read image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to upload image'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsAnalyzing(true);
    setConfidence(null);
    setAnalysisNotes('');

    try {
      const base64 = await compressImage(file);
      setPhotoPreview(base64);

      const response = await fetch('/api/scan-dartboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Vision AI failed to process image');
      }

      setDetectedSegments(data.darts || ['MISS', 'MISS', 'MISS']);
      setConfidence(data.confidence || 'medium');
      setAnalysisNotes(data.notes || 'Dart detection complete.');
    } catch (err: any) {
      console.error('Vision scan failure:', err);
      setErrorMessage(err?.message || 'Vision AI notice. You can verify and correct the segments manually below.');
      setDetectedSegments(['S20', 'S20', 'S20']);
      setConfidence('low');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEditSegment = (slotIndex: number, newSegment: string) => {
    const updated = [...detectedSegments];
    updated[slotIndex] = newSegment.toUpperCase().trim();
    setDetectedSegments(updated);
    setEditingSlot(null);
  };

  const handleConfirm = () => {
    const parsedThrows: DartThrow[] = detectedSegments.map((seg) => parseSegment(seg));
    onConfirmScore(parsedThrows);
    onClose();
  };

  const totalPoints = detectedSegments.reduce((sum, s) => sum + parseSegment(s).score, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#101622] border border-[#1f2838] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f2838] bg-[#0c1018]">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white font-display uppercase tracking-wider">
              Vision AI Dartboard Scanner
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelected}
          />

          {!photoPreview ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 border border-dashed border-[#232f45] rounded-xl bg-[#090d14] text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#141d2c] border border-[#232f45] flex items-center justify-center text-emerald-400 shadow-md">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-white text-base">Capture Dartboard Photo</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Center the dartboard in good lighting with all 3 thrown darts visible.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 active:scale-[0.98] transition-all shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span>Open Device Camera</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo Preview Tile with Retake Option */}
              <div className="relative rounded-xl overflow-hidden border border-[#1f2838] bg-black max-h-40 sm:max-h-48 flex items-center justify-center">
                <img
                  src={photoPreview}
                  alt="Captured Dartboard"
                  className="w-full h-full object-contain max-h-48"
                />

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-[#090d14]/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-emerald-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-xs font-semibold tracking-wide">
                      Gemini Vision analyzing dart coordinates...
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-[#090d14]/90 hover:bg-[#141d2c] border border-[#232f45] rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-all shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl flex items-start gap-2 text-xs text-rose-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{errorMessage}</span>
                    <span className="text-rose-300/80">You can easily adjust each dart below.</span>
                  </div>
                </div>
              )}

              {/* Status Header */}
              {confidence && !isAnalyzing && (
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#1b2535] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Confidence:</span>
                    <span
                      className={`font-mono-numbers font-bold uppercase text-[11px] px-2 py-0.5 rounded ${
                        confidence === 'high'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {confidence}
                    </span>
                  </div>
                  {analysisNotes && (
                    <span className="text-slate-400 text-[11px] truncate max-w-[260px]" title={analysisNotes}>
                      {analysisNotes}
                    </span>
                  )}
                </div>
              )}

              {/* Cadangan 4 UX: Side-by-Side 3-Dart Correction Review */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Side-by-Side 3-Dart Review:</span>
                  <span className="text-emerald-400 font-mono-numbers font-bold">
                    Turn Total: {totalPoints} Pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {detectedSegments.map((seg, idx) => {
                    const parsed = parseSegment(seg);
                    const isSelected = editingSlot === idx;
                    const quickAlts = getQuickNeighbors(seg);

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-center transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-[#12221b] shadow-md ring-1 ring-emerald-500/50'
                            : 'border-[#1f2838] bg-[#0c1018]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono-numbers">
                              Dart {idx + 1}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-400 font-mono-numbers">
                              {parsed.score} pts
                            </span>
                          </div>

                          <div
                            onClick={() => setEditingSlot(isSelected ? null : idx)}
                            className="cursor-pointer py-1 my-1 rounded-lg hover:bg-slate-800/40 transition-colors"
                          >
                            <span className="text-2xl font-black font-mono-numbers text-white tracking-wider block">
                              {seg}
                            </span>
                          </div>
                        </div>

                        {/* Quick-Swap 1-Tap Chips */}
                        <div className="mt-2 pt-2 border-t border-[#182333] space-y-1.5">
                          <div className="text-[10px] text-slate-500 font-medium">Quick Alternatives:</div>
                          <div className="grid grid-cols-3 gap-1">
                            {quickAlts.map((alt) => (
                              <button
                                key={alt}
                                type="button"
                                onClick={() => handleManualEditSegment(idx, alt)}
                                className="h-6 rounded bg-[#141d2c] hover:bg-slate-700 border border-[#232f45] text-[11px] font-bold font-mono-numbers text-slate-300 transition-colors"
                              >
                                {alt}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingSlot(isSelected ? null : idx)}
                            className="w-full text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-center gap-1 pt-0.5"
                          >
                            <span>Pick Other Segment</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Segment Selector Palette when slot is expanded */}
              {editingSlot !== null && (
                <div className="p-3 bg-[#090d14] border border-emerald-500/50 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400">
                      Select Segment for Dart {editingSlot + 1}:
                    </span>
                    <button
                      onClick={() => setEditingSlot(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Done
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto font-mono-numbers">
                    {COMMON_SEGMENTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleManualEditSegment(editingSlot, s)}
                        className={`py-1.5 px-1 rounded text-xs font-bold border transition-colors ${
                          detectedSegments[editingSlot] === s
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                            : 'bg-[#101622] border-[#1f2838] text-slate-300 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f2838] bg-[#0b0f17] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 bg-[#141b28] hover:bg-[#1a2334] text-slate-300 rounded-xl font-medium text-xs transition-colors"
          >
            Cancel
          </button>

          {photoPreview && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isAnalyzing}
              className="h-10 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center gap-2 active:scale-[0.98] transition-all shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm All (3 Darts) & Next Turn · {totalPoints} Pts</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
