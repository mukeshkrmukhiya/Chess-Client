// import React from 'react';
// import { Clock, Crown } from 'lucide-react';

// // Shows player identity, color, timer, and active-turn state.
// export const PlayerInfo = ({ name, color, time, isCurrentPlayer }) => (
//   <div className={`rounded-2xl border p-4 ${isCurrentPlayer ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[rgba(212,175,55,0.18)] bg-white/5'}`}>
//     <div className="flex items-center justify-between gap-3">
//       <div className="min-w-0">
//         <p className="truncate text-sm font-bold text-[#F9FAFB]">{name || 'Waiting...'}</p>
//         <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#9CA3AF]">{color}</p>
//       </div>
//       <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${color === 'white' ? 'bg-white text-gray-950' : 'bg-gray-950 text-white'} border-[#D4AF37]/30`}>
//         <Crown size={16} />
//       </span>
//     </div>
//     <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#111827]/70 px-3 py-2 text-[#F9FAFB]">
//       <Clock size={16} className="text-[#D4AF37]" />
//       <span className="font-mono text-lg font-bold">{time}</span>
//     </div>
//   </div>
// );
import React from "react";
import { Clock, Crown } from "lucide-react";

export const PlayerInfo = ({
  name,
  color,
  time,
  isCurrentPlayer,
}) => (
  <div
  className={`
    rounded-xl
    border
    px-2
    py-2
    sm:rounded-2xl
    sm:p-4
    ${
      isCurrentPlayer
        ? "border-[#D4AF37] bg-[#D4AF37]/10"
        : "border-[rgba(212,175,55,0.18)] bg-white/5"
    }
  `}
>
    <div className="flex min-w-0 items-center justify-between gap-1.5 sm:gap-3">

      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold leading-tight text-[#F9FAFB] sm:text-sm">
          {name || "Waiting..."}
        </p>

        <p className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-[#9CA3AF] sm:mt-1 sm:text-xs sm:tracking-[0.16em]">
          {color}
        </p>
      </div>

      <span
        className={`
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-[#D4AF37]/30
          sm:h-9
          sm:w-9
        `}
      >
       <span
  className={`
    flex
    h-6
    w-6
    shrink-0
    items-center
    justify-center
    rounded-full
    border
    sm:h-9
    sm:w-9
    ${
      color === "white"
        ? "bg-white text-gray-950"
        : "bg-gray-950 text-white"
    }
    border-[#D4AF37]/30
  `}
>
          <Crown
            size={12}
            className="sm:hidden"
          />
          <Crown
            size={16}
            className="hidden sm:block"
          />
        </span>
      </span>
    </div>

    <div className="mt-1.5 flex items-center justify-center gap-1 rounded-lg bg-[#111827]/70 px-2 py-1 sm:mt-4 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2">
      <Clock
        size={12}
        className="shrink-0 text-[#D4AF37] sm:h-4 sm:w-4"
      />

      <span className="font-mono text-xs font-bold sm:text-lg">
        {time}
      </span>
    </div>
  </div>
);