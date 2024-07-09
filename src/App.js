import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Play from './pages/Play';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OnlinePlay from './pages/OnlinePlay';
// import Learn from './pages/Learn';
// import About from './pages/About';
// import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Toaster />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onlineplay" element={<OnlinePlay />} />
          <Route path="/play" element={<Play />} />
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/leaderboard" element={<Play />} /> */}
          <Route path="/login" element={<Login />  } />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/learn" element={<Learn />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
