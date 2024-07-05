import React from 'react';

// Assuming you have the images in the public/assets/images directory
const pieceImages = {
  K: 'assets/images/blackking.svg',
  R: 'assets/images/blackrook.svg',
  B: 'assets/images/blackbishop.svg',
  N: 'assets/images/blackknight.svg',
  P: 'assets/images/blackpawn.svg',
  Q: 'assets/images/blackqueen.svg',
};

const Piece = ({ piece, color }) => {
  const imageSrc = pieceImages[piece];

  if (!imageSrc) {
    return null;
  }

  // Filter to convert black to white
  const filter = color === 'white' ? 'invert(1)' : 'none';

  return (
    <img
    className='mt-1 '
      src={imageSrc}
      alt={`${color} ${piece}`}
      style={{ width: '100%', height: '100%', filter }}
    />
  );
};

export default Piece;

// import React from 'react';

//  const Piece = ({ piece, color }) => {
 
//   const pieceIcons = {
//     K: '♔',
//     Q: '♕',
//     R: '♖',
//     B: '♗',
//     N: '♘',
//     P: '♙',
//   };

//   return (
//     <div className={`text-3xl md:text-5xl ${color === 'white' ? 'text-white' : 'text-black'}`}>
//       {pieceIcons[piece]}
//     </div>
//   );
// };

// export default Piece;