import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Copy, Loader2, Plus, Search, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import OnlineChessBoard from '../components/OnlineChessBoard';
import { backendUrl } from '../components/helper';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageShell from '../components/ui/PageShell';

const socket = io(backendUrl);
const timeControls = [10, 15, 30];

// Manages online lobby creation, joining, and matchmaking.
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
  const [isSearchingRandom, setIsSearchingRandom] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId && token) {
      setPlayerId(storedPlayerId);
    } else {
      toast.error('Please login to play online.');
      navigate('/login');
    }

    socket.on('gameState', ({ players, currentTurn }) => {
      setCurrentTurn(currentTurn);
      const player = players.find((entry) => entry.id === playerId);
      const opponent = players.find((entry) => entry.id !== playerId);

      if (player) {
        setPlayerUsername(player.username);
        setPlayerColor(player.color);
        if (opponent) {
          setOpponentUsername(opponent.username);
          setGameStatus('started');
          setGameStarted(true);
          setSearchStatus('');
        }
      }
    });

    socket.on('opponentJoined', () => {
      setSearchStatus('Opponent joined. Starting game...');
      toast.success('Opponent joined. Starting game...');
    });

    return () => {
      socket.off('gameState');
      socket.off('opponentJoined');
    };
  }, [navigate, playerId]);

  const handleRandomMatch = async () => {
    if (!playerId || !selectedTime) {
      setError('Please select a time control before searching.');
      toast.error('Please select a time control before searching.');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsSearchingRandom(true);
    setSearchStatus('Searching for an opponent...');

    try {
      const response = await axios.post(`${backendUrl}/api/games/random-match`, { playerId, timeControl: selectedTime });
      if (!response.data?.gameCode) throw new Error('Invalid response from server');

      setGameCode(response.data.gameCode);
      setPlayerUsername(response.data.username);
      setPlayerColor(response.data.color);
      setSearchStatus('Game found. Waiting for opponent...');
      socket.emit('joinRoom', { gameCode: response.data.gameCode, playerId, username: response.data.username });
      toast.success('Game found. Waiting for opponent...');
    } catch (err) {
      setError('Failed to join random game. Please try again.');
      setSearchStatus('');
      toast.error('Failed to join random game. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSearchingRandom(false);
    }
  };

  const handleCreateGame = async () => {
    if (!playerId || !selectedTime) {
      setError('Please select a time before creating a game.');
      toast.error('Please select a time before creating a game.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${backendUrl}/api/games/create`, { playerId, timeControl: selectedTime });
      if (!response.data?.gameCode) throw new Error('Invalid response from server');

      setGameCode(response.data.gameCode);
      setPlayerUsername(response.data.username);
      setGameStatus('waiting');
      setGameStarted(true);
      socket.emit('joinRoom', { gameCode: response.data.gameCode, playerId, username: response.data.username });
      toast.success('Game created successfully.');
    } catch (err) {
      setError('Failed to create game. Please try again.');
      toast.error('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinGameCode || !playerId) {
      setError('Please enter a valid game code.');
      toast.error('Please enter a valid game code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${backendUrl}/api/games/join`, { gameCode: joinGameCode, playerId });
      if (!response.data?.game) throw new Error('Invalid response from server');

      setGameCode(joinGameCode);
      setGameInfo(response.data.game);
      setSelectedTime(response.data.game.timeControl);
      setPlayerUsername(response.data.blackPlayer);
      setOpponentUsername(response.data.whitePlayer);
      setGameStatus('started');
      setGameStarted(true);
      setPlayerColor(response.data.whitePlayerId === playerId ? 'white' : 'black');
      socket.emit('joinRoom', { gameCode: joinGameCode, playerId, username: response.data.blackPlayer });
      toast.success('Joined game successfully.');
    } catch (err) {
      setError('Failed to join game. Please try again.');
      toast.error('Failed to join game. Please try again.');
    } finally {
      setIsLoading(false);
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
        toast.success('Game code copied.');
      })
      .catch(() => {
        setError('Failed to copy game code. Please try again.');
        toast.error('Failed to copy game code. Please try again.');
      });
  };

  if (gameStarted) {
    return (
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
        currentTurn={currentTurn}
      />
    );
  }

  return (
    <PageShell>
      <div className="mb-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-2 text-sm font-semibold text-[#D4AF37]">
          <Swords size={16} /> Play Online
        </p>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Create a room or find a rival.</h1>
        <p className="mt-3 max-w-2xl text-[#9CA3AF]">Choose a time control, start a private game, or jump into random matchmaking.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <h2 className="text-2xl font-bold">Time Control</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {timeControls.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-2xl border px-4 py-4 text-left font-bold ${selectedTime === time ? 'border-[#D4AF37] bg-[#D4AF37] text-gray-950' : 'border-[rgba(212,175,55,0.18)] bg-white/5 text-[#F9FAFB] hover:border-[#D4AF37]'}`}
              >
                {time} minutes
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button onClick={handleCreateGame} disabled={isLoading || !selectedTime}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={18} />}
              Create Game
            </Button>
            <Button onClick={handleRandomMatch} variant="secondary" disabled={isLoading || !selectedTime || isSearchingRandom}>
              {isSearchingRandom ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={18} />}
              Random Opponent
            </Button>
          </div>
          {searchStatus && <p className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">{searchStatus}</p>}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold">Join Game</h2>
          <p className="mt-2 text-sm text-[#9CA3AF]">Paste a private room code from another player.</p>
          <input
            type="text"
            value={joinGameCode}
            onChange={(event) => setJoinGameCode(event.target.value)}
            placeholder="Enter game code"
            className="mt-5 w-full rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none placeholder:text-[#9CA3AF]"
          />
          <Button onClick={handleJoinGame} className="mt-4 w-full" disabled={isLoading || !joinGameCode}>
            Join Game
          </Button>
          {gameCode && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 p-3">
              <span className="font-mono text-sm text-[#D4AF37]">{gameCode}</span>
              <button onClick={copyGameCode} disabled={copyButtonDisabled} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold">
                <Copy size={15} /> {copyButtonText}
              </button>
            </div>
          )}
          {error && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        </Card>
      </div>
    </PageShell>
  );
};

export default OnlinePlay;
