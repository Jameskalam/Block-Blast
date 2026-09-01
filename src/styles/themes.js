export const THEMES = {
  ocean: {
    id: 'ocean',
    name: '🌊 Ocean Blue',
    price: 0,
    bg: 'linear-gradient(135deg, #0b2a6b 0%, #1565e0 50%, #29b6ff 100%)',
    bgSolid: '#0d47c4',
    cardBg: 'rgba(255, 255, 255, 0.12)',
    boardBg: 'rgba(8, 30, 84, 0.85)',
    emptyCell: 'rgba(255, 255, 255, 0.10)',
    cellBorder: 'rgba(255, 255, 255, 0.18)',
    accent: '#00d4ff',
    accentSecondary: '#3b82f6',
    text: '#ffffff',
    textMuted: '#cfe4ff',
    blockColors: {
      1: '#ff5277', // Coral Pink
      2: '#ffd21e', // Sunshine Yellow
      3: '#ff8a1e', // Juicy Orange
      4: '#3be07a', // Fresh Green
      5: '#00d4ff', // Aqua Cyan
      6: '#8b7bff', // Soft Violet
      7: '#ff7ad9', // Bubblegum Pink
      8: '#00e5c8', // Turquoise Pop
    },
    glows: {
      1: '0 0 16px rgba(255, 82, 119, 0.8)',
      2: '0 0 16px rgba(255, 210, 30, 0.8)',
      3: '0 0 16px rgba(255, 138, 30, 0.8)',
      4: '0 0 16px rgba(59, 224, 122, 0.8)',
      5: '0 0 16px rgba(0, 212, 255, 0.9)',
      6: '0 0 16px rgba(139, 123, 255, 0.8)',
      7: '0 0 16px rgba(255, 122, 217, 0.8)',
      8: '0 0 16px rgba(0, 229, 200, 0.8)',
    }
  },

  candy: {
    id: 'candy',
    name: '🍬 Candy Blast',
    price: 200,
    bg: 'linear-gradient(135deg, #1e0538 0%, #3b0764 50%, #581c87 100%)',
    bgSolid: '#3b0764',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    boardBg: 'rgba(15, 7, 32, 0.85)',
    emptyCell: 'rgba(255, 255, 255, 0.06)',
    cellBorder: 'rgba(255, 255, 255, 0.08)',
    accent: '#ec4899',
    accentSecondary: '#8b5cf6',
    text: '#ffffff',
    textMuted: '#cbd5e1',
    blockColors: {
      1: '#ff3b6b', // Bright Strawberry
      2: '#ffd21e', // Sunshine Yellow
      3: '#ff8a1e', // Juicy Orange
      4: '#33e06a', // Fresh Green
      5: '#22c3ff', // Sky Blue
      6: '#a24bff', // Grape Purple
      7: '#ff5ecb', // Bubblegum Pink
      8: '#00e5c8', // Turquoise Pop
    },
    glows: {
      1: '0 0 16px rgba(255, 59, 107, 0.8)',
      2: '0 0 16px rgba(255, 210, 30, 0.8)',
      3: '0 0 16px rgba(255, 138, 30, 0.8)',
      4: '0 0 16px rgba(51, 224, 106, 0.8)',
      5: '0 0 16px rgba(34, 195, 255, 0.8)',
      6: '0 0 16px rgba(162, 75, 255, 0.8)',
      7: '0 0 16px rgba(255, 94, 203, 0.8)',
      8: '0 0 16px rgba(0, 229, 200, 0.8)',
    }
  },

  cyber: {
    id: 'cyber',
    name: '⚡ Cyber Neon',
    price: 300,
    bg: 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e1b4b 100%)',
    bgSolid: '#0f172a',
    cardBg: 'rgba(15, 23, 42, 0.75)',
    boardBg: 'rgba(2, 6, 23, 0.9)',
    emptyCell: 'rgba(51, 65, 85, 0.2)',
    cellBorder: 'rgba(99, 102, 241, 0.2)',
    accent: '#06b6d4',
    accentSecondary: '#3b82f6',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    blockColors: {
      1: '#00f5d4', // Neon Mint
      2: '#7b2cbf', // Cyber Violet
      3: '#ff007f', // Hot Magenta
      4: '#3a86ff', // Electric Blue
      5: '#ffbe0b', // Laser Gold
      6: '#ff006e', // Neon Crimson
      7: '#8338ec', // Deep Purple
      8: '#00bbf9', // Bright Cyan
    },
    glows: {
      1: '0 0 16px rgba(0, 245, 212, 0.8)',
      2: '0 0 16px rgba(123, 44, 191, 0.8)',
      3: '0 0 16px rgba(255, 0, 127, 0.8)',
      4: '0 0 16px rgba(58, 134, 255, 0.8)',
      5: '0 0 16px rgba(255, 190, 11, 0.8)',
      6: '0 0 16px rgba(255, 0, 110, 0.8)',
      7: '0 0 16px rgba(131, 56, 236, 0.8)',
      8: '0 0 16px rgba(0, 187, 249, 0.8)',
    }
  },

  gem: {
    id: 'gem',
    name: '💎 Gem Royal',
    price: 500,
    bg: 'linear-gradient(135deg, #091e3a 0%, #2f80ed 50%, #2d9cdb 100%)',
    bgSolid: '#091e3a',
    cardBg: 'rgba(255, 255, 255, 0.12)',
    boardBg: 'rgba(5, 20, 40, 0.88)',
    emptyCell: 'rgba(255, 255, 255, 0.08)',
    cellBorder: 'rgba(255, 255, 255, 0.12)',
    accent: '#38ef7d',
    accentSecondary: '#11998e',
    text: '#ffffff',
    textMuted: '#e2e8f0',
    blockColors: {
      1: '#e63946', // Ruby Red
      2: '#457b9d', // Sapphire Blue
      3: '#2a9d8f', // Emerald Green
      4: '#e9c46a', // Topaz Yellow
      5: '#f4a261', // Amber Orange
      6: '#9d4edd', // Amethyst Purple
      7: '#00b4d8', // Aquamarine
      8: '#e76f51', // Garnet
    },
    glows: {
      1: '0 0 14px rgba(230, 57, 70, 0.75)',
      2: '0 0 14px rgba(69, 123, 157, 0.75)',
      3: '0 0 14px rgba(42, 157, 143, 0.75)',
      4: '0 0 14px rgba(233, 196, 106, 0.75)',
      5: '0 0 14px rgba(244, 162, 97, 0.75)',
      6: '0 0 14px rgba(157, 78, 221, 0.75)',
      7: '0 0 14px rgba(0, 180, 216, 0.75)',
      8: '0 0 14px rgba(231, 111, 81, 0.75)',
    }
  },

  rainbow: {
    id: 'rainbow',
    name: '🌈 Rainbow Pop',
    price: 800,
    bg: 'linear-gradient(135deg, #2b1055 0%, #7597de 50%, #b862d6 100%)',
    bgSolid: '#2b1055',
    cardBg: 'rgba(255, 255, 255, 0.15)',
    boardBg: 'rgba(20, 10, 45, 0.9)',
    emptyCell: 'rgba(255, 255, 255, 0.1)',
    cellBorder: 'rgba(255, 255, 255, 0.15)',
    accent: '#ff007f',
    accentSecondary: '#ffee00',
    text: '#ffffff',
    textMuted: '#f1f5f9',
    blockColors: {
      1: '#ff0055', // Pop Red
      2: '#ff9900', // Pop Orange
      3: '#ffcc00', // Pop Yellow
      4: '#33cc33', // Pop Green
      5: '#00ccff', // Pop Blue
      6: '#9933ff', // Pop Violet
      7: '#ff00cc', // Pop Magenta
      8: '#00ffcc', // Pop Turquoise
    },
    glows: {
      1: '0 0 18px rgba(255, 0, 85, 0.85)',
      2: '0 0 18px rgba(255, 153, 0, 0.85)',
      3: '0 0 18px rgba(255, 204, 0, 0.85)',
      4: '0 0 18px rgba(51, 204, 51, 0.85)',
      5: '0 0 18px rgba(0, 204, 255, 0.85)',
      6: '0 0 18px rgba(153, 51, 255, 0.85)',
      7: '0 0 18px rgba(255, 0, 204, 0.85)',
      8: '0 0 18px rgba(0, 255, 204, 0.85)',
    }
  }
};
