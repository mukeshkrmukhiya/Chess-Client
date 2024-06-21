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
  const [gameStatus, setGameStatus] = useState('waiting'); // 'waiting' or 'started'

  const navigate = useNavigate();

  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      navigate('/login');
    }
    // Listen for opponent joining
    socket.on('opponentJoined', ({ opponentUsername }) => {
      setOpponentUsername(opponentUsername);
      setGameStatus('started');
    });

    return () => {
      socket.off('opponentJoined');
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
          console.log('Game created with username , Game Code:', response.data.username, response.data.gameCode);
          // Join the Socket.IO room for this game
          socket.emit('joinRoom', { gameCode: response.data.gameCode, playerId, username: response.data.username });        } else {
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
          setPlayerUsername(response.data.whitePlayer);
          setOpponentUsername(response.data.blackPlayer);
          setGameStatus('started');
           // Join the Socket.IO room for this game
           socket.emit('joinRoom', { gameCode: joinGameCode, playerId, username: response.data.blackPlayer || response.data.whitePlayer });

           // Notify the opponent that you've joined
          //  socket.emit('playerJoined', { gameCode: joinGameCode, username: response.data.blackPlayer  || response.data.whitePlayer   });
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

  // console.log("game id", gameCode)

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
        {gameCode && <p>Game Code: {gameCode}</p>}
        {playerUsername && <p>Your Username: {playerUsername}</p>}
        {opponentUsername && <p>Opponent's Username: {opponentUsername}</p>}
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

          />


        )}
      </main>
    </div>
  );
};

export default OnlinePlay;
