import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import GridBoard, { BOARD_BORDER, BOARD_PADDING, CELL_MARGIN, CELL_RADIUS } from '../components/GridBoard';
import PieceTray from '../components/PieceTray';
import ComboOverlay from '../components/ComboOverlay';
import RewardedAdModal from '../ads/RewardedAdModal';
import BannerAd from '../ads/BannerAd';
import { useOnlineStatus } from '../ads/useOnlineStatus';
import { SHOW_ADS } from '../ads/adConfig';
import BlastLayer from '../components/BlastLayer';
import PowerUpBar from '../components/PowerUpBar';
import { maybeShowInterstitial } from '../ads/interstitial';
import { showRewarded } from '../ads/rewarded';
import StageBanner from '../components/StageBanner';
import Icon from '../components/Icon';
import {
  createEmptyGrid,
  canPlacePiece,
  placePieceOnGrid,
  checkLinesAndClear,
  canAnyPieceFit,
  clearSpaceForResume,
  isGridEmpty,
  GRID_SIZE,
} from '../engine/gameLogic';
import { getRandomPieceSet, difficultyName } from '../engine/shapes';
import Block from '../components/Block';
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
  const [pieceSet, setPieceSet] = useState(() => getRandomPieceSet(3, 0, createEmptyGrid()));

  // Trays refilled this run. Drives the shape mix, so variety ramps every few
  // placements instead of waiting on the (rare) board-clear level up.
  const [trayCount, setTrayCount] = useState(0);

  // A level is completed by WIPING THE BOARD -- clearing every last square.
  // Refilling the tray is routine and does not advance the level.
  //
  // The palette comes straight from the player's SELECTED THEME (the one they
  // bought in the shop), on this screen and the menu alike -- a purchase should
  // be visible while playing. Levels are still tracked and rewarded, they just
  // don't repaint the background any more.
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(() => storage.getCoins());
  const [coinsThisRun, setCoinsThisRun] = useState(0);

  // ---- Power-ups ----------------------------------------------------------
  const [powerUps, setPowerUps] = useState(() => storage.getPowerUps());
  // 'hammer' while the player is choosing a block to smash, else null.
  const [activePowerUp, setActivePowerUp] = useState(null);
  // Snapshot of the state before the last placement, for undo.
  const [undoSnapshot, setUndoSnapshot] = useState(null);
  // Which power-up a rewarded ad is currently being watched for.
  const [pendingAdPowerUp, setPendingAdPowerUp] = useState(null);
  // Whether the game-over "double your coins" offer has been used.
  const [doubledCoins, setDoubledCoins] = useState(false);
  const startHighScore = useRef(highScore).current;
  const [comboStreak, setComboStreak] = useState(0);
  const [comboText, setComboText] = useState('');
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasUsedAdResume, setHasUsedAdResume] = useState(false);

  // Drag state
  const [drag, setDrag] = useState(null); // { piece, x, y } in window coords
  const [preview, setPreview] = useState(null); // { matrix, row, col, valid, colorIndex }
  const [blasts, setBlasts] = useState([]); // [{ id, x, y, colors?, shards?, spread? }]
  const [phaseBanner, setPhaseBanner] = useState(null); // { name } shown on phase change

  const boardRectRef = useRef(null); // { x, y, width, height } in page coords
  const boardMeasureRef = useRef(null); // fn to re-measure the board on demand
  const lastDragPosRef = useRef(null); // last finger position during a drag

  // Touch events and the board rect are both in PAGE coordinates, but the drag
  // layer and blast layer are absolutely positioned inside this screen's root
  // view -- which SafeAreaView pushes down by the status-bar inset. Without
  // subtracting that offset, everything we draw lands ~1 cell below the cell the
  // placement math picked, so the piece and its board shadow disagree.
  const rootRef = useRef(null);
  const rootOffsetRef = useRef({ x: 0, y: 0 });

  const handleRootLayout = () => {
    const node = rootRef.current;
    if (!node) return;
    node.measure((x, y, width, height, pageX, pageY) => {
      rootOffsetRef.current = { x: pageX, y: pageY };
    });
  };

  // Page coords -> coords local to this screen's root view.
  const toLocal = (pageX, pageY) => ({
    x: pageX - rootOffsetRef.current.x,
    y: pageY - rootOffsetRef.current.y,
  });
  const gridRef = useRef(grid);
  gridRef.current = grid;

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
    // Callers pass page coords; BlastLayer draws inside this screen's root view.
    const localItems = items.map((b) => {
      const p = toLocal(b.x, b.y);
      return { ...b, x: p.x, y: p.y };
    });
    setBlasts((prev) => [...prev, ...localItems]);
    const ids = items.map((b) => b.id);
    setTimeout(() => {
      setBlasts((prev) => prev.filter((b) => !ids.includes(b.id)));
    }, 900);
  };

  const handleRestart = () => {
    // Interstitial goes BETWEEN games, not on top of the game-over card: the
    // player has already decided to keep playing, so it interrupts least here.
    // maybeShowInterstitial() applies its own frequency cap.
    maybeShowInterstitial();

    setGrid(createEmptyGrid());
    setLevel(1);
    setTrayCount(0);
    setPieceSet(getRandomPieceSet(3, 0, createEmptyGrid()));
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
    setUndoSnapshot(null);
    setActivePowerUp(null);
    setPendingAdPowerUp(null);
    setDoubledCoins(false);
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

  // Convert a finger position to the target top-left grid cell for `matrix`,
  // matching where the floating piece is visually drawn (via floatOrigin).
  const computeTarget = (matrix, fingerX, fingerY) => {
    const rect = boardRectRef.current;
    if (!rect) return null;
    const cellSize = getCellSize();
    if (cellSize <= 0) return null;

    const rows = matrix.length;
    const cols = matrix[0].length;
    const pieceW = cols * cellSize;
    const pieceH = rows * cellSize;

    const { left: floatLeft, top: floatTop } = floatOrigin(fingerX, fingerY, pieceW, pieceH);

    const innerX = rect.x + BOARD_BORDER + BOARD_PADDING;
    const innerY = rect.y + BOARD_BORDER + BOARD_PADDING;

    const rawCol = (floatLeft - innerX) / cellSize;
    const rawRow = (floatTop - innerY) / cellSize;

    const maxRow = GRID_SIZE - rows;
    const maxCol = GRID_SIZE - cols;

    // Reject drags that have clearly left the board instead of clamping them in.
    // Clamping unconditionally meant dragging a piece back down to the tray
    // silently snapped it into the last row whenever that row was free.
    //
    // The tolerance still allows nudging slightly past an edge, which is needed
    // to reach the last row/column (the piece floats above the fingertip, so the
    // finger sits just below the board when targeting the bottom row).
    // 0.5 cell (~20px) of slack: enough to forgive imprecise aiming at an edge,
    // while still rejecting a release down in the tray. Aiming correctly at the
    // last row gives rawRow == maxRow exactly, so this is pure forgiveness.
    const SNAP_TOLERANCE = 0.5; // in cells
    if (rawRow < -SNAP_TOLERANCE || rawRow > maxRow + SNAP_TOLERANCE) return null;
    if (rawCol < -SNAP_TOLERANCE || rawCol > maxCol + SNAP_TOLERANCE) return null;

    const col = Math.max(0, Math.min(Math.round(rawCol), maxCol));
    const row = Math.max(0, Math.min(Math.round(rawRow), maxRow));
    return { row, col };
  };

  // Center of a grid cell in window coordinates (for positioning blasts).
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

  const handleDragStart = (piece, x, y) => {
    if (isGameOver || isAdModalOpen) return;
    soundEngine.playPopSound();
    // Refresh the board rect in case its position shifted (fold/rotate/scroll).
    if (boardMeasureRef.current) boardMeasureRef.current();
    handleRootLayout();
    lastDragPosRef.current = { x, y };
    setDrag({ piece, x, y });
    updatePreview(piece, x, y);
  };

  const handleDragMove = (piece, x, y) => {
    lastDragPosRef.current = { x, y };
    setDrag((d) => (d ? { ...d, x, y } : d));
    updatePreview(piece, x, y);
  };

  const updatePreview = (piece, x, y) => {
    const target = computeTarget(piece.matrix, x, y);
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

  const handleDragEnd = (piece, x, y) => {
    setDrag(null);
    setPreview(null);
    if (!piece) return;

    // Fall back to the last tracked position if the release event reports 0/NaN
    // (can happen on a tap with no movement).
    const last = lastDragPosRef.current;
    const endX = Number.isFinite(x) && x !== 0 ? x : last?.x;
    const endY = Number.isFinite(y) && y !== 0 ? y : last?.y;
    if (endX == null || endY == null) return;

    const target = computeTarget(piece.matrix, endX, endY);

    if (!target) {
      // Released off the board (e.g. dragged back down to the tray). Treat this
      // as "put it back", not a failed move: no error spark, piece stays unused.
      soundEngine.playPopSound();
      return;
    }

    if (!canPlacePiece(gridRef.current, piece.matrix, target.row, target.col)) {
      // On the board but the cells are occupied: flash a red spark.
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
    // Snapshot BEFORE mutating anything, so undo can restore the exact state.
    // Only one level of undo is kept, which is what players expect and keeps
    // the memory cost to a single grid copy.
    setUndoSnapshot({
      grid: gridRef.current.map((row) => [...row]),
      pieceSet,
      score,
      comboStreak,
      level,
      trayCount,
    });

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

    if (clearResult.totalLinesCleared > 0) {
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
        const cellColor = theme.blockColors[cell.color] || theme.accent;
        blastItems.push({
          id: Date.now() + i,
          x: center.x,
          y: center.y,
          colors: [cellColor, '#ffffff', theme.accent],
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

    const newTotalScore = Math.round(score + addedScore);
    setScore(newTotalScore);
    if (newTotalScore > highScore) {
      onUpdateHighScore(newTotalScore);
    }

    const updatedPieceSet = pieceSet.map((p) =>
      p.instanceId === piece.instanceId ? { ...p, used: true } : p
    );
    const allUsed = updatedPieceSet.every((p) => p.used);

    // Wiping the board completes the level: advance and reveal a new background.
    const boardCleared = isGridEmpty(finalGrid);
    const nextLevel = boardCleared ? level + 1 : level;

    if (boardCleared) {
      setLevel(nextLevel);
      setPhaseBanner({
        level: nextLevel,
        difficulty: difficultyName(trayCount),
        bonus: 50,
      });
      storage.setBestLevel(nextLevel);
      soundEngine.playRewardSound();

      // Clearing the whole board is the big achievement -> big bonus.
      coinsEarned += 50;
      setComboText('BOARD CLEARED!');
    }

    // Refilling the tray is routine housekeeping, independent of levelling up.
    let nextPieceSet = updatedPieceSet;
    if (allUsed) {
      const nextTray = trayCount + 1;
      setTrayCount(nextTray);
      nextPieceSet = getRandomPieceSet(3, nextTray, finalGrid);
    }

    // Paid out here (not earlier) so the level-complete bonus is included.
    earnCoins(coinsEarned);

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

  const handleAdReward = () => {
    setIsAdModalOpen(false);

    // The same modal is used to earn a power-up charge. In that case the game
    // isn't over, so don't touch the board -- just grant the item.
    if (pendingAdPowerUp) {
      const kind = pendingAdPowerUp;
      setPendingAdPowerUp(null);
      setPowerUps(storage.addPowerUp(kind, 1));
      setComboText('POWER-UP EARNED!');
      soundEngine.playRewardSound();
      return;
    }

    setHasUsedAdResume(true);
    setGrid(clearSpaceForResume(grid));
    setComboText('SAVED! KEEP GOING!');
  };

  const handleAdSkip = () => {
    setIsAdModalOpen(false);

    // Backing out of a power-up ad must not end the game.
    if (pendingAdPowerUp) {
      setPendingAdPowerUp(null);
      return;
    }

    setIsGameOver(true);
  };

  // ---- Power-ups -----------------------------------------------------------

  const applyUndo = () => {
    if (!undoSnapshot) return;
    setGrid(undoSnapshot.grid);
    setPieceSet(undoSnapshot.pieceSet);
    setScore(undoSnapshot.score);
    setComboStreak(undoSnapshot.comboStreak);
    setLevel(undoSnapshot.level);
    setTrayCount(undoSnapshot.trayCount);
    setUndoSnapshot(null);
    // Undoing must also lift a game over, otherwise it's useless at the moment
    // players most want it.
    setIsGameOver(false);
    setIsAdModalOpen(false);
    setComboText('UNDONE!');
    soundEngine.playPopSound();
  };

  const applyShuffle = () => {
    // Reroll only the pieces still unused, keeping the tray's used/unused shape.
    const fresh = getRandomPieceSet(3, trayCount, gridRef.current);
    setPieceSet((prev) => prev.map((p, i) => (p.used ? p : { ...fresh[i], used: false })));
    setComboText('SHUFFLED!');
    soundEngine.playPopSound();
  };

  // Remove a single block; used while the hammer is armed.
  const smashCell = (r, c) => {
    if (gridRef.current[r][c] <= 0) return;

    // The charge is spent here, not when the hammer was armed, so tapping an
    // empty cell or disarming costs nothing.
    const left = storage.usePowerUp('hammer');
    if (!left) {
      setActivePowerUp(null);
      return;
    }
    setPowerUps(left);

    const next = gridRef.current.map((row) => [...row]);
    next[r][c] = 0;
    setGrid(next);
    setActivePowerUp(null);
    const center = cellCenter(r, c);
    if (center) {
      spawnBlasts([
        { id: Date.now(), x: center.x, y: center.y, colors: ['#ffffff', theme.accent, '#fbbf24'], shards: 8, spread: 38 },
      ]);
    }
    soundEngine.playBlastSound(1);
    // A freed cell can rescue a stuck board.
    setIsGameOver(false);
  };

  // Spend an owned power-up.
  const handleUsePowerUp = (kind) => {
    if (kind === 'undo' && !undoSnapshot) return;

    if (kind === 'hammer') {
      // Arm/disarm rather than consuming now: the charge is spent on the tap.
      setActivePowerUp((cur) => (cur === 'hammer' ? null : 'hammer'));
      soundEngine.playPopSound();
      return;
    }

    const left = storage.usePowerUp(kind);
    if (!left) return;
    setPowerUps(left);
    if (kind === 'undo') applyUndo();
    else if (kind === 'shuffle') applyShuffle();
  };

  const handleBuyPowerUp = (kind) => {
    const res = storage.buyPowerUp(kind);
    if (!res.success) {
      soundEngine.playLossSound();
      return;
    }
    setCoins(res.coins);
    setPowerUps(res.powerUps);
    if (onCoinsChange) onCoinsChange(res.coins);
    soundEngine.playRewardSound();
  };

  // Not enough coins: offer a rewarded ad for a free charge.
  const handleWatchAdForPowerUp = (kind) => {
    setPendingAdPowerUp(kind);
    setIsAdModalOpen(true);
  };

  // Rewarded ad that doubles the coins earned this run.
  const handleDoubleCoins = async () => {
    if (doubledCoins || coinsThisRun <= 0) return;
    soundEngine.playPopSound();
    const bonus = coinsThisRun;
    const earned = await showRewarded();
    if (!earned) return;
    setDoubledCoins(true);
    earnCoins(bonus); // matches what they already made -> total is doubled
    soundEngine.playRewardSound();
  };

  // ---- Floating dragged piece ---------------------------------------------

  const renderDragLayer = () => {
    if (!drag) return null;
    const cellSize = getCellSize() || 34;
    const matrix = drag.piece.matrix;
    const color = theme.blockColors[drag.piece.colorIndex] || theme.accent;
    const cols = matrix[0].length;
    const rows = matrix.length;
    const pieceW = cols * cellSize;
    const pieceH = rows * cellSize;
    const { left, top } = floatOrigin(drag.x, drag.y, pieceW, pieceH);
    // floatOrigin works in page coords; shift into this screen's local space so
    // the drawn piece sits exactly over the previewed cells.
    const local = toLocal(left, top);

    return (
      <View pointerEvents="none" style={[styles.dragLayer, { left: local.x, top: local.y }]}>
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
                {cell === 1 ? <Block color={color} radius={CELL_RADIUS} /> : null}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View
      ref={rootRef}
      onLayout={handleRootLayout}
      style={[styles.root, { backgroundColor: theme.bgSolid }]}
    >
      <Header
        score={score}
        highScore={highScore}
        coins={coins}
        level={level}
        levelName={theme.name}
        isMuted={isMuted}
        onToggleSound={onToggleSound}
        onOpenThemes={onOpenThemes}
        onGoHome={onGoHome}
        theme={theme}
      />

      <View style={styles.boardWrap}>
        <GridBoard
          grid={grid}
          preview={preview}
          onMeasure={(rect) => {
            boardRectRef.current = rect;
          }}
          measureRef={boardMeasureRef}
          theme={theme}
          // Cells only become tappable while the hammer is armed.
          onCellPress={activePowerUp === 'hammer' ? smashCell : undefined}
        />
        <ComboOverlay comboText={comboText} theme={theme} />
      </View>

      {activePowerUp === 'hammer' ? (
        <Text style={[styles.hammerHint, { color: theme.accent }]}>
          TAP A BLOCK TO SMASH IT
        </Text>
      ) : null}

      <PowerUpBar
        powerUps={powerUps}
        coins={coins}
        activeKind={activePowerUp}
        canUndo={!!undoSnapshot}
        onUse={handleUsePowerUp}
        onBuy={handleBuyPowerUp}
        onWatchAd={handleWatchAdForPowerUp}
        theme={theme}
      />

      <PieceTray
        pieceSet={pieceSet}
        draggingPieceId={drag?.piece.instanceId}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        theme={theme}
      />

      {renderDragLayer()}
      <BlastLayer blasts={blasts} />
      <StageBanner phase={phaseBanner} theme={theme} />

      <RewardedAdModal
        isOpen={isAdModalOpen}
        onReward={handleAdReward}
        onSkip={handleAdSkip}
        theme={theme}
      />

      <Modal visible={isGameOver} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.bgSolid, borderColor: theme.cellBorder }]}>
            <Icon name={score > startHighScore ? 'Crown' : 'Star'} size={48} color="#fbbf24" />
            <Text style={styles.gameOverTitle}>
              {score > startHighScore ? 'NEW BEST!' : 'GREAT TRY!'}
            </Text>
            <Text style={[styles.gameOverScore, { color: theme.textMuted }]}>
              Score:{' '}
              <Text style={{ color: theme.accent, fontSize: 18, fontWeight: '800' }}>{score.toLocaleString()}</Text>
            </Text>

            <View style={[styles.coinsEarned, { borderColor: '#fbbf24' }]}>
              <Icon name="Coin" size={20} color="#fbbf24" />
              <Text style={styles.coinsEarnedText}>+{coinsThisRun.toLocaleString()} coins earned!</Text>
            </View>

            {/* Highest-engagement rewarded placement: players opt in happily
                because it doubles something they already earned. */}
            {!doubledCoins && coinsThisRun > 0 ? (
              <Pressable
                onPress={handleDoubleCoins}
                style={({ pressed }) => [
                  styles.doubleBtn,
                  { borderColor: '#fbbf24', opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Icon name="Film" size={18} color="#fbbf24" />
                <Text style={styles.doubleText}>WATCH AD — DOUBLE COINS</Text>
              </Pressable>
            ) : null}

            <Pressable onPress={handleRestart} style={[styles.playAgain, { backgroundColor: theme.accent }]}>
              <Icon name="Rocket" size={22} color="#ffffff" />
              <Text style={styles.playAgainText}>PLAY AGAIN</Text>
            </Pressable>
            <Pressable onPress={onGoHome} style={styles.homeLink}>
              <Text style={[styles.homeLinkText, { color: theme.textMuted }]}>Back to Home</Text>
            </Pressable>

            {/* Banner ad on the game-over screen (online only). */}
            <View style={styles.gameOverBanner}>
              <BannerAd theme={theme} />
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
  hammerHint: { textAlign: 'center', fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginTop: 6 },
  doubleBtn: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 16, borderWidth: 2, paddingVertical: 13, marginBottom: 12,
    backgroundColor: 'rgba(251,191,36,0.12)',
  },
  doubleText: { color: '#fbbf24', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
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
