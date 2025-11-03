import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitScore } from '../services/api';

const FastHandGame = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameInterval, setGameInterval] = useState(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isGameRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isGameRunning && timeLeft === 0) {
      endGame();
    }
  }, [isGameRunning, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setIsGameRunning(true);
    setIsGameFinished(false);
    setMessage('');
  };

  const endGame = () => {
    setIsGameRunning(false);
    setIsGameFinished(true);
    setMessage(`Time's up! Your score: ${score}`);
    submitScore('fast_hand_game', round, score);
  };

  const handleButtonClick = () => {
    if (isGameRunning) {
      setScore(score + 1);
    }
  };

  const handleNextRound = () => {
    if (round < 3) {
      setRound(round + 1);
      resetGame();
    } else {
      alert('Fast Hand Game Over! Check the leaderboard.');
      navigate('/leaderboard');
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(10);
    setIsGameRunning(false);
    setIsGameFinished(false);
    setMessage('');
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
      <h2 className="text-3xl font-bold mb-4">Fast Hand Game - Round {round}</h2>
      <p className="mb-4">Click the button as many times as you can in 10 seconds!</p>
      <div className="text-4xl font-bold mb-4">Score: {score}</div>
      <div className="text-2xl mb-6">Time Left: {timeLeft}s</div>

      {!isGameRunning && !isGameFinished && (
        <button onClick={startGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md">
          Start Game
        </button>
      )}

      {isGameRunning && (
        <button onClick={handleButtonClick} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md">
          Click Me!
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

export default FastHandGame;
