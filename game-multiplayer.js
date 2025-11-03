import { firebaseConfig } from './utils.js';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

console.log('[GAME] Script loaded');

const player1Indicator = document.querySelector('.player-indicator:nth-child(1)');
const player2Indicator = document.querySelector('.player-indicator:nth-child(2)');
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

let gameBoard = [null, null, null, null, null, null, null, null, null];
let gameActive = false;
let isMyTurn = isHost;
let moveCount = 0;

console.log('[GAME] Session data loaded:', { roomCode, isHost, mySymbol, opponentSymbol });

// Set player emojis in indicators
if (player1Emoji) player1Emoji.textContent = mySymbol;
if (player2Emoji) player2Emoji.textContent = opponentSymbol;

function updateTurnHighlight() {
  if (isMyTurn) {
    player1Indicator.classList.add('active');
    player2Indicator.classList.remove('active');
  } else {
    player1Indicator.classList.remove('active');
    player2Indicator.classList.add('active');
  }
}

cells.forEach((cell, index) => {
  cell.setAttribute('role', 'button');
  cell.setAttribute('tabindex', '0');
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
    const symbol = gameBoard[index];
    cell.textContent = symbol || '';
    
    // PLAYER PERSPECTIVE COLORS
    if (symbol === mySymbol) {
      cell.style.color = '#3B82F6'; // BLUE for my moves
      cell.classList.add('my-move');
      cell.classList.remove('opponent-move');
    } else if (symbol === opponentSymbol) {
      cell.style.color = '#EF4444'; // RED for opponent moves
      cell.classList.add('opponent-move');
      cell.classList.remove('my-move');
    } else {
      cell.style.color = '';
      cell.classList.remove('my-move', 'opponent-move');
    }
  });
}

function playMoveAnimation(index) {
  const cell = cells[index];
  
  // Add animation class
  cell.classList.add('clicked');
  
  // Remove animation class after animation completes (600ms)
  setTimeout(() => {
    cell.classList.remove('clicked');
  }, 600);
}

function makeMove(index) {
  if (!gameActive || !isMyTurn || gameBoard[index]) {
    return;
  }

  moveCount++;
  
  // Play animation immediately for the local player
  playMoveAnimation(index);

  const roomRef = db.ref('rooms/' + roomCode);
  
  roomRef.transaction((room) => {
    if (!room) return;
    
    // Verify it's this player's turn
    if (room.turn !== mySymbol) {
      console.log('[GAME] Transaction aborted: not my turn. room.turn:', room.turn, 'mySymbol:', mySymbol);
      return;
    }
    
    // Convert board from object to array
    let board = [];
    if (room.board) {
      for (let i = 0; i < 9; i++) {
        board[i] = room.board[i] || null;
      }
    } else {
      board = [null, null, null, null, null, null, null, null, null];
    }
    
    // Check cell is empty
    if (board[index] !== null) {
      console.log('[GAME] Cell occupied, aborting transaction');
      return;
    }
    
    // Make the move
    board[index] = mySymbol;
    
    // Convert back to object for Firebase
    const boardObj = {};
    for (let i = 0; i < 9; i++) {
      boardObj[i] = board[i];
    }
    
    room.board = boardObj;
    
    // CRITICAL: Toggle turn to OPPONENT correctly
    room.turn = opponentSymbol;
    room.winner = checkWinner(board);
    
    console.log('[GAME] Move made at index', index, '. New turn:', room.turn, 'Winner:', room.winner);
    return room;
  }, (error, committed, snapshot) => {
    if (error) {
      console.error('[GAME] Transaction error:', error);
    } else {
      console.log('[GAME] Transaction committed:', committed);
    }
  });
}

function listenToGameChanges() {
  const roomRef = db.ref('rooms/' + roomCode);
  let previousBoard = [null, null, null, null, null, null, null, null, null];
  
  roomRef.on('value', (snapshot) => {
    const room = snapshot.val();
    console.log('[GAME] Firebase update - board:', room?.board, 'turn:', room?.turn, 'mySymbol:', mySymbol);
    
    if (!room) {
      result.textContent = 'Room not found';
      gameActive = false;
      return;
    }
    
    // Convert board to proper array
    if (room.board) {
      if (Array.isArray(room.board)) {
        gameBoard = room.board;
      } else {
        gameBoard = [];
        for (let i = 0; i < 9; i++) {
          gameBoard[i] = room.board[i] || null;
        }
      }
    } else {
      gameBoard = [null, null, null, null, null, null, null, null, null];
    }
    
    // Play animation for opponent's move (find which cell changed)
    for (let i = 0; i < 9; i++) {
      if (previousBoard[i] !== gameBoard[i] && gameBoard[i] !== null) {
        playMoveAnimation(i);
      }
    }
    previousBoard = [...gameBoard];
    
    isMyTurn = room.turn === mySymbol;
    console.log('[GAME] isMyTurn:', isMyTurn, 'gameBoard:', gameBoard);
    
    updateBoard();
    updateTurnHighlight();
    
    if (room.winner) {
      gameActive = false;
      if (room.winner === 'draw') {
        result.textContent = "It's a draw!";
      } else {
        result.textContent = room.winner === mySymbol ? 'You win! 🎉' : 'You lose';
      }
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
    board: {
      0: null, 1: null, 2: null,
      3: null, 4: null, 5: null,
      6: null, 7: null, 8: null
    },
    turn: firstPlayer,
    winner: null
  });
  
  gameBoard = [null, null, null, null, null, null, null, null, null];
  moveCount = 0;
  isMyTurn = isHost;
  gameActive = true;
});

backToMenuBtn.addEventListener('click', () => {
  console.log('[GAME] Back to menu clicked');
  sessionStorage.clear();
  window.location.href = 'home.html';
});

listenToGameChanges();

console.log('[GAME] Script initialization complete');
