import React from 'react';
import Piece from './Piece';

// Displays one board square with selection, move, and target states.
export const Square = ({ piece, color, rowIndex, colIndex, onClick, selected, lastMove, highlight, isMobile }) => {
  const isDark = (rowIndex + colIndex) % 2 !== 0;
  const isLastMove = lastMove && (
    (lastMove.fromRow === rowIndex && lastMove.fromCol === colIndex) ||
    (lastMove.toRow === rowIndex && lastMove.toCol === colIndex)
  );
  const baseColor = isDark ? 'bg-[#7D6A2E]' : 'bg-[#E8D8A0]';
  const stateColor = selected ? 'bg-[#D4AF37]' : isLastMove ? 'bg-[#B8941F]' : baseColor;
  const pieceRotation = isMobile && color === 'white' ? 'rotate-180' : '';

  return (
    <button
      type="button"
      className={`relative flex aspect-square h-full w-full items-center justify-center ${stateColor} ${isMobile ? 'rotate-180' : ''} focus:z-10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
      onClick={onClick}
      aria-label={`Board square ${rowIndex + 1}, ${colIndex + 1}`}
    >
      {piece && (
        <span className={`flex h-full w-full items-center justify-center ${pieceRotation}`}>
          <Piece piece={piece} color={color} />
        </span>
      )}
      {highlight && (
        <span className="absolute h-4 w-4 rounded-full bg-[#111827]/55 ring-2 ring-[#D4AF37]/70" />
      )}
    </button>
  );
};
