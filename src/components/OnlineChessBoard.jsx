import React, { useState, useEffect, useRef, useCallback  } from 'react';
import { isLegalMove, shouldPromotePawn, isLegalMoveConsideringCheck, initializeBoard, isInCheck, isCheckmate, canCastle, performCastling } from './helper';
 import { Square } from './Square';
 import GameOverModal from './GameOverModal';
import PromotionDialog from './PromotionDialog';
import { PlayerInfo } from './PlayerInfo';
import { useNavigate } from 'react-router-dom';
import { Clock, X ,Maximize, Minimize } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../components/helper';



const OnlineChessBoard = ({
  socket,
  gameCode,
  playerId,
  playerUsername,
  opponentUsername,
  selectedTime,
  currentGameStatus,
  gameInfo,
  playerColour,
  currentTurn
}) => {
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
  const boardRef = useRef(null);
  const moveAudioRef = useRef(new Audio('assets/audio/move-sound.mp3'));
  const [rematchState, setRematchState] = useState({
    requested: false,
    accepted: false,
    requestedBy: null
  });

  const navigate = useNavigate();

  const applyMove = (board, move) => {
    const { from, to, piece, isCastling, rookMove } = move;
    const [fromRow, fromCol] = from.split(',').map(Number);
    const [toRow, toCol] = to.split(',').map(Number);
  
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
  
    if (isCastling && rookMove) {
      const [rookFromRow, rookFromCol] = rookMove.from.split(',').map(Number);
      const [rookToRow, rookToCol] = rookMove.to.split(',').map(Number);
      newBoard[rookToRow][rookToCol] = newBoard[rookFromRow][rookFromCol];
      newBoard[rookFromRow][rookFromCol] = null;
    }
  
    return newBoard;
  };
  
  useEffect(() => {
    socket.on('gameState', ({ players, currentTurn }) => {
      // console.log(" gs ocb currturn playercolor",currentTurn, playerColor);
      setTurn(currentTurn);
      setPlayerColor(players[0].id === playerId ? players[0].color : players[1].color);
      if (players && players.length >= 2) {
        const currentPlayer = players.find(player => player.id === playerId);
        const opponentPlayer = players.find(player => player.id !== playerId);

        if (currentPlayer && opponentPlayer) {
          setCurrentPlayer(currentPlayer.username);
          setOpponentPlayer(opponentPlayer.username);
        }
      }
      setGameStatus(players.length > 1 ? 'started' : 'waiting');
      console.log("players oc,", players);
    });

    socket.on('moveMade', ({ move, playerId: moveMakerPlayerId, currentTurn }) => {
      console.log('Move received:', move, 'by', moveMakerPlayerId, 'current turn:', currentTurn);
      moveAudioRef.current.play().catch(e => console.error("Error playing audio:", e));

      
      setBoard(prevBoard => applyMove(prevBoard, move));

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
      }
    });

    return () => {
      socket.off('gameState');
      socket.off('moveMade');
      socket.off('playerLeft');
    };
  }, [socket, turn, playerColor, navigate, playerId, gameOver]);

  // Function to rotate the board
  const rotateBoard = (board) => {
    return board.slice().reverse().map(row => row.slice().reverse());
  };

  // Function to get the displayed board based on player color
  const getDisplayedBoard = () => {
    // console.log("ocb currturn playercolor",currentTurn, playerColor);
    return playerColor === 'black' ? rotateBoard(board) : board;
  };

  // Function to convert clicked position to actual board position
  const convertPosition = (row, col) => {
    if (playerColor === 'black') {
      return [7 - row, 7 - col];
    }
    return [row, col];
  };

  const handlePromotionSelect = (selectedPiece) => {
    const { rowIndex, colIndex, pieceColor, fromRow, fromCol } = promotionChoice;
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[rowIndex][colIndex] = { piece: selectedPiece, color: pieceColor };
    newBoard[fromRow][fromCol] = null;
    setBoard(newBoard);
    setPromotionChoice(null);
    setSelectedPiece(null);
    // setTurn(turn === 'white' ? 'black' : 'white');

    // Emit the move to the server
    const move = {
      from: `${fromRow},${fromCol}`,
      to: `${rowIndex},${colIndex}`,
      piece: { piece: selectedPiece, color: pieceColor },
    };
    socket.emit('makeMove', { gameCode, move, playerId });
  };


  
  useEffect(() => {
    if (!gameOver) {
      const opponentColor = turn === 'white' ? 'black' : 'white';
      const inCheck = isInCheck(board, opponentColor);
      const checkmateResult = isCheckmate(board, opponentColor, lastMove);

      console.log('Checkmate result:', checkmateResult);
      if (inCheck) {
        console.log("check")
      } else if (checkmateResult.isGameOver) {
        handleGameOver(checkmateResult.winner, 'Checkmate');

      }
    }
  }, [turn, lastMove, board, gameOver]);

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
  }, [gameOver, gameStatus, turn]);


  const handleCellClick = (rowIndex, colIndex) => {
    const [actualRow, actualCol] = convertPosition(rowIndex, colIndex);
    const piece = board[actualRow] && board[actualRow][actualCol];
  
    if (turn !== playerColor || !opponentPlayer) {
      console.log("Not your turn");
      return;
    }
  
    if (piece && piece.color === playerColor) {
      // Selecting a piece of the current player's color
      setSelectedPiece({ piece, fromRow: actualRow, fromCol: actualCol });
      const moves = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (piece.piece === 'K') {
            if (
              (isLegalMove(board, piece, actualRow, actualCol, i, j, lastMove) &&
                isLegalMoveConsideringCheck(board, piece, actualRow, actualCol, i, j, lastMove)) ||
              canCastle(board, actualRow, actualCol, i, j, playerColor)
            ) {
              moves.push({ row: i, col: j });
            }
          } else {
            if (
              isLegalMove(board, piece, actualRow, actualCol, i, j, lastMove) &&
              isLegalMoveConsideringCheck(board, piece, actualRow, actualCol, i, j, lastMove)
            ) {
              moves.push({ row: i, col: j });
            }
          }
        }
      }
      setLegalMoves(moves);
    } else if (selectedPiece) {
      const { piece, fromRow, fromCol } = selectedPiece;
      if (
        (isLegalMove(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove) &&
          isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove)) ||
        (piece.piece === 'K' && canCastle(board, fromRow, fromCol, actualRow, actualCol, playerColor))
      ) {
        let move = {
          from: `${fromRow},${fromCol}`,
          to: `${actualRow},${actualCol}`,
          piece: piece,
          isCastling: false
        };
  
        let newBoard;
  
        if (piece.piece === 'K' && Math.abs(fromCol - actualCol) === 2) {
          // Castling move
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
          // Regular move
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
          // moveAudioRef.current.play().catch(e => console.error("Error playing audio:", e));
  
          socket.emit('makeMove', { gameCode, move, playerId });
          // setTurn(turn === 'white' ? 'black' : 'white');
        }
      } else {
        // Invalid move, reset selection
        setSelectedPiece(null);
        setLegalMoves([]);
      }
    } else {
      // Clicking on an empty cell or opponent's piece when no piece is selected
      setSelectedPiece(null);
      setLegalMoves([]);
    }
  };



  useEffect(() => {
    socket.on('rematchRequested', ({ requestingPlayerId }) => {
      setRematchState({
        requested: true,
        accepted: false,
        requestedBy: requestingPlayerId
      });
    });

    socket.on('rematchAccepted', () => {
      setRematchState({
        requested: false,
        accepted: true,
        requestedBy: null
      });
      resetGame();
    });

    socket.on('rematchRejected', () => {
      setRematchState({
        requested: false,
        accepted: false,
        requestedBy: null
      });
    });

    return () => {
      socket.off('rematchRequested');
      socket.off('rematchAccepted');
      socket.off('rematchRejected');
    };
  }, [socket]);

  const resetGame = () => {
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
    setRematchState({
      requested: false,
      accepted: false,
      requestedBy: null
    });
    setEndGameAPICalled(false);
  };

  const handleRematchRequest = () => {
    socket.emit('requestRematch', { gameCode, playerId });
    setRematchState({
      requested: true,
      accepted: false,
      requestedBy: playerId
    });
  };

  const handleRematchAccept = () => {
    socket.emit('acceptRematch', { gameCode, playerId });
    setRematchState({
      requested: false,
      accepted: true,
      requestedBy: null
    });
    resetGame();
  };

  const handleRematchReject = () => {
    socket.emit('rejectRematch', { gameCode, playerId });
    setRematchState({
      requested: false,
      accepted: false,
      requestedBy: null
    });
  };


  const handleGameOver = async (winnerColor, reason) => {
    try {
      if (!gameOver && !endGameAPICalled) {
      setGameOver(true);
      const winnerText = winnerColor === 'white' ? 'White' : 'Black';
      setWinner(winnerText);
      setGameOverReason(reason);
      setModalVisible(true);
      setEndGameAPICalled(true);
      await callEndGameAPI(winnerColor);
      }
    } catch (error) {
      console.error('Error in handleGameOver:', error);
    }
  };

  // const handleGameOver = useCallback((winner, reason) => {
  //   if (!gameOver) {
  //     setGameOver(true);
  //     setWinner(winner);
  //     setGameOverReason(reason);
  //     setModalVisible(true);
  //     callEndGameAPI(winner, reason);
  //   }

    
  // }, [gameOver]);
  
  const callEndGameAPI = async (winnerColor) => {
    try {
      const response = await axios.post(`${backendUrl}/api/games/end-game`, {
        gameCode,
        winner: winnerColor
      });
  
      if (response.status === 200) {
        console.log('Game ended successfully:', response.data);
        return response.data;
      } else {
        throw new Error('Failed to end game: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error ending game:', error.message);
      throw error; // Re-throw the error to be handled by the caller
    }
  };
  const toggleModal = () => {
    setModalVisible(false);

  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  const handleLeaveGame = () => {
    socket.emit('leaveGame', { gameCode, playerId });
    navigate('/'); 
  };


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (boardRef.current.requestFullscreen) {
        boardRef.current.requestFullscreen();
      } else if (boardRef.current.mozRequestFullScreen) { // Firefox
        boardRef.current.mozRequestFullScreen();
      } else if (boardRef.current.webkitRequestFullscreen) { // Chrome, Safari and Opera
        boardRef.current.webkitRequestFullscreen();
      } else if (boardRef.current.msRequestFullscreen) { // IE/Edge
        boardRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

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

  // useEffect(() => {
  //   const preventDefault = (e) => e.preventDefault();
  //   document.body.style.overscrollBehavior = 'none';
  //   document.addEventListener('touchmove', preventDefault, { passive: false });

  //   return () => {
  //     document.body.style.overscrollBehavior = 'auto';
  //     document.removeEventListener('touchmove', preventDefault);
  //   };
  // }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 sm:p-4" ref={boardRef}>
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 p-4 flex justify-between items-center">
          <button
            onClick={handleLeaveGame}
            className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors duration-200"
          >
            <X size={20} />
            <span className="hidden sm:inline">Leave Game</span>
          </button>
          <div className={`px-3 py-1 rounded ${turn === playerColor ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {turn === playerColor ? "Your turn" : "Opponent's turn"}
          </div>
          <button
            onClick={toggleFullscreen}
            className={`flex items-center ${isFullscreen?'bg-gray-800 text-white p-1 rounded-md': 'p-1' }  space-x-2 text-gray-200 hover:text-blue-300 transition-colors duration-200`}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>

        {/* Game Content */}
        <div className="flex flex-col sm:flex-row">
      {/* Player Info */}
      <div className="w-full sm:w-1/4 bg-gray-750 p-4 space-y-4 sm:space-y-0 sm:flex sm:flex-col">
        <div className="flex flex-row sm:flex-col space-x-4 sm:space-x-0 sm:space-y-4">
          <div className="w-1/2 sm:w-full">
            <PlayerInfo
              name={currentPlayer}
              color={playerColor}
              time={formatTime(playerColor === 'white' ? whiteTime : blackTime)}
              isCurrentPlayer={turn === playerColor}
            />
          </div>
          <div className="w-1/2 sm:w-full">
            <PlayerInfo
              name={opponentPlayer || 'Waiting...'}
              color={playerColor === 'white' ? 'black' : 'white'}
              time={formatTime(playerColor === 'white' ? blackTime : whiteTime)}
              isCurrentPlayer={turn !== playerColor}
            />
          </div>
        </div>
      </div>
      
      {/* Chess Board */}
      <div className="aspect-square sm:w-3/4 sm:p-4">
  <div className="aspect-square">
    <div className="grid grid-cols-8 gap-0 bg-gray-600">
      {getDisplayedBoard().map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            piece={cell ? cell.piece : null}
            color={cell ? cell.color : null}
            rowIndex={rowIndex}
            colIndex={colIndex}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            selected={
              selectedPiece &&
              ((playerColor === 'white' && selectedPiece.fromRow === rowIndex && selectedPiece.fromCol === colIndex) ||
                (playerColor === 'black' && selectedPiece.fromRow === 7 - rowIndex && selectedPiece.fromCol === 7 - colIndex))
            }
            lastMove={lastMove && {
              fromRow: playerColor === 'black' ? 7 - lastMove.fromRow : lastMove.fromRow,
              fromCol: playerColor === 'black' ? 7 - lastMove.fromCol : lastMove.fromCol,
              toRow: playerColor === 'black' ? 7 - lastMove.toRow : lastMove.toRow,
              toCol: playerColor === 'black' ? 7 - lastMove.toCol : lastMove.toCol,
            }}
            highlight={legalMoves.some(move =>
              (playerColor === 'white' && move.row === rowIndex && move.col === colIndex) ||
              (playerColor === 'black' && move.row === 7 - rowIndex && move.col === 7 - colIndex)
            )}
          />
        ))
      )}
    </div>
  </div>
</div>
    </div>
      </div>

      {/* Modals */}
      {promotionChoice && (
        <PromotionDialog
          onSelect={handlePromotionSelect}
          position={{
            top: `${playerColor === 'black' ? (7 - promotionChoice.rowIndex) * 12.5 : promotionChoice.rowIndex * 12.5}%`,
            left: `${playerColor === 'black' ? (7 - promotionChoice.colIndex) * 12.5 : promotionChoice.colIndex * 12.5}%`,
          }}
        />
      )}

      {modalVisible && (
        <GameOverModal
          winner={winner}
          gameOverReason={gameOverReason}
          rematchState={rematchState}
          playerId={playerId}
          handleRematchRequest={handleRematchRequest}
          handleRematchAccept={handleRematchAccept}
          handleRematchReject={handleRematchReject}
          toggleModal={toggleModal}
          gameCode = {gameCode}
        />
      )}
    </div>
  );
};


export default OnlineChessBoard;

 // const handleCellClick = (rowIndex, colIndex) => {
  //   const [actualRow, actualCol] = convertPosition(rowIndex, colIndex);
  //   const piece = board[actualRow] && board[actualRow][actualCol];

  //   if (turn !== playerColor || !opponentPlayer) {
  //     console.log("Not your turn");
  //     return;
  //   }

  //   if (piece && piece.color === playerColor) {
  //     // Selecting a piece of the current player's color
  //     setSelectedPiece({ piece, fromRow: actualRow, fromCol: actualCol });
  //     const moves = [];
  //     for (let i = 0; i < 8; i++) {
  //       for (let j = 0; j < 8; j++) {
  //         if (piece.piece === 'K') {
  //           // For the king, check both regular moves and castling
  //           if (
  //             (isLegalMove(board, piece, actualRow, actualCol, i, j, lastMove) &&
  //               isLegalMoveConsideringCheck(board, piece, actualRow, actualCol, i, j, lastMove)) ||
  //             canCastle(board, actualRow, actualCol, i, j, playerColor)
  //           ) {
  //             moves.push({ row: i, col: j });
  //           }
  //         } else {
  //           // For other pieces, check regular moves
  //           if (
  //             isLegalMove(board, piece, actualRow, actualCol, i, j, lastMove) &&
  //             isLegalMoveConsideringCheck(board, piece, actualRow, actualCol, i, j, lastMove)
  //           ) {
  //             moves.push({ row: i, col: j });
  //           }
  //         }
  //       }
  //     }
  //     setLegalMoves(moves);
  //   } else if (selectedPiece) {
  //     // Attempting to move the selected piece
  //     const { piece, fromRow, fromCol } = selectedPiece;
  //     if (
  //       (isLegalMove(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove) &&
  //         isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove)) ||
  //       (piece.piece === 'K' && canCastle(board, fromRow, fromCol, actualRow, actualCol, playerColor))
  //     ) {
  //       // Valid move
  //       let newBoard;
  //       if (piece.piece === 'K' && Math.abs(fromCol - actualCol) === 2) {
  //         // Castling move
  //         newBoard = performCastling(board, fromRow, fromCol, actualRow, actualCol);
  //       } else {
  //         newBoard = JSON.parse(JSON.stringify(board));
  //         newBoard[actualRow][actualCol] = piece;
  //         newBoard[fromRow][fromCol] = null;
  //       }

  //       const move = {
  //         from: `${fromRow},${fromCol}`,
  //         to: `${actualRow},${actualCol}`,
  //         piece: piece,
  //         isCastling: piece.piece === 'K' && Math.abs(fromCol - actualCol) === 2,
          
  //       };

  //       if (shouldPromotePawn(piece, actualRow)) {
  //         setPromotionChoice({ rowIndex: actualRow, colIndex: actualCol, pieceColor: piece.color, fromRow, fromCol });
  //       } else {
  //         setBoard(newBoard);
  //         setSelectedPiece(null);
  //         setLegalMoves([]);
  //         moveAudioRef.current.play().catch(e => console.error("Error playing audio:", e));

  //         socket.emit('makeMove', { gameCode, move, playerId });
  //         setTurn(turn === 'white' ? 'black' : 'white');
  //       }
  //     } else {
  //       // Invalid move, reset selection
  //       setSelectedPiece(null);
  //       setLegalMoves([]);
  //     }
  //   } else {
  //     // Clicking on an empty cell or opponent's piece when no piece is selected
  //     setSelectedPiece(null);
  //     setLegalMoves([]);
  //   }
  // };


    // const handleCellClick = (rowIndex, colIndex) => {
  //   const [actualRow, actualCol] = convertPosition(rowIndex, colIndex);
  //   const piece = board[actualRow] && board[actualRow][actualCol];
  
  //   if (turn !== playerColor || !opponentPlayer) {
  //     console.log("Not your turn");
  //     return;
  //   }
  
  //   if (piece && piece.color === playerColor) {
  //     // Selecting a piece of the current player's color
  //     setSelectedPiece({ piece, fromRow: actualRow, fromCol: actualCol });
  //     const moves = [];
  //     for (let i = 0; i < 8; i++) {
  //       for (let j = 0; j < 8; j++) {
  //         if (piece.piece === 'K') {
  //           // For the king, check both regular moves and castling
  //           if (
  //             (isLegalMove(board, piece, actualRow, actualCol, i, j, lastMove) &&
  //               isLegalMoveConsideringCheck(board, piece, actualRow, actualCol, i, j, lastMove)) ||
  //             canCastle(board, actualRow, actualCol, i, j, playerColor)
  //           ) {
  //             moves.push({ row: i, col: j });
  //           }
  //         } else {
  //           // For other pieces, check regular moves
  //           if (
  //             isLegalMove(board, piece, actualRow, actualCol, i, j, lastMove) &&
  //             isLegalMoveConsideringCheck(board, piece, actualRow, actualCol, i, j, lastMove)
  //           ) {
  //             moves.push({ row: i, col: j });
  //           }
  //         }
  //       }
  //     }
  //     setLegalMoves(moves);
  //   } else if (selectedPiece) {
  //     // Attempting to move the selected piece
  //     const { piece, fromRow, fromCol } = selectedPiece;
  //     if (
  //       (isLegalMove(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove) &&
  //         isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove)) ||
  //       (piece.piece === 'K' && canCastle(board, fromRow, fromCol, actualRow, actualCol, playerColor))
  //     ) {
  //       // Valid move
  //       let newBoard;
  //       let move;
  
  //       if (piece.piece === 'K' && Math.abs(fromCol - actualCol) === 2) {
  //         // Castling move
  //         const { newBoard: castlingBoard, rookMove } = performCastling(board, fromRow, fromCol, actualRow, actualCol);
  //         newBoard = castlingBoard;
  
  //         move = {
  //           from: `${fromRow},${fromCol}`,
  //           to: `${actualRow},${actualCol}`,
  //           piece: piece,
  //           isCastling: true,
  //           rookMove: rookMove // Include the rook move information
  //         };
  //       } else {
  //         // Regular move
  //         newBoard = JSON.parse(JSON.stringify(board));
  //         newBoard[actualRow][actualCol] = piece;
  //         newBoard[fromRow][fromCol] = null;
  
  //         move = {
  //           from: `${fromRow},${fromCol}`,
  //           to: `${actualRow},${actualCol}`,
  //           piece: piece,
  //           isCastling: false
  //         };
  //       }
  
  //       if (shouldPromotePawn(piece, actualRow)) {
  //         setPromotionChoice({ rowIndex: actualRow, colIndex: actualCol, pieceColor: piece.color, fromRow, fromCol });
  //       } else {
  //         setBoard(newBoard);
  //         setSelectedPiece(null);
  //         setLegalMoves([]);
  //         moveAudioRef.current.play().catch(e => console.error("Error playing audio:", e));
  
  //         socket.emit('makeMove', { gameCode, move, playerId });
  //         setTurn(turn === 'white' ? 'black' : 'white');
  //       }
  //     } else {
  //       // Invalid move, reset selection
  //       setSelectedPiece(null);
  //       setLegalMoves([]);
  //     }
  //   } else {
  //     // Clicking on an empty cell or opponent's piece when no piece is selected
  //     setSelectedPiece(null);
  //     setLegalMoves([]);
  //   }
  // };
 