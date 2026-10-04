import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import GridBoard, { BOARD_BORDER, BOARD_PADDING, CELL_MARGIN, CELL_RADIUS } from '../components/GridBoard';
import PieceTray from '../components/PieceTray';
import ComboOverlay from '../components/ComboOverlay';
import RewardedAdModal from '../ads/RewardedAdModal';
import BannerAd from '../ads/BannerAd';
import { useOnlineStatus } from '../ads/useOnlineStatus';
import { SHOW_ADS } from '../ads/adConfig';
import BlastLayer from '../components/BlastLayer';
import StageBanner from '../components/StageBanner';
import Icon from '../components/Icon';
import {
  createEmptyGrid,
  canPlacePiece,
  placePieceOnGrid,
  checkLinesAndClear,
  canAnyPieceFit,
  clearSpaceForResume,
  GRID_SIZE,
} from '../engine/gameLogic';
import { getRandomPieceSet, getPhaseForBlasts, phaseNameForRound, phaseIndexForRound } from '../engine/shapes';
import { THEMES } from '../styles/themes';
import { soundEngine } from '../engine/soundEngine';
import { storage } from '../engine/storage';
import { placePraise, clearPraise } from '../engine/praise';

// The dragged piece floats just above the fingertip: the finger sits
// FINGER_GAP pixels below the piece's bottom edge, centered horizontally.
// This keeps the whole piece visible above the thumb while letting the finger
// reach every row of the board, including the last one.
const FINGER_GAP = 22;

// Top-left window position where the floating piece should be drawn for a given
// finger position and piece size. Shared by placement math and rendering so
// they never drift apart.
function floatOrigin(fingerX, fingerY, pieceW, pieceH) {
  return {
    left: fingerX - pieceW / 2,
    top: fingerY - FINGER_GAP - pieceH,
  };
}



export default function GameScreen({
  highScore,
  onUpdateHighScore,
  isMuted,
  onToggleSound,
  onOpenThemes,
  onGoHome,
  onCoinsChange,
  theme,
}) {
  const isOnline = useOnlineStatus();
  const [grid, setGrid] = useState(() => createEmptyGrid());
  const [round, setRound] = useState(0);
  const [runBlasts, setRunBlasts] = useState(0);
  const [activeThemeId, setActiveThemeId] = useState(theme.id);
  const currentTheme = THEMES[activeThemeId] || theme;

  // Sync with user's equipped theme whenever changed before Phase 2
  useEffect(() => {
    if (runBlasts < 5) {
      setActiveThemeId(theme.id);
    }
  }, [theme.id, runBlasts]);

  const [pieceSet, setPieceSet] = useState(() => getRandomPieceSet(3, 0, 0));
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(() => storage.getCoins());
  const [coinsThisRun, setCoinsThisRun] = useState(0);
  const startHighScore = useRef(highScore).current;
  const [comboStreak, setComboStreak] = useState(0);
  const [comboText, setComboText] = useState('');
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasUsedAdResume, setHasUsedAdResume] = useState(false);

  // Drag state
  const [drag, setDrag] = useState(null); // { piece, x, y } in local coords
  const [preview, setPreview] = useState(null); // { matrix, row, col, valid, colorIndex }
  const [blasts, setBlasts] = useState([]); // [{ id, x, y, colors?, shards?, spread? }]
  const [phaseBanner, setPhaseBanner] = useState(null); // { name, displayName, sub, color }

  const insets = useSafeAreaInsets();
  const rootOffsetRef = useRef({ x: insets.left, y: insets.top });
  const rootViewRef = useRef(null);
  const rawBoardRectRef = useRef(null);
  const boardRectRef = useRef(null); // { x, y, width, height } in GameScreen local coords
  const boardMeasureRef = useRef(null); // fn to re-measure the board on demand
  const lastDragPosRef = useRef(null); // last finger position in GameScreen local coords
  const gridRef = useRef(grid);
  gridRef.current = grid;

  const handleRootLayout = useCallback(() => {
    rootViewRef.current?.measure((x, y, width, height, pageX, pageY) => {
      if (Number.isFinite(pageX) && Number.isFinite(pageY)) {
        rootOffsetRef.current = { x: pageX, y: pageY };
        if (rawBoardRectRef.current) {
          boardRectRef.current = {
            x: rawBoardRectRef.current.x - pageX,
            y: rawBoardRectRef.current.y - pageY,
            width: rawBoardRectRef.current.width,
            height: rawBoardRectRef.current.height,
          };
        }
      }
    });
  }, []);

  const handleBoardMeasure = useCallback((rect) => {
    rawBoardRectRef.current = rect;
    boardRectRef.current = {
      x: rect.x - rootOffsetRef.current.x,
      y: rect.y - rootOffsetRef.current.y,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  const toLocal = (pageX, pageY) => ({
    x: pageX - rootOffsetRef.current.x,
    y: pageY - rootOffsetRef.current.y,
  });

  // Award coins (persistent collectible) and notify the parent so the menu and
  // header stay in sync.
  const earnCoins = (amount) => {
    if (amount <= 0) return;
    const total = storage.addCoins(amount);
    setCoins(total);
    setCoinsThisRun((c) => c + amount);
    if (onCoinsChange) onCoinsChange(total);
  };

  // Spawn a set of blasts and auto-remove them shortly after they finish.
  const spawnBlasts = (items) => {
    if (!items.length) return;
    setBlasts((prev) => [...prev, ...items]);
    const ids = items.map((b) => b.id);
    setTimeout(() => {
      setBlasts((prev) => prev.filter((b) => !ids.includes(b.id)));
    }, 900);
  };

  const handleRestart = () => {
    setGrid(createEmptyGrid());
    setRound(0);
    setRunBlasts(0);
    setActiveThemeId(theme.id);
    setPieceSet(getRandomPieceSet(3, 0, 0));
    setDrag(null);
    setPreview(null);
    setBlasts([]);
    setPhaseBanner(null);
    setScore(0);
    setCoinsThisRun(0);
    setComboStreak(0);
    setComboText('');
    setIsAdModalOpen(false);
    setIsGameOver(false);
    setHasUsedAdResume(false);
    storage.incrementGamesPlayed();
    soundEngine.playPopSound();
  };

  // ---- Drag geometry helpers ----------------------------------------------

  const getCellSize = () => {
    const rect = boardRectRef.current;
    if (!rect) return 0;
    const inner = rect.width - 2 * BOARD_BORDER - 2 * BOARD_PADDING;
    return inner / GRID_SIZE;
  };

  // Convert a local finger position to the target top-left grid cell for `matrix`,
  // matching where the floating piece is visually drawn (via floatOrigin).
  const computeTarget = (matrix, localX, localY) => {
    const rect = boardRectRef.current;
    if (!rect) return null;
    const cellSize = getCellSize();
    if (cellSize <= 0) return null;

    const rows = matrix.length;
    const cols = matrix[0].length;
    const pieceW = cols * cellSize;
    const pieceH = rows * cellSize;

    const { left: floatLeft, top: floatTop } = floatOrigin(localX, localY, pieceW, pieceH);

    const innerX = rect.x + BOARD_BORDER + BOARD_PADDING;
    const innerY = rect.y + BOARD_BORDER + BOARD_PADDING;

    const rawCol = (floatLeft - innerX) / cellSize;
    const rawRow = (floatTop - innerY) / cellSize;

    const maxCol = GRID_SIZE - cols;
    const maxRow = GRID_SIZE - rows;

    // Proximity check: don't snap/show preview if the dragged block is too far off the board.
    // Gives a comfortable ~0.8 cell margin around the board edges without lingering when far below.
    if (
      rawCol < -0.8 ||
      rawCol > maxCol + 0.8 ||
      rawRow < -0.8 ||
      rawRow > maxRow + 0.8
    ) {
      return null;
    }

    let col = Math.round(rawCol);
    let row = Math.round(rawRow);

    col = Math.max(0, Math.min(col, maxCol));
    row = Math.max(0, Math.min(row, maxRow));
    return { row, col };
  };

  // Center of a grid cell in local coordinates (for positioning blasts).
  const cellCenter = (r, c) => {
    const rect = boardRectRef.current;
    const cellSize = getCellSize();
    if (!rect || cellSize <= 0) return null;
    const innerX = rect.x + BOARD_BORDER + BOARD_PADDING;
    const innerY = rect.y + BOARD_BORDER + BOARD_PADDING;
    return {
      x: innerX + c * cellSize + cellSize / 2,
      y: innerY + r * cellSize + cellSize / 2,
    };
  };

  // ---- Drag handlers (called from PieceTray) ------------------------------

  const handleDragStart = (piece, pageX, pageY) => {
    if (isGameOver || isAdModalOpen) return;
    soundEngine.playPopSound();
    // Refresh the board rect in case its position shifted (fold/rotate/scroll).
    if (boardMeasureRef.current) boardMeasureRef.current();
    const { x, y } = toLocal(pageX, pageY);
    lastDragPosRef.current = { x, y };
    setDrag({ piece, x, y });
    updatePreview(piece, x, y);
  };

  const handleDragMove = (piece, pageX, pageY) => {
    const { x, y } = toLocal(pageX, pageY);
    lastDragPosRef.current = { x, y };
    setDrag((d) => (d ? { ...d, x, y } : d));
    updatePreview(piece, x, y);
  };

  const updatePreview = (piece, localX, localY) => {
    const target = computeTarget(piece.matrix, localX, localY);
    if (!target) {
      setPreview(null);
      return;
    }
    const valid = canPlacePiece(gridRef.current, piece.matrix, target.row, target.col);
    setPreview({
      matrix: piece.matrix,
      row: target.row,
      col: target.col,
      valid,
      colorIndex: piece.colorIndex,
    });
  };

  const handleDragEnd = (piece, pageX, pageY) => {
    setDrag(null);
    setPreview(null);
    if (!piece) return;

    const last = lastDragPosRef.current;
    let endX, endY;
    if (Number.isFinite(pageX) && pageX !== 0 && Number.isFinite(pageY) && pageY !== 0) {
      const local = toLocal(pageX, pageY);
      endX = local.x;
      endY = local.y;
    } else {
      endX = last?.x;
      endY = last?.y;
    }
    if (endX == null || endY == null) return;

    const target = computeTarget(piece.matrix, endX, endY);
    if (!target) {
      // Released outside the board area: cancelled drag, no blast needed.
      return;
    }

    const valid = canPlacePiece(gridRef.current, piece.matrix, target.row, target.col);

    if (!valid) {
      // Invalid drop on occupied cells: flash a red spark where the piece hovered.
      soundEngine.playPopSound();
      spawnBlasts([
        { id: Date.now(), x: endX, y: endY - FINGER_GAP, colors: ['#ff3b3b', '#ff7a00', '#ffffff'], shards: 8, spread: 40 },
      ]);
      return;
    }

    placePiece(piece, target.row, target.col);
  };

  // ---- Placement + scoring -------------------------------------------------

  const placePiece = (piece, r, c) => {
    const { newGrid, blocksPlacedCount } = placePieceOnGrid(
      gridRef.current,
      piece.matrix,
      r,
      c,
      piece.colorIndex
    );
    soundEngine.playPlaceSound();

    let addedScore = blocksPlacedCount * 10;
    const clearResult = checkLinesAndClear(newGrid);
    const finalGrid = clearResult.newGrid;

    // Coins: a small reward just for placing, more for clearing lines.
    let coinsEarned = 1;

    let latestBlasts = runBlasts;
    if (clearResult.totalLinesCleared > 0) {
      latestBlasts = runBlasts + clearResult.totalLinesCleared;
      setRunBlasts(latestBlasts);

      const prevPhase = getPhaseForBlasts(runBlasts);
      const nextPhase = getPhaseForBlasts(latestBlasts);

      // Phase change when hitting blast milestones (e.g. 5-6 blasts for Phase 2: Candy Pop)
      if (nextPhase.name !== prevPhase.name) {
        setPhaseBanner({
          name: nextPhase.name,
          displayName: nextPhase.displayName,
          sub: nextPhase.bannerSub,
          color: nextPhase.bannerColor,
        });
        soundEngine.playRewardSound();
        if (nextPhase.themeId && THEMES[nextPhase.themeId]) {
          setActiveThemeId(nextPhase.themeId);
        }
      }

      const newStreak = comboStreak + 1;
      setComboStreak(newStreak);
      addedScore += clearResult.lineScore * (1 + newStreak * 0.5);
      soundEngine.playBlastSound(clearResult.totalLinesCleared);
      soundEngine.playComboChime(newStreak);
      storage.incrementTotalBlasts(clearResult.totalLinesCleared);
      storage.setBestCombo(newStreak);

      // 5 coins per cleared line, plus a combo bonus.
      coinsEarned += clearResult.totalLinesCleared * 5 + Math.max(0, newStreak - 1) * 3;

      // Fire a colorful blast burst at every cleared cell.
      const blastItems = [];
      clearResult.clearedCells.forEach((cell, i) => {
        const center = cellCenter(cell.r, cell.c);
        if (!center) return;
        const cellColor = currentTheme.blockColors[cell.color] || currentTheme.accent;
        blastItems.push({
          id: Date.now() + i,
          x: center.x,
          y: center.y,
          colors: [cellColor, '#ffffff', currentTheme.accent],
          shards: 8,
          spread: 42,
        });
      });
      spawnBlasts(blastItems);

      // Kid-friendly praise instead of dry stats.
      let txt = clearPraise(newStreak);
      if (newStreak > 1) txt = `${clearPraise(newStreak)} COMBO x${newStreak}`;
      setComboText(txt);
    } else {
      setComboStreak(0);
      // Occasional gentle encouragement on a normal placement.
      if (Math.random() < 0.25) setComboText(placePraise());
    }

    earnCoins(coinsEarned);

    const newTotalScore = Math.round(score + addedScore);
    setScore(newTotalScore);
    if (newTotalScore > highScore) {
      onUpdateHighScore(newTotalScore);
    }

    const updatedPieceSet = pieceSet.map((p) =>
      p.instanceId === piece.instanceId ? { ...p, used: true } : p
    );
    const allUsed = updatedPieceSet.every((p) => p.used);

    let nextPieceSet = updatedPieceSet;
    if (allUsed) {
      // New round: advance the cyclic difficulty and refill the tray based on blast progress
      const nextRound = round + 1;
      setRound(nextRound);
      nextPieceSet = getRandomPieceSet(3, nextRound, latestBlasts);
    }

    setGrid(finalGrid);
    setPieceSet(nextPieceSet);

    if (!canAnyPieceFit(finalGrid, nextPieceSet)) {
      soundEngine.playLossSound();
      // Offer a rewarded "continue" only when ads are on, online, and unused.
      // Offline-first: no connection (or ads off) => straight to game over.
      if (SHOW_ADS && !hasUsedAdResume && isOnline) {
        setIsAdModalOpen(true);
      } else {
        setIsGameOver(true);
      }
    }
  };

  const handleAdReward = useCallback(() => {
    setIsAdModalOpen(false);
    setHasUsedAdResume(true);
    setGrid(clearSpaceForResume(gridRef.current));
    setComboText('SAVED! KEEP GOING!');
  }, []);

  const handleAdSkip = useCallback(() => {
    setIsAdModalOpen(false);
    setIsGameOver(true);
  }, []);

  // ---- Floating dragged piece ---------------------------------------------

  const renderDragLayer = () => {
    if (!drag) return null;
    const cellSize = getCellSize() || 34;
    const matrix = drag.piece.matrix;
    const color = currentTheme.blockColors[drag.piece.colorIndex] || currentTheme.accent;
    const cols = matrix[0].length;
    const rows = matrix.length;
    const pieceW = cols * cellSize;
    const pieceH = rows * cellSize;
    const { left, top } = floatOrigin(drag.x, drag.y, pieceW, pieceH);

    return (
      <View pointerEvents="none" style={[styles.dragLayer, { left, top }]}>
        {matrix.map((row, r) => (
          <View key={`dr_${r}`} style={{ flexDirection: 'row' }}>
            {row.map((cell, c) => (
              <View
                key={`dc_${r}_${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  padding: CELL_MARGIN,
                }}
              >
                {cell === 1 ? (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: color,
                      borderRadius: CELL_RADIUS,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.6)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* lit top face */}
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.30)' }} />
                    {/* shaded bottom + right edges = 3D bevel */}
                    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '26%', backgroundColor: 'rgba(0,0,0,0.28)' }} />
                    <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '18%', backgroundColor: 'rgba(0,0,0,0.16)' }} />
                    {/* shine dot */}
                    <View style={{ position: 'absolute', top: '12%', left: '14%', width: '24%', height: '18%', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 5 }} />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View
      ref={rootViewRef}
      onLayout={handleRootLayout}
      style={[styles.root, { backgroundColor: currentTheme.bgSolid }]}
    >
      <Header
        score={score}
        highScore={highScore}
        coins={coins}
        isMuted={isMuted}
        onToggleSound={onToggleSound}
        onOpenThemes={onOpenThemes}
        onGoHome={onGoHome}
        theme={currentTheme}
      />

      <View style={styles.boardWrap}>
        <GridBoard
          grid={grid}
          preview={preview}
          onMeasure={handleBoardMeasure}
          measureRef={boardMeasureRef}
          theme={currentTheme}
        />
        <ComboOverlay comboText={comboText} theme={currentTheme} />
      </View>

      <PieceTray
        pieceSet={pieceSet}
        draggingPieceId={drag?.piece.instanceId}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        theme={currentTheme}
      />

      {renderDragLayer()}
      <BlastLayer blasts={blasts} />
      <StageBanner phase={phaseBanner} theme={currentTheme} />

      <RewardedAdModal
        isOpen={isAdModalOpen}
        onReward={handleAdReward}
        onSkip={handleAdSkip}
        theme={currentTheme}
      />

      <Modal visible={isGameOver} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: currentTheme.bgSolid, borderColor: currentTheme.cellBorder }]}>
            <Icon name={score > startHighScore ? 'Crown' : 'Star'} size={48} color="#fbbf24" />
            <Text style={styles.gameOverTitle}>
              {score > startHighScore ? 'NEW BEST!' : 'GREAT TRY!'}
            </Text>
            <Text style={[styles.gameOverScore, { color: currentTheme.textMuted }]}>
              Score:{' '}
              <Text style={{ color: currentTheme.accent, fontSize: 18, fontWeight: '800' }}>{score.toLocaleString()}</Text>
            </Text>

            <View style={[styles.coinsEarned, { borderColor: '#fbbf24' }]}>
              <Icon name="Coin" size={20} color="#fbbf24" />
              <Text style={styles.coinsEarnedText}>+{coinsThisRun.toLocaleString()} coins earned!</Text>
            </View>

            <Pressable onPress={handleRestart} style={[styles.playAgain, { backgroundColor: currentTheme.accent }]}>
              <Icon name="Rocket" size={22} color="#ffffff" />
              <Text style={styles.playAgainText}>PLAY AGAIN</Text>
            </Pressable>
            <Pressable onPress={onGoHome} style={styles.homeLink}>
              <Text style={[styles.homeLinkText, { color: currentTheme.textMuted }]}>Back to Home</Text>
            </Pressable>

            {/* Banner ad on the game-over screen (online only). */}
            <View style={styles.gameOverBanner}>
              <BannerAd theme={currentTheme} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'space-between', paddingBottom: 16 },
  boardWrap: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, position: 'relative' },
  dragLayer: { position: 'absolute', zIndex: 100 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(5,5,20,0.88)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 380, borderWidth: 2, borderRadius: 28, paddingHorizontal: 24, paddingVertical: 28, alignItems: 'center' },
  gameOverTitle: { marginTop: 12, color: '#ffffff', fontSize: 26, fontWeight: '900' },
  gameOverScore: { marginTop: 4, marginBottom: 16, fontSize: 14 },
  coinsEarned: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 50, paddingVertical: 8, paddingHorizontal: 18, marginBottom: 20 },
  coinsEarnedText: { color: '#fbbf24', fontWeight: '800', fontSize: 15 },
  playAgain: { width: '100%', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  playAgainText: { color: '#ffffff', fontWeight: '900', fontSize: 18 },
  homeLink: { marginTop: 14, padding: 6 },
  homeLinkText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  gameOverBanner: { width: '100%', marginTop: 16, borderRadius: 12, overflow: 'hidden' },
});
