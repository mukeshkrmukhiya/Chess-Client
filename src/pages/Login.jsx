import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../components/helper';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await axios.post(`${backendUrl}/api/players/login`, {
                email,
                password
            });
            localStorage.setItem('authToken', res.data.token);
            localStorage.setItem('playerId', res.data.id);
            setIsLoading(false);
            navigate('/');
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl mb-4 text-center">Login</h2>
                <div className="mb-4">
                    <label className="block mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-blue-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                {error && <div className="text-red-500 mt-4">{error}</div>}
            </form>
        </div>
    );
};

export default Login;


// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import {backendUrl} from '../components/helper'

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const navigate = useNavigate();
//     // const backendUrl = "https://chess-backend-kf5d.onrender.com";

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await axios.post(`${backendUrl}/api/players/login`, {
//                 email,
//                 password
//             });

//             localStorage.setItem('authToken', res.data.token); // Save the authentication token
//             localStorage.setItem('playerId', res.data.id); // Save the player's _id
//             console.log( res.data.id );


//             navigate('/');
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     return (
//         <div className="flex justify-center items-center h-screen bg-gray-100">
//             <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
//                 <h2 className="text-2xl mb-4 text-center">Login</h2>
//                 <div className="mb-4">
//                     <label className="block mb-2">Email</label>
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="w-full p-2 border border-gray-300 rounded"
//                         required
//                     />
//                 </div>
//                 <div className="mb-4">
//                     <label className="block mb-2">Password</label>
//                     <input
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="w-full p-2 border border-gray-300 rounded"
//                         required
//                     />
//                 </div>
//                 <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Login</button>
//             </form>
//         </div>
//     );
// };

// export default Login;
