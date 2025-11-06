import React, { useState } from 'react';
import { login } from '../services/api';

const Auth = ({ onLogin }) => {
  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const data = await login(studentId);
      if (data.token) {
        onLogin(data.token);
      } else {
        setMessage(data.msg || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Server error during login');
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
      <form onSubmit={handleLogin} className="space-y-4">
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
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          로그인
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-400">{message}</p>}
    </div>
  );
};

export default Auth;