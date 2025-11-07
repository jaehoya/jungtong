const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || 'An error occurred');
  }
  return data;
};

export const login = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId }),
  });
  return handleResponse(response);
};

export const submitScore = async (gameType, round, score) => {
  const response = await fetch(`${API_BASE_URL}/game/score`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ gameType, round, score }),
  });
  return handleResponse(response);
};

export const fetchLeaderboard = async (gameType, round) => {
  const response = await fetch(`${API_BASE_URL}/game/leaderboard/${gameType}/${round}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
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

export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

// --- MC Panel API Calls ---

export const getUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const resetLeaderboard = async (gameType, round) => {
  let url = `${API_BASE_URL}/admin/leaderboard/${gameType}`;
  if (round) {
    url += `?round=${round}`;
  }
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const addUser = async (name, studentId, isAdmin) => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, studentId, isAdmin }),
  });
  return handleResponse(response);
};

export const addUsersBulk = async (users) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(users),
  });
  return handleResponse(response);
};

export const setGameVisibility = async (gameType, isVisible) => {
  const response = await fetch(`${API_BASE_URL}/admin/game/visibility`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ gameType, isVisible }),
  });
  return handleResponse(response);
};

export const setGameRound = async (gameType, round) => {
  const response = await fetch(`${API_BASE_URL}/admin/game/set-round`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ gameType, round }),
  });
  return handleResponse(response);
};