// import React, { useState, useEffect } from 'react';
// import { isLegalMove, shouldPromotePawn, isLegalMoveConsideringCheck, initializeBoard, isInCheck, isCheckmate } from './helper';
// import { Square } from './Square';
// import PromotionDialog from './PromotionDialog';

// const OnlineChessBoard = ({ 
//   socket, 
//   gameCode, 
//   playerId, 
//   playerUsername, 
//   opponentUsername, 
//   selectedTime, 
//   currentGameStatus, 
//   gameInfo,
//   playerColor 
// }) => {
//   const [board, setBoard] = useState(initializeBoard());
//   const [selectedPiece, setSelectedPiece] = useState(null);
//   const [legalMoves, setLegalMoves] = useState([]);
//   const [turn, setTurn] = useState('white');
//   const [lastMove, setLastMove] = useState(null);
//   const [whiteTime, setWhiteTime] = useState(selectedTime * 60 || 5*60);
//   const [blackTime, setBlackTime] = useState(selectedTime * 60 || 5*60);
//   const [gameOver, setGameOver] = useState(false);
//   const [winner, setWinner] = useState('');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [promotionChoice, setPromotionChoice] = useState(null);
//   const [gameOverReason, setGameOverReason] = useState(null);
//   const [currentPlayer, setCurrentPlayer] = useState(playerUsername);
//   const [opponentPlayer, setOpponentPlayer] = useState(opponentUsername);
//   const [gameStatus, setGameStatus] = useState('waiting');

//   const handlePromotionSelect = (selectedPiece) => {
//     const { rowIndex, colIndex, pieceColor, fromRow, fromCol } = promotionChoice;
//     const newBoard = JSON.parse(JSON.stringify(board));
//     newBoard[rowIndex][colIndex] = { piece: selectedPiece, color: pieceColor };
//     newBoard[fromRow][fromCol] = null;
//     setBoard(newBoard);
//     setPromotionChoice(null);
//     setSelectedPiece(null);
//     setTurn(turn === 'white' ? 'black' : 'white');

//     // Emit the move to the server
//     const move = {
//       from: `${fromRow},${fromCol}`,
//       to: `${rowIndex},${colIndex}`,
//       piece: { piece: selectedPiece, color: pieceColor },
//     };
//     socket.emit('makeMove', { gameCode, move, playerId });
//   };

//   useEffect(() => {
//     socket.on('gameState', ({ players, currentTurn }) => {
//       setTurn(currentTurn);
//       setCurrentPlayer(players && players[0].id === playerId? players[0].username: players[1].username);
//       setOpponentPlayer(players && players[0].id !== playerId? players[0].username: players[1].username);
//       setGameStatus(players.length > 1 ?'started' : 'waiting');
//       console.log("player", players);
//     });

//     socket.on('moveMade', ({ move, playerId: moveMakerPlayerId, currentTurn }) => {
//       console.log('Move made:', move, 'by', moveMakerPlayerId, 'current turn:', currentTurn);
//       const { from, to, piece } = move;
//       const [fromRow, fromCol] = from.split(',').map(Number);
//       const [toRow, toCol] = to.split(',').map(Number);

//       setBoard(prevBoard => {
//         const newBoard = JSON.parse(JSON.stringify(prevBoard));
//         newBoard[toRow][toCol] = piece;
//         newBoard[fromRow][fromCol] = null;
//         return newBoard;
//       });

//       setTurn(currentTurn);
//       setLastMove({ fromRow, fromCol, toRow, toCol });
//       setSelectedPiece(null);
//       setLegalMoves([]);
//     });

//     return () => {
//       socket.off('gameState');
//       socket.off('moveMade');
//     };
//   }, [socket]);


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
//     let timer;
//     if (!gameOver && gameStatus === 'started') {
//       timer = setInterval(() => {
//         if (turn === 'white') {
//           setWhiteTime((prevTime) => {
//             if (prevTime <= 0) {
//               clearInterval(timer);
//               handleGameOver('black', 'Time out');
//               return 0;
//             }
//             return prevTime - 1;
//           });
//         } else {
//           setBlackTime((prevTime) => {
//             if (prevTime <= 0) {
//               clearInterval(timer);
//               handleGameOver('white', 'Time out');
//               return 0;
//             }
//             return prevTime - 1;
//           });
//         }
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [gameOver, gameStatus, turn]);

//   const handleCellClick = (rowIndex, colIndex) => {
//     const piece = board[rowIndex] && board[rowIndex][colIndex];

//     if (turn !== playerColor) {
//       console.log("Not your turn");
//       return;
//     }

//     if (piece && piece.color === playerColor) {
//       setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
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
//       const { piece, fromRow, fromCol } = selectedPiece;
//       if (
//         isLegalMove(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove) &&
//         isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove)
//       ) {
//         const newBoard = JSON.parse(JSON.stringify(board));
//         const move = {
//           from: `${fromRow},${fromCol}`,
//           to: `${rowIndex},${colIndex}`,
//           piece: piece,
//         };

//         if (shouldPromotePawn(piece, rowIndex)) {
//           setPromotionChoice({ rowIndex, colIndex, pieceColor: piece.color, fromRow, fromCol });
//         } else {
//           newBoard[rowIndex][colIndex] = piece;
//           newBoard[fromRow][fromCol] = null;
//           setBoard(newBoard);
//           setSelectedPiece(null);
//           setLegalMoves([]);

//           socket.emit('makeMove', { gameCode, move, playerId });
//           setTurn(turn === 'white' ? 'black' : 'white');
//         }
//       } else {
//         setSelectedPiece(null);
//         setLegalMoves([]);
//       }
//     }
//   };

//   const handleGameOver = (winnerColor, reason) => {
//     setGameOver(true);
//     setWinner(winnerColor === 'white' ? 'White' : 'Black');
//     setGameOverReason(reason);
//     setModalVisible(true);
//   };

//   const formatTime = (time) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = time % 60;
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
//       <div className="flex justify-between items-center mb-4 w-full px-4">
//         <div className="text-white">
//           <p>{currentPlayer} ({playerColor})</p>
//           <p>Time: {formatTime(playerColor === 'white' ? whiteTime : blackTime)}</p>
//         </div>
//         <div className="text-white">
//           <p>{opponentPlayer || 'Waiting for opponent'} ({playerColor === 'white' ? 'black' : 'white'})</p>
//           <p>Time: {formatTime(playerColor === 'white' ? blackTime : whiteTime)}</p>
//         </div>
//       </div>
//       <div className={`text-white mb-4 ${turn === playerColor ? 'bg-green-500' : 'bg-red-500'} px-4 py-2 rounded`}>
//         {turn === playerColor ? "Your turn" : "Opponent's turn"}
//       </div>

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
//           <PromotionDialog
//             onSelect={handlePromotionSelect}
//             position={{
//               top: `${promotionChoice.rowIndex * 64}px`,
//               left: `${promotionChoice.colIndex * 64}px`,
//             }}
//           />
//         )}
//       </div>

//       {modalVisible && (
//         <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-8 rounded-lg">
//             <p className="text-xl font-bold mb-2">
//               {winner === 'Draw' ? 'The game is a draw.' : `${winner} wins by ${gameOverReason}`}
//             </p>
//             <button
//               onClick={() => window.location.reload()}
//               className="bg-blue-500 text-white px-4 py-2 rounded"
//             >
//               New Game
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OnlineChessBoard;


import React, { useState, useEffect } from 'react';
import { isLegalMove, shouldPromotePawn, isLegalMoveConsideringCheck, initializeBoard, isInCheck, isCheckmate } from './helper';
import { Square } from './Square';
import PromotionDialog from './PromotionDialog';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

  // Function to rotate the board
  const rotateBoard = (board) => {
    return board.slice().reverse().map(row => row.slice().reverse());
  };

  // Function to get the displayed board based on player color
  const getDisplayedBoard = () => {
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
    setTurn(turn === 'white' ? 'black' : 'white');

    // Emit the move to the server
    const move = {
      from: `${fromRow},${fromCol}`,
      to: `${rowIndex},${colIndex}`,
      piece: { piece: selectedPiece, color: pieceColor },
    };
    socket.emit('makeMove', { gameCode, move, playerId });
  };

  useEffect(() => {
    socket.on('gameState', ({ players, currentTurn }) => {
      setTurn(currentTurn);
      setPlayerColor(players[0].id === playerId?players[0].color: players[1].color);
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
      console.log('Move made:', move, 'by', moveMakerPlayerId, 'current turn:', currentTurn);
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
      setSelectedPiece(null);
      setLegalMoves([]);
    });

    socket.on('playerLeft', ({ playerId: leftPlayerId }) => {
      if (leftPlayerId !== playerId) {
        handleGameOver(playerColor, 'Opponent left the game');
      }
    });

    return () => {
      socket.off('gameState');
      socket.off('moveMade');
      socket.off('playerLeft');
    };
  }, [socket, turn, playerColor]);


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
      setSelectedPiece({ piece, fromRow: actualRow, fromCol: actualCol });
      const moves = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (isLegalMove(board, piece, actualRow, actualCol, i, j, lastMove) &&
            isLegalMoveConsideringCheck(board, piece, actualRow, actualCol, i, j, lastMove)) {
            moves.push({ row: i, col: j });
          }
        }
      }
      setLegalMoves(moves);
    } else if (selectedPiece) {
      const { piece, fromRow, fromCol } = selectedPiece;
      if (
        isLegalMove(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove) &&
        isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, actualRow, actualCol, lastMove)
      ) {
        const newBoard = JSON.parse(JSON.stringify(board));
        const move = {
          from: `${fromRow},${fromCol}`,
          to: `${actualRow},${actualCol}`,
          piece: piece,
        };

        if (shouldPromotePawn(piece, actualRow)) {
          setPromotionChoice({ rowIndex: actualRow, colIndex: actualCol, pieceColor: piece.color, fromRow, fromCol });
        } else {
          newBoard[actualRow][actualCol] = piece;
          newBoard[fromRow][fromCol] = null;
          setBoard(newBoard);
          setSelectedPiece(null);
          setLegalMoves([]);

          socket.emit('makeMove', { gameCode, move, playerId });
          setTurn(turn === 'white' ? 'black' : 'white');
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
  const toggleModal = (modalVisible) =>{
    setModalVisible(false);
    
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  const handleLeaveGame = () => {
    socket.emit('leaveGame', { gameCode, playerId });
    navigate('/'); // Or wherever you want to redirect after leaving
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-800 p-4">
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between items-center text-white text-sm md:text-base">
          <div>
            <p>{currentPlayer} ({playerColor})</p>
            <p>Time: {formatTime(playerColor === 'white' ? whiteTime : blackTime)}</p>
          </div>
          <div>
            <p>{opponentPlayer || 'Waiting...'} ({playerColor === 'white' ? 'black' : 'white'})</p>
            <p>Time: {formatTime(playerColor === 'white' ? blackTime : whiteTime)}</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleLeaveGame}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded text-sm md:text-base hover:bg-red-600"
      >
        Leave Game
      </button>

      <div className={`text-white mb-4 ${turn === playerColor ? 'bg-green-500' : 'bg-red-500'} px-4 py-2 rounded text-sm md:text-base`}>
        {turn === playerColor ? "Your turn" : "Opponent's turn"}
      </div>

      <div className="grid grid-cols-8 relative">
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
        {promotionChoice && (
          <PromotionDialog
            onSelect={handlePromotionSelect}
            position={{
              top: `${playerColor === 'black' ? (7 - promotionChoice.rowIndex) * 12.5 : promotionChoice.rowIndex * 12.5}%`,
              left: `${playerColor === 'black' ? (7 - promotionChoice.colIndex) * 12.5 : promotionChoice.colIndex * 12.5}%`,
            }}
          />
        )}
      </div>

      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
          onClick={() => toggleModal(modalVisible)}>
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <p className="text-lg font-bold mb-4 text-center">
              {winner === 'Draw' ? 'The game is a draw.' : `${winner} wins by ${gameOverReason}`}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
