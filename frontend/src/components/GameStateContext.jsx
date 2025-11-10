import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { socket } from '../services/socket'; // 1. 중앙 소켓 임포트

const GameStateContext = createContext();

export const useGameState = () => {
  return useContext(GameStateContext);
};

export const GameStateProvider = ({ children }) => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // 2. 중앙 소켓을 사용하여 gameStateUpdate 이벤트 수신
    const handleGameStateUpdate = (newGameState) => {
      console.log('GameState updated:', newGameState);
      setGameState(newGameState);
    };

    socket.on('gameStateUpdate', handleGameStateUpdate);

    // 서버는 연결 시 자동으로 초기 gameState를 보내주므로,
    // 별도의 HTTP fetch는 더 이상 필요 없습니다.

    // 3. 컴포넌트 언마운트 시 리스너 정리
    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
    };
  }, []);

  // 이 함수는 더 이상 외부에서 직접 호출할 필요가 없을 수 있지만,
  // 다른 컴포넌트와의 호환성을 위해 일단 유지합니다.
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
