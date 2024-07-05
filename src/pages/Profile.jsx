// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { backendUrl  } from '../components/helper';

// const Profile = () => {
//     const [profile, setProfile] = useState(null);
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(true);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchProfile = async () => {
//             setIsLoading(true);
//             setError('');
//             try {
//                 const token = localStorage.getItem('authToken');
//                 if (!token) {
//                     setError('No authentication token found. Please log in.');
//                     setIsLoading(false);
//                     return;
//                 }
//                 const config = {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 };
//                 const response = await axios.get(`${backendUrl}/api/players/profile`, config);
//                 setProfile(response.data);
//             } catch (err) {
//                 setError(err.response?.data?.message || 'Failed to fetch profile data');
//                 console.error('Error fetching profile:', err.response ? err.response.data : err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchProfile();
//     }, []);

//     const handleLogout = () => {
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('playerId');
//         navigate('/login');
//     };

//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-gray-100">
//                 <div className="text-xl">Loading...</div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex justify-center items-center h-screen bg-gray-100">
//                 <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
//                     <div className="text-red-500 text-center">{error}</div>
//                     <button
//                         onClick={() => navigate('/login')}
//                         className="w-full bg-blue-500 text-white py-2 rounded mt-4"
//                     >
//                         Go to Login
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex justify-center items-center h-screen bg-gray-100">
//             <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
//                 <h2 className="text-2xl mb-4 text-center">Profile</h2>
//                 {profile && (
//                     <div>
//                         <p className="mb-2"><strong>Username:</strong> {profile.username}</p>
//                         <p className="mb-2"><strong>Email:</strong> {profile.email}</p>
//                         <p className="mb-2"><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
//                         <button
//                             onClick={handleLogout}
//                             className="w-full bg-red-500 text-white py-2 rounded mt-4 hover:bg-red-600 transition-colors"
//                         >
//                             Logout
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Profile;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserCircle, Mail, Award, Calendar, LogOut, Check, X } from 'lucide-react';
import { backendUrl } from '../components/helper';
import { FaChess } from "react-icons/fa";

const Profile = () => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const profileResponse = await axios.get(`${backendUrl}/api/players/profile`, config);
        console.log(profileResponse);
        setPlayer(profileResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        console.error('Error fetching data:', err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('playerId');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <div className="text-red-500 text-center mb-4">{error}</div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-900">Player Profile</h2>
        </div>
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'games' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('games')}
          >
            Game History
          </button>
        </div>
        {activeTab === 'profile' && (
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {player.profilePicture ? (
                  <img
                    src={player.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-32 h-32 text-gray-400" />
                )}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">{player.username}</h2>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{player.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Award className="w-5 h-5 text-yellow-500" />
                <span>{player.points || 0} points</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Joined: {new Date(player.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={handleLogout}
                className="mt-6 flex items-center space-x-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
        {activeTab === 'games' && (
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-xl font-semibold mb-4">Game History</h3>
            {player.games.length === 0 ? (
              <p className="text-gray-500 text-center">No games played yet.</p>
            ) : (
              <div className="space-y-4">
                {player.games.map((game) => (
                  <div key={game._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FaChess className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-semibold">
                          {player.username} vs {game.opponent}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(game.date).toLocaleDateString()} {new Date(game.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {game.outcome === 'win' && <Check className="w-6 h-6 text-green-500" />}
                      {game.outcome === 'lose' && <X className="w-6 h-6 text-red-500" />}
                      {game.outcome === 'draw' && <span className="text-yellow-500">=</span>}
                      <span className={`font-semibold ${game.outcome === 'win' ? 'text-green-500' :
                          game.outcome === 'lose' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                        {game.outcome.charAt(0).toUpperCase() + game.outcome.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;