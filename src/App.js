import React, { Suspense, lazy } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import LoadingScreen from './components/ui/LoadingScreen';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const Play = lazy(() => import('./pages/Play'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const OnlinePlay = lazy(() => import('./pages/OnlinePlay'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const MatchHistory = lazy(() => import('./pages/MatchHistory'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Configures routes, lazy loading, and global platform chrome.
function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB]">
        <Navbar />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
              border: '1px solid rgba(212,175,55,0.18)',
              borderRadius: '16px'
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#111827' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#111827' } }
          }}
        />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onlineplay" element={<OnlinePlay />} />
            <Route path="/play" element={<Play />} />
            <Route path="/computer" element={<Play />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<MatchHistory />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  if (!googleClientId) {
    return <AppContent />;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

export default App;
