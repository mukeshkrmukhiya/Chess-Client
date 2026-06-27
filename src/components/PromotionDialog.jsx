import React from 'react';

const pieceLabels = {
  Q: 'Queen',
  R: 'Rook',
  B: 'Bishop',
  N: 'Knight'
};

// Presents promotion choices without changing promotion rules.
const PromotionDialog = ({ onSelect }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <div className="luxury-panel w-full max-w-sm rounded-2xl p-6">
      <h2 className="text-center text-2xl font-bold text-[#F9FAFB]">Choose Promotion</h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {Object.entries(pieceLabels).map(([piece, label]) => (
          <button
            key={piece}
            onClick={() => onSelect(piece)}
            className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-5 text-center hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <span className="block text-3xl font-extrabold text-[#D4AF37]">{piece}</span>
            <span className="mt-1 block text-sm text-[#9CA3AF]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default PromotionDialog;
