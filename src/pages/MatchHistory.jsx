import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, Swords } from 'lucide-react';
import { backendUrl } from '../components/helper';
import Card from '../components/ui/Card';
import LoadingScreen from '../components/ui/LoadingScreen';
import PageShell from '../components/ui/PageShell';
import { getFriendlyErrorMessage } from '../utils/userMessages';

// Shows match history from the authenticated player's profile.
const MatchHistory = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${backendUrl}/api/players/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGames(response.data.games || []);
      } catch (err) {
        setError(getFriendlyErrorMessage(err, 'We could not load your match history.'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <LoadingScreen label="Loading match history" />;

  return (
    <PageShell>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Match History</p>
        <h1 className="mt-3 text-4xl font-extrabold">Your recent games</h1>
      </div>
      <Card className="p-4">
        {error ? (
          <p className="p-4 text-red-200">{error}</p>
        ) : games.length === 0 ? (
          <div className="p-8 text-center text-[#9CA3AF]">
            <History className="mx-auto mb-4 h-10 w-10 text-[#D4AF37]" />
            No completed games yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {games.map((game) => (
              <div key={game._id || `${game.opponent}-${game.date}`} className="grid gap-4 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <Swords className="h-7 w-7 text-[#D4AF37]" />
                <div>
                  <p className="font-bold">vs {game.opponent || 'Unknown opponent'}</p>
                  <p className="text-sm text-[#9CA3AF]">{game.color} pieces • {new Date(game.date).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                  game.outcome === 'win' ? 'bg-green-500/15 text-green-300' : game.outcome === 'lose' ? 'bg-red-500/15 text-red-300' : 'bg-[#D4AF37]/15 text-[#D4AF37]'
                }`}>
                  {game.outcome}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
};

export default MatchHistory;
