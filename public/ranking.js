document.addEventListener('DOMContentLoaded', () => {
  const gameTypeSelect = document.getElementById('gameType');
  const roundSelect = document.getElementById('round');
  const searchBtn = document.getElementById('searchBtn');
  const rankingTableBody = document.querySelector('#rankingTable tbody');
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to login page or show an error
    // For now, we'll just disable the search button
    searchBtn.disabled = true;
    searchBtn.textContent = '로그인이 필요합니다';
    return;
  }

  searchBtn.addEventListener('click', async () => {
    const gameType = gameTypeSelect.value;
    const round = roundSelect.value;

    try {
      const response = await fetch(`/api/game/leaderboard/${gameType}/${round}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const leaderboard = await response.json();

      // Clear existing table data
      rankingTableBody.innerHTML = '';

      if (leaderboard.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = '해당 게임/라운드에 대한 기록이 없습니다.';
        row.appendChild(cell);
        rankingTableBody.appendChild(row);
        return;
      }

      leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${entry.user.name}</td>
          <td>${entry.user.studentId}</td>
          <td>${entry.score}</td>
        `;
        rankingTableBody.appendChild(row);
      });

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      rankingTableBody.innerHTML = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = '순위를 불러오는 중 오류가 발생했습니다.';
      row.appendChild(cell);
      rankingTableBody.appendChild(row);
    }
  });
});
