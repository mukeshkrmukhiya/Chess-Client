
import React, { useState, useEffect, useRef } from 'react';
import { isLegalMove, shouldPromotePawn, isLegalMoveConsideringCheck, initializeBoard, isInCheck, isCheckmate, canCastle, performCastling } from './helper';
import { Square } from './Square';
import PromotionDialog from './PromotionDialog';
import { PlayerInfo } from './PlayerInfo';
import { Clock, Play, Focus, ChevronUp, ChevronDown } from 'lucide-react';
import GameOverModalOffline from './GameOverModalOffline';

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
  const [selectedTime, setSelectedTime] = useState("10");
  const [isMobile, setIsMobile] = useState(false);
  const [isOffline, setIsOffline] = useState(true);
  const [focusedMode, setFocusedMode] = useState(false);
  const boardRef = useRef(null);
  const moveAudioRef = useRef(new Audio('assets/audio/move-sound.mp3'));


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
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
        console.log("check");
      } else if (checkmateResult.isGameOver) {
        handleGameOver(checkmateResult.winner, 'Checkmate');
      }
    }
  }, [turn, lastMove, board, gameOver, gameStatus]);

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
          } else {
            if (
              isLegalMove(board, piece, rowIndex, colIndex, i, j, lastMove) &&
              isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)
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
        (isLegalMove(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove) &&
          isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove)) ||
        (piece.piece === 'K' && canCastle(board, fromRow, fromCol, rowIndex, colIndex, turn))
      ) {
        let move = {
          from: `${fromRow},${fromCol}`,
          to: `${rowIndex},${colIndex}`,
          piece: piece,
          isCastling: false
        };

        let newBoard;

        if (piece.piece === 'K' && Math.abs(fromCol - colIndex) === 2) {
          const castlingResult = performCastling(board, fromRow, fromCol, rowIndex, colIndex, isOffline);
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
          newBoard[rowIndex][colIndex] = piece;
          newBoard[fromRow][fromCol] = null;
        }

        if (shouldPromotePawn(piece, rowIndex)) {
          setPromotionChoice({ rowIndex, colIndex, pieceColor: piece.color, fromRow, fromCol });
        } else {
          setBoard(newBoard);
          setSelectedPiece(null);
          setLegalMoves([]);
          moveAudioRef.current.play().catch(e => console.error("Error playing audio:", e));
          setTurn(turn === 'white' ? 'black' : 'white');
          setLastMove({ fromRow, fromCol, toRow: rowIndex, toCol: colIndex });
        }
      } else {
        setSelectedPiece(null);
        setLegalMoves([]);
      }
    }
  };

  const handleGameOver = (winnerColor, reason) => {
    setGameOver(true);
    setWinner(winnerColor === 'white' ? 'White' : 'Black');
    setGameOverReason(reason);
    setModalVisible(true);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleStartGame = () => {
    if (selectedTime && selectedTime !== 'No time limit') {
      const timeInSeconds = parseInt(selectedTime) * 60;
      setWhiteTime(timeInSeconds);
      setBlackTime(timeInSeconds);
    }
    setGameStatus('playing');
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedPiece(null);
    setLegalMoves([]);
    setTurn('white');
    setLastMove(null);
    setWhiteTime(selectedTime === 'No time limit' ? null : parseInt(selectedTime) * 60);
    setBlackTime(selectedTime === 'No time limit' ? null : parseInt(selectedTime) * 60);
    setGameOver(false);
    setWinner('');
    setModalVisible(false);
    setPromotionChoice(null);
    setGameOverReason(null);
    setGameStatus('playing');
  };



  const renderSquare = (rowIndex, colIndex, cell) => {
    return (
      <Square
        key={`${rowIndex}-${colIndex}`}
        piece={cell ? cell.piece : null}
        color={cell ? cell.color : null}
        rowIndex={rowIndex}
        colIndex={colIndex}
        onClick={() => handleCellClick(rowIndex, colIndex)}
        selected={selectedPiece && selectedPiece.fromRow === rowIndex && selectedPiece.fromCol === colIndex}
        lastMove={lastMove}
        highlight={legalMoves.some(move => move.row === rowIndex && move.col === colIndex)}
        isMobile={isMobile}
      />
    );
  };

  const toggleFocusedMode = () => {
    setFocusedMode(!focusedMode);
    if (!focusedMode) {
      scrollToBottom();
      if (isMobile) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      }
    } else {
      if (isMobile) {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    }
  };

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-900 sm:p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {gameStatus === 'setup' ? (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Game Setup</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="White Player Name (optional)"
                value={whitePlayer}
                onChange={(e) => setWhitePlayer(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="text"
                placeholder="Black Player Name (optional)"
                value={blackPlayer}
                onChange={(e) => setBlackPlayer(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="">Select Time Limit</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="No time limit">No time limit</option>
              </select>
              <button
                onClick={handleStartGame}
                disabled={!selectedTime}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Play className="mr-2" size={20} />
                Start Game
              </button>
            </div>
            </div>
          ) : (
          <>
            <div className="bg-gray-700 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-white">
                <Clock size={20} />
                <span>{selectedTime === 'No time limit' ? 'No time limit' : `${selectedTime} minutes`}</span>
              </div>
              <div className={`px-3 py-1 rounded ${turn === 'white' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                {turn === 'white' ? "White's turn" : "Black's turn"}
              </div>
              <button
                onClick={toggleFocusedMode}
                className={`p-2 rounded ${focusedMode ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
              >
                <Focus size={20} />
              </button>
            </div>

            {focusedMode && isMobile && (
              <div className="bg-gray-600 text-gray-900 px-4 py-2 text-sm">
                To enable scrolling, exit focused mode.
              </div>
            )}

            <div ref={boardRef} className={`flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
            
              {isMobile && (
                <div className={`w-full bg-gray-750 p-4 ${isMobile ? 'transform rotate-180' : ''}`}>
                  <PlayerInfo
                    name={blackPlayer || 'Black'}
                    color="black"
                    time={blackTime ? formatTime(blackTime) : 'No limit'}
                    isCurrentPlayer={turn === 'black'}
                  />
                </div>
              )}

              <div className={`aspect-square ${isMobile ? 'w-full' : 'sm:w-3/4'} sm:p-4`}>
                <div className="aspect-square">
                  <div className="grid grid-cols-8 gap-0 bg-gray-600">
                    {board.map((row, rowIndex) =>
                      row.map((cell, colIndex) => renderSquare(rowIndex, colIndex, cell))
                    )}
                  </div>
                </div>
              </div>

              {!isMobile && (
                <div className="w-full sm:w-1/4 bg-gray-750 p-4 space-y-4 sm:space-y-0 sm:flex sm:flex-col">
                  <PlayerInfo
                    name={whitePlayer || 'White'}
                    color="white"
                    time={whiteTime ? formatTime(whiteTime) : 'No limit'}
                    isCurrentPlayer={turn === 'white'}
                  />
                  <PlayerInfo
                    name={blackPlayer || 'Black'}
                    color="black"
                    time={blackTime ? formatTime(blackTime) : 'No limit'}
                    isCurrentPlayer={turn === 'black'}
                  />
                </div>
              )}

              {isMobile && (
                <div className="w-full bg-gray-750 p-4">
                  <PlayerInfo
                    name={whitePlayer || 'White'}
                    color="white"
                    time={whiteTime ? formatTime(whiteTime) : 'No limit'}
                    isCurrentPlayer={turn === 'white'}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {promotionChoice && (
        <PromotionDialog
          onSelect={handlePromotionSelect}
          position={{
            top: `${promotionChoice.rowIndex * 12.5}%`,
            left: `${promotionChoice.colIndex * 12.5}%`,
          }}
        />
      )}

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



// import React, { useState, useEffect,useRef  } from 'react';
// import { isLegalMove, isLegalMoveConsideringCheck, initializeBoard, shouldPromotePawn, isInCheck, isCheckmate } from './helper';
// import { Square } from './Square';
// import PromotionDialog from './PromotionDialog';
// import { useNavigate } from 'react-router-dom';
// const ChessBoard = () => {
//   const navigate = useNavigate();
//   const [board, setBoard] = useState(initializeBoard());
//   const [selectedPiece, setSelectedPiece] = useState(null);
//   const [legalMoves, setLegalMoves] = useState([]);
//   const [turn, setTurn] = useState('white');
//   const [lastMove, setLastMove] = useState(null);
//   const [whiteTime, setWhiteTime] = useState(300); // Initial time in seconds (5 minutes)
//   const [blackTime, setBlackTime] = useState(300); // Initial time in seconds (5 minutes)
//   const [initialTime, setInitialTime] = useState('');
//   const [showInitialTimeInput, setShowInitialTimeInput] = useState(true);
//   const [gameOver, setGameOver] = useState(false);
//   const [winner, setWinner] = useState('');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [promotionChoice, setPromotionChoice] = useState(null);
//   const [gameOverReason, setGameOverReason] = useState(null);
//   const moveAudioRef = useRef(new Audio('assets/audio/move-sound.mp3'));

//   const handlePromotionSelect = (selectedPiece) => {
//     const { rowIndex, colIndex, pieceColor, fromRow, fromCol } = promotionChoice;
//     const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy of the board
//     newBoard[rowIndex][colIndex] = { piece: selectedPiece, color: pieceColor };
//     newBoard[fromRow][fromCol] = null; // Remove the pawn from its original position
//     setBoard(newBoard);
//     setPromotionChoice(null);
//     setSelectedPiece(null); // Clear the selected piece
//     setTurn(turn === 'white' ? 'black' : 'white');
//   };

//   //   // Timer effect for decrementing time every second
//   useEffect(() => {
//     const timer = setInterval(() => {
//       if (!gameOver) {
//         if (turn === 'white') {
//           if (whiteTime > 0) {
//             setWhiteTime((time) => time - 1);
//           } else {
//             clearInterval(timer);
//             handleGameOver('black', 'Time out');
//           }
//         } else {
//           if (blackTime > 0) {
//             setBlackTime((time) => time - 1);
//           } else {
//             clearInterval(timer);
//             handleGameOver('white', 'Time out');
//           }
//         }
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [turn, whiteTime, blackTime, gameOver]);

//   // Effect to check for check, checkmate, and stalemate
//   useEffect(() => {
//     if (!gameOver) {
//       const opponentColor = turn === 'white' ? 'black' : 'white';
//       const inCheck = isInCheck(board, opponentColor);
//       const checkmateResult = isCheckmate(board, opponentColor, lastMove);

//       console.log('Checkmate result:', checkmateResult);
//       if (inCheck) {
//         console.log("check")
//       } else if (checkmateResult.isGameOver) {
//         handleGameOver(checkmateResult.winner, 'Checkmate');

//       }
//     }
//   }, [turn, lastMove, board, gameOver]);


//   useEffect(() => {
//     if (!gameOver) {
//       const opponentColor = turn === 'white' ? 'black' : 'white';
//       const inCheck = isInCheck(board, opponentColor);
//       const checkmateResult = isCheckmate(board, opponentColor, lastMove);

//       if (inCheck) {
//         console.log('Check');
//       } else if (checkmateResult.isGameOver) {
//         handleGameOver(checkmateResult.winner, 'Checkmate');
//       }
//     }
//   }, [turn, lastMove, board, gameOver]);
//   // Handler for submitting initial game time
//   const handleInitialTimeSubmit = () => {
//     const timeInSeconds = parseInt(initialTime) * 60;
//     setWhiteTime(timeInSeconds);
//     setBlackTime(timeInSeconds);
//     setShowInitialTimeInput(false);
//   };

//   const handleCellClick = (rowIndex, colIndex) => {
//     const piece = board[rowIndex][colIndex];

//     if (piece && piece.color === turn) {
//       // Select a piece if it belongs to the current player's turn
//       setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
//       // Calculate and set legal moves
//       const moves = [];
//       for (let i = 0; i < 8; i++) {
//         for (let j = 0; j < 8; j++) {
//           if (isLegalMove(board, piece, rowIndex, colIndex, i, j, lastMove) &&
//             isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)) {
//             moves.push({ row: i, col: j });
//           }
//         }
//       }
//       setLegalMoves(moves);
//     } else if (selectedPiece) {
//       // Move the selected piece to the clicked cell if it's a legal move considering the check
//       const { piece, fromRow, fromCol } = selectedPiece;
//       if (
//         isLegalMove(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove) &&
//         isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove)
//       ) {
//         const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy of the board

//         if (shouldPromotePawn(piece, rowIndex)) {
//           // Show promotion dialog and set a callback to update the board with the selected piece
//           setPromotionChoice({ rowIndex, colIndex, pieceColor: piece.color, fromRow, fromCol });
//         } else {
//           newBoard[rowIndex][colIndex] = piece;
//           newBoard[fromRow][fromCol] = null;
//           setBoard(newBoard);
//           setSelectedPiece(null);
//           setLegalMoves([]);
//           setTurn(turn === 'white' ? 'black' : 'white');
//           setLastMove({ piece, fromRow, fromCol, toRow: rowIndex, toCol: colIndex });
//           // Play the move sound
//           moveAudioRef.current.play().catch(e => console.error("Error playing audio:", e));
//         }
//       } else {
//         // Select another piece of the same color if clicked on another piece
//         if (piece && piece.color === selectedPiece.piece.color) {
//           setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
//           // Recalculate and set legal moves
//           const moves = [];
//           for (let i = 0; i < 8; i++) {
//             for (let j = 0; j < 8; j++) {
//               if (isLegalMove(board, piece, rowIndex, colIndex, i, j, lastMove) &&
//                 isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)) {
//                 moves.push({ row: i, col: j });
//               }
//             }
//           }
//           setLegalMoves(moves);
//         } else {
//           setSelectedPiece(null);
//           setLegalMoves([]);
//         }
//       }
//     }
//   };

//   const handleGameOver = (winnerColor, reason) => {
//     console.log(`Game Over: ${winnerColor} wins by ${reason}`);
//     setGameOver(true);
//     setWinner(winnerColor === 'white' ? 'White' : 'Black');
//     setGameOverReason(reason);
//     setModalVisible(true);
//   };

//   return (
//     <div className=" flex flex-col items-center justify-center h-screen w-screen bg-gray-800">
//       {showInitialTimeInput ? (
//         <div className="mb-4">
//           <input
//             type="number"
//             value={initialTime}
//             onChange={(e) => setInitialTime(e.target.value)}
//             placeholder="Enter initial time in minutes"
//             className="p-2 text-black"
//           />
//           <button
//             onClick={handleInitialTimeSubmit}
//             className="ml-2 p-2 bg-blue-500 text-white rounded"
//           >
//             Set Time
//           </button>
//         </div>
//       ) : (
//         <div className="flex items-center mb-4">
//           <div className="text-white mr-4">
//             {turn === 'white' ? 'White\'s Turn' : 'Black\'s Turn'}
//           </div>
//           <div className="text-white">
//             {turn === 'white'
//               ? `Time: ${Math.floor(whiteTime / 60)}:${('0' + (whiteTime % 60)).slice(-2)}`
//               : `Time: ${Math.floor(blackTime / 60)}:${('0' + (blackTime % 60)).slice(-2)}`}
//           </div>
//         </div>
//       )}


//       <div className="grid grid-cols-8 relative">
//         {board.map((row, rowIndex) =>
//           row.map((cell, colIndex) => (
//             <Square
//               key={`${rowIndex}-${colIndex}`}
//               piece={cell ? cell.piece : null}
//               color={cell ? cell.color : null}
//               rowIndex={rowIndex}
//               colIndex={colIndex}
//               onClick={() => handleCellClick(rowIndex, colIndex)}
//               selected={
//                 selectedPiece &&
//                 selectedPiece.fromRow === rowIndex &&
//                 selectedPiece.fromCol === colIndex
//               }
//               lastMove={lastMove}
//               highlight={legalMoves.some(move => move.row === rowIndex && move.col === colIndex)}
//             />
//           ))
//         )}
//         {promotionChoice && (
//           <div
//             className="absolute"
//             style={{
//               top: `${promotionChoice.rowIndex * 64}px`,
//               left: `${promotionChoice.colIndex * 64}px`,
//             }}
//           >
//             <PromotionDialog onSelect={handlePromotionSelect} />
//           </div>
//         )}
//       </div>

//       {modalVisible && (
//         <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
//         onClick={() => {
//           setModalVisible(false) } } >
//           <div className="bg-white p-8 rounded-lg" >
//             <div className="text-center">
//               <p className="text-xl font-bold mb-1">
//                 {winner === 'Draw' ? 'The game is a draw.' : `${winner} wins`}
//               </p>
//               {winner !== 'Draw' && (
//                 <p className="text-lg  sm:text-sm text-gray-500 mb-2">{`by ${gameOverReason}`}</p>
//               )}
//             </div>
//             <button
//               onClick={() => {
//                 window.location.reload();
//               }}
//               className="bg-blue-500 text-white px-4 py-2 rounded"
//             >
//                New Game
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChessBoard;



