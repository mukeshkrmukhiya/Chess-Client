import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Clock, Maximize, Minimize, Settings, Volume2, Copy, X } from 'lucide-react';
import { isLegalMove, shouldPromotePawn, isLegalMoveConsideringCheck, initializeBoard, isInCheck, isCheckmate, canCastle, performCastling } from './helper';
import { Square } from './Square';
import GameOverModal from './GameOverModal';
import PromotionDialog from './PromotionDialog';
import { PlayerInfo } from './PlayerInfo';
import BoardFrame from './BoardFrame';
import { backendUrl } from '../components/helper';
// import Button from './ui/Button';
import Card from './ui/Card';

// Runs the online chess board while preserving existing socket gameplay.
const OnlineChessBoard = ({ socket, gameCode, playerId, playerUsername, opponentUsername, selectedTime, currentGameStatus, gameInfo, playerColour, currentTurn, onLeave, copyButtonDisabled, copyGameCode, copyButtonText }) => {
  const [board, setBoard] = useState(initializeBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [turn, setTurn] = useState(currentTurn);
  const [lastMove, setLastMove] = useState(null);
  const [whiteTime, setWhiteTime] = useState(selectedTime * 60 || 5 * 60);
  const [blackTime, setBlackTime] = useState(selectedTime * 60 || 5 * 60);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [promotionChoice, setPromotionChoice] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(playerUsername);
  const [opponentPlayer, setOpponentPlayer] = useState(opponentUsername);
  const [gameStatus, setGameStatus] = useState(currentGameStatus);
  const [playerColor, setPlayerColor] = useState(playerColour);
  const [endGameAPICalled, setEndGameAPICalled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rematchState, setRematchState] = useState({ requested: false, accepted: false, requestedBy: null });
  const boardRef = useRef(null);
  const moveAudioRef = useRef(new Audio('assets/audio/move-sound.mp3'));
  // const navigate = useNavigate();

  // Applies a server-broadcast move to the local board copy.
  const applyMove = useCallback((boardState, move) => {
    const { from, to, piece, isCastling, rookMove } = move;
    const [fromRow, fromCol] = from.split(',').map(Number);
    const [toRow, toCol] = to.split(',').map(Number);
    const newBoard = JSON.parse(JSON.stringify(boardState));
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    if (isCastling && rookMove) {
      const [rookFromRow, rookFromCol] = rookMove.from.split(',').map(Number);
      const [rookToRow, rookToCol] = rookMove.to.split(',').map(Number);
      newBoard[rookToRow][rookToCol] = newBoard[rookFromRow][rookFromCol];
      newBoard[rookFromRow][rookFromCol] = null;
    }

    return newBoard;
  }, []);

  // Persists game completion to the backend.
  const callEndGameAPI = useCallback(async (winnerColor) => {
    const response = await axios.post(`${backendUrl}/api/games/end-game`, { gameCode, winner: winnerColor });
    if (response.status === 200) return response.data;
    throw new Error(`Failed to end game: ${response.data.message}`);
  }, [gameCode]);

  // Ends the game once and persists the winner.
  const handleGameOver = useCallback(async (winnerColor, reason) => {
    try {
      if (!gameOver && !endGameAPICalled) {
        setGameOver(true);
        setWinner(winnerColor === 'white' ? 'White' : 'Black');
        setGameOverReason(reason);
        setModalVisible(true);
        setEndGameAPICalled(true);
        await callEndGameAPI(winnerColor);
      }
    } catch (error) {
      console.error('Error in handleGameOver:', error);
    }
  }, [callEndGameAPI, endGameAPICalled, gameOver]);

  // Resets the online board for an accepted rematch.
  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setSelectedPiece(null);
    setLegalMoves([]);
    setTurn('white');
    setLastMove(null);
    setWhiteTime(selectedTime * 60 || 5 * 60);
    setBlackTime(selectedTime * 60 || 5 * 60);
    setGameOver(false);
    setWinner('');
    setModalVisible(false);
    setPromotionChoice(null);
    setGameOverReason(null);
    setRematchState({ requested: false, accepted: false, requestedBy: null });
    setEndGameAPICalled(false);
  }, [selectedTime]);

  useEffect(() => {


    socket.on('gameState', ({ players, currentTurn }) => {
      setTurn(currentTurn);
      if (players && players.length > 0) {
        const player = players.find((entry) => entry.id === playerId);
        const opponent = players.find((entry) => entry.id !== playerId);
        if (player) {
          setPlayerColor(player.color);
          setCurrentPlayer(player.username);
        }
        if (opponent) setOpponentPlayer(opponent.username);
      }
      setGameStatus(players.length > 1 ? 'started' : 'waiting');
    });

    socket.on('moveMade', ({ move, currentTurn }) => {
      if (soundEnabled) {
        moveAudioRef.current.play().catch((error) => console.error('Error playing audio:', error));
      }
      setBoard((prevBoard) => applyMove(prevBoard, move));
      const [fromRow, fromCol] = move.from.split(',').map(Number);
      const [toRow, toCol] = move.to.split(',').map(Number);
      setLastMove({ fromRow, fromCol, toRow, toCol });
      setTurn(currentTurn);
      setSelectedPiece(null);
      setLegalMoves([]);
    });

    socket.on('playerLeft', ({ playerId: leftPlayerId }) => {
      if (leftPlayerId !== playerId && !gameOver) {
        handleGameOver(playerColor, 'Opponent left the game');
        toast.error('Your opponent has left the game.');
      }
    });

    socket.on('playerDisconnected', ({ playerId: disconnectedPlayerId }) => {
      if (disconnectedPlayerId !== playerId && !gameOver) {
        setGameStatus('opponent_disconnected');
        handleGameOver(playerColor, 'Opponent disconnected');
        toast.error('Your opponent has disconnected.');
      }
    });

    socket.on('disconnect', () => {
      setGameStatus('disconnected');
      toast.error('Disconnected from the server. Refresh to reconnect.', { duration: 6000 });
    });

    return () => {
      socket.off('gameState');
      socket.off('moveMade');
      socket.off('playerLeft');
      socket.off('playerDisconnected');
      socket.off('disconnect');
    };
  }, [applyMove, gameOver, handleGameOver, playerColor, playerId, socket, soundEnabled]);

  // Rotates board rows and columns for the black player view.
  const rotateBoard = (boardState) => boardState.slice().reverse().map((row) => row.slice().reverse());

  // Returns the board from the current player's perspective.
  const getDisplayedBoard = () => (playerColor === 'black' ? rotateBoard(board) : board);

  // Converts displayed square coordinates into actual board coordinates.
  const convertPosition = (row, col) => (playerColor === 'black' ? [7 - row, 7 - col] : [row, col]);

  // Emits a promoted pawn move to the server.
  const handlePromotionSelect = (promotedPiece) => {
    const { rowIndex, colIndex, pieceColor, fromRow, fromCol } = promotionChoice;
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[rowIndex][colIndex] = { piece: promotedPiece, color: pieceColor };
    newBoard[fromRow][fromCol] = null;
    setBoard(newBoard);
    setPromotionChoice(null);
    setSelectedPiece(null);
    socket.emit('makeMove', {
      gameCode,
      playerId,
      move: {
        from: `${fromRow},${fromCol}`,
        to: `${rowIndex},${colIndex}`,
        piece: { piece: promotedPiece, color: pieceColor }
      }
    });
  };

  useEffect(() => {
    if (!gameOver) {
      const opponentColor = turn === 'white' ? 'black' : 'white';
      const inCheck = isInCheck(board, opponentColor);
      const checkmateResult = isCheckmate(board, opponentColor, lastMove);
      if (inCheck) {
        console.log('check');
      } else if (checkmateResult.isGameOver) {
        handleGameOver(checkmateResult.winner, 'Checkmate');
      }
    }
  }, [board, gameOver, handleGameOver, lastMove, turn]);

  useEffect(() => {
    let timer;
    if (!gameOver && gameStatus === 'started') {
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
  }, [gameOver, gameStatus, handleGameOver, turn]);

  // Handles online board clicks with existing move validation.
  const handleCellClick = (rowIndex, colIndex) => {
    const [actualRow, actualCol] = convertPosition(rowIndex, colIndex);
    const piece = board[actualRow] && board[actualRow][actualCol];

    if (turn !== playerColor || !opponentPlayer) {
      console.log('Not your turn');
      return;
    }

    if (piece && piece.color === playerColor) {
      setSelectedPiece({ piece, fromRow: actualRow, fromCol: actualCol });
      const moves = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (piece.piece === 'K') {
            if ((isLegalMove(board, piece, actualRow, actualCol, i, j, lastMove) && isLegalMoveConsideringCheck(board, piece, actualRow, actualCol, i, j, lastMove)) || canCastle(board, actualRow, actualCol, i, j, playerColor)) {
              moves.push({ row: i, col: j });
            }
          } else if (isLegalMove(board, piece, actualRow, actualCol, i, j, lastMove) && isLegalMoveConsideringCheck(board, piece, actualRow, actualCol, i, j, lastMove)) {
            moves.push({ row: i, col: j });
          }
        }
      }
      setLegalMoves(moves);
    } else if (selectedPiece) {
      const { piece, fromRow, fromCol } = selectedPiece;
      if ((isLegalMove(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove) && isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove)) || (piece.piece === 'K' && canCastle(board, fromRow, fromCol, actualRow, actualCol, playerColor))) {
        let move = { from: `${fromRow},${fromCol}`, to: `${actualRow},${actualCol}`, piece, isCastling: false };
        let newBoard;

        if (piece.piece === 'K' && Math.abs(fromCol - actualCol) === 2) {
          const castlingResult = performCastling(board, fromRow, fromCol, actualRow, actualCol);
          if (castlingResult) {
            newBoard = castlingResult.newBoard;
            move.isCastling = true;
            move.rookMove = castlingResult.rookMove;
          } else {
            console.error('Castling failed');
            return;
          }
        } else {
          newBoard = JSON.parse(JSON.stringify(board));
          newBoard[actualRow][actualCol] = piece;
          newBoard[fromRow][fromCol] = null;
        }

        if (shouldPromotePawn(piece, actualRow)) {
          setPromotionChoice({ rowIndex: actualRow, colIndex: actualCol, pieceColor: piece.color, fromRow, fromCol });
        } else {
          setBoard(newBoard);
          setSelectedPiece(null);
          setLegalMoves([]);
          socket.emit('makeMove', { gameCode, move, playerId });
        }
      } else {
        setSelectedPiece(null);
        setLegalMoves([]);
      }
    } else {
      setSelectedPiece(null);
      setLegalMoves([]);
    }
  };

  useEffect(() => {
    // socket.on('rematchRequested', ({ requestingPlayerId }) => setRematchState({ requested: true, accepted: false, requestedBy: requestingPlayerId }));
    socket.on('rematchRequested', ({ requestingPlayerId }) => {
      setRematchState({
        requested: true,
        accepted: false,
        requestedBy: requestingPlayerId
      });

      // Open Game Over modal for opponent
      setModalVisible(true);
    });

    socket.on('rematchAccepted', () => {
      setRematchState({ requested: false, accepted: true, requestedBy: null });
      resetGame();
    });
    socket.on('rematchRejected', () => setRematchState({ requested: false, accepted: false, requestedBy: null }));
    return () => {
      socket.off('rematchRequested');
      socket.off('rematchAccepted');
      socket.off('rematchRejected');
    };
  }, [resetGame, socket]);

  // Sends a rematch request to the opponent.
  const handleRematchRequest = () => {
    socket.emit('requestRematch', { gameCode, playerId });
    setRematchState({ requested: true, accepted: false, requestedBy: playerId });
  };

  // Accepts an incoming rematch request.
  const handleRematchAccept = () => {
    socket.emit('acceptRematch', { gameCode, playerId });
    setRematchState({ requested: false, accepted: true, requestedBy: null });
    resetGame();
  };

  // Rejects an incoming rematch request.
  const handleRematchReject = () => {
    socket.emit('rejectRematch', { gameCode, playerId });
    setRematchState({ requested: false, accepted: false, requestedBy: null });
  };

  // Formats seconds for the responsive chess clocks.
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Leaves the current online room.
  // const handleLeaveGame = () => {
  //   socket.emit('leaveGame', { gameCode, playerId });
  //   navigate('/');
  // };



  // Toggles browser fullscreen for the game frame.
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (boardRef.current.requestFullscreen) boardRef.current.requestFullscreen();
      else if (boardRef.current.mozRequestFullScreen) boardRef.current.mozRequestFullScreen();
      else if (boardRef.current.webkitRequestFullscreen) boardRef.current.webkitRequestFullscreen();
      else if (boardRef.current.msRequestFullscreen) boardRef.current.msRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const displayedLastMove = lastMove && {
    fromRow: playerColor === 'black' ? 7 - lastMove.fromRow : lastMove.fromRow,
    fromCol: playerColor === 'black' ? 7 - lastMove.fromCol : lastMove.fromCol,
    toRow: playerColor === 'black' ? 7 - lastMove.toRow : lastMove.toRow,
    toCol: playerColor === 'black' ? 7 - lastMove.toCol : lastMove.toCol
  };
  return (
    <main
      ref={boardRef}
      className="h-screen overflow-hidden bg-[#111827] text-[#F9FAFB]"
    >
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col">

        {/* Controls */}
        <div className="shrink-0 px-2 py-2 sm:px-4 sm:py-3 lg:px-6">
          <Card className="p-2 sm:p-3">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">

              {/* Sound */}
              <button
                type="button"
                onClick={() =>
                  setSoundEnabled((value) => !value)
                }
                className={`flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition sm:h-11 sm:rounded-xl sm:text-sm ${soundEnabled
                  ? "bg-[#D4AF37] text-gray-950"
                  : "bg-white/10 text-[#F9FAFB]"
                  }`}
                aria-label="Toggle sound"
              >
                <Volume2 size={17} />
                <span className="hidden sm:inline">
                  Sound
                </span>
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-white/10 text-xs font-semibold text-[#F9FAFB] transition sm:h-11 sm:rounded-xl sm:text-sm"
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? (
                  <Minimize size={17} />
                ) : (
                  <Maximize size={17} />
                )}

                <span className="hidden sm:inline">
                  Full Screen
                </span>
              </button>

              {/* Turn */}
              <div
                className={`flex h-9 items-center justify-center gap-1.5 rounded-lg px-1 text-center text-[11px] font-bold sm:h-11 sm:rounded-xl sm:px-3 sm:text-sm ${turn === playerColor
                  ? "bg-green-500/15 text-green-300"
                  : "bg-red-500/15 text-red-300"
                  }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${turn === playerColor
                    ? "bg-green-400"
                    : "bg-red-400"
                    }`}
                />

                <span className="truncate">
                  <span className="sm:hidden">
                    {turn === playerColor ? "Your" : "Opp."}
                  </span>

                  <span className="hidden sm:inline">
                    {turn === playerColor
                      ? "Your turn"
                      : "Opponent's turn"}
                  </span>
                </span>
              </div>

              {/* Leave */}
              <button
                type="button"
                onClick={onLeave}
                className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-500/15 px-2 text-xs font-bold text-red-300 transition hover:bg-red-500/25 sm:h-11 sm:rounded-xl sm:text-sm"
                aria-label="Leave game"
              >
                <X size={17} />

                <span className="hidden sm:inline">
                  Leave Game
                </span>
              </button>

            </div>
          </Card>
        </div>


        {/* Game area */}
        <div
          className="
          min-h-0
          flex-1
          px-2
          pb-2
          sm:px-4
          sm:pb-4
          lg:px-6
        "
        >
          <div
            className="
            grid
            h-full
            min-h-0
            gap-2

            lg:grid-cols-[220px_minmax(0,1fr)]
            lg:gap-4
          "
          >
            {/* Chess board */}
            <section
  className="
    order-1
    flex
    w-full
    shrink-0
    min-w-0
    items-start
    justify-center
    lg:order-2
    lg:min-h-0
    lg:items-center
  "
>
  <div
    className="
      aspect-square
      w-full
      max-w-[calc(100vw-2rem)]
      lg:max-w-[calc(100vh-150px)]
    "
    style={{
      width: "min(100%, calc(100dvh - 80px))",
    }}
  >
    <BoardFrame playerColor={playerColor}>
      {getDisplayedBoard().map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            piece={cell ? cell.piece : null}
            color={cell ? cell.color : null}
            rowIndex={rowIndex}
            colIndex={colIndex}
            onClick={() =>
              handleCellClick(rowIndex, colIndex)
            }
            selected={
              selectedPiece &&
              (
                playerColor === "white"
                  ? selectedPiece.fromRow === rowIndex &&
                    selectedPiece.fromCol === colIndex
                  : selectedPiece.fromRow === 7 - rowIndex &&
                    selectedPiece.fromCol === 7 - colIndex
              )
            }
            lastMove={displayedLastMove}
            highlight={legalMoves.some(
              (move) =>
                playerColor === "white"
                  ? move.row === rowIndex &&
                    move.col === colIndex
                  : move.row === 7 - rowIndex &&
                    move.col === 7 - colIndex
            )}
          />
        ))
      )}
    </BoardFrame>
  </div>
</section>

<aside
              className="
    order-2
    grid
    min-w-0
    grid-cols-2
    gap-1

    md:order-1
    md:grid-cols-1
    md:grid-rows-[auto_auto_1fr]
    md:gap-4
  "
            >
              <PlayerInfo
                name={currentPlayer}
                color={playerColor}
                time={formatTime(
                  playerColor === "white"
                    ? whiteTime
                    : blackTime
                )}
                isCurrentPlayer={turn === playerColor}
              />

              <PlayerInfo
                name={opponentPlayer || "Waiting..."}
                color={
                  playerColor === "white"
                    ? "black"
                    : "white"
                }
                time={formatTime(
                  playerColor === "white"
                    ? blackTime
                    : whiteTime
                )}
                isCurrentPlayer={turn !== playerColor}
              />

              {/* Game Panel */}
              <Card className="col-span-2 p-3 lg:col-span-1 lg:p-5">
                <div className="flex items-center gap-2">
                  <Settings
                    size={17}
                    className="text-[#D4AF37]"
                  />

                  <h3 className="text-sm font-bold sm:text-base">
                    Game Panel
                  </h3>
                </div>

                <div className="mt-3 space-y-2 text-xs text-[#9CA3AF] sm:mt-4 sm:space-y-3 sm:text-sm">

                  <p className="flex items-center gap-2">
                    <Clock
                      size={15}
                      className="shrink-0"
                    />

                    <span>
                      {selectedTime} minute game
                    </span>
                  </p>

                  {/* Room Code */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">
                      Room code:
                    </span>

                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-mono text-[#D4AF37]">
                        {gameCode}
                      </span>

                      <button
                        type="button"
                        onClick={copyGameCode}
                        disabled={copyButtonDisabled}

                        className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-white/10
              text-[#F9FAFB]
              transition
              hover:bg-white/20
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                        aria-label="Copy room code"
                        title="Copy room code"
                      >
                        <Copy size={14} />
                        {copyButtonText}
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <p>
                    Status:{" "}
                    <span className="text-[#F9FAFB]">
                      {gameStatus}
                    </span>
                  </p>

                  {/* Last Move */}
                  <p className="truncate">
                    Last move:{" "}
                    <span className="text-[#F9FAFB]">
                      {lastMove
                        ? `${lastMove.fromRow},${lastMove.fromCol} to ${lastMove.toRow},${lastMove.toCol}`
                        : "No moves yet"}
                    </span>
                  </p>

                  {gameInfo && (
                    <p className="text-green-300">
                      Game saved in history after completion.
                    </p>
                  )}
                </div>
              </Card>
            </aside>

          </div>
        </div>
      </div>


      {promotionChoice && (
        <PromotionDialog
          onSelect={handlePromotionSelect}
        />
      )}

      {modalVisible && (
        <GameOverModal
          winner={winner}
          gameOverReason={gameOverReason}
          rematchState={rematchState}
          playerId={playerId}
          handleRematchRequest={
            handleRematchRequest
          }
          handleRematchAccept={
            handleRematchAccept
          }
          handleRematchReject={
            handleRematchReject
          }
          toggleModal={() =>
            setModalVisible(false)
          }
          gameCode={gameCode}
        />
      )}
    </main>
  );

};

export default OnlineChessBoard;