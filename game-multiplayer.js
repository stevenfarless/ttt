const db = firebase.database();

const player1Indicator = document.getElementById('player1-indicator');
const player2Indicator = document.getElementById('player2-indicator');
const player1Emoji = document.getElementById('player1-emoji');
const player2Emoji = document.getElementById('player2-emoji');
const cells = document.querySelectorAll('.cell');
const result = document.getElementById('result');
const resetButton = document.getElementById('reset');
const backToMenuBtn = document.getElementById('backToMenu');

let roomCode = sessionStorage.getItem('roomCode');
let isHost = sessionStorage.getItem('isHost') === 'true';
let mySymbol = sessionStorage.getItem('mySymbol');
let opponentSymbol = sessionStorage.getItem('opponentSymbol');
let gameBoard = Array(9).fill(null);
let gameActive = false;
let currentPlayer = mySymbol;
let isMyTurn = false;
let moveCount = 0;

// Set player emojis in indicators
player1Emoji.textContent = mySymbol;
player2Emoji.textContent = opponentSymbol;

function updateTurnHighlight() {
  if (isMyTurn) {
    player1Indicator.classList.add('active');
    player2Indicator.classList.remove('active');
  } else {
    player1Indicator.classList.remove('active');
    player2Indicator.classList.add('active');
  }
}

// Keyboard accessibility
cells.forEach((cell, index) => {
  cell.setAttribute('role', 'button');
  cell.setAttribute('tabindex', '0');
  cell.setAttribute('aria-label', `Cell ${index + 1}`);
  
  cell.addEventListener('click', () => makeMove(index));
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      makeMove(index);
    }
  });
});

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }

  if (board.every(cell => cell !== null)) {
    return 'draw';
  }

  return null;
}

function updateBoard() {
  cells.forEach((cell, index) => {
    cell.textContent = gameBoard[index] || '';
  });
}

function makeMove(index) {
  if (!gameActive || !isMyTurn || gameBoard[index]) {
    return;
  }

  moveCount++;
  const roomRef = db.ref('rooms/' + roomCode);
  
  roomRef.transaction((room) => {
    if (!room) return;
    
    if (room.board[index] !== null) {
      return; // Cell already taken
    }

    room.board[index] = mySymbol;
    room.turn = room.turn === mySymbol ? opponentSymbol : mySymbol;
    room.winner = checkWinner(room.board);
    
    return room;
  });
}

function listenToGameChanges() {
  const roomRef = db.ref('rooms/' + roomCode);
  
  roomRef.on('value', (snapshot) => {
    const room = snapshot.val();
    
    if (!room) {
      result.textContent = 'Room not found';
      gameActive = false;
      return;
    }

    gameBoard = room.board || Array(9).fill(null);
    currentPlayer = room.turn;
    isMyTurn = room.turn === mySymbol;
    
    updateBoard();
    updateTurnHighlight();

    // Check game state
    if (room.winner) {
      gameActive = false;
      if (room.winner === 'draw') {
        result.textContent = "It's a draw!";
      } else {
        result.textContent = room.winner === mySymbol ? 'You win! 🎉' : 'You lose';
      }
    } else if (moveCount === 0) {
      gameActive = true;
      result.textContent = 'Game started!';
    } else {
      gameActive = true;
      result.textContent = isMyTurn ? 'Your turn' : "Opponent's turn";
    }
  });
}

resetButton.addEventListener('click', () => {
  const roomRef = db.ref('rooms/' + roomCode);
  const firstPlayer = isHost ? mySymbol : opponentSymbol;
  
  roomRef.update({
    board: Array(9).fill(null),
    turn: firstPlayer,
    winner: null
  });

  gameBoard = Array(9).fill(null);
  moveCount = 0;
  isMyTurn = isHost;
  gameActive = true;
});

backToMenuBtn.addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = 'home.html';
});

// Initialize game
listenToGameChanges();
