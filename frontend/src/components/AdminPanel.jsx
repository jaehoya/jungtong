import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUser, resetLeaderboard } from '../services/api';


const AdminPanel = () => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const data = await addUser(name, studentId, isAdmin);
      if (data.studentId) {
        setMessage(`User ${data.name} (${data.studentId}) added successfully!`);
        setName('');
        setStudentId('');
        setIsAdmin(false);
      } else {
        setMessage(data.msg || 'Failed to add user');
      }
    } catch (error) {
      console.error('Add user error:', error);
      setMessage('Server error during add user');
    }
  };

  const handleResetLeaderboard = async () => {
    if (window.confirm('Are you sure you want to reset the leaderboard? This action cannot be undone.')) {
      setMessage('');
      try {
        const data = await resetLeaderboard();
        setMessage(data.msg || 'Leaderboard reset successfully!');
      } catch (error) {
        console.error('Reset leaderboard error:', error);
        setMessage('Server error during leaderboard reset');
      }
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">어드민 페이지</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">유저 추가하기 기능</h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">이름</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-300">학번</label>
            <input
              type="text"
              id="studentId"
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center">
            <input
              id="isAdmin"
              name="isAdmin"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-300">
              어드민 계정?
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            추가
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">리더보드 초기화</h3>
        <button
          onClick={handleResetLeaderboard}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          초기화 하기
        </button>
      </div>

      {message && <p className="mt-4 text-center text-blue-400">{message}</p>}
      <button
        onClick={() => navigate('/games')}
        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md mt-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Go Back
      </button>
    </div>
  );
};

export default AdminPanel;