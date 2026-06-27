import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Medal, Trophy } from 'lucide-react';
import { backendUrl } from '../components/helper';
import Card from '../components/ui/Card';
import LoadingScreen from '../components/ui/LoadingScreen';
import PageShell from '../components/ui/PageShell';
import { getFriendlyErrorMessage } from '../utils/userMessages';

// Loads top players from the API and ranks them by points.
const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/players/leaderboard`);
        setPlayers(response.data.players || []);
      } catch (err) {
        setError(getFriendlyErrorMessage(err, 'We could not load the leaderboard right now.'));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <LoadingScreen label="Loading leaderboard" />;

  return (
    <PageShell>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Leaderboard</p>
        <h1 className="mt-3 text-4xl font-extrabold">Top Mukhiya Chess players</h1>
      </div>
      <Card className="overflow-hidden">
        {error ? (
          <p className="p-6 text-red-200">{error}</p>
        ) : (
          <div className="divide-y divide-[rgba(212,175,55,0.18)]">
            {players.map((player, index) => (
              <div key={player._id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-[#D4AF37]">
                  {index < 3 ? <Trophy size={20} /> : <Medal size={20} />}
                </span>
                <div>
                  <p className="font-bold text-[#F9FAFB]">{player.username}</p>
                  <p className="text-sm text-[#9CA3AF]">{player.gamesPlayed} matches played</p>
                </div>
                <p className="text-xl font-extrabold text-[#D4AF37]">{player.points}</p>
              </div>
            ))}
            {players.length === 0 && <p className="p-6 text-[#9CA3AF]">No players found yet.</p>}
          </div>
        )}
      </Card>
    </PageShell>
  );
};

export default Leaderboard;
