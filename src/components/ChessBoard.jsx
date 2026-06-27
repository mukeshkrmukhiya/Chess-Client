import React, { useEffect, useRef, useState } from 'react';
import { Clock, Focus, Play, RotateCcw, Settings, Maximize, Minimize } from 'lucide-react';
import { isLegalMove, shouldPromotePawn, isLegalMoveConsideringCheck, initializeBoard, isInCheck, isCheckmate, canCastle, performCastling } from './helper';
import { Square } from './Square';
import PromotionDialog from './PromotionDialog';
import { PlayerInfo } from './PlayerInfo';
import GameOverModalOffline from './GameOverModalOffline';
import BoardFrame from './BoardFrame';
import Button from './ui/Button';
import Card from './ui/Card';

// Runs the local chess board while preserving existing game rules.
const ChessBoard = () => {
  const [board, setBoard] = useState(initializeBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [turn, setTurn] = useState('white');
  const [lastMove, setLastMove] = useState(null);
  const [whiteTime, setWhiteTime] = useState(null);
  const [blackTime, setBlackTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [promotionChoice, setPromotionChoice] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [gameStatus, setGameStatus] = useState('setup');
  const [whitePlayer, setWhitePlayer] = useState('');
  const [blackPlayer, setBlackPlayer] = useState('');
  const [selectedTime, setSelectedTime] = useState('10');
  const [isMobile, setIsMobile] = useState(false);
  const [isOffline] = useState(true);
  const [focusedMode, setFocusedMode] = useState(false);
  const boardRef = useRef(null);
  const moveAudioRef = useRef(new Audio('assets/audio/move-sound.mp3'));

  const [isFullscreen, setIsFullscreen] = useState(false);

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    boardRef.current?.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

useEffect(() => {
  const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
  document.addEventListener('fullscreenchange', onFSChange);
  return () => document.removeEventListener('fullscreenchange', onFSChange);
}, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let timer;
    if (gameStatus === 'playing' && selectedTime !== 'No time limit') {
      timer = setInterval(() => {
        if (turn === 'white') {
          setWhiteTime((prevTime) => {
            if (prevTime <= 0) {
              clearInterval(timer);
              handleGameOver('black', 'Time out');
              return 0;
            }
            return prevTime - 1;
          });
        } else {
          setBlackTime((prevTime) => {
            if (prevTime <= 0) {
              clearInterval(timer);
              handleGameOver('white', 'Time out');
              return 0;
            }
            return prevTime - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus, turn, selectedTime]);

  useEffect(() => {
    if (gameStatus === 'playing' && !gameOver) {
      const opponentColor = turn === 'white' ? 'black' : 'white';
      const inCheck = isInCheck(board, opponentColor);
      const checkmateResult = isCheckmate(board, opponentColor, lastMove);

      if (inCheck) {
        console.log('check');
      } else if (checkmateResult.isGameOver) {
        handleGameOver(checkmateResult.winner, 'Checkmate');
      }
    }
  }, [turn, lastMove, board, gameOver, gameStatus]);

  // Applies the selected promotion piece to the pending pawn move.
  const handlePromotionSelect = (selectedPiece) => {
    const { rowIndex, colIndex, pieceColor, fromRow, fromCol } = promotionChoice;
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[rowIndex][colIndex] = { piece: selectedPiece, color: pieceColor };
    newBoard[fromRow][fromCol] = null;
    setBoard(newBoard);
    setPromotionChoice(null);
    setSelectedPiece(null);
    setTurn(turn === 'white' ? 'black' : 'white');
  };

  // Handles board clicks using the existing move validation helpers.
  const handleCellClick = (rowIndex, colIndex) => {
    if (gameStatus !== 'playing') return;

    const piece = board[rowIndex][colIndex];

    if (piece && piece.color === turn) {
      setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
      const moves = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (piece.piece === 'K') {
            if (
              (isLegalMove(board, piece, rowIndex, colIndex, i, j, lastMove) &&
                isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)) ||
              canCastle(board, rowIndex, colIndex, i, j, turn)
            ) {
              moves.push({ row: i, col: j });
            }
          } else if (
            isLegalMove(board, piece, rowIndex, colIndex, i, j, lastMove) &&
            isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)
          ) {
            moves.push({ row: i, col: j });
          }
        }
      }
      setLegalMoves(moves);
    } else if (selectedPiece) {
      const { piece, fromRow, fromCol } = selectedPiece;
      if (
        (isLegalMove(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove) &&
          isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove)) ||
        (piece.piece === 'K' && canCastle(board, fromRow, fromCol, rowIndex, colIndex, turn))
      ) {
        let newBoard;

        if (piece.piece === 'K' && Math.abs(fromCol - colIndex) === 2) {
          const castlingResult = performCastling(board, fromRow, fromCol, rowIndex, colIndex, isOffline);
          if (castlingResult) {
            newBoard = castlingResult.newBoard;
          } else {
            console.error('Castling failed');
            return;
          }
        } else {
          newBoard = JSON.parse(JSON.stringify(board));
          newBoard[rowIndex][colIndex] = piece;
          newBoard[fromRow][fromCol] = null;
        }

        if (shouldPromotePawn(piece, rowIndex)) {
          setPromotionChoice({ rowIndex, colIndex, pieceColor: piece.color, fromRow, fromCol });
        } else {
          setBoard(newBoard);
          setSelectedPiece(null);
          setLegalMoves([]);
          moveAudioRef.current.play().catch((error) => console.error('Error playing audio:', error));
          setTurn(turn === 'white' ? 'black' : 'white');
          setLastMove({ fromRow, fromCol, toRow: rowIndex, toCol: colIndex });
        }
      } else {
        setSelectedPiece(null);
        setLegalMoves([]);
      }
    }
  };

  // Opens the outcome modal with winner and reason details.
  const handleGameOver = (winnerColor, reason) => {
    setGameOver(true);
    setWinner(winnerColor === 'white' ? 'White' : 'Black');
    setGameOverReason(reason);
    setModalVisible(true);
  };

  // Formats remaining seconds as a chess clock string.
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Starts the local game with the selected time control.
  const handleStartGame = () => {
    if (selectedTime && selectedTime !== 'No time limit') {
      const timeInSeconds = parseInt(selectedTime, 10) * 60;
      setWhiteTime(timeInSeconds);
      setBlackTime(timeInSeconds);
    }
    setGameStatus('playing');
  };

  // Resets board state for a fresh local game.
  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedPiece(null);
    setLegalMoves([]);
    setTurn('white');
    setLastMove(null);
    setWhiteTime(selectedTime === 'No time limit' ? null : parseInt(selectedTime, 10) * 60);
    setBlackTime(selectedTime === 'No time limit' ? null : parseInt(selectedTime, 10) * 60);
    setGameOver(false);
    setWinner('');
    setModalVisible(false);
    setPromotionChoice(null);
    setGameOverReason(null);
    setGameStatus('playing');
  };

  // Renders one square with current board-state props.
  const renderSquare = (rowIndex, colIndex, cell) => (
    <Square
      key={`${rowIndex}-${colIndex}`}
      piece={cell ? cell.piece : null}
      color={cell ? cell.color : null}
      rowIndex={rowIndex}
      colIndex={colIndex}
      onClick={() => handleCellClick(rowIndex, colIndex)}
      selected={selectedPiece && selectedPiece.fromRow === rowIndex && selectedPiece.fromCol === colIndex}
      lastMove={lastMove}
      highlight={legalMoves.some((move) => move.row === rowIndex && move.col === colIndex)}
      isMobile={isMobile}
    />
  );

  // Toggles mobile focused mode around the board area.
  const toggleFocusedMode = () => {
    setFocusedMode(!focusedMode);
    if (!focusedMode) {
      scrollToBottom();
      if (isMobile) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      }
    } else if (isMobile) {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  };

  // Scrolls the board into view for focused play.
  const scrollToBottom = () => {
    if (boardRef.current) {
      boardRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  if (gameStatus === 'setup') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 pb-10">
        <Card className="w-full max-w-2xl p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Game Setup</p>
              <h2 className="mt-2 text-3xl font-extrabold">Prepare the board</h2>
            </div>
            <Settings className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <div className="grid gap-4">
            <input value={whitePlayer} onChange={(event) => setWhitePlayer(event.target.value)} placeholder="White player name" className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none placeholder:text-[#9CA3AF]" />
            <input value={blackPlayer} onChange={(event) => setBlackPlayer(event.target.value)} placeholder="Black player name" className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none placeholder:text-[#9CA3AF]" />
            <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#1F2937] px-4 py-3 text-[#F9FAFB] outline-none">
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="No time limit">No time limit</option>
            </select>
            <Button onClick={handleStartGame} disabled={!selectedTime} className="w-full">
              <Play size={18} /> Start Game
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-10" ref={boardRef}>
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <Clock size={20} className="text-[#D4AF37]" />
            <span>{selectedTime === 'No time limit' ? 'No time limit' : `${selectedTime} minutes`}</span>
          </div>
          <div className={`rounded-2xl px-4 py-2 text-sm font-bold ${turn === 'white' ? 'bg-white text-gray-950' : 'bg-gray-950 text-white'}`}>
            {turn === 'white' ? "White's turn" : "Black's turn"}
          </div>
          <div className="flex gap-2">
            <button onClick={toggleFocusedMode} className={`rounded-2xl p-3 ${focusedMode ? 'bg-[#D4AF37] text-gray-950' : 'bg-white/10 text-[#F9FAFB]'}`} aria-label="Toggle focused board mode">
              <Focus size={18} />
            </button>
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className={`rounded-xl p-2 transition-colors ${
                isFullscreen
                  ? 'bg-[#D4AF37] text-gray-950'
                  : 'bg-white/10 text-[#F9FAFB] hover:bg-white/20'
              }`}
            >
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>
            <button onClick={resetGame} className="rounded-2xl bg-white/10 p-3 text-[#F9FAFB]" aria-label="Reset game">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </Card>

      {focusedMode && isMobile && (
        <div className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#D4AF37]/10 px-4 py-3 text-sm text-[#F9FAFB]">
          Exit focused mode to restore page scrolling.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[620px_270px] lg:justify-center">
        <Card className="p-3 sm:p-5">
          <BoardFrame>
            {board.map((row, rowIndex) => row.map((cell, colIndex) => renderSquare(rowIndex, colIndex, cell)))}
          </BoardFrame>
        </Card>

        <aside className="grid gap-4">
          <PlayerInfo name={whitePlayer || 'White'} color="white" time={whiteTime ? formatTime(whiteTime) : 'No limit'} isCurrentPlayer={turn === 'white'} />
          <PlayerInfo name={blackPlayer || 'Black'} color="black" time={blackTime ? formatTime(blackTime) : 'No limit'} isCurrentPlayer={turn === 'black'} />
          <Card className="p-5">
            <h3 className="font-bold">Move Panel</h3>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              {lastMove ? `Last move: ${lastMove.fromRow},${lastMove.fromCol} to ${lastMove.toRow},${lastMove.toCol}` : 'No moves yet.'}
            </p>
            <p className="mt-4 text-sm text-[#9CA3AF]">Legal targets glow after you select a piece.</p>
          </Card>
        </aside>
      </div>

      {promotionChoice && <PromotionDialog onSelect={handlePromotionSelect} />}
      {modalVisible && (
        <GameOverModalOffline
          winner={winner}
          gameOverReason={gameOverReason}
          handleRematchRequest={resetGame}
          toggleModal={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};

export default ChessBoard;
