import React from 'react';

const pieceImages = {
  K: 'assets/images/blackking.svg',
  R: 'assets/images/blackrook.svg',
  B: 'assets/images/blackbishop.svg',
  N: 'assets/images/blackknight.svg',
  P: 'assets/images/blackpawn.svg',
  Q: 'assets/images/blackqueen.svg'
};

// Renders chess piece images with color-specific filtering.
const Piece = ({ piece, color }) => {
  const imageSrc = pieceImages[piece];

  if (!imageSrc) return null;

  return (
    <img
      className="h-[82%] w-[82%] object-contain drop-shadow-xl"
      src={imageSrc}
      alt={`${color} ${piece}`}
      style={{ filter: color === 'white' ? 'invert(1)' : 'none' }}
      draggable={false}
    />
  );
};

export default Piece;
