import React from 'react';

 const Piece = ({ piece, color }) => {
  const pieceIcons = {
    K: '♔',
    Q: '♕',
    R: '♖',
    B: '♗',
    N: '♘',
    P: '♙',
  };

  return (
    <div className={`text-3xl ${color === 'white' ? 'text-white' : 'text-black'}`}>
      {pieceIcons[piece]}
    </div>
  );
};

export default Piece;