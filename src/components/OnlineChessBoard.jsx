import React, { useState, useEffect } from 'react';
import { isLegalMove,shouldPromotePawn, isLegalMoveConsideringCheck, initializeBoard, isInCheck, isCheckmate } from './helper';
import { Square } from './Square';
import PromotionDialog from './PromotionDialog';

const OnlineChessBoard = ({ socket, gameCode, playerId, playerUsername, opponentUsername, selectedTime, gameStatus, gameInfo }) => {
  const [board, setBoard] = useState(initializeBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [turn, setTurn] = useState('white');
  const [lastMove, setLastMove] = useState(null);
  const [whiteTime, setWhiteTime] = useState(selectedTime * 60 || 5*60);
  const [blackTime, setBlackTime] = useState(selectedTime * 60 || 5*60);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [promotionChoice, setPromotionChoice] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);

  const handlePromotionSelect = (selectedPiece) => {
    const { rowIndex, colIndex, pieceColor, fromRow, fromCol } = promotionChoice;
    const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy of the board
    newBoard[rowIndex][colIndex] = { piece: selectedPiece, color: pieceColor };
    newBoard[fromRow][fromCol] = null; // Remove the pawn from its original position
    setBoard(newBoard);
    setPromotionChoice(null);
    setSelectedPiece(null); // Clear the selected piece
    setTurn(turn === 'white' ? 'black' : 'white');
  };

  // useEffect(() => {
  //   socket.on('moveMade', ({ move }) => {
  //     const parsedMove = JSON.parse(move);
  //     const newBoard = JSON.parse(JSON.stringify(board));
  //     const { from, to, piece } = parsedMove;
  //     const [fromRow, fromCol] = from.split(',').map(Number);
  //     const [toRow, toCol] = to.split(',').map(Number);
  //     newBoard[toRow][toCol] = piece;
  //     newBoard[fromRow][fromCol] = null;
  //     setBoard(newBoard);
  //     setTurn(turn === 'white' ? 'black' : 'white');
  //     setLastMove({ fromRow, fromCol, toRow, toCol });
  //   });

  //   return () => {
  //     socket.off('moveMade');
  //   };
  // }, [socket, board, turn]);

  // useEffect(() => {
  //   // Determine player color based on username order (this is just an example, adjust as needed)
  //   setPlayerColor(turn === 'white' ? 'white' : 'black');
  // }, [turn]);



  useEffect(() => {
    socket.on('playerColor', ({ color }) => {
      console.log(color);
      setPlayerColor(color);
    });

    socket.on('gameStart', ({ currentTurn }) => {
      setTurn(currentTurn);
    });

    socket.on('moveMade', ({ move, playerId: moveMakePlayerId, currentTurn }) => {
      const { from, to, piece } = move;
      const [fromRow, fromCol] = from.split(',').map(Number);
      const [toRow, toCol] = to.split(',').map(Number);
      
      setBoard(prevBoard => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        newBoard[toRow][toCol] = piece;
        newBoard[fromRow][fromCol] = null;
        return newBoard;
      });
      
      setTurn(currentTurn);
      setLastMove({ fromRow, fromCol, toRow, toCol });
    });

    return () => {
      socket.off('playerColor');
      socket.off('gameStart');
      socket.off('moveMade');
    };
  }, [socket]);


  useEffect(() => {
    let timer;
    if ( !gameOver) {
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
  }, [ gameOver, turn]);

 const handleCellClick = (rowIndex, colIndex) => {
    const piece = board[rowIndex][colIndex];

    if (turn !== playerColor) {
      return; // Not this player's turn
    }

    if (piece && piece.color === playerColor) {
      setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
      const moves = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (isLegalMove(board, piece, rowIndex, colIndex, i, j, lastMove) &&
              isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)) {
            moves.push({ row: i, col: j });
          }
        }
      }
      setLegalMoves(moves);
    } else if (selectedPiece) {
      const { piece, fromRow, fromCol } = selectedPiece;
      if (
        isLegalMove(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove) &&
        isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove)
      ) {
        const newBoard = JSON.parse(JSON.stringify(board));
        const move = {
          from: `${fromRow},${fromCol}`,
          to: `${rowIndex},${colIndex}`,
          piece: piece,
        };

        if (shouldPromotePawn(piece, rowIndex)) {
          setPromotionChoice({ rowIndex, colIndex, pieceColor: piece.color, fromRow, fromCol });
        } else {
          newBoard[rowIndex][colIndex] = piece;
          newBoard[fromRow][fromCol] = null;
          setBoard(newBoard);
          setSelectedPiece(null);
          setLegalMoves([]);
          
          socket.emit('makeMove', { gameCode, move, playerId });
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

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
      <div className="flex justify-between items-center mb-4 w-full px-4">
        <div className="text-white">
          <p>{playerUsername || 'Your username'} ({playerColor})</p>
          <p>Time: {formatTime(playerColor === 'white' ? whiteTime : blackTime)}</p>
        </div>
        <div className="text-white">
          <p>{opponentUsername || (gameStatus === 'waiting' ? 'Waiting for opponent' : 'Opponent')} ({playerColor === 'white' ? 'black' : 'white'})</p>
          <p>Time: {formatTime(playerColor === 'white' ? blackTime : whiteTime)}</p>
        </div>
      </div>
      <div className={`text-white mb-4 ${turn === playerColor ? 'bg-green-500' : 'bg-red-500'} px-4 py-2 rounded`}>
        {turn === playerColor ? "Your turn" : "Opponent's turn"}
      </div>

      <div className="grid grid-cols-8 relative">
        {board.map((row, rowIndex) =>
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
                selectedPiece.fromRow === rowIndex &&
                selectedPiece.fromCol === colIndex
              }
              lastMove={lastMove}
              highlight={legalMoves.some(move => move.row === rowIndex && move.col === colIndex)}
            />
          ))
        )}
        {promotionChoice && (
          <PromotionDialog
            onSelect={handlePromotionSelect}
            position={{
              top: `${promotionChoice.rowIndex * 64}px`,
              left: `${promotionChoice.colIndex * 64}px`,
            }}
          />
        )}
      </div>

      {modalVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg">
            <p className="text-xl font-bold mb-2">
              {winner === 'Draw' ? 'The game is a draw.' : `${winner} wins by ${gameOverReason}`}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineChessBoard;


// import React, { useState, useEffect } from 'react';
// import { isLegalMove, isLegalMoveConsideringCheck, initializeBoard, shouldPromotePawn, isInCheck, isCheckmate } from './helper';
// import { Square } from './Square';
// import PromotionDialog from './PromotionDialog';
// import { useNavigate } from 'react-router-dom';


// const OnlineChessBoard = ({ socket, gameCode, playerId, opponentId, whitePlayerName, blackPlayerName }) => {

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

  
//   }, [socket, turn, lastMove, board, gameOver]);

//   socket.on('moveMade', ({ move }) => {
//     const parsedMove = JSON.parse(move);
//     const newBoard = JSON.parse(JSON.stringify(board));
//     const { from, to, piece } = parsedMove;
//     const [fromRow, fromCol] = from.split('');
//     const [toRow, toCol] = to.split('');
//     newBoard[toRow][toCol] = piece;
//     newBoard[fromRow][fromCol] = null;
//     setBoard(newBoard);
//     setTurn(turn === 'white' ? 'black' : 'white');
//   });

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
//               isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)) {
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
//         const move = {
//           from: `${fromRow}${fromCol}`,
//           to: `${rowIndex}${colIndex}`,
//           piece: piece,
//         };
  
//         newBoard[rowIndex][colIndex] = piece;
//         newBoard[fromRow][fromCol] = null;
//         setBoard(newBoard);
//         setSelectedPiece(null);
//         setLegalMoves([]);
//         setTurn(turn === 'white' ? 'black' : 'white');
//         setLastMove({ piece: piece, fromRow: fromRow, fromCol: fromCol, toRow: rowIndex, toCol: colIndex });
  
//         // Emit the move to the server
//         socket.emit('makeMove', { move });
//       } else {
//         // Select another piece of the same color if clicked on another piece
//         if (piece && piece.color === turn) {
//           setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
//           // Recalculate and set legal moves
//           const moves = [];
//           for (let i = 0; i < 8; i++) {
//             for (let j = 0; j < 8; j++) {
//               if (isLegalMove(board, piece, rowIndex, colIndex, i, j, lastMove) &&
//                   isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)) {
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
//   // const handleCellClick = (rowIndex, colIndex) => {
//   //   const piece = board[rowIndex][colIndex];

//   //   if (piece && piece.color === turn) {
//   //     // Select a piece if it belongs to the current player's turn
//   //     setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
//   //     // Calculate and set legal moves
//   //     const moves = [];
//   //     for (let i = 0; i < 8; i++) {
//   //       for (let j = 0; j < 8; j++) {
//   //         if (isLegalMove(board, piece, rowIndex, colIndex, i, j, lastMove) &&
//   //           isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)) {
//   //           moves.push({ row: i, col: j });
//   //         }
//   //       }
//   //     }
//   //     setLegalMoves(moves);
//   //   } else if (selectedPiece) {
//   //     // Move the selected piece to the clicked cell if it's a legal move considering the check
//   //     const { piece, fromRow, fromCol } = selectedPiece;
//   //     if (
//   //       isLegalMove(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove) &&
//   //       isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove)
//   //     ) {
//   //       const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy of the board

//   //       if (shouldPromotePawn(piece, rowIndex)) {
//   //         // Show promotion dialog and set a callback to update the board with the selected piece
//   //         setPromotionChoice({ rowIndex, colIndex, pieceColor: piece.color, fromRow, fromCol });
//   //       } else {
//   //         newBoard[rowIndex][colIndex] = piece;
//   //         newBoard[fromRow][fromCol] = null;
//   //         setBoard(newBoard);
//   //         setSelectedPiece(null);
//   //         setLegalMoves([]);
//   //         setTurn(turn === 'white' ? 'black' : 'white');
//   //         setLastMove({ piece, fromRow, fromCol, toRow: rowIndex, toCol: colIndex });
//   //       }
//   //     } else {
//   //       // Select another piece of the same color if clicked on another piece
//   //       if (piece && piece.color === selectedPiece.piece.color) {
//   //         setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
//   //         // Recalculate and set legal moves
//   //         const moves = [];
//   //         for (let i = 0; i < 8; i++) {
//   //           for (let j = 0; j < 8; j++) {
//   //             if (isLegalMove(board, piece, rowIndex, colIndex, i, j, lastMove) &&
//   //               isLegalMoveConsideringCheck(board, piece, rowIndex, colIndex, i, j, lastMove)) {
//   //               moves.push({ row: i, col: j });
//   //             }
//   //           }
//   //         }
//   //         setLegalMoves(moves);
//   //       } else {
//   //         setSelectedPiece(null);
//   //         setLegalMoves([]);
//   //       }
//   //     }
//   //   }
//   // };

//   const handleGameOver = (winnerColor, reason) => {
//     console.log(`Game Over: ${winnerColor} wins by ${reason}`);
//     setGameOver(true);
//     setWinner(winnerColor === 'white' ? 'White' : 'Black');
//     setGameOverReason(reason);
//     setModalVisible(true);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
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
//       )  : (
//         <div className="flex justify-between items-center mb-4 w-full px-4">
//           <div className="text-white">
//             <p>{whitePlayerName} (White)</p>
//             <p>
//               {turn === 'white'
//                 ? `Time: ${Math.floor(whiteTime / 60)}:${('0' + (whiteTime % 60)).slice(-2)}`
//                 : '--:--'}
//             </p>
//           </div>
//           <div className="text-white">
//             <p>{blackPlayerName} (Black)</p>
//             <p>
//               {turn === 'black'
//                 ? `Time: ${Math.floor(blackTime / 60)}:${('0' + (blackTime % 60)).slice(-2)}`
//                 : '--:--'}
//             </p>
//           </div>
//         </div>
//       )}

//       {/*pawn promotion */}
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
//                 <p className="text-sm text-gray-500 mb-2">{`by ${gameOverReason}`}</p>
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

// export default OnlineChessBoard;



