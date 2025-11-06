import React, { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../services/api';
import { useGameState } from './GameStateContext';

const Leaderboard = ({ gameType, onBack }) => {
  const { gameState } = useGameState();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentRound = gameState ? gameState[gameType]?.currentRound : 1;

  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await fetchLeaderboard(gameType, currentRound);
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (gameType && currentRound) {
      getLeaderboard();
    }
  }, [gameType, currentRound]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg">
      <h2 className="text-3xl font-bold mb-4 text-center">리더보드 - {gameType} (라운드 {currentRound})</h2>
      {loading ? (
        <p>로딩중...</p>
      ) : leaderboard.length === 0 ? (
        <p>아직 등록된 점수가 없습니다.</p>
      ) : (
        <ol className="list-decimal list-inside space-y-2">
          {leaderboard.map((entry, index) => (
            <li key={entry._id} className="p-2 bg-gray-700 rounded flex justify-between">
              <span>{index + 1}. {entry.user?.name} ({entry.user?.studentId})</span>
              <span>{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
      <button onClick={onBack} className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
        돌아가기
      </button>
    </div>
  );
};

export default Leaderboard;