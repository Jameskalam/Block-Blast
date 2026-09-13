import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import MainMenuScreen from './src/screens/MainMenuScreen';
import GameScreen from './src/screens/GameScreen';
import ThemeSelector from './src/components/ThemeSelector';
import { THEMES } from './src/styles/themes';
import { storage } from './src/engine/storage';
import { soundEngine } from './src/engine/soundEngine';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [themeId, setThemeId] = useState(() => storage.getActiveTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [highScore, setHighScore] = useState(() => storage.getHighScore());
  const [totalBlasts, setTotalBlasts] = useState(() => storage.getTotalBlasts());
  const [gamesPlayed, setGamesPlayed] = useState(() => storage.getGamesPlayed());
  const [isMuted, setIsMuted] = useState(false);

  const theme = THEMES[themeId] || THEMES.candy;

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
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bgSolid }]}>
      <StatusBar style="light" />
      <View style={styles.fill}>
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

        <ThemeSelector
          isOpen={isThemeModalOpen}
          currentThemeId={themeId}
          onSelectTheme={handleSelectTheme}
          onClose={() => setIsThemeModalOpen(false)}
          theme={theme}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
});
