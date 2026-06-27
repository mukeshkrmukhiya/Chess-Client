import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { backendUrl } from '../components/helper';
import { getFriendlyErrorMessage } from '../utils/userMessages';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  GoogleLogin
} from '@react-oauth/google';
import PageShell from '../components/ui/PageShell';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
// Registers a new player and awards the starting bonus.
const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axios.post(`${backendUrl}/api/players/register`, { username, email, password });
      toast.success('Signup complete. You received 700 starting points.');
      navigate('/login');
    } catch (err) {
      const message = getFriendlyErrorMessage(err, 'Please check your details and try again.');
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
      toast.success('Signed up with Google.');
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
      <div className="grid min-h-[calc(100vh-12rem)] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Register</h1>
              <p className="mt-2 text-sm text-[#9CA3AF]">Create your player identity.</p>
            </div>
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none placeholder:text-[#9CA3AF]" placeholder="Username" required />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none placeholder:text-[#9CA3AF]" placeholder="Email" required />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3 text-[#F9FAFB] outline-none placeholder:text-[#9CA3AF]" placeholder="Password" required />
            {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <UserPlus size={18} />
              {isLoading ? 'Registering...' : 'Create Account'}
            </Button>

            <div className="relative py-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
              or
            </div>
            {googleClientId ? (
              <div className="overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#D4AF37] p-2">

                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    const message = 'Google Registration could not be completed.';
                    setError(message);
                    toast.error(message);
                  }}
                  theme="filled_black"
                  shape="pill"
                  width="100%"
                  size="large"
                  text="signup_with"
                />

              </div>
            ) : (
              <p className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-3 text-center text-sm text-[#9CA3AF]">
                Google Registration is not configured yet.
              </p>
            )}
            <p className="text-center text-sm text-[#9CA3AF]">
              Already registered? <Link to="/login" className="font-semibold text-[#D4AF37] hover:text-[#B8941F]">Sign in</Link>
            </p>
          </form>
        </Card>
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.18)] bg-white/5 px-4 py-2 text-sm font-semibold text-[#D4AF37]">
            <Gift size={16} /> 700 point bonus
          </span>
          <h2 className="text-4xl font-extrabold sm:text-6xl">Start with a polished profile.</h2>
          <p className="max-w-xl text-lg leading-8 text-[#9CA3AF]">
            Your account unlocks protected profile data, point tracking, online rooms, and match history.
          </p>

        </div>
      </div>
    </PageShell>
  );
};

export default Register;
