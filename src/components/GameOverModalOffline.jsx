import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import Button from './ui/Button';

// Shows local game outcome and rematch action.
const GameOverModalOffline = ({ winner, gameOverReason, handleRematchRequest, toggleModal }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <div className="luxury-panel w-full max-w-sm rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">Game Over</h2>
        <button onClick={toggleModal} className="rounded-xl p-2 text-[#9CA3AF] hover:bg-white/10 hover:text-[#F9FAFB]" aria-label="Close modal">
          <X size={20} />
        </button>
      </div>
      <div className="my-6 text-center">
        <p className="text-xl font-bold">{winner === 'Draw' ? "It's a draw" : `${winner} wins`}</p>
        <p className="mt-2 text-[#9CA3AF]">{gameOverReason}</p>
      </div>
      <Button onClick={handleRematchRequest} className="w-full">
        <RotateCcw size={18} /> Rematch
      </Button>
    </div>
  </div>
);

export default GameOverModalOffline;
