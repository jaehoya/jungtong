import React, { useState, useEffect } from 'react';
import { submitScore } from '../services/api';
import { useGameState } from './GameStateContext';
import Leaderboard from './Leaderboard';

const TimingGame = () => {
  const { gameState } = useGameState();
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(null);
  const [message, setMessage] = useState('');
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const currentRound = gameState?.timingGame?.currentRound || 1;
  const targetTime = 7.777;

  useEffect(() => {
    // Reset game state when round changes
    setStartTime(null);
    setElapsedTime(0);
    setScore(null);
    setIsGameRunning(false);
    setShowLeaderboard(false);
    setMessage(`라운드 ${currentRound}: 준비되셨나요? 목표는 ${targetTime}초 입니다!`);
  }, [currentRound]);

  useEffect(() => {
    let interval;
    if (isGameRunning) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isGameRunning, startTime]);

  const handleStart = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    setScore(null);
    setIsGameRunning(true);
    setMessage(`${targetTime}초에 가깝게 멈추세요!`);
  };

  const handleStop = async () => {
    if (!isGameRunning) return;

    const finalTime = Date.now() - startTime;
    const calculatedScore = Math.abs(targetTime * 1000 - finalTime);
    setScore(calculatedScore);
    setMessage(`오차 시간: ${(calculatedScore / 1000).toFixed(3)}초`);
    setIsGameRunning(false);

    try {
      await submitScore('timing_game', currentRound, calculatedScore);
    } catch (error) {
      alert(`점수 등록 실패: ${error.message}`);
    }
  };

  const renderTimer = () => {
    const seconds = (elapsedTime / 1000).toFixed(3);
    let display = seconds;
    let timerClass = "text-6xl font-mono bg-gray-900 p-4 rounded-lg mb-6";

    if (currentRound === 2 && elapsedTime > 4000) {
      display = "???";
    }
    if (currentRound === 3 && isGameRunning) {
      timerClass += " animate-spin-180";
    }

    return <div className={timerClass}>{display}</div>;
  };

  if (showLeaderboard) {
    return <Leaderboard gameType="timing_game" currentRound={currentRound} onBack={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg text-center">
      <h2 className="text-3xl font-bold mb-4">지금이니?! (라운드 {currentRound})</h2>
      <p className="text-xl mb-6">{message}</p>
      
      {renderTimer()}

      {!isGameRunning && score === null ? (
        <button onClick={handleStart} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-2xl">
          시작
        </button>
      ) : isGameRunning ? (
        <button onClick={handleStop} className="bg-red-500 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-2xl">
          정지
        </button>
      ) : null}

      {score !== null && (
        <div className="mt-6">
          <h3 className="text-2xl">라운드 {currentRound} 오차 시간: {(score / 1000).toFixed(3)}초</h3>
          <p>(0에 가까울수록 높은 순위)</p>
          <p className="mt-4">MC가 다음 라운드를 시작하기를 기다려주세요...</p>
        </div>
      )}

      <div className="mt-8">
        <button onClick={() => setShowLeaderboard(true)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400" disabled={!gameState}>
          리더보드 보기
        </button>
      </div>
    </div>
  );
};

export default TimingGame;