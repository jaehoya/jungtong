import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeaderboard } from '../services/api';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [gameType, setGameType] = useState('timing_game');
  const [round, setRound] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLeaderboard(gameType, round);
      if (Array.isArray(data)) {
        setLeaderboard(data);
      } else {
        setError(data.msg || 'Failed to fetch leaderboard');
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Server error fetching leaderboard');
      setLeaderboard([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl w-full">
      <h1 className="text-3xl font-bold mb-6 text-center">Leaderboard</h1>
      <div className="flex justify-center items-center space-x-4 mb-6">
        <select value={gameType} onChange={(e) => setGameType(e.target.value)} className="bg-gray-700 text-white p-2 rounded-md">
          <option value="timing_game">Timing Game</option>
          <option value="fast_hand_game">Fast Hand Game</option>
        </select>
        <select value={round} onChange={(e) => setRound(e.target.value)} className="bg-gray-700 text-white p-2 rounded-md">
          <option value="1">Round 1</option>
          <option value="2">Round 2</option>
          <option value="3">Round 3</option>
        </select>
        <button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-400">{error}</p>
      ) : (
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Student ID</th>
              <th className="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <tr key={entry._id} className="border-b border-gray-700 hover:bg-gray-600">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{entry.user.name}</td>
                  <td className="px-4 py-2">{entry.user.studentId}</td>
                  <td className="px-4 py-2">{entry.score.toFixed(3)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">No records found for this game/round.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <button onClick={() => navigate('/games')} className="mt-8 text-indigo-400 hover:text-indigo-300">
        Back to Game Selection
      </button>
    </div>
  );
};

export default Leaderboard;
