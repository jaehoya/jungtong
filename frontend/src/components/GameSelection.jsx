import React, { useState } from 'react';
import TimingGame from './TimingGame';
import FastHandGame from './FastHandGame';
import Leaderboard from './Leaderboard';
import { useGameState } from './GameStateContext';

const GameSelection = () => {
  const { gameState } = useGameState();
  const [selectedGame, setSelectedGame] = useState(null);
  const [viewingLeaderboard, setViewingLeaderboard] = useState(null);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setViewingLeaderboard(null);
  };

  const handleShowLeaderboard = (game) => {
    setViewingLeaderboard(game);
    setSelectedGame(null);
  };

  const handleBack = () => {
    setSelectedGame(null);
    setViewingLeaderboard(null);
  };

  if (!gameState) {
    return <div>Loading games...</div>;
  }

  if (selectedGame) {
    const gameComponents = {
      timingGame: <TimingGame onBack={handleBack} />,
      fastHandGame: <FastHandGame onBack={handleBack} />,
    };
    return gameComponents[selectedGame];
  }

  if (viewingLeaderboard) {
    return <Leaderboard gameType={viewingLeaderboard} onBack={handleBack} />;
  }

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6">게임 선택</h2>
      <div className="space-y-4">
        {gameState.timingGame.isVisible && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-2xl mb-2">지금이니?!</h3>
            <button onClick={() => handleGameSelect('timingGame')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
              게임 시작
            </button>
            <button onClick={() => handleShowLeaderboard('timingGame')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              리더보드 보기
            </button>
          </div>
        )}
        {gameState.fastHandGame.isVisible && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-2xl mb-2">손 빠르니??</h3>
            <button onClick={() => handleGameSelect('fastHandGame')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
              게임 시작
            </button>
            <button onClick={() => handleShowLeaderboard('fastHandGame')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              리더보드 보기
            </button>
          </div>
        )}
        {!gameState.timingGame.isVisible && !gameState.fastHandGame.isVisible && (
            <p>어드민이 게임을 공개하기를 기다리고 있습니다...</p>
        )}
      </div>
    </div>
  );
};

export default GameSelection;
