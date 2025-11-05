import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeaderboard, resetLeaderboard, addUser, getAuthToken } from '../services/api';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [gameType, setGameType] = useState('timing_game');
  const [round, setRound] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserStudentId, setNewUserStudentId] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.user.isAdmin);
      } catch (e) {
        console.error('Invalid token', e);
      }
    }
  }, []);

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

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset the leaderboard?')) {
      try {
        await resetLeaderboard();
        handleSearch();
      } catch (err) {
        console.error('Error resetting leaderboard', err);
        setError('Failed to reset leaderboard');
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await addUser(newUserName, newUserStudentId);
      setNewUserName('');
      setNewUserStudentId('');
      alert('User added successfully');
    } catch (err) {
      console.error('Error adding user', err);
      setError('Failed to add user');
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl w-full">
      <h1 className="text-3xl font-bold mb-6 text-center">리더보드</h1>
      <div className="flex justify-center items-center space-x-4 mb-6">
        <select value={gameType} onChange={(e) => setGameType(e.target.value)} className="bg-gray-700 text-white p-2 rounded-md">
          <option value="timing_game">지금이니!!</option>
          <option value="fast_hand_game">손 빠르니??</option>
        </select>
        <select value={round} onChange={(e) => setRound(e.target.value)} className="bg-gray-700 text-white p-2 rounded-md">
          <option value="1">라운드 1</option>
          <option value="2">라운드 2</option>
          <option value="3">라운드 3</option>
        </select>
        <button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">
          검색
        </button>
      </div>

      {isAdmin && (
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
          <div className="flex space-x-4">
            <form onSubmit={handleAddUser} className="flex-grow flex space-x-2">
              <input
                type="text"
                placeholder="New user name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="bg-gray-800 text-white p-2 rounded-md w-full"
              />
              <input
                type="text"
                placeholder="New user student ID"
                value={newUserStudentId}
                onChange={(e) => setNewUserStudentId(e.target.value)}
                className="bg-gray-800 text-white p-2 rounded-md w-full"
              />
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
                Add User
              </button>
            </form>
            <button onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">
              Reset Leaderboard
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center">로딩...</p>
      ) : error ? (
        <p className="text-center text-red-400">{error}</p>
      ) : (
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2">순위</th>
              <th className="px-4 py-2">이름</th>
              <th className="px-4 py-2">학번</th>
              <th className="px-4 py-2">오차 시간</th>
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
        돌아가기
      </button>
    </div>
  );
};

export default Leaderboard;