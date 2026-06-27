import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, BarChart3, Brain, Crown, Gauge, Globe2, ShieldCheck, Sparkles, Swords, Trophy } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageShell from '../components/ui/PageShell';

const features = [
  { icon: Globe2, title: 'Online Rooms', text: 'Create, join, or search for a live opponent with clean real-time status.' },
  { icon: Brain, title: 'Focused Practice', text: 'Play locally with names, clocks, promotion dialogs, and polished board feedback.' },
  { icon: ShieldCheck, title: 'Secure Profiles', text: 'JWT authentication, protected profile data, points, and match history.' },
  { icon: BarChart3, title: 'Progress Tracking', text: 'Review outcomes, opponents, colors, and rating-style points from your profile.' }
];

const stats = [
  ['700', 'Signup bonus points'],
  ['3', 'Rapid time controls'],
  ['24/7', 'Private room play'],
  ['100%', 'Responsive layout']
];

const steps = [
  'Create an account and claim your starting points.',
  'Choose online matchmaking or focused local play.',
  'Finish games to build history and climb the board.'
];

const modes = [
  { icon: Swords, title: 'Play Online', text: 'Create a room, share a code, or find a random opponent.', to: '/onlineplay' },
  { icon: Gauge, title: 'Play Computer', text: 'Use the local board experience for focused practice sessions.', to: '/play' },
  { icon: Trophy, title: 'Leaderboard', text: 'Compare player points and recent competitive momentum.', to: '/leaderboard' }
];

const testimonials = [
  ['Aarav S.', 'The board finally feels like a serious chess room. Fast, quiet, and beautiful.'],
  ['Neha K.', 'Creating a match and sharing the code is effortless on mobile.'],
  ['Rohan M.', 'The profile and history views make every game feel meaningful.']
];

// Builds the premium homepage sections requested in the brief.
function Home() {
  return (
    <PageShell className="overflow-hidden">
      <section className="grid min-h-[calc(100vh-7rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-2 text-sm font-semibold text-[#D4AF37]">
            <Sparkles size={16} />
            Premium chess platform
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight text-[#F9FAFB] sm:text-6xl lg:text-7xl">
              Mukhiya Chess
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#9CA3AF]">
              A luxury dark chess arena for online battles, focused practice, player profiles, and match history.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to="/onlineplay">
              Play Online <ArrowRight size={18} />
            </Button>
            <Button to="/play" variant="secondary">
              Practice Locally
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <Card className="p-4">
            <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)]">
              {Array.from({ length: 64 }).map((_, index) => {
                const row = Math.floor(index / 8);
                const col = index % 8;
                const isDark = (row + col) % 2 === 1;
                const pieces = { 3: '♜', 4: '♚', 11: '♞', 28: '♕', 36: '♙', 51: '♘', 59: '♔', 60: '♖' };
                return (
                  <div key={index} className={`flex items-center justify-center text-3xl sm:text-5xl ${isDark ? 'bg-[#7D6A2E]' : 'bg-[#E8D8A0]'} ${pieces[index] ? 'text-gray-950' : ''}`}>
                    {pieces[index]}
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </section>

      <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([value, label]) => (
          <Card key={label} className="p-6">
            <p className="text-3xl font-extrabold text-[#D4AF37]">{value}</p>
            <p className="mt-2 text-sm text-[#9CA3AF]">{label}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Why Choose Mukhiya Chess</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Built for serious play without losing elegance.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-6">
              <Icon className="h-8 w-8 text-[#D4AF37]" />
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#9CA3AF]">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 py-14 lg:grid-cols-3">
        <Card className="p-8 lg:col-span-1">
          <Activity className="h-8 w-8 text-[#22C55E]" />
          <h2 className="mt-4 text-3xl font-bold">How It Works</h2>
          <ol className="mt-6 space-y-4 text-[#9CA3AF]">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-sm font-bold text-gray-950">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          {modes.map(({ icon: Icon, title, text, to }) => (
            <Link key={title} to={to} className="luxury-panel group rounded-2xl p-6 hover:-translate-y-1 hover:border-[#D4AF37]">
              <Icon className="h-8 w-8 text-[#D4AF37]" />
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#9CA3AF]">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
                Open mode <ArrowRight size={16} className="group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-14 lg:grid-cols-3">
        {testimonials.map(([name, quote]) => (
          <Card key={name} className="p-6">
            <p className="text-base leading-7 text-[#F9FAFB]">"{quote}"</p>
            <p className="mt-5 text-sm font-semibold text-[#D4AF37]">{name}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-8">
          <Crown className="h-10 w-10 text-[#D4AF37]" />
          <h2 className="mt-5 text-3xl font-bold">Developer Section</h2>
          <p className="mt-4 leading-7 text-[#9CA3AF]">
            Designed as a clean full-stack chess product with protected routes, real-time rooms, reusable UI components, and a maintainable Express API.
          </p>
        </Card>
        <Card className="flex flex-col justify-between p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Call To Action</p>
            <h2 className="mt-3 text-4xl font-extrabold">Make your next move feel premium.</h2>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/register">Create Account</Button>
            <Button to="/leaderboard" variant="secondary">View Leaderboard</Button>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}

export default Home;
