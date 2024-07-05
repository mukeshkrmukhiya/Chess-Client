

import React from 'react';
import { Clock, X } from 'lucide-react';


export const PlayerInfoOffline = ({ name, color, time, isCurrentPlayer, rotate }) => (
    <div className={`bg-gray-750 p-2 flex justify-between items-center ${rotate ? 'rotate-180' : ''}`}>
      <div className={`flex items-center space-x-2 ${rotate ? 'flex-row-reverse' : ''}`}>
        <div className={`w-3 h-3 rounded-full ${color === 'white' ? 'bg-white' : 'bg-black'}`}></div>
        <span className="text-white text-sm">{name}</span>
      </div>
      <div className={`text-white text-sm ${isCurrentPlayer ? 'font-bold' : ''}`}>
        {time}
      </div>
    </div>
  );