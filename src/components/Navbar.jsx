// src/components/Navbar.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">Chess Website</div>
        <div className="hidden md:flex space-x-4">
          <Link to="/onlineplay" className="text-gray-300 hover:text-white">OnlinePlay</Link>
          <Link to="/play" className="text-gray-300 hover:text-white">Play</Link>
          <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
          <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
          <Link to="/leaderboard" className="text-gray-300 hover:text-white">Leaderboard</Link>
          <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
          <Link to="/register" className="text-gray-300 hover:text-white">Registration</Link>
          <button className="text-gray-300 hover:text-white"
            onClick={() => {
              localStorage.removeItem('authToken');
              navigate('/login');
            }}
          >LogOut</button>
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-300 hover:text-white focus:outline-none focus:text-white">
            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden" onClick={ toggleMenu}>
          <Link to="/play" className="block text-gray-300 hover:text-white px-4 py-2">Play</Link>
          <Link to="/onlineplay" className="block text-gray-300 hover:text-white px-4 py-2">OnlinePlay</Link>
          <Link to="/" className="block text-gray-300 hover:text-white px-4 py-2">Home</Link>
          <Link to="/profile" className="block text-gray-300 hover:text-white px-4 py-2">Profile</Link>
          <Link to="puzzle" className="block text-gray-300 hover:text-white px-4 py-2">LeaderBoard</Link>
          <Link to="/login" className="block text-gray-300 hover:text-white px-4 py-2">Login</Link>
          <Link to="/register" className="block text-gray-300 hover:text-white px-4 py-2">Register</Link>
          <Link to="/logout" className="block text-gray-300 hover:text-white px-4 py-2">Logout</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
