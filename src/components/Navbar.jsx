import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { BarChart3, Crown, History, Home, LogIn, LogOut, Menu, Monitor, Settings, Swords, User, UserPlus, X } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/onlineplay', label: 'Play Online', icon: Swords },
  { to: '/play', label: 'Play Computer', icon: Monitor },
  { to: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings }
];

// Provides responsive primary navigation and session controls.
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('playerId');
    setIsOpen(false);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${
      isActive
        ? 'bg-[#D4AF37] text-gray-950 shadow-lg shadow-[#D4AF37]/20'
        : 'text-[#9CA3AF] hover:bg-white/10 hover:text-[#F9FAFB]'
    }`;

  const renderLinks = () => (
    <>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={linkClass} onClick={() => setIsOpen(false)}>
          <Icon size={17} />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(212,175,55,0.18)] bg-[#111827]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37] text-gray-950 shadow-lg shadow-[#D4AF37]/20">
            <Crown size={22} />
          </span>
          <div className="leading-tight">
            <span className="block text-base font-extrabold text-[#F9FAFB] sm:text-lg">Mukhiya Chess</span>
            <span className="hidden text-xs font-medium text-[#9CA3AF] sm:block">Luxury Dark Arena</span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">{renderLinks()}</div>

        <div className="hidden items-center gap-2 lg:flex">
          <NavLink to="/login" className={linkClass}>
            <LogIn size={17} />
            <span>Login</span>
          </NavLink>
          <NavLink to="/register" className={linkClass}>
            <UserPlus size={17} />
            <span>Register</span>
          </NavLink>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-[#9CA3AF] hover:bg-white/10 hover:text-[#F9FAFB]">
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>

        <button
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(212,175,55,0.18)] text-[#F9FAFB] lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-[rgba(212,175,55,0.18)] bg-[#111827] px-4 pb-5 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2 py-4 sm:grid-cols-2">
            {renderLinks()}
            <NavLink to="/login" className={linkClass} onClick={() => setIsOpen(false)}>
              <LogIn size={17} />
              <span>Login</span>
            </NavLink>
            <NavLink to="/register" className={linkClass} onClick={() => setIsOpen(false)}>
              <UserPlus size={17} />
              <span>Register</span>
            </NavLink>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-[#9CA3AF] hover:bg-white/10 hover:text-[#F9FAFB]">
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
