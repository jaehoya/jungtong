import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import io from 'socket.io-client';

const GameStateContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const useGameState = () => {
  return useContext(GameStateContext);
};

export const GameStateProvider = ({ children }) => {
  const [gameState, setGameState] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    newSocket.on('gameStateUpdate', (newGameState) => {
      setGameState(newGameState);
    });

    // Fetch initial state via HTTP as a fallback
    fetch(`${API_BASE_URL}/game/state`)
      .then(res => res.json())
      .then(data => setGameState(data))
      .catch(err => console.error('Failed to fetch initial game state:', err));

    return () => newSocket.close();
  }, []);

  const updateGameState = useCallback((newGameState) => {
    setGameState(newGameState);
  }, []);

  const value = {
    gameState,
    updateGameState,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};
