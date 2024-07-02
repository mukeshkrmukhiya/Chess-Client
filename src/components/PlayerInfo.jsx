import React from 'react';
import { Clock, X } from 'lucide-react';


export const PlayerInfo = ({ name, color, time, isCurrentPlayer }) => (
    <div className={` bg-gray-700 p-4 rounded-lg ${isCurrentPlayer ? 'border-2 border-gray-500' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-semibold">{name}</span>
        <span className={`w-4 h-4 rounded-full ${color === 'white' ? 'bg-white' : 'bg-gray-900'}`}></span>
      </div>
      <div className="flex items-center text-gray-300">
        <Clock size={16} className="mr-2" />
        <span>{time}</span>
      </div>
    </div>
  );

