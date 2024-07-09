// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { backendUrl } from '../components/helper';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setIsLoading(true);
//         try {
//             const res = await axios.post(`${backendUrl}/api/players/login`, {
//                 email,
//                 password
//             });
//             localStorage.setItem('authToken', res.data.token);
//             localStorage.setItem('playerId', res.data.id);
//             setIsLoading(false);
//             navigate('/');
//         } catch (err) {
//             setIsLoading(false);
//             console.error(err);
//             setError(err.response?.data?.message || 'Invalid credentials');
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
//                 <button 
//                     type="submit" 
//                     className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-blue-300"
//                     disabled={isLoading}
//                 >
//                     {isLoading ? 'Logging in...' : 'Login'}
//                 </button>
//                 {error && <div className="text-red-500 mt-4">{error}</div>}
//             </form>
//         </div>
//     );
// };

// export default Login;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../components/helper';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post(`${backendUrl}/api/players/login`, {
                email,
                password
            });
            localStorage.setItem('authToken', res.data.token);
            localStorage.setItem('playerId', res.data.id);
            toast.success('Login successful!', {
                style: {
                    border: '1px solid #4caf50',
                    padding: '16px',
                    color: '#4caf50',
                },
                iconTheme: {
                    primary: '#4caf50',
                    secondary: '#FFFAEE',
                },
            });
            setIsLoading(false);
            navigate('/');
        } catch (err) {
            setIsLoading(false);
            const errorMsg = err.response?.data?.message || 'Invalid credentials';
            setError(err.response?.data?.message || 'Invalid credentials');
            toast.error(errorMsg, {
                style: {
                    border: '1px solid #f44336',
                    padding: '16px',
                    color: '#f44336',
                },
                iconTheme: {
                    primary: '#f44336',
                    secondary: '#FFFAEE',
                },
            });
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl mb-4 text-center text-gray-700 font-semibold">Login</h2>
                <div className="mb-4">
                    <label className="block mb-2 text-gray-600">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-gray-600">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                        required
                    />
                </div>
                {error && <div className="text-red-500 mt-4">{error}</div>}
                <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
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
