import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate ();
    const backendUrl = "https://chess-backend-kf5d.onrender.com";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No authentication token found. Please log in.');
                    return;
                }
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.get(`${backendUrl}/api/players/profile`, config);
                setProfile(response.data);
            // console.log( localStorage.getItem('playerId') );
            // console.log( response.data._id );


            } catch (err) {
                setError('Failed to fetch profile data');
                console.error('Error fetching profile:', err.response ? err.response.data : err.message);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl mb-4 text-center">Profile</h2>
                {profile ? (
                    <div>
                        <p><strong>Username:</strong> {profile.username}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                        <button 
                            onClick={handleLogout} 
                            className="w-full bg-red-500 text-white py-2 rounded mt-4">
                            Logout
                        </button>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default Profile;
