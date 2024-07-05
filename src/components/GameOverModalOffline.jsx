import React from 'react';
import { X } from 'lucide-react';

const GameOverModalOffline = ({ winner, gameOverReason, handleRematchRequest, toggleModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Game Over</h2>
          <button onClick={toggleModal} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6 text-center">
          <p className="text-xl font-semibold mb-2 text-white">
            {winner === 'Draw' ? "It's a draw!" : `${winner} wins!`}
          </p>
          <p className="text-gray-300">{gameOverReason}</p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleRematchRequest}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModalOffline;