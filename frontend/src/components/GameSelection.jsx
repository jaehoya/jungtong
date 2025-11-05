import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

const GameSelection = ({ setIsAuthenticated, isAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
      <h2 className="text-2xl font-bold mb-6">게임 선택</h2>
      <div className="space-y-4">
        <button
          onClick={() => navigate('/timing-game')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          지금이니!!
        </button>
        <button
          onClick={() => navigate('/fast-hand-game')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          손 빠르니??
        </button>
        <button
          onClick={() => navigate('/leaderboard')}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          순위 보기
        </button>
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            어드민 페이지
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-1/4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md mt-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default GameSelection;
