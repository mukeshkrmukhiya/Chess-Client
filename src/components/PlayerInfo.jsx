import React from 'react';
import { Clock, Crown } from 'lucide-react';

// Shows player identity, color, timer, and active-turn state.
export const PlayerInfo = ({ name, color, time, isCurrentPlayer }) => (
  <div className={`rounded-2xl border p-4 ${isCurrentPlayer ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[rgba(212,175,55,0.18)] bg-white/5'}`}>
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-[#F9FAFB]">{name || 'Waiting...'}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">{color}</p>
      </div>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${color === 'white' ? 'bg-white text-gray-950' : 'bg-gray-950 text-white'} border-[#D4AF37]/30`}>
        <Crown size={16} />
      </span>
    </div>
    <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#111827]/70 px-3 py-2 text-[#F9FAFB]">
      <Clock size={16} className="text-[#D4AF37]" />
      <span className="font-mono text-lg font-bold">{time}</span>
    </div>
  </div>
);
