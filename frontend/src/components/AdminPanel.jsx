import React, { useState } from 'react';
import { resetLeaderboard, addUser } from '../services/api';
import { useGameState } from './GameStateContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const AdminPanel = () => {
  const { gameState } = useGameState();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleApiCall = async (url, body) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Failed to perform admin action');
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleVisibilityToggle = (gameType) => {
    const isVisible = !gameState[gameType].isVisible;
    handleApiCall('/api/admin/game/visibility', { gameType, isVisible });
  };

  const handleSetRound = (gameType, round) => {
    handleApiCall('/api/admin/game/set-round', { gameType, round });
  };

  const handleReset = async () => {
    if (window.confirm('정말로 리더보드를 초기화하시겠습니까?')) {
      try {
        await resetLeaderboard();
        alert('리더보드가 초기화되었습니다.');
      } catch (error) {
        alert('초기화에 실패했습니다.');
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await addUser(name, studentId, isAdmin);
      alert('사용자가 추가되었습니다.');
      setName('');
      setStudentId('');
      setIsAdmin(false);
    } catch (error) {
      alert('사용자 추가에 실패했습니다.');
    }
  };

  if (!gameState) return <div>Loading admin panel...</div>;

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">어드민 패널</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-700 rounded">
          <h3 className="font-bold mb-2">게임 컨트롤</h3>
          {Object.keys(gameState).map(gameType => (
            <div key={gameType} className="mb-2">
              <p className="mb-2">{gameType === 'timingGame' ? '지금이니?!' : '손 빠르니??'} (현재: {gameState[gameType].currentRound} 라운드)</p>
              <div className="flex items-center justify-between">
                <button onClick={() => handleVisibilityToggle(gameType)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                  {gameState[gameType].isVisible ? '숨기기' : '공개'}
                </button>
                <div className="flex items-center space-x-1">
                  <span>라운드 설정:</span>
                  {[1, 2, 3].map(round => (
                    <button 
                      key={round} 
                      onClick={() => handleSetRound(gameType, round)} 
                      className={`w-8 h-8 rounded ${gameState[gameType].currentRound === round ? 'bg-green-700' : 'bg-green-500'} hover:bg-green-700 text-white font-bold`}>
                      {round}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-700 rounded">
            <h3 className="font-bold mb-2">리더보드 초기화</h3>
            <button onClick={handleReset} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                리더보드 전체 초기화
            </button>
        </div>
      </div>

      <div className="p-4 bg-gray-700 rounded">
        <h3 className="font-bold mb-2">사용자 추가</h3>
        <form onSubmit={handleAddUser} className="flex flex-col space-y-2">
          <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} className="p-2 rounded bg-gray-600" />
          <input type="text" placeholder="학번" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="p-2 rounded bg-gray-600" />
          <label className="flex items-center">
            <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="mr-2" />
            어드민으로 설정
          </label>
          <button type="submit" className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">사용자 추가</button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;