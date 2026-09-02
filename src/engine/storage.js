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
  BEST_LEVEL: 'BLOCK_BLAST_BEST_LEVEL',
  // Power-up inventory.
  PU_HAMMER: 'BLOCK_BLAST_PU_HAMMER',
  PU_SHUFFLE: 'BLOCK_BLAST_PU_SHUFFLE',
  PU_UNDO: 'BLOCK_BLAST_PU_UNDO',
  // Daily streak (consecutive days opened).
  STREAK_DAYS: 'BLOCK_BLAST_STREAK_DAYS',
  // Timestamp (ms) of the last free rewarded coin claim on the menu.
  LAST_FREE_COINS: 'BLOCK_BLAST_LAST_FREE_COINS',
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
  // Highest level (and therefore background) the player has ever reached.
  [STORAGE_KEYS.BEST_LEVEL]: 1,
  // Start players with one of each power-up so they discover how they work.
  [STORAGE_KEYS.PU_HAMMER]: 1,
  [STORAGE_KEYS.PU_SHUFFLE]: 1,
  [STORAGE_KEYS.PU_UNDO]: 1,
  [STORAGE_KEYS.STREAK_DAYS]: 0,
  [STORAGE_KEYS.LAST_FREE_COINS]: 0,
};

// Coin price of each power-up when buying one outright.
export const POWERUP_COST = { hammer: 40, shuffle: 25, undo: 30 };

const PU_KEY = {
  hammer: STORAGE_KEYS.PU_HAMMER,
  shuffle: STORAGE_KEYS.PU_SHUFFLE,
  undo: STORAGE_KEYS.PU_UNDO,
};

// Escalating daily streak: longer streaks pay more, capped so it stays sane.
export function streakReward(day) {
  const d = Math.max(1, Math.min(day, 7));
  return [50, 75, 100, 150, 200, 300, 500][d - 1];
}

// How long between free rewarded-coin claims on the menu.
export const FREE_COINS_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
export const FREE_COINS_AMOUNT = 50;

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
      bestLevel: cache[STORAGE_KEYS.BEST_LEVEL],
      unlockedThemes: parseThemeList(cache[STORAGE_KEYS.UNLOCKED_THEMES]),
      powerUps: {
        hammer: cache[STORAGE_KEYS.PU_HAMMER],
        shuffle: cache[STORAGE_KEYS.PU_SHUFFLE],
        undo: cache[STORAGE_KEYS.PU_UNDO],
      },
      streak: cache[STORAGE_KEYS.STREAK_DAYS],
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

  // ---- Power-ups ----------------------------------------------------------
  getPowerUps: () => ({
    hammer: cache[STORAGE_KEYS.PU_HAMMER],
    shuffle: cache[STORAGE_KEYS.PU_SHUFFLE],
    undo: cache[STORAGE_KEYS.PU_UNDO],
  }),

  // Spend one power-up. Returns the new inventory, or null if none were held.
  usePowerUp: (kind) => {
    const key = PU_KEY[kind];
    if (!key || cache[key] <= 0) return null;
    cache[key] -= 1;
    persist(key, cache[key]);
    return storage.getPowerUps();
  },

  addPowerUp: (kind, amount = 1) => {
    const key = PU_KEY[kind];
    if (!key) return storage.getPowerUps();
    cache[key] += amount;
    persist(key, cache[key]);
    return storage.getPowerUps();
  },

  // Buy a power-up with coins. Returns { success, coins, powerUps }.
  buyPowerUp: (kind) => {
    const key = PU_KEY[kind];
    const cost = POWERUP_COST[kind];
    if (!key || cost == null) {
      return { success: false, coins: cache[STORAGE_KEYS.COINS], powerUps: storage.getPowerUps() };
    }
    if (cache[STORAGE_KEYS.COINS] < cost) {
      return { success: false, coins: cache[STORAGE_KEYS.COINS], powerUps: storage.getPowerUps() };
    }
    cache[STORAGE_KEYS.COINS] -= cost;
    persist(STORAGE_KEYS.COINS, cache[STORAGE_KEYS.COINS]);
    cache[key] += 1;
    persist(key, cache[key]);
    return { success: true, coins: cache[STORAGE_KEYS.COINS], powerUps: storage.getPowerUps() };
  },

  // ---- Free rewarded coins (menu, rate limited) ---------------------------
  getFreeCoinsReadyAt: () => cache[STORAGE_KEYS.LAST_FREE_COINS] + FREE_COINS_COOLDOWN_MS,

  isFreeCoinsReady: () => Date.now() >= storage.getFreeCoinsReadyAt(),

  // Grants the reward and starts the cooldown. Returns { granted, coins }.
  claimFreeCoins: (amount = FREE_COINS_AMOUNT) => {
    if (!storage.isFreeCoinsReady()) {
      return { granted: false, coins: cache[STORAGE_KEYS.COINS] };
    }
    cache[STORAGE_KEYS.LAST_FREE_COINS] = Date.now();
    persist(STORAGE_KEYS.LAST_FREE_COINS, cache[STORAGE_KEYS.LAST_FREE_COINS]);
    cache[STORAGE_KEYS.COINS] += amount;
    persist(STORAGE_KEYS.COINS, cache[STORAGE_KEYS.COINS]);
    return { granted: true, coins: cache[STORAGE_KEYS.COINS] };
  },

  // ---- Daily streak -------------------------------------------------------
  getStreakDays: () => cache[STORAGE_KEYS.STREAK_DAYS],

  // ---- Best level reached (drives the background progression) -------------
  getBestLevel: () => cache[STORAGE_KEYS.BEST_LEVEL],

  setBestLevel: (level) => {
    if (level > cache[STORAGE_KEYS.BEST_LEVEL]) {
      cache[STORAGE_KEYS.BEST_LEVEL] = level;
      persist(STORAGE_KEYS.BEST_LEVEL, level);
    }
    return cache[STORAGE_KEYS.BEST_LEVEL];
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

  // ---- Daily streak bonus -------------------------------------------------
  //
  // Escalating reward for consecutive days (50 -> 500 over a week), which is a
  // far stronger reason to come back than a flat daily gift. Playing on
  // consecutive days extends the streak; missing a day resets it to 1.
  claimDailyReward: () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const lastKey = cache[STORAGE_KEYS.LAST_REWARD_DAY];

    if (lastKey === todayKey) {
      return {
        claimed: false,
        amount: 0,
        coins: cache[STORAGE_KEYS.COINS],
        streak: cache[STORAGE_KEYS.STREAK_DAYS],
      };
    }

    // Consecutive only if the last claim was exactly the previous calendar day.
    const yesterdayKey = new Date(Date.now() - dayMs).toISOString().slice(0, 10);
    const continued = lastKey === yesterdayKey;
    const streak = continued ? cache[STORAGE_KEYS.STREAK_DAYS] + 1 : 1;
    const amount = streakReward(streak);

    cache[STORAGE_KEYS.STREAK_DAYS] = streak;
    persist(STORAGE_KEYS.STREAK_DAYS, streak);
    cache[STORAGE_KEYS.LAST_REWARD_DAY] = todayKey;
    persist(STORAGE_KEYS.LAST_REWARD_DAY, todayKey);
    cache[STORAGE_KEYS.COINS] += amount;
    persist(STORAGE_KEYS.COINS, cache[STORAGE_KEYS.COINS]);

    return { claimed: true, amount, coins: cache[STORAGE_KEYS.COINS], streak };
  },
};
