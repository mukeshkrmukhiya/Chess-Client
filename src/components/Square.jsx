import React from 'react';
import Piece from './Piece';

export const Square = ({ piece, color, rowIndex, colIndex, onClick, selected, lastMove, highlight }) => {
  const backgroundColor = (rowIndex + colIndex) % 2 === 0 ? 'bg-green-600' : 'bg-gray-500';
  const selectedBackgroundColor = 'bg-blue-700'; // Background color for the selected cell
  const lastMoveSourceColor = 'bg-blue-500'; // Background color for the source cell of the last move
  const lastMoveDestinationColor = 'bg-blue-400'; // Background color for the destination cell of the last move

  let cellBackgroundColor = backgroundColor;

  if (selected) {
    cellBackgroundColor = `${selectedBackgroundColor} `;
  } else if (
    lastMove &&
    ((lastMove.fromRow === rowIndex && lastMove.fromCol === colIndex) ||
      (lastMove.toRow === rowIndex && lastMove.toCol === colIndex))
  ) {
    cellBackgroundColor =
      lastMove.fromRow === rowIndex && lastMove.fromCol === colIndex
        ? lastMoveSourceColor
        : lastMoveDestinationColor;
  }

  return (
    <div
      className={`w-16 h-16 flex justify-center items-center cursor-pointer  ${cellBackgroundColor} `}
      onClick={onClick}
    >
      {piece && <Piece piece={piece} color={color} />}
      {highlight && <div className="absolute w-4 h-4 "></div>} {/* bg-yellow-400 rounded-full */}
    </div>
  );
};


