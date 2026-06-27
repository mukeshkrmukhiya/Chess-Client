import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Github, ShieldCheck } from 'lucide-react';

const footerLinks = [
  { label: 'Play Online', to: '/onlineplay' },
  { label: 'Play Computer', to: '/play' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Settings', to: '/settings' }
];

// Displays global product links and trust signals.
const Footer = () => (
  <footer className="border-t border-[rgba(212,175,55,0.18)] bg-[#111827]/95 px-4 py-8 text-[#9CA3AF]">
    <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D4AF37] text-gray-950">
          <Crown size={20} />
        </span>
        <div>
          <p className="font-semibold text-[#F9FAFB]">Mukhiya Chess</p>
          <p className="text-sm">Premium chess play, built for focus.</p>
        </div>
      </div>
      <nav className="flex flex-wrap gap-4 text-sm" aria-label="Footer navigation">
        {footerLinks.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-[#D4AF37]">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Secure play</span>
        <span className="inline-flex items-center gap-2"><Github size={16} /> 2026</span>
      </div>
    </div>
  </footer>
);

export default Footer;
