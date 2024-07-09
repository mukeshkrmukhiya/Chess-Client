import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { backendUrl } from '../components/helper';

const Register = () => {
    const [username, setUsername] = useState('');
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
            const res = await axios.post(`${backendUrl}/api/players/register`, {
                username,
                email,
                password
            });
            setIsLoading(false);
            navigate('/login');
            toast.success('Congratulations! You received a signup bonus of 700 points.');
            console.log(res.data);
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl mb-4 text-center">Register</h2>
                <div className="mb-4">
                    <label className="block mb-2">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
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
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
                {error && <div className="text-red-500 mt-4">{error}</div>}
            </form>
        </div>
    );
};

export default Register;


// import React, { useState } from 'react';
// import axios from 'axios';
// import {  useNavigate } from 'react-router-dom';
// import {backendUrl} from '../components/helper'


// const Register = () => {
//     const [username, setUsername] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const navigate = useNavigate();
//     // const backendUrl = 'https://chess-backend-kf5d.onrender.com'

    

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         try {
//             const res = await axios.post(`${backendUrl}/api/players/register`, {
//                 username,
//                 email,
//                 password
//             });
//             navigate('/login');
//             console.log(res.data);
//         } catch (err) {
//             console.error(err);
//             setError(err.response.data.message || 'Something went wrong');
//         }
//     };

//     return (
//         <div className="flex justify-center items-center h-screen bg-gray-100">
//             <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
//                 <h2 className="text-2xl mb-4 text-center">Register</h2>
//                 <div className="mb-4">
//                     <label className="block mb-2">Username</label>
//                     <input
//                         type="text"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         className="w-full p-2 border border-gray-300 rounded"
//                         required
//                     />
//                 </div>
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
//                 <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Register</button>
//                 {error && <div className="text-red-500 mt-4">{error}</div>}
//             </form>
//         </div>
//     );
// };

// export default Register;
