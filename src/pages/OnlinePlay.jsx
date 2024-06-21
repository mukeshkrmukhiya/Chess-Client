import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OnlineChessBoard from '../components/OnlineChessBoard';

const socket = io('http://localhost:5000');

const OnlinePlay = () => {
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [gameCode, setGameCode] = useState('');
  const [gameInfo, setGameInfo] = useState(null);
  const [playerUsername, setPlayerUsername] = useState('');
  const [opponentUsername, setOpponentUsername] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [joinGameCode, setJoinGameCode] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [playerColor, setPlayerColor] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      navigate('/login');
    }

    socket.on('gameState', ({ players, currentTurn }) => {
      const player = players.find(p => p.id === storedPlayerId);
      const opponent = players.find(p => p.id !== storedPlayerId);
      
      if (player) {
        setPlayerColor(player.color);
        setPlayerUsername(player.username);
        if (opponent) {
          setOpponentUsername(opponent.username);
          setGameStatus('started');
        }
      }
    });

    return () => {
      socket.off('gameState');
    };
  }, [navigate]);

  const handleCreateGame = async () => {
    if (playerId && selectedTime) {
      try {
        const response = await axios.post('http://localhost:5000/api/games/create', {
          playerId,
          timeControl: selectedTime
        });

        if (response.data && response.data.gameCode) {
          setGameCode(response.data.gameCode);
          setPlayerUsername(response.data.username);
          setGameInfo(response.data.game);
          setGameStatus('waiting');
          console.log('Game created with username, Game Code:', response.data.username, response.data.gameCode);
          socket.emit('joinRoom', { gameCode: response.data.gameCode, playerId, username: response.data.username });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error creating game:', error);
        console.log('Failed to create game. Please try again.');
      }
    } else {
      console.log('Please set your player ID and select a time before creating a game.');
    }
  };

  const handleJoinGame = async () => {
    if (joinGameCode && playerId) {
      try {
        const response = await axios.post('http://localhost:5000/api/games/join', {
          gameCode: joinGameCode,
          playerId
        });

        if (response.data && response.data.game) {
          setGameCode(joinGameCode);
          setGameInfo(response.data.game);
          setSelectedTime(response.data.game.timeControl);
          setPlayerUsername(response.data.blackPlayer);
          socket.emit('joinRoom', { gameCode: joinGameCode, playerId, username: response.data.playerUsername });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error joining game:', error);
        console.log('Failed to join game. Please try again.');
      }
    } else {
      console.log('Please enter a valid game code and set your player ID before joining a game.');
    }
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode)
        .then(() => {
            alert('Game code copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy game code: ', err);
        });
};

  return (
    <div className="text-center">
      <header className="bg-blue-500 text-white p-6">
        <h1 className="text-xl font-bold">Online Chess Game</h1>
      </header>
      <main className="p-6">
        <div className="flex justify-center mb-4">
          <div className="mr-4">
            <h3 className="mb-2">Select Time:</h3>
            <div>
              <button
                className={`bg-gray-300 text-black p-2 m-1 ${selectedTime === 10 ? 'bg-green-500 text-white' : ''}`}
                onClick={() => setSelectedTime(10)}
              >
                10 minutes
              </button>
              <button
                className={`bg-gray-300 text-black p-2 m-1 ${selectedTime === 15 ? 'bg-green-500 text-white' : ''}`}
                onClick={() => setSelectedTime(15)}
              >
                15 minutes
              </button>
              <button
                className={`bg-gray-300 text-black p-2 m-1 ${selectedTime === 30 ? 'bg-green-500 text-white' : ''}`}
                onClick={() => setSelectedTime(30)}
              >
                30 minutes
              </button>
            </div>
          </div>
          <button className="bg-green-500 text-white p-2 m-2" onClick={handleCreateGame}>
            Create Game
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <input
            type="text"
            value={joinGameCode}
            onChange={(e) => setJoinGameCode(e.target.value)}
            placeholder="Enter Game Code"
            className="p-2 mr-2 border border-gray-300 rounded"
          />
          <button className="bg-yellow-500 text-white p-2" onClick={handleJoinGame}>
            Join Game
          </button>
        </div>

        {gameCode && (
                    <div className="mt-4">
                        <p>New Game Code: <span className="font-bold">{gameCode}</span></p>
                        <button
                            onClick={copyGameCode}
                            className="bg-green-500 text-white py-2 px-4 rounded mt-2"
                        >
                            Copy Game Code
                        </button>
                    </div>
                )}
        {gameCode && (
        <OnlineChessBoard
          socket={socket}
          gameCode={gameCode}
          playerId={playerId}
          playerUsername={playerUsername}
          opponentUsername={opponentUsername}
          selectedTime={selectedTime}
          gameStatus={gameStatus}
          gameInfo={gameInfo}
          playerColor={playerColor}
        />
      )}
      </main>
    </div>
  );
};

export default OnlinePlay;
