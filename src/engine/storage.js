const STORAGE_KEYS = {
  HIGH_SCORE: 'BLOCK_BLAST_HIGH_SCORE',
  TOTAL_BLASTS: 'BLOCK_BLAST_TOTAL_BLASTS',
  GAMES_PLAYED: 'BLOCK_BLAST_GAMES_PLAYED',
  ACTIVE_THEME: 'BLOCK_BLAST_ACTIVE_THEME',
};

export const storage = {
  getHighScore: () => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  },

  setHighScore: (score) => {
    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
    } catch (e) {}
  },

  getTotalBlasts: () => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.TOTAL_BLASTS);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  },

  incrementTotalBlasts: (count = 1) => {
    try {
      const current = storage.getTotalBlasts();
      localStorage.setItem(STORAGE_KEYS.TOTAL_BLASTS, (current + count).toString());
    } catch (e) {}
  },

  getGamesPlayed: () => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  },

  incrementGamesPlayed: () => {
    try {
      const current = storage.getGamesPlayed();
      localStorage.setItem(STORAGE_KEYS.GAMES_PLAYED, (current + 1).toString());
    } catch (e) {}
  },

  getActiveTheme: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_THEME) || 'candy';
    } catch (e) {
      return 'candy';
    }
  },

  setActiveTheme: (themeId) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_THEME, themeId);
    } catch (e) {}
  }
};
