import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitScore } from '../services/api';

const TimingGame = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [message, setMessage] = useState('');
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);

  useEffect(() => {
    return () => clearInterval(timerInterval);
  }, [timerInterval]);

  const startTimer = () => {
    setStartTime(Date.now() - elapsedTime);
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 10);
    setTimerInterval(interval);
    setIsGameRunning(true);
    setIsGameFinished(false);
    setMessage('');
  };

  const stopTimer = () => {
    clearInterval(timerInterval);
    const finalTime = (elapsedTime / 1000);
    const score = Math.abs(finalTime - 7.77);
    setMessage(`You stopped at ${finalTime.toFixed(3)} seconds. Error: ${score.toFixed(3)}`);
    submitScore('timing_game', round, score);
    setIsGameRunning(false);
    setIsGameFinished(true);
  };

  const handleNextRound = () => {
    if (round < 3) {
      setRound(round + 1);
      resetGame();
    } else {
      alert('Timing Game Over! Check the leaderboard.');
      navigate('/leaderboard');
    }
  };

  const resetGame = () => {
    clearInterval(timerInterval);
    setElapsedTime(0);
    setMessage('');
    setIsGameRunning(false);
    setIsGameFinished(false);
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
      <h2 className="text-3xl font-bold mb-4">Timing Game - Round {round}</h2>
      <p className="mb-6">Goal: Stop the timer as close to 7.77 seconds as possible!</p>
      <div className="text-6xl font-mono bg-gray-900 p-4 rounded-lg mb-6">{(elapsedTime / 1000).toFixed(3)}</div>
      
      {!isGameRunning && !isGameFinished && (
        <button onClick={startTimer} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md">
          Start
        </button>
      )}

      {isGameRunning && (
        <button onClick={stopTimer} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md">
          Stop
        </button>
      )}

      {message && <p className="mt-4 text-yellow-400">{message}</p>}

      {isGameFinished && (
        <div className="mt-4 space-y-2">
          <button onClick={handleNextRound} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            {round < 3 ? 'Next Round' : 'Finish Game'}
          </button>
          <button onClick={() => navigate('/leaderboard')} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">
            View Leaderboard
          </button>
        </div>
      )}

      <button onClick={() => navigate('/games')} className="mt-8 text-indigo-400 hover:text-indigo-300">
        Back to Game Selection
      </button>
    </div>
  );
};

export default TimingGame;
