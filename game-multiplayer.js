import { showError, validateRoomCode } from './utils.js';

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
let gameActive = false;
let isMyTurn = false;
let moveLock = false;

let gameBoard = Array(9).fill(null);

if (!validateRoomCode(roomCode)) {
  showError(result, 'Invalid room code. Please return to menu.');
}

player1Emoji.textContent = isHost ? mySymbol : opponentSymbol;
player2Emoji.textContent = isHost ? opponentSymbol : mySymbol;

// Accessibility: make cells keyboard accessible
cells.forEach((cell, index) => {
  cell.setAttribute('tabindex', '0');
  cell.setAttribute('role', 'button');
  cell.setAttribute('aria-label', `Cell ${index + 1}`);
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCellClick(index);
    }
  });
  cell.addEventListener('click', () => handleCellClick(index));
});

function checkWinner(board) {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diag
  ];
  for (const [a, b, c] of winLines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  if (board.every(c => c !== null)) {
    return 'draw';
  }
  return null;
}

function updateUI(board) {
  board.forEach((player, index) => {
    cells[index].textContent = player || '';
    cells[index].classList.toggle('occupied', !!player);
  });
}

function setTurnIndicator(isMyTurnNow) {
  isMyTurn = isMyTurnNow;
  if (isMyTurn) {
    player1Indicator.classList.add('active');
    player2Indicator.classList.remove('active');
  } else {
    player1Indicator.classList.remove('active');
    player2Indicator.classList.add('active');
  }
}

function handleCellClick(index) {
  if (!gameActive || moveLock || gameBoard[index]) return;
  if (!isMyTurn) {
    showError(result, 'It is not your turn');
    return;
  }
  moveLock = true;

  const roomRef = db.ref('rooms/' + roomCode);
  roomRef.transaction(room => {
    if (!room || room.winner || room.board[index] !== null) {
      return; // Abort transaction
    }
    if (room.turn !== mySymbol) {
      return; // Not player's turn
    }

    room.board[index] = mySymbol;
    room.turn = (mySymbol === 'X') ? 'O' : 'X';
    room.winner = checkWinner(room.board);
    return room;
  }, (error, committed, snapshot) => {
    if (error) {
      showError(result, 'Error submitting move.');
    }
    moveLock = false;
  });
}

function listenForGameUpdates() {
  const roomRef = db.ref('rooms/' + roomCode);
  roomRef.on('value', snapshot => {
    const room = snapshot.val();
    if (!room) {
      showError(result, 'Room data lost. Returning to menu.');
      gameActive = false;
      return;
    }
    gameBoard = room.board || Array(9).fill(null);
    updateUI(gameBoard);
    gameActive = !room.winner;
    result.textContent = room.winner === 'draw' ? 'Game ended in a draw' :
      room.winner ? `${room.winner} wins!` : 'Game in progress...';
    setTurnIndicator(room.turn === mySymbol);
  }, error => {
    showError(result, 'Failed to sync game data.');
  });
}

resetButton.addEventListener('click', () => {
  if (!roomCode) return;
  const roomRef = db.ref('rooms/' + roomCode);
  roomRef.set({
    roomCode,
    hostJoined: true,
    guestJoined: true,
    board: Array(9).fill(null),
    turn: 'X',
    winner: null
  }).catch(err => {
    showError(result, 'Failed to reset game: ' + err.message);
  });
});

backToMenuBtn.addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = 'home.html';
});

// Start listening for updates
if (roomCode) {
  listenForGameUpdates();
}
