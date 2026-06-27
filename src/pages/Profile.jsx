import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Award, Calendar, History, LogOut, Mail, Trophy, UserCircle } from 'lucide-react';
import { backendUrl } from '../components/helper';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingScreen from '../components/ui/LoadingScreen';
import PageShell from '../components/ui/PageShell';
import { getFriendlyErrorMessage } from '../utils/userMessages';

// Fetches and displays the authenticated player's profile.
const Profile = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found. Please log in.');
          return;
        }

        const response = await axios.get(`${backendUrl}/api/players/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlayer(response.data);
      } catch (err) {
        setError(getFriendlyErrorMessage(err, 'We could not load your profile. Please sign in again.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('playerId');
    navigate('/login');
  };

  if (loading) return <LoadingScreen label="Loading profile" />;

  if (error) {
    return (
      <PageShell>
        <Card className="mx-auto max-w-md p-8 text-center">
          <p className="text-red-200">{error}</p>
          <Button to="/login" className="mt-6 w-full">Go to Login</Button>
        </Card>
      </PageShell>
    );
  }

  const games = player?.games || [];
  const wins = games.filter((game) => game.outcome === 'win').length;

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-8">
          <div className="flex flex-col items-center text-center">
            <UserCircle className="h-28 w-28 text-[#D4AF37]" />
            <h1 className="mt-4 text-3xl font-extrabold">{player.username}</h1>
            <p className="mt-2 flex items-center gap-2 text-[#9CA3AF]"><Mail size={16} /> {player.email}</p>
            <Button variant="danger" onClick={handleLogout} className="mt-8">
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <Award className="h-8 w-8 text-[#D4AF37]" />
            <p className="mt-4 text-3xl font-extrabold">{player.points || 0}</p>
            <p className="text-sm text-[#9CA3AF]">Points</p>
          </Card>
          <Card className="p-6">
            <History className="h-8 w-8 text-[#D4AF37]" />
            <p className="mt-4 text-3xl font-extrabold">{games.length}</p>
            <p className="text-sm text-[#9CA3AF]">Matches</p>
          </Card>
          <Card className="p-6">
            <Trophy className="h-8 w-8 text-[#D4AF37]" />
            <p className="mt-4 text-3xl font-extrabold">{wins}</p>
            <p className="text-sm text-[#9CA3AF]">Wins</p>
          </Card>
          <Card className="p-6 sm:col-span-3">
            <p className="flex items-center gap-2 text-[#9CA3AF]">
              <Calendar size={18} className="text-[#D4AF37]" />
              Joined {new Date(player.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button to="/history">View Match History</Button>
              <Button to="/leaderboard" variant="secondary">Open Leaderboard</Button>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
};

export default Profile;
