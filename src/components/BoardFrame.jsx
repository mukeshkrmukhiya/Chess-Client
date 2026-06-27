import React from 'react';

const defaultFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const defaultRanks = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Frames the board with fixed 8x8 sizing and chess coordinates.
const BoardFrame = ({ children, files = defaultFiles, ranks = defaultRanks }) => (
  <div className="grid w-full grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 gap-y-2 sm:grid-cols-[2rem_minmax(0,1fr)]">
    <div className="col-start-1 row-start-1 grid text-xs font-bold text-[#D4AF37] sm:text-sm" style={{ gridTemplateRows: 'repeat(8, minmax(0, 1fr))' }}>
      {ranks.map((rank) => (
        <div key={rank} className="flex items-center justify-center" aria-hidden="true">
          {rank}
        </div>
      ))}
    </div>
    <div className="col-start-2 row-start-1 aspect-square overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)] shadow-2xl shadow-black/30">
      <div className="grid h-full w-full grid-cols-8" style={{ gridTemplateRows: 'repeat(8, minmax(0, 1fr))' }}>
        {children}
      </div>
    </div>
    <div className="col-start-2 row-start-2 grid grid-cols-8 text-xs font-bold text-[#D4AF37] sm:text-sm">
      {files.map((file) => (
        <div key={file} className="flex items-center justify-center" aria-hidden="true">
          {file}
        </div>
      ))}
    </div>
  </div>
);

export default BoardFrame;
