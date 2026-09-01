import React, { useState, useEffect } from 'react';
import MainMenuScreen from './src/screens/MainMenuScreen.jsx';
import GameScreen from './src/screens/GameScreen.jsx';
import ThemeSelector from './src/components/ThemeSelector.jsx';
import { THEMES } from './src/styles/themes';
import { storage } from './src/engine/storage';
import { soundEngine } from './src/engine/soundEngine';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main' | 'game'
  const [themeId, setThemeId] = useState(() => storage.getActiveTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [highScore, setHighScore] = useState(() => storage.getHighScore());
  const [totalBlasts, setTotalBlasts] = useState(() => storage.getTotalBlasts());
  const [gamesPlayed, setGamesPlayed] = useState(() => storage.getGamesPlayed());
  const [isMuted, setIsMuted] = useState(false);

  const theme = THEMES[themeId] || THEMES.candy;

  // Refresh stats when opening main menu
  const refreshStats = () => {
    setHighScore(storage.getHighScore());
    setTotalBlasts(storage.getTotalBlasts());
    setGamesPlayed(storage.getGamesPlayed());
  };

  const handleUpdateHighScore = (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      storage.setHighScore(newScore);
    }
  };

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectTheme = (id) => {
    setThemeId(id);
    storage.setActiveTheme(id);
    setIsThemeModalOpen(false);
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      background: theme.bgSolid,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      overflowX: 'hidden'
    }}>
      {currentScreen === 'main' ? (
        <MainMenuScreen
          onStartGame={() => setCurrentScreen('game')}
          highScore={highScore}
          totalBlasts={totalBlasts}
          gamesPlayed={gamesPlayed}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          onOpenThemes={() => setIsThemeModalOpen(true)}
          theme={theme}
        />
      ) : (
        <GameScreen
          highScore={highScore}
          onUpdateHighScore={handleUpdateHighScore}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          onOpenThemes={() => setIsThemeModalOpen(true)}
          onGoHome={() => {
            refreshStats();
            setCurrentScreen('main');
          }}
          theme={theme}
        />
      )}

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={isThemeModalOpen}
        currentThemeId={themeId}
        onSelectTheme={handleSelectTheme}
        onClose={() => setIsThemeModalOpen(false)}
        theme={theme}
      />
    </div>
  );
}
