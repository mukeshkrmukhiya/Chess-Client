// export const backendUrl = 'http://localhost:5000';
export const backendUrl = 'https://chess-backend-kf5d.onrender.com';

// Creates the initial chess board state.
export const initializeBoard = () => {
  const emptyBoard = Array(8).fill(null).map(() => Array(8).fill(null));

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

// Validates piece movement without considering check state.
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

  const pawnDirection = color === 'white' ? -1 : 1;
  const pawnRow = row + pawnDirection;
  if (pawnRow >= 0 && pawnRow < 8) {
    if (col > 0 && board[pawnRow][col - 1]?.piece === 'P' && board[pawnRow][col - 1]?.color === opponentColor) return true;
    if (col < 7 && board[pawnRow][col + 1]?.piece === 'P' && board[pawnRow][col + 1]?.color === opponentColor) return true;
  }

  const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  for (const [rowOffset, colOffset] of knightMoves) {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (board[newRow][newCol]?.piece === 'N' && board[newRow][newCol]?.color === opponentColor) return true;
    }
  }

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
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  
  if (rowDiff <= 1 && colDiff <= 1) {
    if (board[toRow][toCol] && board[toRow][toCol].color === color) {
      console.log('King move rejected: Destination square occupied by own piece');
      return false; // Cannot capture own piece
    }
    
    const tempBoard = JSON.parse(JSON.stringify(board));
    tempBoard[toRow][toCol] = piece;
    tempBoard[fromRow][fromCol] = null;
    
    if (isCheck(tempBoard, color)) {
      console.log('King move rejected: Move would put king in check');
      return false; // Cannot move into check
    }
    
    return true; // Valid basic king move
  }
  
  if (canCastle(board, fromRow, fromCol, toRow, toCol, color)) {
    return true; // Valid castling move
  }
  
  return false; // Not a valid king move
};

const isCheck = (board, color) => {
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
  const step = piece.color === 'white' ? -1 : 1;

  if (fromCol === toCol && board[toRow][toCol] === null) {
    if (fromRow + step === toRow) return true; // Move one square forward
    if (piece.color === 'white' && fromRow === 6 && toRow === 4 && board[5][toCol] === null) return true; // Move two squares from starting position
    if (piece.color === 'black' && fromRow === 1 && toRow === 3 && board[2][toCol] === null) return true; // Move two squares from starting position
  }


  if (Math.abs(fromCol - toCol) === 1 && fromRow + step === toRow && board[toRow][toCol] && board[toRow][toCol].color !== piece.color) {
    return true;
  }


  return false;
};


 export const canCastle = (board, fromRow, fromCol, toRow, toCol, color) => {
  const king = board[fromRow][fromCol];
  if (king.piece !== 'K' || king.hasMoved) return false; // King must not have moved

  if (Math.abs(toCol - fromCol) !== 2 || fromRow !== toRow) return false;

  const isKingsideCastling = toCol > fromCol;
  const rookCol = isKingsideCastling ? 7 : 0;
  const rook = board[fromRow][rookCol];

  if (!rook || rook.piece !== 'R' || rook.hasMoved) return false; // Rook must not have moved

  const startCol = Math.min(fromCol, rookCol) + 1;
  const endCol = Math.max(fromCol, rookCol);
  for (let col = startCol; col < endCol; col++) {
    if (board[fromRow][col]) return false;
  }

  if (isUnderAttack(board, fromRow, fromCol, color)) return false;

  const direction = isKingsideCastling ? 1 : -1;
  for (let col = fromCol; col !== toCol + direction; col += direction) {
    if (isUnderAttack(board, fromRow, col, color)) return false;
  }

  return true;
};







export function performCastling(board, fromRow, fromCol, toRow, toCol, isOffline) {
  const newBoard = JSON.parse(JSON.stringify(board));
  const piece = newBoard[fromRow][fromCol];
  
  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;
  
  let rookFromCol, rookToCol;
  if (toCol > fromCol) {  // Kingside castling
    rookFromCol = 7;
    rookToCol = 5;
  } else {  // Queenside castling
    rookFromCol = 0;
    rookToCol = 3;
  }
  
  const rook = newBoard[fromRow][rookFromCol];
  if (!rook || rook.piece !== 'R') {
    console.error('Rook not found for castling:', { fromRow, rookFromCol, rook });
    return null; // Return null to indicate castling couldn't be performed
  }
  
  newBoard[fromRow][rookToCol] = rook;
  isOffline ? newBoard[fromRow][rookFromCol] = null : newBoard[fromRow][rookToCol] = rook ;
  
  return {
    newBoard,
    rookMove: {
      from: `${fromRow},${rookFromCol}`,
      to: `${fromRow},${rookToCol}`,
      piece: rook
    }
  };
}


export function performCastlingOffline(board, fromRow, fromCol, toRow, toCol) {
  const newBoard = JSON.parse(JSON.stringify(board));
  const piece = newBoard[fromRow][fromCol];
  
  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;
  
  let rookFromCol, rookToCol;
  if (toCol > fromCol) {  // Kingside castling
    rookFromCol = 7;
    rookToCol = 5;
  } else {  // Queenside castling
    rookFromCol = 0;
    rookToCol = 3;
  }
  
  const rook = newBoard[fromRow][rookFromCol];
  if (!rook || rook.piece !== 'R') {
    console.error('Rook not found for castling:', { fromRow, rookFromCol, rook });
    return null; // Return null to indicate castling couldn't be performed
  }
  
  newBoard[fromRow][rookToCol] = rook;
  newBoard[fromRow][rookFromCol] = null;
  
  return {
    newBoard,
    rookMove: {
      from: `${fromRow},${rookFromCol}`,
      to: `${fromRow},${rookToCol}`,
      piece: rook
    }
  };
}





// Determines whether the specified king is attacked.
export const isInCheck = (board, color) => {
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

  return isUnderAttack(board, kingRow, kingCol, color);
};



// Detects whether the current checked side is mated.
export const isCheckmate = (board, color, lastMove) => {
  const opponentColor = color === 'white' ? 'black' : 'white';

  if (!isInCheck(board, opponentColor)) {
    return { isGameOver: false }; // Opponent's king is not in check, so it's not checkmated
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isLegalMove(board, piece, r, c, toRow, toCol, lastMove)) {
              const tempBoard = copyBoard(board);
              tempBoard[toRow][toCol] = { ...piece };
              tempBoard[r][c] = null;

              if (!isInCheck(tempBoard, opponentColor)) {
                return { isGameOver: false }; // Found a legal move that prevents checkmate
              }
            }
          }
        }
      }
    }
  }

  const winner = color;
  return { isGameOver: true, winner };
};



// Detects no-legal-move positions without check.
export const isStalemate = (board, color, lastMove) => {
  if (isInCheck(board, color)) {
    return false; // King is in check, so it's not stalemate
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = generateMoves(board, piece, r, c, lastMove);
        for (const [toRow, toCol] of moves) {
          const tempBoard = JSON.parse(JSON.stringify(board));
          tempBoard[toRow][toCol] = piece;
          tempBoard[r][c] = null;

          if (!isInCheck(tempBoard, color)) {
            return false; // Found a move that avoids stalemate
          }
        }
      }
    }
  }

  return true; // No moves available, so it's stalemate
};


const generateMoves = (board, piece, r, c, lastMove) => {
  const moves = [];
  return moves;
};


const copyBoard = (board) => {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
};


// Checks whether a pawn reached promotion rank.
export const shouldPromotePawn = (piece, toRow) => {
  return (piece.piece === 'P' && ((piece.color === 'white' && toRow === 0) || (piece.color === 'black' && toRow === 7)));
};

// Ensures a legal move does not expose check.
export const isLegalMoveConsideringCheck = (board, piece, fromRow, fromCol, toRow, toCol, lastMove) => {
  const tempBoard = JSON.parse(JSON.stringify(board));
  tempBoard[toRow][toCol] = piece;
  tempBoard[fromRow][fromCol] = null;

  const color = piece.color;

  if (piece.piece === 'K') {
    return !isUnderAttack(tempBoard, toRow, toCol, color);
  } else {
    return !isInCheck(tempBoard, color);
  }
};



























































        


