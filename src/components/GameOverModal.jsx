
// import React,{ useEffect } from 'react';
// import axios from 'axios';
// import { backendUrl } from './helper';
// const GameOverModal = ({
//     winner,
//     gameOverReason,
//     rematchState,
//     playerId,
//     handleRematchRequest,
//     handleRematchAccept,
//     handleRematchReject,
//     toggleModal,
//     gameCode
//   }) =>{ 

//     useEffect(() => {
//       const callEndGameAPI = async (winnerColor) => {
//         try {
//           const response = await axios.post(`${backendUrl}/api/games/end-game`, {
//             gameCode,
//             winner: winnerColor
//           });
      
//           if (response.status === 200) {
//             console.log('Game ended successfully:', response.data);
//             return response.data;
//           } else {
//             throw new Error('Failed to end game: ' + response.data.message);
//           }
//         } catch (error) {
//           console.error('Error ending game:', error.message);
//           throw error; // Re-throw the error to be handled by the caller
//         }
//       };
    
//       callEndGameAPI();
//     }, [])
    
    
    
//     return(
//     <div onClick={toggleModal} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-6">
//       <div onClick={(e) => e.stopPropagation()} className="bg-gray-300 rounded-lg p-8 max-w-md w-full">
//         <h2 className="text-2xl font-bold mb-4 text-center">
//           {winner === 'Draw' ? 'Game Draw' : `${winner} Wins!`}
//         </h2>
//         {winner !== 'Draw' && (
//           <p className="text-gray-600 mb-6 text-center">{`by ${gameOverReason}`}</p>
//         )}
//         <div className="flex flex-col space-y-3">
//           {!rematchState.requested && (
//             <button
//               onClick={handleRematchRequest}
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
//             >
//               Request Rematch
//             </button>
//           )}
//           {rematchState.requested && rematchState.requestedBy !== playerId && (
//             <>
//               <button
//                 onClick={handleRematchAccept}
//                 className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
//               >
//                 Accept 
//               </button>
//               <button
//                 onClick={handleRematchReject}
//                 className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
//               >
//                 Decline 
//               </button>
//             </>
//           )}
//           {rematchState.requested && rematchState.requestedBy === playerId && (
//             <p className="text-center text-gray-600">Rematch requested. Waiting for opponent...</p>
//           )}
//           {rematchState.accepted && (
//             <p className="text-center text-green-600">Rematch accepted! Starting new game...</p>
//           )}
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
//           >
//             New Game
//           </button>
//         </div>
//       </div>
//     </div>
//   )};

//   export default GameOverModal;

import React, { useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from './helper';

const GameOverModal = ({
  winner,
  gameOverReason,
  rematchState,
  playerId,
  handleRematchRequest,
  handleRematchAccept,
  handleRematchReject,
  toggleModal,
  gameCode
}) => {

  // useEffect(() => {
  //   const callEndGameAPI = async (winnerColor) => {
  //     try {
  //       const response = await axios.post(`${backendUrl}/api/games/end-game`, {
  //         gameCode,
  //         winner: winnerColor
  //       });

  //       if (response.status === 200) {
  //         console.log('Game ended successfully:', response.data);
  //         return response.data;
  //       } else {
  //         throw new Error('Failed to end game: ' + response.data.message);
  //       }
  //     } catch (error) {
  //       console.error('Error ending game:', error.message);
  //       throw error; // Re-throw the error to be handled by the caller
  //     }
  //   };

  //   if (winner && gameCode) {
  //     callEndGameAPI(winner);
  //   }
  // }, [winner, gameCode]);

  return (
    <div onClick={toggleModal} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-6">
      <div onClick={(e) => e.stopPropagation()} className="bg-gray-300 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {winner === 'Draw' ? 'Game Draw' : `${winner} Wins!`}
        </h2>
        {winner !== 'Draw' && (
          <p className="text-gray-600 mb-6 text-center">{`by ${gameOverReason}`}</p>
        )}
        <div className="flex flex-col space-y-3">
          {!rematchState.requested && (
            <button
              onClick={handleRematchRequest}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Request Rematch
            </button>
          )}
          {rematchState.requested && rematchState.requestedBy !== playerId && (
            <>
              <button
                onClick={handleRematchAccept}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
              >
                Accept 
              </button>
              <button
                onClick={handleRematchReject}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
              >
                Decline 
              </button>
            </>
          )}
          {rematchState.requested && rematchState.requestedBy === playerId && (
            <p className="text-center text-gray-600">Rematch requested. Waiting for opponent...</p>
          )}
          {rematchState.accepted && (
            <p className="text-center text-green-600">Rematch accepted! Starting new game...</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
