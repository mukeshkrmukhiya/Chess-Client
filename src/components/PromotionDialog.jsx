import React from 'react';

const PromotionDialog = ({ onSelect }) => {
  const pieceIcons = {
    Q: '♕',
    R: '♖',
    B: '♗',
    N: '♘',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-white rounded-lg shadow-lg p-2 w-32">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(pieceIcons).map(([piece, icon]) => (
            <div
              key={piece}
              onClick={() => onSelect(piece)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-2 rounded text-2xl flex items-center justify-center cursor-pointer"
            >
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionDialog;