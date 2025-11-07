import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  addUser, 
  addUsersBulk, 
  resetLeaderboard, 
  setGameVisibility, 
  setGameRound 
} from '../services/api';
import { useGameState } from './GameStateContext';

const AdminPanel = () => {
  const { gameState, updateGameState } = useGameState();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [bulkUsersFile, setBulkUsersFile] = useState(null);

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

  const handleReset = async () => {
    if (window.confirm('정말로 리더보드를 초기화하시겠습니까?')) {
      try {
        await resetLeaderboard();
        alert('리더보드가 초기화되었습니다.');
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
    } catch (error) {
      alert(`사용자 추가 실패: ${error.message}`);
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
        
        const users = json.slice(1).map(user => ({ ...user, studentId: String(user.studentId) }));

        const result = await addUsersBulk(users);
        alert(`${result.msg} (추가: ${result.added}, 중복: ${result.duplicates})`);

      } catch (error) {
        console.error('엑셀 처리 중 오류 발생:', error);
        alert(`일괄 등록 실패: ${error.message}`);
      }
    };
    reader.readAsArrayBuffer(bulkUsersFile);
  };

  if (!gameState) return <div>Loading MC panel...</div>;

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">MC 패널</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-700 rounded">
          <h3 className="font-bold mb-2">게임 컨트롤</h3>
          {Object.keys(gameState).map(gameType => (
            <div key={gameType} className="mb-2">
              <p className="mb-2">{gameType === 'timingGame' ? '지금이니?!' : '손 빠르니??'} (현재: {gameState?.[gameType]?.currentRound} 라운드)</p>
              <div className="flex items-center justify-between">
                <button onClick={() => handleVisibilityToggle(gameType)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                  {gameState?.[gameType]?.isVisible ? '숨기기' : '공개'}
                </button>
                <div className="flex items-center space-x-1">
                  <span>라운드 설정:</span>
                  {[1, 2, 3].map(round => (
                    <button 
                      key={round} 
                      onClick={() => handleSetRound(gameType, round)} 
                      className={`w-8 h-8 rounded ${gameState?.[gameType]?.currentRound === round ? 'bg-green-700' : 'bg-green-500'} hover:bg-green-700 text-white font-bold`}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-700 rounded">
          <h3 className="font-bold mb-2">사용자 개별 추가</h3>
          <form onSubmit={handleAddUser} className="flex flex-col space-y-2">
            <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} className="p-2 rounded bg-gray-600" />
            <input type="text" placeholder="학번" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="p-2 rounded bg-gray-600" />
            <label className="flex items-center">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="mr-2" />
              MC로 설정
            </label>
            <button type="submit" className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">개별 추가</button>
          </form>
        </div>

        <div className="p-4 bg-gray-700 rounded">
          <h3 className="font-bold mb-2">사용자 일괄 등록 (엑셀)</h3>
          <p className="text-sm text-gray-400 mb-2">엑셀 파일의 첫 번째 열은 이름, 두 번째 열은 학번이어야 합니다. (첫 행은 머리글로 제외됩니다)</p>
          <input type="file" accept=".xlsx, .xls" onChange={(e) => setBulkUsersFile(e.target.files[0])} className="mb-2 w-full" />
          <button onClick={handleBulkUpload} className="w-full bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded">일괄 등록</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;