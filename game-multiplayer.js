// Firebase initialized in utils.js
// database is available globally

const board = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const youEmoji = document.getElementById('youEmoji');
const opponentEmoji = document.getElementById('opponentEmoji');

let roomCode = sessionStorage.getItem('roomCode');
let playerEmoji = sessionStorage.getItem('playerEmoji');
let isHost = sessionStorage.getItem('isHost') === 'true';
let opponentEmojiValue = null;
let gameState = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function init() {
  if (!roomCode || !playerEmoji) {
    alert('Game session expired. Redirecting...');
    window.location.href = 'home.html';
    return;
  }

  youEmoji.textContent = playerEmoji;
  getOpponentEmoji();
  setupBoard();
  setupEventListeners();
  watchGameState();
}

function setupBoard() {
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
  }
}

function setupEventListeners() {
  resetBtn.addEventListener('click', resetGame);
}

function handleCellClick(e) {
  const index = parseInt(e.target.dataset.index);
  
  if (gameState[index] === '' && gameActive) {
    const playerSymbol = isHost ? playerEmoji : opponentEmojiValue;
    gameState[index] = playerSymbol;
    
    database.ref(`rooms/${roomCode}/gameState`).set(gameState);
    
    checkGameEnd();
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }
}

function updateBoard() {
  document.querySelectorAll('.cell').forEach((cell, i) => {
    cell.textContent = gameState[i];
  });
}

function checkGameEnd() {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      gameActive = false;
      status.textContent = `${gameState[a]} Wins!`;
      return;
    }
  }
  
  if (!gameState.includes('')) {
    gameActive = false;
    status.textContent = "It's a Draw!";
    return;
  }
  
  const player1Turn = gameState.filter(cell => cell === playerEmoji).length === gameState.filter(cell => cell === opponentEmojiValue).length;
  status.textContent = `${player1Turn ? 'Your Turn' : "Opponent's Turn"}`;
}

function getOpponentEmoji() {
  const roomRef = database.ref(`rooms/${roomCode}`);
  roomRef.once('value', (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      opponentEmojiValue = isHost ? data.player2 : data.player1;
      opponentEmoji.textContent = opponentEmojiValue;
      updateBoard();
    }
  });
}

function watchGameState() {
  const roomRef = database.ref(`rooms/${roomCode}/gameState`);
  roomRef.on('value', (snapshot) => {
    if (snapshot.exists()) {
      gameState = snapshot.val();
      updateBoard();
      
      if (gameState.filter(c => c !== '').length > 0) {
        const player1Count = gameState.filter(cell => cell === playerEmoji).length;
        const player2Count = gameState.filter(cell => cell === opponentEmojiValue).length;
        
        currentPlayer = player1Count > player2Count ? 'O' : 'X';
      }
    }
  });
}

function resetGame() {
  gameState = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;
  status.textContent = 'Game Reset';
  
  database.ref(`rooms/${roomCode}/gameState`).set(gameState);
  database.ref(`rooms/${roomCode}/gameActive`).set(true);
  
  updateBoard();
}

init();
