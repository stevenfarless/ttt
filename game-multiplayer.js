// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBfJzZ52dh9lKJ8Eo9CvYZd9RK9WwQwx-U",
  authDomain: "tic-tac-toe-multiplayer-7e3ea.firebaseapp.com",
  projectId: "tic-tac-toe-multiplayer-7e3ea",
  storageBucket: "tic-tac-toe-multiplayer-7e3ea.appspot.com",
  messagingSenderId: "816848127676",
  appId: "1:816848127676:web:b35d0a4f8c9e3d6f7c2a1b",
  databaseURL: "https://tic-tac-toe-multiplayer-7e3ea-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Get room code and emoji from session
const roomCode = sessionStorage.getItem('roomCode');
const playerEmoji = sessionStorage.getItem('playerEmoji');
const isHost = sessionStorage.getItem('isHost') === 'true';

// DOM Elements
const board = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const quitBtn = document.getElementById('quitBtn');
const youEmoji = document.getElementById('youEmoji');
const opponentEmoji = document.getElementById('opponentEmoji');

// Game state
let gameState = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;
let opponentEmojiValue = null;
let playerSymbol = isHost ? 'X' : 'O';
let opponentSymbol = isHost ? 'O' : 'X';
let gameStarted = false;
let roomRef = database.ref(`rooms/${roomCode}`);

// Winning patterns
const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Initialize game
function initGame() {
  youEmoji.textContent = playerEmoji;
  createBoard();
  
  // Wait for opponent
  roomRef.on('value', (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const opponent = isHost ? data.player2 : data.player1;
      
      if (opponent && !gameStarted) {
        opponentEmojiValue = opponent;
        opponentEmoji.textContent = opponent;
        gameActive = true;
        gameStarted = true;
        currentPlayer = 'X';
        updateStatus();
      }
    }
  });

  // Listen for opponent moves
  roomRef.child('gameState').on('value', (snapshot) => {
    if (snapshot.exists()) {
      const moves = snapshot.val();
      gameState = moves;
      updateBoardUI();
      
      // Check if game has ended
      if (checkWin()) {
        const winner = currentPlayer === playerSymbol ? 'Opponent' : 'You';
        status.textContent = winner === 'You' ? '🎉 You Win!' : '😢 Opponent Wins!';
        gameActive = false;
      } else if (gameState.every(cell => cell !== '')) {
        status.textContent = '🤝 Draw!';
        gameActive = false;
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
      }
    }
  });
  
  // Setup button listeners
  resetBtn.addEventListener('click', resetGame);
  quitBtn.addEventListener('click', quitGame);
}

function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.textContent = '';
    cell.addEventListener('click', () => handleCellClick(i));
    board.appendChild(cell);
  }
}

function handleCellClick(index) {
  if (!gameActive || gameState[index] !== '' || currentPlayer !== playerSymbol) {
    return;
  }

  gameState[index] = playerSymbol;
  updateBoardUI();

  // Send move to Firebase
  roomRef.child('gameState').set(gameState);

  // Check for win
  if (checkWin()) {
    status.textContent = '🎉 You Win!';
    gameActive = false;
    return;
  }

  // Check for draw
  if (gameState.every(cell => cell !== '')) {
    status.textContent = '🤝 Draw!';
    gameActive = false;
    return;
  }

  // Switch to opponent
  currentPlayer = opponentSymbol;
  updateStatus();
}

function updateBoardUI() {
  for (let i = 0; i < 9; i++) {
    const cell = board.children[i];
    if (gameState[i] === '') {
      cell.textContent = '';
      cell.classList.remove('filled', 'player-x', 'player-o');
    } else if (gameState[i] === 'X') {
      cell.textContent = isHost ? playerEmoji : opponentEmojiValue;
      cell.classList.add('filled', 'player-x');
    } else if (gameState[i] === 'O') {
      cell.textContent = isHost ? opponentEmojiValue : playerEmoji;
      cell.classList.add('filled', 'player-o');
    }
  }
}

function updateStatus() {
  if (!gameStarted) {
    status.textContent = '⏳ Waiting for opponent...';
  } else if (!gameActive) {
    return;
  } else if (currentPlayer === playerSymbol) {
    status.textContent = '🎮 Your Turn';
  } else {
    status.textContent = "⏳ Opponent's Turn";
  }
}

function checkWin() {
  return winPatterns.some(pattern =>
    gameState[pattern[0]] !== '' &&
    gameState[pattern[0]] === gameState[pattern[1]] &&
    gameState[pattern[1]] === gameState[pattern[2]]
  );
}

function resetGame() {
  gameState = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = gameStarted;
  updateBoardUI();
  updateStatus();
  roomRef.child('gameState').set(gameState);
}

function quitGame() {
  sessionStorage.removeItem('roomCode');
  sessionStorage.removeItem('playerEmoji');
  sessionStorage.removeItem('isHost');
  roomRef.off();
  window.location.href = 'index.html';
}

initGame();
