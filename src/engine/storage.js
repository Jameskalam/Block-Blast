import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  HIGH_SCORE: 'BLOCK_BLAST_HIGH_SCORE',
  TOTAL_BLASTS: 'BLOCK_BLAST_TOTAL_BLASTS',
  GAMES_PLAYED: 'BLOCK_BLAST_GAMES_PLAYED',
  ACTIVE_THEME: 'BLOCK_BLAST_ACTIVE_THEME',
  COINS: 'BLOCK_BLAST_COINS',
  BEST_COMBO: 'BLOCK_BLAST_BEST_COMBO',
  LAST_REWARD_DAY: 'BLOCK_BLAST_LAST_REWARD_DAY',
  UNLOCKED_THEMES: 'BLOCK_BLAST_UNLOCKED_THEMES',
};

const DEFAULTS = {
  [STORAGE_KEYS.HIGH_SCORE]: 0,
  [STORAGE_KEYS.TOTAL_BLASTS]: 0,
  [STORAGE_KEYS.GAMES_PLAYED]: 0,
  [STORAGE_KEYS.ACTIVE_THEME]: 'ocean',
  [STORAGE_KEYS.COINS]: 0,
  [STORAGE_KEYS.BEST_COMBO]: 0,
  [STORAGE_KEYS.LAST_REWARD_DAY]: '',
  // 'ocean' is free and unlocked by default. Stored as a comma-separated list.
  [STORAGE_KEYS.UNLOCKED_THEMES]: 'ocean',
};

// AsyncStorage is async, but the UI reads these values synchronously (useState
// initializers, render paths). So we keep an in-memory cache that is hydrated
// once at startup and written through on every change.
const cache = { ...DEFAULTS };

const persist = (key, value) => {
  AsyncStorage.setItem(key, String(value)).catch(() => {});
};

// Unlocked themes are stored as a comma-separated string; parse to an array.
const parseThemeList = (raw) =>
  String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const storage = {
  // Must be awaited before the app renders so the cache holds the saved values.
  async hydrate() {
    try {
      const entries = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
      const stringKeys = [
        STORAGE_KEYS.ACTIVE_THEME,
        STORAGE_KEYS.LAST_REWARD_DAY,
        STORAGE_KEYS.UNLOCKED_THEMES,
      ];
      for (const [key, raw] of entries) {
        if (raw === null || raw === undefined) continue;
        if (stringKeys.includes(key)) {
          cache[key] = raw;
        } else {
          const parsed = parseInt(raw, 10);
          if (!Number.isNaN(parsed)) cache[key] = parsed;
        }
      }
    } catch (e) {
      // Keep defaults if storage is unavailable.
    }
    return {
      highScore: cache[STORAGE_KEYS.HIGH_SCORE],
      totalBlasts: cache[STORAGE_KEYS.TOTAL_BLASTS],
      gamesPlayed: cache[STORAGE_KEYS.GAMES_PLAYED],
      activeTheme: cache[STORAGE_KEYS.ACTIVE_THEME],
      coins: cache[STORAGE_KEYS.COINS],
      bestCombo: cache[STORAGE_KEYS.BEST_COMBO],
      unlockedThemes: parseThemeList(cache[STORAGE_KEYS.UNLOCKED_THEMES]),
    };
  },

  getHighScore: () => cache[STORAGE_KEYS.HIGH_SCORE],

  setHighScore: (score) => {
    cache[STORAGE_KEYS.HIGH_SCORE] = score;
    persist(STORAGE_KEYS.HIGH_SCORE, score);
  },

  getTotalBlasts: () => cache[STORAGE_KEYS.TOTAL_BLASTS],

  incrementTotalBlasts: (count = 1) => {
    cache[STORAGE_KEYS.TOTAL_BLASTS] += count;
    persist(STORAGE_KEYS.TOTAL_BLASTS, cache[STORAGE_KEYS.TOTAL_BLASTS]);
  },

  getGamesPlayed: () => cache[STORAGE_KEYS.GAMES_PLAYED],

  incrementGamesPlayed: () => {
    cache[STORAGE_KEYS.GAMES_PLAYED] += 1;
    persist(STORAGE_KEYS.GAMES_PLAYED, cache[STORAGE_KEYS.GAMES_PLAYED]);
  },

  getActiveTheme: () => cache[STORAGE_KEYS.ACTIVE_THEME],

  setActiveTheme: (themeId) => {
    cache[STORAGE_KEYS.ACTIVE_THEME] = themeId;
    persist(STORAGE_KEYS.ACTIVE_THEME, themeId);
  },

  // ---- Coins (persistent collectible reward) ------------------------------
  getCoins: () => cache[STORAGE_KEYS.COINS],

  addCoins: (amount = 0) => {
    cache[STORAGE_KEYS.COINS] += amount;
    persist(STORAGE_KEYS.COINS, cache[STORAGE_KEYS.COINS]);
    return cache[STORAGE_KEYS.COINS];
  },

  // ---- Best combo streak --------------------------------------------------
  getBestCombo: () => cache[STORAGE_KEYS.BEST_COMBO],

  setBestCombo: (combo) => {
    if (combo > cache[STORAGE_KEYS.BEST_COMBO]) {
      cache[STORAGE_KEYS.BEST_COMBO] = combo;
      persist(STORAGE_KEYS.BEST_COMBO, combo);
    }
    return cache[STORAGE_KEYS.BEST_COMBO];
  },

  // ---- Theme unlocks (coin shop) ------------------------------------------
  getUnlockedThemes: () => parseThemeList(cache[STORAGE_KEYS.UNLOCKED_THEMES]),

  isThemeUnlocked: (themeId) => parseThemeList(cache[STORAGE_KEYS.UNLOCKED_THEMES]).includes(themeId),

  unlockTheme: (themeId) => {
    const list = parseThemeList(cache[STORAGE_KEYS.UNLOCKED_THEMES]);
    if (!list.includes(themeId)) {
      list.push(themeId);
      cache[STORAGE_KEYS.UNLOCKED_THEMES] = list.join(',');
      persist(STORAGE_KEYS.UNLOCKED_THEMES, cache[STORAGE_KEYS.UNLOCKED_THEMES]);
    }
    return list;
  },

  // Attempt to buy a theme: deducts coins and unlocks if affordable.
  buyTheme: (themeId, price) => {
    if (parseThemeList(cache[STORAGE_KEYS.UNLOCKED_THEMES]).includes(themeId)) {
      return { success: true, alreadyOwned: true, coins: cache[STORAGE_KEYS.COINS] };
    }
    if (cache[STORAGE_KEYS.COINS] < price) {
      return { success: false, alreadyOwned: false, coins: cache[STORAGE_KEYS.COINS] };
    }
    cache[STORAGE_KEYS.COINS] -= price;
    persist(STORAGE_KEYS.COINS, cache[STORAGE_KEYS.COINS]);
    const list = parseThemeList(cache[STORAGE_KEYS.UNLOCKED_THEMES]);
    list.push(themeId);
    cache[STORAGE_KEYS.UNLOCKED_THEMES] = list.join(',');
    persist(STORAGE_KEYS.UNLOCKED_THEMES, cache[STORAGE_KEYS.UNLOCKED_THEMES]);
    return { success: true, alreadyOwned: false, coins: cache[STORAGE_KEYS.COINS] };
  },

  // ---- Daily bonus: returns the reward if not yet claimed today -----------
  claimDailyReward: (amount = 50) => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (cache[STORAGE_KEYS.LAST_REWARD_DAY] === today) {
      return { claimed: false, amount: 0, coins: cache[STORAGE_KEYS.COINS] };
    }
    cache[STORAGE_KEYS.LAST_REWARD_DAY] = today;
    persist(STORAGE_KEYS.LAST_REWARD_DAY, today);
    cache[STORAGE_KEYS.COINS] += amount;
    persist(STORAGE_KEYS.COINS, cache[STORAGE_KEYS.COINS]);
    return { claimed: true, amount, coins: cache[STORAGE_KEYS.COINS] };
  },
};
