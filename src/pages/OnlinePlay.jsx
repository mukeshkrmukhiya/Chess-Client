import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OnlineChessBoard from '../components/OnlineChessBoard';
import { backendUrl } from '../components/helper';

const socket = io(backendUrl);

const OnlinePlay = () => {
  const [playerId, setPlayerId] = useState(null);
  const [gameCode, setGameCode] = useState('');
  const [gameInfo, setGameInfo] = useState(null);
  const [playerUsername, setPlayerUsername] = useState('');
  const [opponentUsername, setOpponentUsername] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [joinGameCode, setJoinGameCode] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [playerColor, setPlayerColor] = useState('white');
  const [gameStarted, setGameStarted] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [copyButtonDisabled, setCopyButtonDisabled] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('white');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      navigate('/login');
    }

    socket.on('gameState', ({ players, currentTurn }) => {
      setCurrentTurn(currentTurn);
      const player = players.find(p => p.id === playerId);
      const opponent = players.find(p => p.id !== playerId);
      console.log("player play", players, currentTurn);
      setPlayerColor(players[0].id === playerId ? players[0].color : 'black');

      if (player) {
        setPlayerUsername(player.username);
        if (opponent) {
          setOpponentUsername(opponent.username);
          setGameStatus('waiting');
        }
      }
    });

    return () => {
      socket.off('gameState');
    };
  }, [navigate, socket, playerId]);

  const handleCreateGame = async () => {
    if (playerId && selectedTime) {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.post(`${backendUrl}/api/games/create`, {
          playerId,
          timeControl: selectedTime
        });

        if (response.data && response.data.gameCode) {
          setGameCode(response.data.gameCode);
          setPlayerUsername(response.data.username);
          setGameStatus('waiting');
          setGameStarted(true);
          console.log('Game created with username, Game Code:', response.data.username, response.data.gameCode);
          socket.emit('joinRoom', { gameCode: response.data.gameCode, playerId, username: response.data.username });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error creating game:', error);
        setError('Failed to create game. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please set your player ID and select a time before creating a game.');
    }
  };

  const handleJoinGame = async () => {
    if (joinGameCode && playerId) {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.post(`${backendUrl}/api/games/join`, {
          gameCode: joinGameCode,
          playerId
        });

        if (response.data && response.data.game) {
          setGameCode(joinGameCode);
          setGameInfo(response.data.game);
          setSelectedTime(response.data.game.timeControl);
          setPlayerUsername(response.data.blackPlayer);
          setOpponentUsername(response.data.whitePlayer);
          setGameStatus('started');
          setGameStarted(true);
          setPlayerColor(response.data.whitePlayerId === playerId ? 'white' : 'black');
          console.log("Joined game", joinGameCode, playerId, response.data.blackPlayer);
          socket.emit('joinRoom', { gameCode: joinGameCode, playerId, username: response.data.blackPlayer });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error joining game:', error);
        setError('Failed to join game. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please enter a valid game code and set your player ID before joining a game.');
    }
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode)
      .then(() => {
        setCopyButtonText('Copied');
        setCopyButtonDisabled(true);
        setTimeout(() => {
          setCopyButtonText('Copy');
          setCopyButtonDisabled(false);
        }, 5000);
      })
      .catch(err => {
        console.error('Failed to copy game code: ', err);
        setError('Failed to copy game code. Please try again.');
      });
  };

  return (
    <div className="text-center">
      <header className="bg-blue-500 text-white p-4">
        <h1 className=" md:text-xl text-lg md:fond-bold ">
          Make sure you're logged in. Select a time to create a game and send the game code to your friend.
        </h1>
      </header>
      <div className="md:p-6">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!gameStarted && (
          <>
            <div className="flex flex-col items-center mb-4">
              <h3 className="mb-2">Select Time:</h3>
              <div className="flex space-x-2 mb-4">
                {[10, 15, 30].map(time => (
                  <button
                    key={time}
                    className={`px-4 py-2 rounded ${selectedTime === time ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time} minutes
                  </button>
                ))}
              </div>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-green-300"
                onClick={handleCreateGame}
                disabled={isLoading || !selectedTime}
              >
                {isLoading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
            <div className="flex flex-col items-center mb-4">
              <input
                type="text"
                value={joinGameCode}
                onChange={(e) => setJoinGameCode(e.target.value)}
                placeholder="Enter Game Code"
                className="p-2 mb-2 border border-gray-300 rounded w-full max-w-xs"
              />
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded disabled:bg-yellow-300"
                onClick={handleJoinGame}
                disabled={isLoading || !joinGameCode}
              >
                {isLoading ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </>
        )}

        {gameCode && (
          <div className="mt-4 flex items-center justify-center">
            <p className="mr-2">Game Code: <span className="font-bold">{gameCode}</span></p>
            <button
              onClick={copyGameCode}
              className="bg-green-500 text-white py-2 px-4 rounded disabled:bg-green-300"
              disabled={copyButtonDisabled}
            >
              {copyButtonText}
            </button>
          </div>
        )}

        <div className='w-full'>
          {gameCode && (

            <OnlineChessBoard
              socket={socket}
              gameCode={gameCode}
              playerId={playerId}
              playerUsername={playerUsername}
              opponentUsername={opponentUsername}
              selectedTime={selectedTime}
              currentGameStatus={gameStatus}
              gameInfo={gameInfo}
              playerColour={playerColor}
              currentTrun={currentTurn}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlinePlay;