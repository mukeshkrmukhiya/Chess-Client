import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import Button from './ui/Button';

// Shows online game outcome and rematch controls.
const GameOverModal = ({
  winner,
  gameOverReason,
  rematchState,
  playerId,
  handleRematchRequest,
  handleRematchAccept,
  handleRematchReject,
  toggleModal
}) => (
  <div onClick={toggleModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <div onClick={(event) => event.stopPropagation()} className="luxury-panel w-full max-w-md rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">{winner === 'Draw' ? 'Game Draw' : `${winner} Wins`}</h2>
        <button onClick={toggleModal} className="rounded-xl p-2 text-[#9CA3AF] hover:bg-white/10 hover:text-[#F9FAFB]" aria-label="Close modal">
          <X size={20} />
        </button>
      </div>
      {winner !== 'Draw' && <p className="mt-2 text-[#9CA3AF]">by {gameOverReason}</p>}
      <div className="mt-6 grid gap-3">
        {!rematchState.requested && (
          <Button onClick={handleRematchRequest}>
            <RotateCcw size={18} /> Request Rematch
          </Button>
        )}
        {rematchState.requested && rematchState.requestedBy !== playerId && (
          <>
            <Button onClick={handleRematchAccept}>Accept Rematch</Button>
            <Button onClick={handleRematchReject} variant="danger">Decline Rematch</Button>
          </>
        )}
        {rematchState.requested && rematchState.requestedBy === playerId && (
          <p className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 p-4 text-center text-sm text-[#9CA3AF]">Rematch requested. Waiting for opponent...</p>
        )}
        {rematchState.accepted && <p className="text-center text-green-300">Rematch accepted. Starting new game...</p>}
        <Button onClick={() => window.location.reload()} variant="secondary">New Game</Button>
      </div>
    </div>
  </div>
);

export default GameOverModal;
