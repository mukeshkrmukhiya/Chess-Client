// src/components/Navbar.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, User, LogIn, UserPlus, LogOut, Gamepad2 } from 'lucide-react';
import { FaChess } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
    >
      <Icon size={18} />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start sm:items-stretch">
            <Link to="/" className="flex-shrink-0 flex items-center text-gray-300 hover:text-white ">
              <FaChess className="h-8 w-8 " />
              <span className="text-xl font-bold ml-2 sm:hidden lg:block">MukhiyaChessApp</span>
            </Link>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                <NavItem to="/" icon={Home}>Home</NavItem>
                <NavItem to="/onlineplay" icon={Gamepad2}>Online Play</NavItem>
                <NavItem to="/play" icon={Gamepad2}>Offline Play</NavItem>
                <NavItem to="/profile" icon={User}>Profile</NavItem>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="hidden sm:flex space-x-2">
              <NavItem to="/login" icon={LogIn}>Login</NavItem>
              <NavItem to="/register" icon={UserPlus}>Register</NavItem>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
            {/* Mobile menu button */}
            <div className="flex sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={toggleMenu}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <NavItem to="/" icon={Home}>Home</NavItem>
          <NavItem to="/onlineplay" icon={Gamepad2}>Online Play</NavItem>
          <NavItem to="/play" icon={Gamepad2}>Offline Play</NavItem>
          <NavItem to="/profile" icon={User}>Profile</NavItem>
          <NavItem to="/login" icon={LogIn}>Login</NavItem>
          <NavItem to="/register" icon={UserPlus}>Register</NavItem>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const navigate = useNavigate();

//   const toggleMenu = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <nav className="bg-gray-800 p-4">
//       <div className="container mx-auto flex justify-between items-center">
//         <div className="text-white text-2xl font-bold">MukhiyaChessApp</div>
//         <div className="hidden md:flex space-x-4">
//           <Link to="/onlineplay" className="text-gray-300 hover:text-white">OnlinePlay</Link>
//           <Link to="/play" className="text-gray-300 hover:text-white">OfflinePlay</Link>
//           <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
//           <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
//           {/* <Link to="/leaderboard" className="text-gray-300 hover:text-white">Leaderboard</Link> */}
//           <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
//           <Link to="/register" className="text-gray-300 hover:text-white">Registration</Link>
//           <button className="text-gray-300 hover:text-white"
//             onClick={() => {
//               localStorage.removeItem('authToken');
//               navigate('/login');
//             }}
//           >LogOut</button>
//         </div>
//         <div className="md:hidden">
//           <button onClick={toggleMenu} className="text-gray-300 hover:text-white focus:outline-none focus:text-white">
//             <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
//               <path d="M4 6h16M4 12h16m-7 6h7" />
//             </svg>
//           </button>
//         </div>
//       </div>
//       {isOpen && (
//         <div className="md:hidden" onClick={ toggleMenu}>
//           <Link to="/play" className="block text-gray-300 hover:text-white px-4 py-2">OfflinePlay</Link>
//           <Link to="/onlineplay" className="block text-gray-300 hover:text-white px-4 py-2">OnlinePlay</Link>
//           <Link to="/" className="block text-gray-300 hover:text-white px-4 py-2">Home</Link>
//           <Link to="/profile" className="block text-gray-300 hover:text-white px-4 py-2">Profile</Link>
//           {/* <Link to="puzzle" className="block text-gray-300 hover:text-white px-4 py-2">LeaderBoard</Link> */}
//           <Link to="/login" className="block text-gray-300 hover:text-white px-4 py-2">Login</Link>
//           <Link to="/register" className="block text-gray-300 hover:text-white px-4 py-2">Register</Link>
//           <Link to="/logout" className="block text-gray-300 hover:text-white px-4 py-2">Logout</Link>
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Navbar;
