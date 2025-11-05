const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const login = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ studentId }),
  });
  return response.json();
};

export const submitScore = async (gameType, round, score) => {
  const response = await fetch(`${API_BASE_URL}/game/score`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ gameType, round, score }),
  });
  return response.json();
};

export const fetchLeaderboard = async (gameType, round) => {
  const response = await fetch(`${API_BASE_URL}/game/leaderboard/${gameType}/${round}`, {
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const resetLeaderboard = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/leaderboard`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return response.json();
};

export const addUser = async (name, studentId) => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, studentId }),
  });
  return response.json();
};