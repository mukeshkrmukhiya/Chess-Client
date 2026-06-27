import React from 'react';
import { Monitor } from 'lucide-react';
import Chessboard from '../components/ChessBoard';
import PageShell from '../components/ui/PageShell';

// Hosts the local chess board experience.
function Play() {
  return (
    <PageShell className="px-0 py-0 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-0">
        <p className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-2 text-sm font-semibold text-[#D4AF37]">
          <Monitor size={16} /> Play Computer
        </p>
      </div>
      <Chessboard />
    </PageShell>
  );
}

export default Play;
