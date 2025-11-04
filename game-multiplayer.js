// game-multiplayer.js

import { firebaseConfig } from './utils.js';

const ANIMATION_DURATION = 600;

// Retrieve session data from sessionStorage

const roomCode = sessionStorage.getItem('roomCode');
const isHost = sessionStorage.getItem('isHost') === 'true';
const mySymbol = sessionStorage.getItem('mySymbol');
const opponentSymbol = sessionStorage.getItem('opponentSymbol');

if (!roomCode || !mySymbol || !opponentSymbol) {
  console.error('[GAME] Missing session data');
  window.location.href = 'index.html';
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
console.log('[GAME] Script loaded');

const board = Array(9).fill(null);
let currentTurn = null;
let winner = null;
let isLeavingGame = false;

const cells = document.querySelectorAll('.cell');
const result = document.getElementById('game-status');
const resetBtn = document.getElementById('reset-game-btn');
const leaveBtn = document.getElementById('leave-game-btn');

function updateBoardUI() {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    if (board[index] === mySymbol) {
      cell.style.color = 'blue';
    } else if (board[index] === opponentSymbol) {
      cell.style.color = 'red';
    } else {
      cell.style.color = 'var(--light)';
    }
  });
}

function checkWinner(boardState) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (const [a, b, c] of winPatterns) {
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a];
    }
  }
  return null;
}

function isBoardFull(boardState) {
  return boardState.every(cell => cell !== null);
}

async function makeMove(index) {
  if (board[index] !== null || currentTurn !== mySymbol || winner !== null) {
    return;
  }
  try {
    const roomRef = db.ref(`rooms/${roomCode}`);
    await roomRef.transaction(room => {
      if (!room) return;
      if (room.board[index] !== null) {
        throw 'Invalid move';
      }
      if (room.turn !== mySymbol) {
        throw 'Not your turn';
      }

      // Update board locally
      board[index] = mySymbol;
      // Convert board to object format for Firebase
      room.board = Object.fromEntries(board.map((val, i) => [i, val]));
      room.turn = opponentSymbol;
      room.winner = checkWinner(board);

      return room;
    });
  } catch (error) {
    console.error('[GAME] Transaction error:', error);
  }
}

function listenToGameChanges() {
  const roomRef = db.ref(`rooms/${roomCode}`);
  roomRef.on('value', (snapshot) => {
    if (isLeavingGame) return;
    const room = snapshot.val();
    if (!room) {
      result.textContent = 'Game room was closed';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }

    board.splice(0, board.length, ...Object.values(room.board || Array(9).fill(null)));
    currentTurn = room.turn;
    winner = room.winner;

    updateBoardUI();

    if (winner) {
      if (winner === mySymbol) {
        result.textContent = 'You win!';
      } else {
        result.textContent = 'You lose!';
      }
      resetBtn.disabled = false;
    } else if (isBoardFull(board)) {
      result.textContent = "It's a draw!";
      resetBtn.disabled = false;
    } else if (currentTurn === mySymbol) {
      result.textContent = "Your turn.";
      resetBtn.disabled = true;
    } else {
      result.textContent = "Opponent's turn.";
      resetBtn.disabled = true;
    }
  });
}

cells.forEach((cell, index) => {
  cell.addEventListener('click', () => {
    makeMove(index);
  });
});

resetBtn.addEventListener('click', async () => {
  if (!isHost) return;

  const roomRef = db.ref(`rooms/${roomCode}`);
  await roomRef.transaction(room => {
    if (!room) return;
    room.board = Object.fromEntries(Array(9).fill(null).map((_, i) => [i, null]));
    room.turn = isHost ? mySymbol : opponentSymbol;
    room.winner = null;
    return room;
  });
});

leaveBtn.addEventListener('click', async () => {
  isLeavingGame = true;

  const roomRef = db.ref(`rooms/${roomCode}`);

  if (isHost) {
    await roomRef.remove();
  } else {
    await roomRef.update({
      guestJoined: false,
      guestEmoji: null,
    });
  }

  sessionStorage.clear();

  window.location.href = 'index.html';
});

listenToGameChanges();
