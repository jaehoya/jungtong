import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  getUsers,
  deleteUser,
  addUser, 
  addUsersBulk, 
  resetLeaderboard, 
  setGameVisibility, 
  setGameRound 
} from '../services/api';
import { useGameState } from './GameStateContext';

const AdminPanel = () => {
  const { gameState, updateGameState } = useGameState();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [bulkUsersFile, setBulkUsersFile] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      alert(`사용자 목록을 불러오는 데 실패했습니다: ${error.message}`);
    }
  };

  const handleVisibilityToggle = async (gameType) => {
    try {
      const isVisible = !gameState[gameType].isVisible;
      const newGameState = await setGameVisibility(gameType, isVisible);
      updateGameState(newGameState);
    } catch (error) {
      alert(`오류: ${error.message}`);
    }
  };

  const handleSetRound = async (gameType, round) => {
    try {
      const newGameState = await setGameRound(gameType, round);
      updateGameState(newGameState);
    } catch (error) {
      alert(`오류: ${error.message}`);
    }
  };

  const handleResetLeaderboard = async (gameType, round) => {
    const gameName = gameType === 'timing_game' ? '지금이니?!' : '손 빠르니??';
    const roundText = round ? `라운드 ${round}` : '전체';
    if (window.confirm(`정말로 [${gameName}]의 [${roundText}] 리더보드를 초기화하시겠습니까?`)) {
      try {
        await resetLeaderboard(gameType, round);
        alert(`[${gameName}]의 [${roundText}] 리더보드가 초기화되었습니다.`);
      } catch (error) {
        alert(`초기화 실패: ${error.message}`);
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
      fetchUsers(); // Refresh user list
    } catch (error) {
      alert(`사용자 추가 실패: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`정말로 ${userName}(${userId}) 사용자를 삭제하시겠습니까? 모든 점수 기록이 함께 삭제됩니다.`)) {
      try {
        await deleteUser(userId);
        alert('사용자가 삭제되었습니다.');
        fetchUsers(); // Refresh user list
      } catch (error) {
        alert(`삭제 실패: ${error.message}`);
      }
    }
  };

  const handleBulkUpload = () => {
    if (!bulkUsersFile) {
      alert('엑셀 파일을 선택해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: ['name', 'studentId'] });
        
        const usersToUpload = json.slice(1).map(user => ({ ...user, studentId: String(user.studentId) }));

        const result = await addUsersBulk(usersToUpload);
        alert(`${result.msg} (추가: ${result.added}, 중복: ${result.duplicates})`);
        fetchUsers(); // Refresh user list

      } catch (error) {
        console.error('엑셀 처리 중 오류 발생:', error);
        alert(`일괄 등록 실패: ${error.message}`);
      }
    };
    reader.readAsArrayBuffer(bulkUsersFile);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!gameState) return <div>Loading MC panel...</div>;

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">MC 패널</h2>
      
      {/* Game Control */}
      <div className="p-4 bg-gray-700 rounded-lg shadow-md mb-8">
        <h3 className="font-bold text-xl mb-3">게임 컨트롤</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(gameState).map(gameType => (
            <div key={gameType} className="mb-2">
              <p className="mb-2 font-semibold">{gameType === 'timingGame' ? '지금이니?!' : '손 빠르니??'} (현재: {gameState?.[gameType]?.currentRound} 라운드)</p>
              <div className="flex items-center justify-between">
                <button onClick={() => handleVisibilityToggle(gameType)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded transition-colors">
                  {gameState?.[gameType]?.isVisible ? '숨기기' : '공개'}
                </button>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">라운드:</span>
                  {[1, 2, 3].map(round => (
                    <button 
                      key={round} 
                      onClick={() => handleSetRound(gameType, round)} 
                      className={`w-10 h-10 rounded-full font-bold transition-transform transform hover:scale-110 ${gameState?.[gameType]?.currentRound === round ? 'bg-green-700 ring-2 ring-white' : 'bg-green-500'} hover:bg-green-600`}>
                      {round}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Reset */}
      <div className="p-4 bg-gray-700 rounded-lg shadow-md mb-8">
        <h3 className="font-bold text-xl mb-3">리더보드 초기화</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">'지금이니?!' 초기화</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleResetLeaderboard('timing_game')} className="bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-3 rounded text-sm">전체</button>
              {[1, 2, 3].map(round => (
                <button key={round} onClick={() => handleResetLeaderboard('timing_game', round)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm">R{round}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">'손 빠르니??' 초기화</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleResetLeaderboard('fast_hand_game')} className="bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-3 rounded text-sm">전체</button>
              {[1, 2, 3].map(round => (
                <button key={round} onClick={() => handleResetLeaderboard('fast_hand_game', round)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm">R{round}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-gray-700 rounded-lg shadow-md">
          <h3 className="font-bold text-xl mb-3">사용자 개별 추가</h3>
          <form onSubmit={handleAddUser} className="flex flex-col space-y-3">
            <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} className="p-2 rounded bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" placeholder="학번" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="p-2 rounded bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="form-checkbox h-5 w-5 text-indigo-600 bg-gray-600 border-gray-500 rounded focus:ring-indigo-500" />
              <span>MC로 설정</span>
            </label>
            <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors">개별 추가</button>
          </form>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg shadow-md">
          <h3 className="font-bold text-xl mb-3">사용자 일괄 등록 (엑셀)</h3>
          <p className="text-sm text-gray-400 mb-3">엑셀 파일의 첫 번째 열은 이름, 두 번째 열은 학번이어야 합니다. (첫 행은 머리글로 제외됩니다)</p>
          <input type="file" accept=".xlsx, .xls" onChange={(e) => setBulkUsersFile(e.target.files[0])} className="mb-3 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
          <button onClick={handleBulkUpload} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded transition-colors">일괄 등록</button>
        </div>
      </div>

      {/* User List */}
      <div className="p-4 bg-gray-700 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-xl">사용자 관리</h3>
          <span className="font-semibold">총 사용자: {users.length}명</span>
        </div>
        <input 
          type="text"
          placeholder="이름으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-gray-600 border border-gray-500 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="overflow-y-auto max-h-96">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-gray-800">
              <tr>
                <th className="p-2">이름</th>
                <th className="p-2">학번</th>
                <th className="p-2">역할</th>
                <th className="p-2">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="border-b border-gray-600 hover:bg-gray-600">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.studentId}</td>
                  <td className="p-2">{user.isAdmin ? 'MC' : '참가자'}</td>
                  <td className="p-2">
                    <button onClick={() => handleDeleteUser(user._id, user.name)} className="bg-red-600 hover:bg-red-800 text-white font-bold py-1 px-3 rounded text-sm transition-colors">
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
