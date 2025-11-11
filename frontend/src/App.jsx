import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import GameSelection from './components/GameSelection';
import MCPanel from './components/AdminPanel'; // Renamed import
import { getAuthToken, setAuthToken, decodeToken } from './services/api';
import { GameStateProvider } from './components/GameStateContext';
import { socket, connectSocket } from './services/socket';

function App() {
  const [token, setToken] = useState(getAuthToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser.user); // Correctly set the nested user object
        connectSocket(token);
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [token]);

  const handleSetToken = (newToken) => {
    setAuthToken(newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    handleSetToken(null);
  };

  return (
    <GameStateProvider>
      <div className="App bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
        {!token ? (
          <Auth onLogin={handleSetToken} />
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-end items-center mb-4">
              {user && <p className="mr-4">환영합니다, {user.name}님!</p>}
            </div>
            <GameSelection />
            {user && user.isAdmin && <MCPanel />}
            <div className="mt-8 text-center">
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>
    </GameStateProvider>
  );
}

export default App;