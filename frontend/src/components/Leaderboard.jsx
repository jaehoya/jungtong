import React, { useState, useEffect, useCallback } from 'react';
import { fetchLeaderboard } from '../services/api';

const Leaderboard = ({ gameType, currentRound, onBack }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [playersInRound, setPlayersInRound] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const getLeaderboard = useCallback(async () => {
    if (!gameType || !currentRound) return;
    try {
      setLoading(true);
      const { leaderboard, playersInRound, totalUsers } = await fetchLeaderboard(gameType, currentRound);
      setLeaderboard(leaderboard);
      setPlayersInRound(playersInRound);
      setTotalUsers(totalUsers);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      alert('리더보드를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [gameType, currentRound]);

  useEffect(() => {
    getLeaderboard();
  }, [getLeaderboard]);

  const gameName = gameType === 'timing_game' ? '지금이니?!' : '손 빠르니??';

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">리더보드</h2>
        <span className="text-lg">{gameName} (라운드 {currentRound})</span>
      </div>

      <div className="p-3 bg-gray-900 rounded-lg mb-4 text-center">
        <p className="text-lg">참여 현황: {playersInRound} / {totalUsers} 명</p>
      </div>
      
      {loading ? (
        <div className="text-center p-8">
          <p className="text-xl">로딩중...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-xl">아직 등록된 점수가 없습니다.</p>
        </div>
      ) : (
        <ol className="list-decimal list-inside space-y-2">
          {leaderboard.map((entry, index) => (
            <li key={entry._id} className="p-3 bg-gray-700 rounded-lg flex justify-between items-center transition-all hover:bg-gray-600">
              <span className="font-semibold text-lg">{index + 1}. {entry.user?.name}</span>
              <span className="font-mono text-xl">
                {gameType === 'timing_game' 
                  ? `${(entry.score / 1000).toFixed(3)}초` 
                  : `${entry.score}점`}
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-8 flex justify-between items-center">
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors">
          돌아가기
        </button>
        <button onClick={getLeaderboard} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors" disabled={loading}>
          {loading ? '로딩중...' : '점수 불러오기'}
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;