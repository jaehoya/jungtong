import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setAuthToken, getAuthToken, decodeToken } from './services/api';
import Auth from './components/Auth';
import GameSelection from './components/GameSelection';
import TimingGame from './components/TimingGame';
import FastHandGame from './components/FastHandGame';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    console.log('Token from storage:', token);
    if (token) {
      setIsAuthenticated(true);
      const decoded = decodeToken(token);
      console.log('Decoded token:', decoded);
      if (decoded && decoded.user && decoded.user.isAdmin) {
        console.log('Setting isAdmin to true');
        setIsAdmin(true);
      } else {
        console.log('Setting isAdmin to false');
        setIsAdmin(false);
      }
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="container mx-auto p-4">
          <Routes>
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/games" /> : <Auth setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route
              path="/games"
              element={isAuthenticated ? <GameSelection setIsAuthenticated={setIsAuthenticated} isAdmin={isAdmin} /> : <Navigate to="/" />}
            />
            <Route
              path="/timing-game"
              element={isAuthenticated ? <TimingGame /> : <Navigate to="/" />}
            />
            <Route
              path="/fast-hand-game"
              element={isAuthenticated ? <FastHandGame /> : <Navigate to="/" />}
            />
            <Route
              path="/leaderboard"
              element={isAuthenticated ? <Leaderboard /> : <Navigate to="/" />}
            />
            <Route
              path="/admin"
              element={isAuthenticated && isAdmin ? <AdminPanel /> : <Navigate to="/" />}
            />
            <Route path="*" element={<h1 className="text-3xl font-bold">404 Not Found</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;