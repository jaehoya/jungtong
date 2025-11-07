import React, { useState, useEffect, useCallback } from 'react';
import { submitScore } from '../services/api';
import { useGameState } from './GameStateContext';
import Leaderboard from './Leaderboard';

const FastHandGame = () => {
  const { gameState } = useGameState();
  const [clicks, setClicks] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Round specific state
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [buttonColor, setButtonColor] = useState('bg-green-500');

  const currentRound = gameState?.fastHandGame?.currentRound || 1;
  const timeLimit = currentRound === 2 || currentRound === 3 ? 15 : 10; // Rounds 2 & 3 are 15 seconds

  const resetGameState = useCallback(() => {
    setClicks(0);
    setIsGameRunning(false);
    setFinished(false);
    setShowLeaderboard(false);
    setTimeLeft(timeLimit);
    setPosition({ top: '50%', left: '50%' });
    setButtonColor('bg-green-500');
  }, [timeLimit]);

  useEffect(() => {
    resetGameState();
  }, [currentRound, resetGameState]);

  useEffect(() => {
    let gameInterval;
    if (isGameRunning && timeLeft > 0) {
      gameInterval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isGameRunning && timeLeft === 0) {
      (async () => {
        setIsGameRunning(false);
        setFinished(true);
        try {
          await submitScore('fast_hand_game', currentRound, clicks);
        } catch (error) {
          alert(`점수 등록 실패: ${error.message}`);
        }
      })();
    }
    return () => clearInterval(gameInterval);
  }, [isGameRunning, timeLeft, currentRound]);

  useEffect(() => {
    let roundInterval;
    if (isGameRunning) {
      if (currentRound === 2) {
        roundInterval = setInterval(() => {
          setPosition({ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` });
        }, 1200); // Round 2: moves every 1.2 seconds
      } else if (currentRound === 3) {
        roundInterval = setInterval(() => {
          // Round 3: moves faster and changes color
          setPosition({ top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%` });
          setButtonColor(prev => prev === 'bg-green-500' ? 'bg-red-500' : 'bg-green-500');
        }, 700); // Round 3: moves every 0.7 seconds
      }
    }
    return () => clearInterval(roundInterval);
  }, [isGameRunning, currentRound]);

  const handleStart = () => {
    resetGameState();
    setIsGameRunning(true);
  };

  const handleClick = () => {
    if (!isGameRunning) return;
    if (currentRound === 3) {
      setClicks(prev => prev + (buttonColor === 'bg-green-500' ? 1 : -1));
    } else {
      setClicks(prev => prev + 1);
    }
  };

  if (showLeaderboard) {
    return <Leaderboard gameType="fast_hand_game" currentRound={currentRound} onBack={() => setShowLeaderboard(false)} />;
  }

  const renderGame = () => {
    if (finished) {
      return (
        <div className="text-center">
          <h3 className="text-4xl font-bold">게임 종료!</h3>
          <p className="text-2xl mt-4">당신의 점수: {clicks}</p>
          <p className="mt-4">MC가 다음 라운드를 시작하기를 기다려주세요...</p>
        </div>
      );
    }

    if (!isGameRunning) {
      return <button onClick={handleStart} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-2xl">시작</button>;
    }

    // Button classes and styles based on round
    const isMovingButton = currentRound === 2 || currentRound === 3;
    let buttonClass = 'absolute font-bold rounded-lg transition-all duration-100 text-white';
    
    if (currentRound === 1) {
      buttonClass += ' py-8 px-14 text-3xl'; // Larger button for round 1
    } else {
      buttonClass += ' py-3 px-5';
    }

    if (currentRound === 3) {
      buttonClass += ` ${buttonColor}`;
    } else {
      buttonClass += ' bg-purple-600';
    }

    const buttonStyle = isMovingButton
      ? { top: position.top, left: position.left, transform: 'translate(-50%, -50%)' }
      : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    return (
      <div className="relative w-full h-64 bg-gray-700 rounded-lg">
        <button 
          onClick={handleClick} 
          className={buttonClass}
          style={buttonStyle}
        >
          클릭!
        </button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg text-center">
      <h2 className="text-3xl font-bold mb-2">손 빠르니?? (라운드 {currentRound})</h2>
      <p className="text-xl mb-4">남은 시간: {timeLeft}초 | 점수: {clicks}</p>
      {renderGame()}
      <div className="mt-8">
        <button onClick={() => setShowLeaderboard(true)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400" disabled={!gameState}>
          리더보드 보기
        </button>
      </div>
    </div>
  );
};

export default FastHandGame;