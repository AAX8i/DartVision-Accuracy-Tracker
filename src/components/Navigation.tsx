import React from 'react';
import { Target, PlayCircle, BarChart3, Home, Zap } from 'lucide-react';

export type ActiveScreen = 'home' | 'x01' | 'training' | 'stats';

interface NavigationProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  activeMatchInProgress?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  activeMatchInProgress = false,
}) => {
  return (
    <>
      {/* Desktop Top Bar Contract: 3 Zones Separated by gap-8 */}
      <header className="sticky top-0 z-40 w-full bg-[#090d14]/90 backdrop-blur-md border-b border-[#1f2838] px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single Brand Element */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#141d2c] border border-[#232f45] flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white font-display whitespace-nowrap">
              DARTVISION
            </span>
          </button>

          {/* Zone 2: Navigation Links (Single-Line, Clean Typography) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-slate-400">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentScreen === 'home'
                  ? 'text-white border-b-2 border-emerald-500 font-bold pb-0.5'
                  : ''
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onNavigate('x01')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                currentScreen === 'x01'
                  ? 'text-white border-b-2 border-emerald-500 font-bold pb-0.5'
                  : ''
              }`}
            >
              <span>X01 Match</span>
              {activeMatchInProgress && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('training')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentScreen === 'training'
                  ? 'text-white border-b-2 border-emerald-500 font-bold pb-0.5'
                  : ''
              }`}
            >
              Accuracy Training
            </button>
            <button
              type="button"
              onClick={() => onNavigate('stats')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                currentScreen === 'stats'
                  ? 'text-white border-b-2 border-emerald-500 font-bold pb-0.5'
                  : ''
              }`}
            >
              Stats & History
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('x01')}
              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold tracking-wide whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{activeMatchInProgress ? 'Resume Match' : 'New Match'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Ergonomic Thumb Reach Zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d14]/95 backdrop-blur-md border-t border-[#1f2838] px-2 pb-safe">
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              currentScreen === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('x01')}
            className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors ${
              currentScreen === 'x01' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlayCircle className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 font-medium">X01 Match</span>
            {activeMatchInProgress && (
              <span className="absolute top-2.5 right-6 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('training')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              currentScreen === 'training' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 font-medium">Training</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('stats')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              currentScreen === 'stats' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 font-medium">Stats</span>
          </button>
        </div>
      </div>
    </>
  );
};
