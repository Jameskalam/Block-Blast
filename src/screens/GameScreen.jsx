import React, { useState, useRef } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import GridBoard from '../components/GridBoard';
import PieceTray from '../components/PieceTray';
import ComboOverlay from '../components/ComboOverlay';
import AdWatchModal from '../components/AdWatchModal';
import Icon from '../components/Icon';
import {
  createEmptyGrid,
  canPlacePiece,
  placePieceOnGrid,
  checkLinesAndClear,
  canAnyPieceFit,
  clearSpaceForResume
} from '../engine/gameLogic';
import { getRandomPieceSet } from '../engine/shapes';
import { soundEngine } from '../engine/soundEngine';
import { storage } from '../engine/storage';

export default function GameScreen({
  highScore,
  onUpdateHighScore,
  isMuted,
  onToggleSound,
  onOpenThemes,
  onGoHome,
  theme
}) {
  const [grid, setGrid] = useState(() => createEmptyGrid());
  const [pieceSet, setPieceSet] = useState(() => getRandomPieceSet(3));
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);
  const [isValidPlacement, setIsValidPlacement] = useState(false);
  const [score, setScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [comboText, setComboText] = useState('');
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasUsedAdResume, setHasUsedAdResume] = useState(false);
  const boardRef = useRef(null);

  const handleRestart = () => {
    setGrid(createEmptyGrid());
    setPieceSet(getRandomPieceSet(3));
    setSelectedPiece(null);
    setHoverPos(null);
    setScore(0);
    setComboStreak(0);
    setComboText('');
    setIsAdModalOpen(false);
    setIsGameOver(false);
    setHasUsedAdResume(false);
    storage.incrementGamesPlayed();
    soundEngine.playPopSound();
  };

  const handleCellHover = (r, c) => {
    if (!selectedPiece) return;
    setHoverPos({ r, c });
    setIsValidPlacement(canPlacePiece(grid, selectedPiece.matrix, r, c));
  };

  const handleCellClick = (r, c) => {
    if (!selectedPiece || isGameOver || isAdModalOpen) return;

    if (!canPlacePiece(grid, selectedPiece.matrix, r, c)) {
      soundEngine.playPopSound();
      return;
    }

    const { newGrid, blocksPlacedCount } = placePieceOnGrid(
      grid,
      selectedPiece.matrix,
      r,
      c,
      selectedPiece.colorIndex
    );
    soundEngine.playPlaceSound();

    let addedScore = blocksPlacedCount * 10;
    const clearResult = checkLinesAndClear(newGrid);
    let finalGrid = clearResult.newGrid;

    if (clearResult.totalLinesCleared > 0) {
      const newStreak = comboStreak + 1;
      setComboStreak(newStreak);
      addedScore += clearResult.lineScore * (1 + newStreak * 0.5);
      soundEngine.playBlastSound(clearResult.totalLinesCleared);
      soundEngine.playComboChime(newStreak);
      storage.incrementTotalBlasts(clearResult.totalLinesCleared);

      let txt = `${clearResult.totalLinesCleared}X LINE BLAST!`;
      if (newStreak > 1) txt = `COMBO X${newStreak}! +${Math.round(addedScore)}`;
      if (clearResult.totalLinesCleared >= 3) txt = `SUPER BLAST! +${Math.round(addedScore)}`;
      setComboText(txt);
    } else {
      setComboStreak(0);
    }

    const newTotalScore = Math.round(score + addedScore);
    setScore(newTotalScore);
    if (newTotalScore > highScore) {
      onUpdateHighScore(newTotalScore);
    }

    const updatedPieceSet = pieceSet.map((p) =>
      p.instanceId === selectedPiece.instanceId ? { ...p, used: true } : p
    );
    const allUsed = updatedPieceSet.every((p) => p.used);
    const nextPieceSet = allUsed ? getRandomPieceSet(3) : updatedPieceSet;

    setGrid(finalGrid);
    setPieceSet(nextPieceSet);
    setSelectedPiece(null);
    setHoverPos(null);

    if (!canAnyPieceFit(finalGrid, nextPieceSet)) {
      soundEngine.playLossSound();
      if (!hasUsedAdResume) {
        setIsAdModalOpen(true);
      } else {
        setIsGameOver(true);
      }
    }
  };

  const handleAdWatchSuccess = () => {
    setIsAdModalOpen(false);
    setHasUsedAdResume(true);
    setGrid(clearSpaceForResume(grid));
    setSelectedPiece(null);
    setHoverPos(null);
    setComboText('SAVED BY AD! CONTINUE!');
  };

  const handleAdDecline = () => {
    setIsAdModalOpen(false);
    setIsGameOver(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bgSolid }]}>
      <Header
        score={score}
        highScore={highScore}
        isMuted={isMuted}
        onToggleSound={onToggleSound}
        onOpenThemes={onOpenThemes}
        onGoHome={onGoHome}
        theme={theme}
      />

      <View style={styles.boardWrap}>
        <GridBoard
          grid={grid}
          selectedPiece={selectedPiece}
          hoverPos={hoverPos}
          onCellHover={handleCellHover}
          onCellClick={handleCellClick}
          onDropPiece={handleCellClick}
          isValidPlacement={isValidPlacement}
          theme={theme}
          boardRef={boardRef}
        />
        <ComboOverlay comboText={comboText} theme={theme} />
      </View>

      <PieceTray
        pieceSet={pieceSet}
        selectedPieceId={selectedPiece?.instanceId}
        onSelectPiece={(piece) => {
          soundEngine.playPopSound();
          setSelectedPiece(piece);
        }}
        onDragStartPiece={(piece) => {
          soundEngine.playPopSound();
          setSelectedPiece(piece);
        }}
        theme={theme}
      />

      <AdWatchModal
        isOpen={isAdModalOpen}
        score={score}
        highScore={highScore}
        onWatchAdSuccess={handleAdWatchSuccess}
        onDecline={handleAdDecline}
        theme={theme}
      />

      <Modal visible={isGameOver} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.bgSolid, borderColor: theme.cellBorder }]}>
            <Icon name="trophy" size={48} color="#fbbf24" />
            <Text style={styles.gameOverTitle}>GAME OVER</Text>
            <Text style={[styles.gameOverScore, { color: theme.textMuted }]}>
              Final Score: <Text style={{ color: theme.accent, fontSize: 18, fontWeight: '800' }}>{score.toLocaleString()}</Text>
            </Text>
            <Pressable onPress={handleRestart} style={[styles.playAgain, { backgroundColor: theme.accent }]}>
              <Icon name="refresh" size={22} color="#ffffff" />
              <Text style={styles.playAgainText}>PLAY AGAIN</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'space-between', paddingBottom: 16 },
  boardWrap: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, position: 'relative' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 20, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 2,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  gameOverTitle: { marginTop: 12, color: '#ffffff', fontSize: 26, fontWeight: '900' },
  gameOverScore: { marginTop: 4, marginBottom: 20, fontSize: 14 },
  playAgain: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  playAgainText: { color: '#ffffff', fontWeight: '900', fontSize: 18 },
});
