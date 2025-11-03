document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const gameSelection = document.getElementById('game-selection');
    const gameArea = document.getElementById('game-area');
    const leaderboardArea = document.getElementById('leaderboard-area');
    const authMessage = document.getElementById('auth-message');

    const nameInput = document.getElementById('name');
    const studentIdInput = document.getElementById('studentId');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const timingGameBtn = document.getElementById('timing-game-btn');
    const fastHandGameBtn = document.getElementById('fast-hand-game-btn');
    const backToSelectionBtn = document.getElementById('back-to-selection');

    // Timing Game Elements
    const timingGameContainer = document.getElementById('timing-game-container');
    const timingGameRoundSpan = document.getElementById('timing-game-round');
    const timerDisplay = document.getElementById('timer-display');
    const startTimingGameBtn = document.getElementById('start-timing-game-btn');
    const stopTimingGameBtn = document.getElementById('stop-timing-game-btn');
    const timingGameMessage = document.getElementById('timing-game-message');
    const nextRoundBtn = document.getElementById('next-round-btn');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');

    // Fast Hand Game Elements
    const fastHandGameContainer = document.getElementById('fast-hand-game-container');
    const fastHandGameRoundSpan = document.getElementById('fast-hand-game-round');
    const fastHandGameInstruction = document.getElementById('fast-hand-game-instruction');
    const fastHandGameScoreSpan = document.getElementById('fast-hand-game-score');
    const fastHandGameButton = document.getElementById('fast-hand-game-button');
    const fastHandGameMessage = document.getElementById('fast-hand-game-message');
    const fastHandGameNextRoundBtn = document.getElementById('fast-hand-game-next-round-btn');
    const fastHandGameViewLeaderboardBtn = document.getElementById('fast-hand-game-view-leaderboard-btn');

    let token = localStorage.getItem('token');
    let currentTimingGameRound = 1;
    let timerInterval;
    let startTime;
    let elapsedTime = 0;

    let currentFastHandGameRound = 1;
    let fastHandGameScore = 0;
    let fastHandGameTimer;
    let fastHandGameTimeLeft = 10;
    let fastHandGameInterval;

    const showSection = (section) => {
        authSection.style.display = 'none';
        gameSelection.style.display = 'none';
        gameArea.style.display = 'none';
        leaderboardArea.style.display = 'none';
        section.style.display = 'block';
    };

    const checkAuth = () => {
        if (token) {
            showSection(gameSelection);
        } else {
            showSection(authSection);
        }
    };

    // Initial check
    checkAuth();

    // --- Authentication Logic ---
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const studentId = studentIdInput.value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId }),
            });
            const data = await res.json();
            if (res.ok) {
                token = data.token;
                localStorage.setItem('token', token);
                authMessage.textContent = '';
                checkAuth();
            } else {
                authMessage.textContent = data.msg || 'Login failed';
            }
        } catch (err) {
            console.error(err);
            authMessage.textContent = 'Server error';
        }
    });

    registerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = nameInput.value;
        const studentId = studentIdInput.value;

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, studentId }),
            });
            const data = await res.json();
            if (res.ok) {
                token = data.token;
                localStorage.setItem('token', token);
                authMessage.textContent = '';
                checkAuth();
            } else {
                authMessage.textContent = data.msg || 'Registration failed';
            }
        } catch (err) {
            console.error(err);
            authMessage.textContent = 'Server error';
        }
    });

    logoutBtn.addEventListener('click', () => {
        token = null;
        localStorage.removeItem('token');
        checkAuth();
    });
    const startTimer = () => {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            timerDisplay.textContent = (elapsedTime / 1000).toFixed(3);
            if (currentTimingGameRound === 2 && elapsedTime >= 3000) {
                timerDisplay.style.visibility = 'hidden';
            }
        }, 10);
    };

    const stopTimer = () => {
        clearInterval(timerInterval);
        const finalTime = (elapsedTime / 1000);
        let score = Math.abs(finalTime - 7.77);
        timingGameMessage.textContent = `You stopped at ${finalTime.toFixed(3)} seconds. Error: ${score.toFixed(3)}`;
        submitScore('timing_game', currentTimingGameRound, score);
        startTimingGameBtn.style.display = 'none';
        stopTimingGameBtn.style.display = 'none';
        nextRoundBtn.style.display = 'block';
        viewLeaderboardBtn.style.display = 'block';
    };

    const resetTimingGame = () => {
        clearInterval(timerInterval);
        elapsedTime = 0;
        timerDisplay.textContent = '0.000';
        timerDisplay.style.visibility = 'visible';
        timingGameMessage.textContent = '';
        startTimingGameBtn.style.display = 'block';
        stopTimingGameBtn.style.display = 'none';
        nextRoundBtn.style.display = 'none';
        viewLeaderboardBtn.style.display = 'none';
    };

    const submitScore = async (gameType, round, score) => {
        try {
            const res = await fetch('/api/game/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ gameType, round, score }),
            });
            const data = await res.json();
            if (res.ok) {
                console.log('Score submitted:', data);
            } else {
                console.error('Score submission failed:', data.msg);
            }
        } catch (err) {
            console.error('Error submitting score:', err);
        }
    };

    const loadTimingGameRound = (round) => {
        currentTimingGameRound = round;
        timingGameRoundSpan.textContent = round;
        resetTimingGame();
        showSection(gameArea);
        document.getElementById('game-title').textContent = 'Timing Game';
        timingGameContainer.style.display = 'block';
        fastHandGameContainer.style.display = 'none'; // Hide other game

        // Round specific rules
        if (round === 3) {
            timerDisplay.classList.add('spinning');
        } else {
            timerDisplay.classList.remove('spinning');
        }
    };

    timingGameBtn.addEventListener('click', () => {
        loadTimingGameRound(1);
    });

    startTimingGameBtn.addEventListener('click', () => {
        startTimer();
        startTimingGameBtn.style.display = 'none';
        stopTimingGameBtn.style.display = 'block';
    });

    stopTimingGameBtn.addEventListener('click', () => {
        stopTimer();
    });

    nextRoundBtn.addEventListener('click', () => {
        if (currentTimingGameRound < 3) {
            loadTimingGameRound(currentTimingGameRound + 1);
        } else {
            alert('Timing Game Over! Check the leaderboard.');
            showLeaderboard('timing_game', currentTimingGameRound);
        }
    });

    viewLeaderboardBtn.addEventListener('click', () => {
        showLeaderboard('timing_game', currentTimingGameRound);
    });

    // --- Fast Hand Game Logic ---
    const startFastHandGameTimer = () => {
        fastHandGameTimeLeft = 10;
        fastHandGameScore = 0;
        fastHandGameScoreSpan.textContent = fastHandGameScore;
        fastHandGameButton.disabled = false;
        fastHandGameMessage.textContent = `Time Left: ${fastHandGameTimeLeft}s`;

        fastHandGameInterval = setInterval(() => {
            fastHandGameTimeLeft--;
            fastHandGameMessage.textContent = `Time Left: ${fastHandGameTimeLeft}s`;
            if (fastHandGameTimeLeft <= 0) {
                clearInterval(fastHandGameInterval);
                fastHandGameButton.disabled = true;
                fastHandGameMessage.textContent = `Time's up! Your score: ${fastHandGameScore}`;
                submitScore('fast_hand_game', currentFastHandGameRound, fastHandGameScore);
                fastHandGameNextRoundBtn.style.display = 'block';
                fastHandGameViewLeaderboardBtn.style.display = 'block';
            }
        }, 1000);
    };

    const resetFastHandGame = () => {
        clearInterval(fastHandGameInterval);
        fastHandGameScore = 0;
        fastHandGameScoreSpan.textContent = 0;
        fastHandGameMessage.textContent = '';
        fastHandGameButton.style.display = 'block';
        fastHandGameButton.disabled = false;
        fastHandGameButton.style.position = 'static'; // Reset position
        fastHandGameButton.style.left = 'auto';
        fastHandGameButton.style.top = 'auto';
        fastHandGameNextRoundBtn.style.display = 'none';
        fastHandGameViewLeaderboardBtn.style.display = 'none';
    };

    const loadFastHandGameRound = (round) => {
        currentFastHandGameRound = round;
        fastHandGameRoundSpan.textContent = round;
        resetFastHandGame();
        showSection(gameArea);
        document.getElementById('game-title').textContent = 'Fast Hand Game';
        timingGameContainer.style.display = 'none'; // Hide other game
        fastHandGameContainer.style.display = 'block';

        fastHandGameInstruction.textContent = 'Click the button as many times as you can in 10 seconds!';

        if (round === 2) {
            fastHandGameInstruction.textContent = 'The button will move! Follow and click it!';
            fastHandGameButton.style.position = 'relative';
            fastHandGameButton.style.left = '0px';
            fastHandGameButton.style.top = '0px';
        } else if (round === 3) {
            fastHandGameInstruction.textContent = 'The button is frozen! Click it 20 times to break the ice!';
            fastHandGameButton.textContent = 'Frozen Button';
            fastHandGameButton.disabled = true; // Will be enabled after 20 clicks
            fastHandGameScore = 20; // Clicks needed to break ice
            fastHandGameScoreSpan.textContent = fastHandGameScore;
        }

        startFastHandGameTimer();
    };

    fastHandGameBtn.addEventListener('click', () => {
        loadFastHandGameRound(1);
    });

    fastHandGameButton.addEventListener('click', () => {
        if (currentFastHandGameRound === 1 || currentFastHandGameRound === 2) {
            fastHandGameScore++;
            fastHandGameScoreSpan.textContent = fastHandGameScore;

            if (currentFastHandGameRound === 2) {
                // Move button randomly
                const maxX = fastHandGameContainer.clientWidth - fastHandGameButton.clientWidth;
                const maxY = fastHandGameContainer.clientHeight - fastHandGameButton.clientHeight;
                const newX = Math.random() * maxX;
                const newY = Math.random() * maxY;
                fastHandGameButton.style.left = `${newX}px`;
                fastHandGameButton.style.top = `${newY}px`;
            }
        } else if (currentFastHandGameRound === 3) {
            fastHandGameScore--;
            fastHandGameScoreSpan.textContent = fastHandGameScore;
            if (fastHandGameScore <= 0) {
                fastHandGameMessage.textContent = 'Ice Broken! Game Over!';
                clearInterval(fastHandGameInterval);
                fastHandGameButton.disabled = true;
                submitScore('fast_hand_game', currentFastHandGameRound, 20); // Score is 20 for breaking ice
                fastHandGameNextRoundBtn.style.display = 'block';
                fastHandGameViewLeaderboardBtn.style.display = 'block';
            }
        }
    });

    fastHandGameNextRoundBtn.addEventListener('click', () => {
        if (currentFastHandGameRound < 3) {
            loadFastHandGameRound(currentFastHandGameRound + 1);
        } else {
            alert('Fast Hand Game Over! Check the leaderboard.');
            showLeaderboard('fast_hand_game', currentFastHandGameRound);
        }
    });

    fastHandGameViewLeaderboardBtn.addEventListener('click', () => {
        showLeaderboard('fast_hand_game', currentFastHandGameRound);
    });

    backToSelectionBtn.addEventListener('click', () => {
        resetTimingGame();
        resetFastHandGame();
        showSection(gameSelection);
    });

    // --- Leaderboard Logic ---
    const showLeaderboard = async (gameType, round) => {
        try {
            const res = await fetch(`/api/game/leaderboard/${gameType}/${round}`, {
                headers: {
                    'x-auth-token': token,
                },
            });
            const data = await res.json();
            if (res.ok) {
                const leaderboardContent = document.getElementById('leaderboard-content');
                leaderboardContent.innerHTML = `<h3>${gameType.replace('_', ' ').toUpperCase()} - Round ${round} Leaderboard</h3>`;
                if (data.length > 0) {
                    data.forEach((entry, index) => {
                        const div = document.createElement('div');
                        div.textContent = `${index + 1}. ${entry.user.name} (${entry.user.studentId}) - Score: ${entry.score.toFixed(3)}`;
                        leaderboardContent.appendChild(div);
                    });
                } else {
                    leaderboardContent.innerHTML += '<p>No scores yet for this round.</p>';
                }
                showSection(leaderboardArea);
            } else {
                alert(data.msg || 'Failed to load leaderboard');
            }
        } catch (err) {
            console.error('Error loading leaderboard:', err);
            alert('Server error loading leaderboard');
        }
    };

    document.getElementById('back-to-game').addEventListener('click', () => {
        // Determine which game was active to go back to its area
        if (timingGameContainer.style.display === 'block') {
            showSection(gameArea);
        } else if (fastHandGameContainer.style.display === 'block') {
            showSection(gameArea);
        } else {
            showSection(gameSelection);
        }
    });

});
