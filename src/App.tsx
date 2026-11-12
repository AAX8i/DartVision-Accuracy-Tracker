/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation, ActiveScreen } from './components/Navigation';
import { HomeScreen } from './components/HomeScreen';
import { X01GameArena } from './components/X01GameArena';
import { TrainingMode } from './components/TrainingMode';
import { StatsHistoryView } from './components/StatsHistoryView';
import { loadState } from './utils/storage';
import { AppState } from './types/dart';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [appState, setAppState] = useState<AppState>(loadState);

  // Refresh appState on mount and whenever returning to screen
  const refreshState = () => {
    setAppState(loadState());
  };

  useEffect(() => {
    refreshState();
  }, [currentScreen]);

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 flex flex-col font-sans pb-20 md:pb-10 selection:bg-emerald-500 selection:text-white">
      {/* Responsive Navigation: Top Bar & Mobile Bottom Tab */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          refreshState();
          setCurrentScreen(screen);
        }}
        activeMatchInProgress={!!appState.activeMatch && !appState.activeMatch.isCompleted}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-6 py-4">
        {currentScreen === 'home' && (
          <HomeScreen
            onSelectMode={(mode) => setCurrentScreen(mode)}
            activeMatch={appState.activeMatch}
            matchHistory={appState.matchHistory}
            trainingStats={appState.trainingStats}
          />
        )}

        {currentScreen === 'x01' && (
          <X01GameArena
            initialActiveMatch={appState.activeMatch}
            onMatchFinished={() => {
              refreshState();
            }}
          />
        )}

        {currentScreen === 'training' && <TrainingMode />}

        {currentScreen === 'stats' && (
          <StatsHistoryView
            onDataReset={() => {
              refreshState();
            }}
          />
        )}
      </main>
    </div>
  );
}
