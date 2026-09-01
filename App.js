import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
  const [coins, setCoins] = useState(() => storage.getCoins());
  const [bestCombo, setBestCombo] = useState(() => storage.getBestCombo());
  const [unlockedThemes, setUnlockedThemes] = useState(() => storage.getUnlockedThemes());
  const [dailyReward, setDailyReward] = useState(null); // { amount } once/day
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const theme = THEMES[themeId] || THEMES.ocean;

  const refreshStats = () => {
    setHighScore(storage.getHighScore());
    setTotalBlasts(storage.getTotalBlasts());
    setGamesPlayed(storage.getGamesPlayed());
    setCoins(storage.getCoins());
    setBestCombo(storage.getBestCombo());
  };

  // Load persisted values from AsyncStorage before showing the UI, since the
  // storage layer reads from an in-memory cache that starts empty.
  useEffect(() => {
    let cancelled = false;
    // Warm up the audio engine (synthesizes + preloads the sound clips).
    soundEngine.init();
    storage.hydrate().then((saved) => {
      if (cancelled) return;
      setThemeId(saved.activeTheme);
      setHighScore(saved.highScore);
      setTotalBlasts(saved.totalBlasts);
      setGamesPlayed(saved.gamesPlayed);
      setCoins(saved.coins);
      setBestCombo(saved.bestCombo);
      setUnlockedThemes(saved.unlockedThemes);
      setIsReady(true);

      // Daily bonus: give returning players a coin reward once per day.
      const reward = storage.claimDailyReward(50);
      if (reward.claimed) {
        setCoins(reward.coins);
        setDailyReward({ amount: reward.amount });
        soundEngine.playRewardSound();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Buy a locked theme with coins, then equip it immediately.
  const handleBuyTheme = (th) => {
    const result = storage.buyTheme(th.id, th.price);
    if (result.success) {
      setCoins(result.coins);
      setUnlockedThemes(storage.getUnlockedThemes());
      soundEngine.playRewardSound();
      handleSelectTheme(th.id);
    } else {
      // Not enough coins.
      soundEngine.playLossSound();
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.root, { backgroundColor: theme.bgSolid }]}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <StatusBar style="light" translucent />
        <View style={styles.fill}>
        {!isReady ? null : currentScreen === 'main' ? (
          <MainMenuScreen
            onStartGame={() => setCurrentScreen('game')}
            highScore={highScore}
            totalBlasts={totalBlasts}
            gamesPlayed={gamesPlayed}
            coins={coins}
            bestCombo={bestCombo}
            dailyReward={dailyReward}
            onDismissDailyReward={() => setDailyReward(null)}
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
            onCoinsChange={setCoins}
            theme={theme}
          />
        )}

          <ThemeSelector
            isOpen={isThemeModalOpen}
            currentThemeId={themeId}
            unlockedThemes={unlockedThemes}
            coins={coins}
            onSelectTheme={handleSelectTheme}
            onBuyTheme={handleBuyTheme}
            onClose={() => setIsThemeModalOpen(false)}
            theme={theme}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
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
