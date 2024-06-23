import React, { useState, useEffect } from 'react';
import { isLegalMove, isLegalMoveConsideringCheck, initializeBoard, shouldPromotePawn, isInCheck, isCheckmate } from './helper';
import { Square } from './Square';
import PromotionDialog from './PromotionDialog';
import { useNavigate } from 'react-router-dom';

const ChessBoard = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState(initializeBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [turn, setTurn] = useState('white');
  const [lastMove, setLastMove] = useState(null);
  const [whiteTime, setWhiteTime] = useState(300); // Initial time in seconds (5 minutes)
  const [blackTime, setBlackTime] = useState(300); // Initial time in seconds (5 minutes)
  const [initialTime, setInitialTime] = useState('');
  const [showInitialTimeInput, setShowInitialTimeInput] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [promotionChoice, setPromotionChoice] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);

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

  //   // Timer effect for decrementing time every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameOver) {
        if (turn === 'white') {
          if (whiteTime > 0) {
            setWhiteTime((time) => time - 1);
          } else {
            clearInterval(timer);
            handleGameOver('black', 'Time out');
          }
        } else {
          if (blackTime > 0) {
            setBlackTime((time) => time - 1);
          } else {
            clearInterval(timer);
            handleGameOver('white', 'Time out');
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, whiteTime, blackTime, gameOver]);

  // Effect to check for check, checkmate, and stalemate
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
    if (!gameOver) {
      const opponentColor = turn === 'white' ? 'black' : 'white';
      const inCheck = isInCheck(board, opponentColor);
      const checkmateResult = isCheckmate(board, opponentColor, lastMove);

      if (inCheck) {
        console.log('Check');
      } else if (checkmateResult.isGameOver) {
        handleGameOver(checkmateResult.winner, 'Checkmate');
      }
    }
  }, [turn, lastMove, board, gameOver]);
  // Handler for submitting initial game time
  const handleInitialTimeSubmit = () => {
    const timeInSeconds = parseInt(initialTime) * 60;
    setWhiteTime(timeInSeconds);
    setBlackTime(timeInSeconds);
    setShowInitialTimeInput(false);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    const piece = board[rowIndex][colIndex];

    if (piece && piece.color === turn) {
      // Select a piece if it belongs to the current player's turn
      setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
      // Calculate and set legal moves
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
      // Move the selected piece to the clicked cell if it's a legal move considering the check
      const { piece, fromRow, fromCol } = selectedPiece;
      if (
        isLegalMove(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove) &&
        isLegalMoveConsideringCheck(board, piece, fromRow, fromCol, rowIndex, colIndex, lastMove)
      ) {
        const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy of the board

        if (shouldPromotePawn(piece, rowIndex)) {
          // Show promotion dialog and set a callback to update the board with the selected piece
          setPromotionChoice({ rowIndex, colIndex, pieceColor: piece.color, fromRow, fromCol });
        } else {
          newBoard[rowIndex][colIndex] = piece;
          newBoard[fromRow][fromCol] = null;
          setBoard(newBoard);
          setSelectedPiece(null);
          setLegalMoves([]);
          setTurn(turn === 'white' ? 'black' : 'white');
          setLastMove({ piece, fromRow, fromCol, toRow: rowIndex, toCol: colIndex });
        }
      } else {
        // Select another piece of the same color if clicked on another piece
        if (piece && piece.color === selectedPiece.piece.color) {
          setSelectedPiece({ piece, fromRow: rowIndex, fromCol: colIndex });
          // Recalculate and set legal moves
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
        } else {
          setSelectedPiece(null);
          setLegalMoves([]);
        }
      }
    }
  };

  const handleGameOver = (winnerColor, reason) => {
    console.log(`Game Over: ${winnerColor} wins by ${reason}`);
    setGameOver(true);
    setWinner(winnerColor === 'white' ? 'White' : 'Black');
    setGameOverReason(reason);
    setModalVisible(true);
  };

  return (
    <div className=" flex flex-col items-center justify-center h-screen w-screen bg-gray-800">
      {showInitialTimeInput ? (
        <div className="mb-4">
          <input
            type="number"
            value={initialTime}
            onChange={(e) => setInitialTime(e.target.value)}
            placeholder="Enter initial time in minutes"
            className="p-2 text-black"
          />
          <button
            onClick={handleInitialTimeSubmit}
            className="ml-2 p-2 bg-blue-500 text-white rounded"
          >
            Set Time
          </button>
        </div>
      ) : (
        <div className="flex items-center mb-4">
          <div className="text-white mr-4">
            {turn === 'white' ? 'White\'s Turn' : 'Black\'s Turn'}
          </div>
          <div className="text-white">
            {turn === 'white'
              ? `Time: ${Math.floor(whiteTime / 60)}:${('0' + (whiteTime % 60)).slice(-2)}`
              : `Time: ${Math.floor(blackTime / 60)}:${('0' + (blackTime % 60)).slice(-2)}`}
          </div>
        </div>
      )}


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
          <div
            className="absolute"
            style={{
              top: `${promotionChoice.rowIndex * 64}px`,
              left: `${promotionChoice.colIndex * 64}px`,
            }}
          >
            <PromotionDialog onSelect={handlePromotionSelect} />
          </div>
        )}
      </div>

      {modalVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
        onClick={() => {
          setModalVisible(false) } } >
          <div className="bg-white p-8 rounded-lg" >
            <div className="text-center">
              <p className="text-xl font-bold mb-1">
                {winner === 'Draw' ? 'The game is a draw.' : `${winner} wins`}
              </p>
              {winner !== 'Draw' && (
                <p className="text-lg  sm:text-sm text-gray-500 mb-2">{`by ${gameOverReason}`}</p>
              )}
            </div>
            <button
              onClick={() => {
                window.location.reload();
              }}
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

export default ChessBoard;



