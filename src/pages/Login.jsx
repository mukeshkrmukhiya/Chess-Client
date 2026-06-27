import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendUrl } from '../components/helper';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageShell from '../components/ui/PageShell';
import { getFriendlyErrorMessage } from '../utils/userMessages';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Handles player sign-in and local session persistence.
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/players/login`, { email, password });
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('playerId', response.data.id);
      toast.success('Welcome back to Mukhiya Chess.');
      navigate('/');
    } catch (err) {
      const message = getFriendlyErrorMessage(err, 'Email or password is incorrect.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/players/google`, { credential });
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('playerId', response.data.id);
      toast.success('Signed in with Google.');
      navigate('/');
    } catch (err) {
      const message = getFriendlyErrorMessage(err, 'Google sign-in could not be completed.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="grid min-h-[calc(100vh-12rem)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-2 text-sm font-semibold text-[#D4AF37]">
            <Shield size={16} /> Secure player access
          </span>
          <h1 className="text-4xl font-extrabold sm:text-6xl">Return to your arena.</h1>
          <p className="max-w-xl text-lg leading-8 text-[#9CA3AF]">
            Sign in to create rooms, track points, review match history, and continue building your chess profile.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold">Login</h2>
              <p className="mt-2 text-sm text-[#9CA3AF]">Use your registered email and password.</p>
            </div>
            <label className="block text-sm font-semibold text-[#F9FAFB]">
              Email
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3">
                <Mail size={18} className="text-[#D4AF37]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent text-[#F9FAFB] outline-none placeholder:text-[#9CA3AF]"
                  placeholder="you@example.com"
                  required
                />
              </span>
            </label>
            <label className="block text-sm font-semibold text-[#F9FAFB]">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none placeholder:text-[#9CA3AF]"
                placeholder="Enter your password"
                required
              />
            </label>
            {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn size={18} />
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="relative py-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
              or
            </div>
            {googleClientId ? (
              <div className="overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white p-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    const message = 'Google sign-in could not be completed.';
                    setError(message);
                    toast.error(message);
                  }}
                  theme="filled_black"
                  shape="pill"
                  width="100%"
                />
              </div>
            ) : (
              <p className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3 text-center text-sm text-[#9CA3AF]">
                Google sign-in is not configured yet.
              </p>
            )}
            <p className="text-center text-sm text-[#9CA3AF]">
              New here? <Link to="/register" className="font-semibold text-[#D4AF37] hover:text-[#B8941F]">Create an account</Link>
            </p>
          </form>
        </Card>
      </div>
    </PageShell>
  );
};

export default Login;
