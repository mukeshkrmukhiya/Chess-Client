// helpers.js
export const backendUrl = 'https://chess-backend-kf5d.onrender.com'
// export const backendUrl = 'http://localhost:5000'
// Function to initialize the chess board
export const initializeBoard = () => {
  const emptyBoard = Array(8).fill(null).map(() => Array(8).fill(null));

  // Initialize pieces for both players
  emptyBoard[0] = [
    { piece: 'R', color: 'black' },
    { piece: 'N', color: 'black' },
    { piece: 'B', color: 'black' },
    { piece: 'Q', color: 'black' },
    { piece: 'K', color: 'black' },
    { piece: 'B', color: 'black' },
    { piece: 'N', color: 'black' },
    { piece: 'R', color: 'black' },
  ];

  emptyBoard[1] = Array(8).fill({ piece: 'P', color: 'black' });
  emptyBoard[6] = Array(8).fill({ piece: 'P', color: 'white' });

  emptyBoard[7] = [
    { piece: 'R', color: 'white' },
    { piece: 'N', color: 'white' },
    { piece: 'B', color: 'white' },
    { piece: 'Q', color: 'white' },
    { piece: 'K', color: 'white' },
    { piece: 'B', color: 'white' },
    { piece: 'N', color: 'white' },
    { piece: 'R', color: 'white' },
  ];

  return emptyBoard;
};

// Function to check if a move is legal
export const isLegalMove = (board, piece, fromRow, fromCol, toRow, toCol, lastMove) => {
  if (!piece) return false; // No piece to move
  if (fromRow === toRow && fromCol === toCol) return false; // No move
  if (board[toRow][toCol] && board[toRow][toCol].color === piece.color) return false; // Can't capture own piece

  const direction = piece.color === 'white' ? 1 : -1;

  switch (piece.piece) {
    case 'K': // King
      return isKingMove(board, piece, fromRow, fromCol, toRow, toCol);

    case 'Q': // Queen
      return isStraightMove(board, fromRow, fromCol, toRow, toCol) || isDiagonalMove(board, fromRow, fromCol, toRow, toCol);

    case 'R': // Rook
      return isStraightMove(board, fromRow, fromCol, toRow, toCol);

    case 'B': // Bishop
      return isDiagonalMove(board, fromRow, fromCol, toRow, toCol);

    case 'N': // Knight
      return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) || (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2);

    case 'P': // Pawn
      return isPawnMove(board, piece, fromRow, fromCol, toRow, toCol, direction, lastMove);

    default:
      return false;
  }


};

const isUnderAttack = (board, row, col, color) => {
  const opponentColor = color === 'white' ? 'black' : 'white';

  // Check for pawn attacks
  const pawnDirection = color === 'white' ? -1 : 1;
  const pawnRow = row + pawnDirection;
  if (pawnRow >= 0 && pawnRow < 8) {
    if (col > 0 && board[pawnRow][col - 1]?.piece === 'P' && board[pawnRow][col - 1]?.color === opponentColor) return true;
    if (col < 7 && board[pawnRow][col + 1]?.piece === 'P' && board[pawnRow][col + 1]?.color === opponentColor) return true;
  }

  // Check for knight attacks
  const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  for (const [rowOffset, colOffset] of knightMoves) {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (board[newRow][newCol]?.piece === 'N' && board[newRow][newCol]?.color === opponentColor) return true;
    }
  }

  // Check for horizontal and vertical attacks (rook and queen)
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [rowOffset, colOffset] of directions) {
    let newRow = row + rowOffset;
    let newCol = col + colOffset;
    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const piece = board[newRow][newCol]?.piece;
      const pieceColor = board[newRow][newCol]?.color;
      if (piece && pieceColor === opponentColor && (piece === 'R' || piece === 'Q')) return true;
      if (piece) break;
      newRow += rowOffset;
      newCol += colOffset;
    }
  }

  // Check for diagonal attacks (bishop and queen)
  const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [rowOffset, colOffset] of diagonalDirections) {
    let newRow = row + rowOffset;
    let newCol = col + colOffset;
    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const piece = board[newRow][newCol]?.piece;
      const pieceColor = board[newRow][newCol]?.color;
      if (piece && pieceColor === opponentColor && (piece === 'B' || piece === 'Q')) return true;
      if (piece) break;
      newRow += rowOffset;
      newCol += colOffset;
    }
  }

  // Check for king attacks
  const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  for (const [rowOffset, colOffset] of kingMoves) {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (board[newRow][newCol]?.piece === 'K' && board[newRow][newCol]?.color === opponentColor) return true;
    }
  }

  return false;
};


const isKingMove = (board, piece, fromRow, fromCol, toRow, toCol, color) => {
  // Basic movement: one square in any direction
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  
  if (rowDiff <= 1 && colDiff <= 1) {
    // Check if the destination square is empty or contains an opponent's piece
    if (board[toRow][toCol] && board[toRow][toCol].color === color) {
      console.log('King move rejected: Destination square occupied by own piece');
      return false; // Cannot capture own piece
    }
    
    // Create a temporary board to check if the move would result in check
    const tempBoard = JSON.parse(JSON.stringify(board));
    tempBoard[toRow][toCol] = piece;
    tempBoard[fromRow][fromCol] = null;
    
    // Check if the move would put the king in check
    if (isCheck(tempBoard, color)) {
      console.log('King move rejected: Move would put king in check');
      return false; // Cannot move into check
    }
    
    return true; // Valid basic king move
  }
  
  // Check for castling
  if (canCastle(board, fromRow, fromCol, toRow, toCol, color)) {
    return true; // Valid castling move
  }
  
  return false; // Not a valid king move
};

// Helper function to check if the king is in check
const isCheck = (board, color) => {
  // Find the king's position
  let kingRow, kingCol;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.piece === 'K' && board[row][col]?.color === color) {
        kingRow = row;
        kingCol = col;
        break;
      }
    }
    if (kingRow !== undefined) break;
  }

  // Check if the king's position is under attack
  return isUnderAttack(board, kingRow, kingCol, color);
};














const isStraightMove = (board, fromRow, fromCol, toRow, toCol) => {
  if (fromRow !== toRow && fromCol !== toCol) return false; // Not a straight move
  const rowStep = fromRow === toRow ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
  const colStep = fromCol === toCol ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);
  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;
  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol]) return false; // Can't jump over pieces
    currentRow += rowStep;
    currentCol += colStep;
  }
  return true;
};

const isDiagonalMove = (board, fromRow, fromCol, toRow, toCol) => {
  if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false; // Not a diagonal move
  const rowStep = (toRow - fromRow) / Math.abs(toRow - fromRow);
  const colStep = (toCol - fromCol) / Math.abs(toCol - fromCol);
  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;
  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol]) return false; // Can't jump over pieces
    currentRow += rowStep;
    currentCol += colStep;
  }
  return true;
};





const isPawnMove = (board, piece, fromRow, fromCol, toRow, toCol, direction, lastMove) => {
  // if (!piece || piece.piece !== 'P') return false;
  // console.log("ispawnmove :", piece)
  const step = piece.color === 'white' ? -1 : 1;

  // Normal move
  if (fromCol === toCol && board[toRow][toCol] === null) {
    if (fromRow + step === toRow) return true; // Move one square forward
    if (piece.color === 'white' && fromRow === 6 && toRow === 4 && board[5][toCol] === null) return true; // Move two squares from starting position
    if (piece.color === 'black' && fromRow === 1 && toRow === 3 && board[2][toCol] === null) return true; // Move two squares from starting position
  }


  // Capture move
  if (Math.abs(fromCol - toCol) === 1 && fromRow + step === toRow && board[toRow][toCol] && board[toRow][toCol].color !== piece.color) {
    return true;
  }

  // En passant
  // if (lastMove && lastMove.piece.piece === 'P' && Math.abs(lastMove.fromRow - lastMove.toRow) === 2 &&
  //     lastMove.toCol === toCol && toRow === lastMove.toRow + step && Math.abs(fromRow - lastMove.toRow) === 1) {
  //   return true;
  // }

  return false;
};


 export const canCastle = (board, fromRow, fromCol, toRow, toCol, color) => {
  const king = board[fromRow][fromCol];
  if (king.piece !== 'K' || king.hasMoved) return false; // King must not have moved

  // Check if the king is moving exactly two squares
  if (Math.abs(toCol - fromCol) !== 2 || fromRow !== toRow) return false;

  const isKingsideCastling = toCol > fromCol;
  const rookCol = isKingsideCastling ? 7 : 0;
  const rook = board[fromRow][rookCol];

  if (!rook || rook.piece !== 'R' || rook.hasMoved) return false; // Rook must not have moved

  // Check if there are no pieces between the king and the rook
  const startCol = Math.min(fromCol, rookCol) + 1;
  const endCol = Math.max(fromCol, rookCol);
  for (let col = startCol; col < endCol; col++) {
    if (board[fromRow][col]) return false;
  }

  // Check if the king is not in check
  if (isUnderAttack(board, fromRow, fromCol, color)) return false;

  // Check if the squares the king moves across are not under attack
  const direction = isKingsideCastling ? 1 : -1;
  for (let col = fromCol; col !== toCol + direction; col += direction) {
    if (isUnderAttack(board, fromRow, col, color)) return false;
  }

  return true;
};

// export const performCastling = (board, fromRow, fromCol, toRow, toCol) => {
//   const newBoard = JSON.parse(JSON.stringify(board));
//   const isKingsideCastling = toCol > fromCol;
//   const rookCol = isKingsideCastling ? 7 : 0;
//   const newRookCol = isKingsideCastling ? toCol - 1 : toCol + 1;

//   // Move the king
//   newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
//   newBoard[fromRow][fromCol] = null;

//   // Move the rook
//   newBoard[toRow][newRookCol] = newBoard[fromRow][rookCol];
//   newBoard[fromRow][rookCol] = null;

//   // Mark both pieces as moved
//   newBoard[toRow][toCol].hasMoved = true;
//   newBoard[toRow][newRookCol].hasMoved = true;

//   return newBoard;
// };

//new pc function

export function performCastling(board, fromRow, fromCol, toRow, toCol) {
  const newBoard = JSON.parse(JSON.stringify(board));
  const piece = newBoard[fromRow][fromCol];
  
  // Move the king
  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;
  
  // Determine rook positions
  let rookFromCol, rookToCol;
  if (toCol > fromCol) {  // Kingside castling
    rookFromCol = 7;
    rookToCol = 5;
  } else {  // Queenside castling
    rookFromCol = 0;
    rookToCol = 3;
  }
  
  // Move the rook
  const rook = newBoard[fromRow][rookFromCol];
  if (!rook || rook.piece !== 'R') {
    console.error('Rook not found for castling:', { fromRow, rookFromCol, rook });
    return null; // Return null to indicate castling couldn't be performed
  }
  
  newBoard[fromRow][rookToCol] = rook;
  // newBoard[fromRow][rookFromCol] = null;
  
  return {
    newBoard,
    rookMove: {
      from: `${fromRow},${rookFromCol}`,
      to: `${fromRow},${rookToCol}`,
      piece: rook
    }
  };
}





export const isInCheck = (board, color) => {
  // Find the king's position
  let kingRow, kingCol;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.piece === 'K' && board[row][col]?.color === color) {
        kingRow = row;
        kingCol = col;
        break;
      }
    }
    if (kingRow !== undefined) break;
  }

  // Check if the king's position is under attack
  return isUnderAttack(board, kingRow, kingCol, color);
};



export const isCheckmate = (board, color, lastMove) => {
  const opponentColor = color === 'white' ? 'black' : 'white';

  // Check if the opponent's king is in check
  if (!isInCheck(board, opponentColor)) {
    return { isGameOver: false }; // Opponent's king is not in check, so it's not checkmated
  }

  // Check all possible moves for all opponent's pieces
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isLegalMove(board, piece, r, c, toRow, toCol, lastMove)) {
              // Make the move on a temporary board
              const tempBoard = copyBoard(board);
              tempBoard[toRow][toCol] = { ...piece };
              tempBoard[r][c] = null;

              // Check if the move gets the king out of check
              if (!isInCheck(tempBoard, opponentColor)) {
                return { isGameOver: false }; // Found a legal move that prevents checkmate
              }
            }
          }
        }
      }
    }
  }

  // If no legal moves are found to get out of check, it's checkmate
  const winner = color;
  return { isGameOver: true, winner };
};



export const isStalemate = (board, color, lastMove) => {
  // Check if the king is in check
  if (isInCheck(board, color)) {
    return false; // King is in check, so it's not stalemate
  }

  // Generate all possible moves for the current player
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = generateMoves(board, piece, r, c, lastMove);
        for (const [toRow, toCol] of moves) {
          // Make the move on a temporary board
          const tempBoard = JSON.parse(JSON.stringify(board));
          tempBoard[toRow][toCol] = piece;
          tempBoard[r][c] = null;

          // Check if the king is in check after the move
          if (!isInCheck(tempBoard, color)) {
            return false; // Found a move that avoids stalemate
          }
        }
      }
    }
  }

  return true; // No moves available, so it's stalemate
};


// Function to generate all legal moves for a given piece
const generateMoves = (board, piece, r, c, lastMove) => {
  const moves = [];
  // Implement the logic to generate legal moves based on the piece type
  // Add each legal move as an array [toRow, toCol] to the moves array
  return moves;
};

// Function to create a deep copy of the board
// const copyBoard = (board) => {
//   return board.map((row) => row.slice());
// };

const copyBoard = (board) => {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
};


// Function to check if a move results in pawn promotion
export const shouldPromotePawn = (piece, toRow) => {
  return (piece.piece === 'P' && ((piece.color === 'white' && toRow === 0) || (piece.color === 'black' && toRow === 7)));
};

export const isLegalMoveConsideringCheck = (board, piece, fromRow, fromCol, toRow, toCol, lastMove) => {
  // Make the move on a temporary board
  const tempBoard = JSON.parse(JSON.stringify(board));
  tempBoard[toRow][toCol] = piece;
  tempBoard[fromRow][fromCol] = null;

  // Get the color of the piece being moved
  const color = piece.color;

  // If the piece is a king, we need to check if the destination square is under attack
  if (piece.piece === 'K') {
    return !isUnderAttack(tempBoard, toRow, toCol, color);
  } else {
    // For other pieces, check if the king is in check after the move
    return !isInCheck(tempBoard, color);
  }
};

// Helper function to check if a square is under attack by the opponent
// const isUnderAttack = (board, row, col, color) => {
//   const opponentColor = color === 'white' ? 'black' : 'white';

//   // Check all squares on the board
//   for (let r = 0; r < 8; r++) {
//     for (let c = 0; c < 8; c++) {
//       const piece = board[r][c];
//       if (piece && piece.color === opponentColor) {
//         // If an opponent's piece can legally move to the square, it's under attack
//         if (isLegalMove(board, piece, r, c, row, col, null)) {
//           return true;
//         }
//       }
//     }
//   }

//   return false;
// };


// Function to check if the opponent's king is in check
// export const isInCheck = (board, opponentColor) => {
//   // Find the opponent's king
//   let kingRow = -1;
//   let kingCol = -1;
//   for (let r = 0; r < 8; r++) {
//     for (let c = 0; c < 8; c++) {
//       if (board[r][c] && board[r][c].piece === 'K' && board[r][c].color === opponentColor) {
//         kingRow = r;
//         kingCol = c;
//         break;
//       }
//     }
//     if (kingRow !== -1) break;
//   }

//   if (kingRow === -1 || kingCol === -1) return false; // King not found (should not happen)

//   // Check for attacking pawns
//   const pawnAttacks = [
//     [-1, 1],
//     [-1, -1],
//     [-1, -1], [1, 1]
//   ];
//   for (const [dr, dc] of pawnAttacks) {
//     const r = kingRow + dr;
//     const c = kingCol + dc;
//     if (r >= 0 && r < 8 && c >= 0 && c < 8) {
//       const piece = board[r][c];
//       if (piece && piece.color !== opponentColor && piece.piece === 'P') {
//         console.log(`${opponentColor} king is in check by pawn`);
//         return true; // King is in check by pawn
//       }
//     }
//   }

//   // Check for attacking knights
//   const knightMoves = [
//     [-2, -1],
//     [-2, 1],
//     [-1, -2],
//     [-1, 2],
//     [1, -2],
//     [1, 2],
//     [2, -1],
//     [2, 1],
//   ];
//   for (const [dr, dc] of knightMoves) {
//     const r = kingRow + dr;
//     const c = kingCol + dc;
//     if (r >= 0 && r < 8 && c >= 0 && c < 8) {
//       const piece = board[r][c];
//       if (piece && piece.color !== opponentColor && piece.piece === 'N') {
//         console.log(`${opponentColor} king is in check by knight`);
//         return true; // King is in check by knight
//       }
//     }
//   }

//   // Check for attacking bishops, rooks, and queens
//   const directions = [
//     [-1, -1],
//     [-1, 1],
//     [1, -1],
//     [1, 1],
//     [-1, 0],
//     [1, 0],
//     [0, -1],
//     [0, 1],
//   ];
//   for (const [dr, dc] of directions) {
//     let r = kingRow + dr;
//     let c = kingCol + dc;
//     while (r >= 0 && r < 8 && c >= 0 && c < 8) {
//       const piece = board[r][c];
//       if (piece) {
//         if (
//           piece.color !== opponentColor &&
//           ((piece.piece === 'B' && (dr !== 0 && dc !== 0)) ||
//             (piece.piece === 'R' && (dr === 0 || dc === 0)) ||
//             piece.piece === 'Q')
//         ) {
//           console.log(`${opponentColor} king is in check by ${piece.piece}`);
//           return true; // King is in check by bishop, rook, or queen
//         }
//         break; // Stop searching in this direction
//       }
//       r += dr;
//       c += dc;
//     }
//   }

//   return false;
// };

// Function to check if the opponent's king is in check
// export const isInCheck = (board, opponentColor) => {
//   // Find the opponent's king
//   let kingRow = -1;
//   let kingCol = -1;
//   for (let r = 0; r < 8; r++) {
//     for (let c = 0; c < 8; c++) {
//       if (board[r][c] && board[r][c].piece === 'K' && board[r][c].color === opponentColor) {
//         kingRow = r;
//         kingCol = c;
//         break;
//       }
//     }
//     if (kingRow !== -1) break;
//   }
//   if (kingRow === -1 || kingCol === -1) return false; // King not found (should not happen)

//   // Check for attacking pawns
//   // const pawnDirection = opponentColor === 'white' ? -1 : 1;
//   const pawnAttacks = [
//     [-1, 1],  [1, 1], [-1, -1], [1, -1]
//   ];

//   for (const [dr, dc] of pawnAttacks) {
//     const r = kingRow + dr;
//     const c = kingCol + dc;
//     if (r >= 0 && r < 8 && c >= 0 && c < 8) {
//       const piece = board[r][c];
//       if (piece && piece.color !== opponentColor && piece.piece === 'P') {
//         console.log(`${opponentColor} king is in check by pawn at [${r},${c}]`);
//         return true; // King is in check by pawn
//       }
//     }
//   }

//   // Check for attacking knights
//   const knightMoves = [
//     [-2, -1], [-2, 1], [-1, -2], [-1, 2],
//     [1, -2], [1, 2], [2, -1], [2, 1],
//   ];
//   for (const [dr, dc] of knightMoves) {
//     const r = kingRow + dr;
//     const c = kingCol + dc;
//     if (r >= 0 && r < 8 && c >= 0 && c < 8) {
//       const piece = board[r][c];
//       if (piece && piece.color !== opponentColor && piece.piece === 'N') {
//         console.log(`${opponentColor} king is in check by knight`);
//         return true; // King is in check by knight
//       }
//     }
//   }

//   // Check for attacking bishops, rooks, and queens
//   const directions = [
//     [-1, -1], [-1, 1], [1, -1], [1, 1],
//     [-1, 0], [1, 0], [0, -1], [0, 1],
//   ];
//   for (const [dr, dc] of directions) {
//     let r = kingRow + dr;
//     let c = kingCol + dc;
//     while (r >= 0 && r < 8 && c >= 0 && c < 8) {
//       const piece = board[r][c];
//       if (piece) {
//         if (
//           piece.color !== opponentColor &&
//           ((piece.piece === 'B' && (dr !== 0 && dc !== 0)) ||
//            (piece.piece === 'R' && (dr === 0 || dc === 0)) ||
//            piece.piece === 'Q')
//         ) {
//           console.log(`${opponentColor} king is in check by ${piece.piece}`);
//           return true; // King is in check by bishop, rook, or queen
//         }
//         break; // Stop searching in this direction
//       }
//       r += dr;
//       c += dc;
//     }
//   }

//   return false;
// };

// const isKingMove = (board, piece, fromRow, fromCol, toRow, toCol, color) => {
//   // Basic movement: one square in any direction
//   const rowDiff = Math.abs(toRow - fromRow);
//   const colDiff = Math.abs(toCol - fromCol);

//   if (rowDiff <= 1 && colDiff <= 1) {
//     // Check if the destination square is empty or contains an opponent's piece
//     if (board[toRow][toCol] && board[toRow][toCol].color === color) {
//       return false; // Cannot capture own piece
//     }

//     // Create a temporary board to check if the move would result in check
//     const tempBoard = JSON.parse(JSON.stringify(board));
//     tempBoard[toRow][toCol] = piece;
//     tempBoard[fromRow][fromCol] = null;

//     // Check if the move would put the king in check
//     if (isUnderAttack(tempBoard, toRow, toCol, color)) {
//       return false; // Cannot move into check
//     }

//     return true; // Valid basic king move
//   }

//   // Check for castling
//   if (canCastle(board, fromRow, fromCol, toRow, toCol, color)) {
//     return true; // Valid castling move
//   }

//   return false; // Not a valid king move
// };

// const isPawnMove = (board, piece, fromRow, fromCol, toRow, toCol, direction, lastMove) => {
//   if (!piece || piece.piece !== 'P') return false;

//   console.log("ispawnmove :", piece);
//   const step = piece.color === 'white' ? -1 : 1;

//   // Normal move
//   if (fromCol === toCol && board[toRow] && board[toRow][toCol] === null) {
//     if (fromRow + step === toRow) return true; // Move one square forward
//     if (piece.color === 'white' && fromRow === 6 && toRow === 4 && board[5] && board[5][toCol] === null) return true; // Move two squares from starting position
//     if (piece.color === 'black' && fromRow === 1 && toRow === 3 && board[2] && board[2][toCol] === null) return true; // Move two squares from starting position
//   }

//   // Capture move
//   if (Math.abs(fromCol - toCol) === 1 && fromRow + step === toRow && board[toRow] && board[toRow][toCol] && board[toRow][toCol].color !== piece.color) {
//     return true;
//   }

//   // En passant
//   if (lastMove && lastMove.piece && lastMove.piece.piece === 'P' && 
//       Math.abs(lastMove.fromRow - lastMove.toRow) === 2 &&
//       lastMove.toCol === toCol && toRow === lastMove.toRow + step && 
//       Math.abs(fromRow - lastMove.toRow) === 1) {
//     return true;
//   }

//   return false;
// };



// Helper function to check if castling is possible


// isUnderAttack function
// const isUnderAttack = (board, row, col, color) => {
//   const opponentColor = color === 'white' ? 'black' : 'white';


//   // Check for pawn attacks
//   const pawnDirection = color === 'white' ? -1 : 1;
//   const pawnRow = row + pawnDirection;
//   if (pawnRow >= 0 && pawnRow < 8) {
//     if (col > 0 && board[pawnRow][col - 1]?.piece === 'P' && board[pawnRow][col - 1]?.color === opponentColor) return true;
//     if (col < 7 && board[pawnRow][col + 1]?.piece === 'P' && board[pawnRow][col + 1]?.color === opponentColor) return true;
//   }

//   // Check for knight attacks
//   const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
//   for (const [rowOffset, colOffset] of knightMoves) {
//     const newRow = row + rowOffset;
//     const newCol = col + colOffset;
//     if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
//       if (board[newRow][newCol]?.piece === 'N' && board[newRow][newCol]?.color === opponentColor) return true;
//     }
//   }

//   // Check for horizontal and vertical attacks (rook and queen)
//   const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
//   for (const [rowOffset, colOffset] of directions) {
//     let newRow = row + rowOffset;
//     let newCol = col + colOffset;
//     while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
//       const piece = board[newRow][newCol]?.piece;
//       const pieceColor = board[newRow][newCol]?.color;
//       if (piece && pieceColor === opponentColor && (piece === 'R' || piece === 'Q')) return true;
//       if (piece) break;
//       newRow += rowOffset;
//       newCol += colOffset;
//     }
//   }

//   // Check for diagonal attacks (bishop and queen)
//   const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
//   for (const [rowOffset, colOffset] of diagonalDirections) {
//     let newRow = row + rowOffset;
//     let newCol = col + colOffset;
//     while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
//       const piece = board[newRow][newCol]?.piece;
//       const pieceColor = board[newRow][newCol]?.color;
//       if (piece && pieceColor === opponentColor && (piece === 'B' || piece === 'Q')) return true;
//       if (piece) break;
//       newRow += rowOffset;
//       newCol += colOffset;
//     }
//   }

  // Check for king attacks
//   const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
//   for (const [rowOffset, colOffset] of kingMoves) {
//     const newRow = row + rowOffset;
//     const newCol = col + colOffset;
//     if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
//       if (board[newRow][newCol]?.piece === 'K' && board[newRow][newCol]?.color === opponentColor) return true;
//     }
//   }

//   return false;
// };

// isKingMove function
// const isKingMove = (board, piece, fromRow, fromCol, toRow, toCol) => {
//   // Normal king move
//   if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) return true;

//   // Castling logic
//   if (piece.hasMoved || toCol === fromCol) return false; // King has already moved
//   console.log("col:", fromCol, toCol);

// if (toCol === fromCol + 2 || toCol === fromCol - 2) {
//     const rookCol = toCol > fromCol ? fromCol + 3 : fromCol - 4;
//     const rook = board[fromRow][rookCol];

//     // Check if the rook exists, is the correct color, and has not moved
//     if (!rook || rook.piece !== 'R' || rook.color !== piece.color || rook.hasMoved) return false;

//     const step = toCol > fromCol ? 1 : -1;

//     // Check for pieces between the king and the rook
//     for (let col = fromCol + step; col !== toCol; col += step) {
//         if (board[fromRow][col]) return false;
//     }

//     // Check that the king is not moving through or into a square under attack
//     for (let col = fromCol; col !== toCol + step; col += step) {
//         if (isUnderAttack(board, fromRow, col, piece.color)) return false;
//     }

//     // Move the rook
//     // const newRookCol = toCol > fromCol ? fromCol + 1 : fromCol - 1;
//     // board[fromRow][newRookCol] = rook;
//     // board[fromRow][rookCol] = null;
//     // rook.hasMoved = true;

//     return true;
// }

// return false;
// };

// const isKingMove = (board, piece, fromRow, fromCol, toRow, toCol) => {
//   // Check if the move is within one square in any direction
//   if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
//     // Check if the move puts the king adjacent to the opponent's king
//     const opponentColor = piece.color === 'white' ? 'black' : 'white';
//     for (let i = -1; i <= 1; i++) {
//       for (let j = -1; j <= 1; j++) {
//         const checkRow = toRow + i;
//         const checkCol = toCol + j;
//         if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
//           const checkPiece = board[checkRow][checkCol];
//           if (checkPiece && checkPiece.piece === 'K' && checkPiece.color === opponentColor) {
//             return false; // Move would place king adjacent to opponent's king
//           }
//         }
//       }
//     }

//     // Check if the destination square is occupied by a piece of the same color
//     if (board[toRow][toCol] && board[toRow][toCol].color === piece.color) {
//       return false; // Cannot move to a square occupied by own piece
//     }

//     return true; // Valid king move
//   }

//   return false; // Not a valid king move
// };

// Function to check if the opponent's king is checkmated
// export const isCheckmate = (board, color, lastMove) => {
//   const opponentColor = color === 'white' ? 'black' : 'white';

//   // Check if the opponent's king is in check
//   if (!isInCheck(board, opponentColor)) {
//     return { isGameOver: false }; // Opponent's king is not in check, so it's not checkmated
//   }

//   // Find the position of the opponent's king
//   let kingPosition = null;
//   for (let r = 0; r < 8; r++) {
//     for (let c = 0; c < 8; c++) {
//       const piece = board[r][c];
//       if (piece && piece.piece === 'K' && piece.color === opponentColor) {
//         kingPosition = { row: r, col: c };
//         break;
//       }
//     }
//     if (kingPosition) break;
//   }
//   if (!kingPosition) {
//     throw new Error('Opponent\'s king not found on the board');
//   }

// // Generate all possible moves for the opponent
// for (let r = 0; r < 8; r++) {
//   for (let c = 0; c < 8; c++) {
//     const piece = board[r][c];
//     if (piece && piece.color === opponentColor) {
//       const moves = generateMoves(board, piece, r, c, lastMove);
//       for (const [toRow, toCol] of moves) {
//         // Make the move on a temporary board
//         const tempBoard = copyBoard(board);
//         tempBoard[toRow][toCol] = piece;
//         tempBoard[r][c] = null;
        
//         // Check if the opponent's king is still in check after the move
//         if (!isInCheck(tempBoard, opponentColor)) {
//           return { isGameOver: false }; // Found a move that gets the opponent's king out of check
//         }
//       }
//     }
//   }
// }

//   // Check if the opponent's king can move to a safe square
//   const kingMoves = [
//     [-1, -1],
//     [-1, 0],
//     [-1, 1],
//     [0, -1],
//     [0, 1],
//     [1, -1],
//     [1, 0],
//     [1, 1],
//   ];
//   for (const [dr, dc] of kingMoves) {
//     const r = kingPosition.row + dr;
//     const c = kingPosition.col + dc;
//     if (r >= 0 && r < 8 && c >= 0 && c < 8) {
//       const piece = board[r][c];
//       if (!piece || piece.color !== opponentColor) {
//         const tempBoard = copyBoard(board);
//         tempBoard[r][c] = tempBoard[kingPosition.row][kingPosition.col];
//         tempBoard[kingPosition.row][kingPosition.col] = null;
//         if (!isInCheck(tempBoard, opponentColor)) {
//           return { isGameOver: false }; // Found a safe square for the opponent's king
//         }
//       }
//     }
//   }

//   const winner = color;
//   return { isGameOver: true, winner }; // No moves to get the opponent's king out of check, so it's checkmated
// };
