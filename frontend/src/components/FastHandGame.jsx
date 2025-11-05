import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitScore } from '../services/api';

const FastHandGame = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [message, setMessage] = useState('');

  // Round 2: Button position
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  // Round 3: Button color
  const [buttonColor, setButtonColor] = useState('green');
  const [gameInterval, setGameInterval] = useState(null);

  useEffect(() => {
    if (isGameRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isGameRunning && timeLeft === 0) {
      endGame();
    }

    // Cleanup interval on component unmount or game end
    return () => {
      if (gameInterval) {
        clearInterval(gameInterval);
      }
    };
  }, [isGameRunning, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setIsGameRunning(true);
    setIsGameFinished(false);
    setMessage('');

    if (round === 2) {
      const interval = setInterval(() => {
        const top = Math.random() * 90 + '%';
        const left = Math.random() * 90 + '%';
        setPosition({ top, left });
      }, 1000);
      setGameInterval(interval);
    }

    if (round === 3) {
      const interval = setInterval(() => {
        setButtonColor(prevColor => prevColor === 'green' ? 'red' : 'green');
      }, 800);
      setGameInterval(interval);
    }
  };

  const endGame = () => {
    if (gameInterval) {
      clearInterval(gameInterval);
    }
    setIsGameRunning(false);
    setIsGameFinished(true);
    setMessage(`Time's up! Your score: ${score}`);
    submitScore('fast_hand_game', round, score);
  };

  const handleButtonClick = () => {
    if (isGameRunning) {
      if (round === 3) {
        if (buttonColor === 'green') {
          setScore(score + 1);
        } else {
          setScore(score - 1);
        }
      } else {
        setScore(score + 1);
      }
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
      <h2 className="text-3xl font-bold mb-4">손 빠르니?? - 라운드 {round}</h2>
      {round === 1 && <p className="mb-4">10초 안에 가장 많이 버튼을 누르세요!</p>}
      {round === 2 && <p className="mb-4">10초 안에 움직이는 버튼을 가장 많이 누르세요!</p>}
      {round === 3 && <p className="mb-4">10초 안에 초록색 버튼을 가장 많이 누르세요! (빨간색 버튼은 점수 차감)</p>}
      <div className="text-4xl font-bold mb-4">점수: {score}</div>
      <div className="text-2xl mb-6">남은시간: {timeLeft}s</div>

      <div className="relative bg-gray-900 h-64 w-full mb-6 rounded-md">
        {!isGameRunning && !isGameFinished && (
          <button onClick={startGame} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md">
            시작하기
          </button>
        )}

        {isGameRunning && (
          <button 
            onClick={handleButtonClick} 
            className={`absolute font-bold py-3 px-4 rounded-md transition-all duration-200 
              ${round === 3 ? (buttonColor === 'green' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600') : 'bg-purple-600 hover:bg-purple-700'}`}
            style={round === 2 ? { top: position.top, left: position.left, transform: 'translate(-50%, -50%)' } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            Click Me!
          </button>
        )}
      </div>

      {message && <p className="mt-4 text-yellow-400">{message}</p>}

      {isGameFinished && (
        <div className="mt-4 space-y-2">
          <button onClick={handleNextRound} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            {round < 3 ? '다음 라운드' : '게임 종료'}
          </button>
          <button onClick={() => navigate('/leaderboard')} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">
            순위보기
          </button>
        </div>
      )}

      <button onClick={() => navigate('/games')} className="mt-8 text-indigo-400 hover:text-indigo-300">
        게임 선택으로 돌아가기
      </button>
    </div>
  );
};

export default FastHandGame;
