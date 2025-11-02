const db = firebase.database();
console.log('[GAME] Script loaded');

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
let gameBoard = [null, null, null, null, null, null, null, null, null];
let gameActive = false;
let isMyTurn = isHost;
let moveCount = 0;

console.log('[GAME] Session data loaded:', { roomCode, isHost, mySymbol, opponentSymbol });

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
    
    // Convert board object to array if needed
    let board = room.board;
    if (!Array.isArray(board)) {
      board = Object.values(board || {}).length === 9 ? Object.values(board) : [null, null, null, null, null, null, null, null, null];
    }
    
    if (board[index] !== null) return;

    board[index] = mySymbol;
    room.board = board;
    room.turn = room.turn === mySymbol ? opponentSymbol : mySymbol;
    room.winner = checkWinner(board);
    
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

    // Convert board to proper array
    if (room.board) {
      if (Array.isArray(room.board)) {
        gameBoard = room.board;
      } else {
        gameBoard = Object.values(room.board);
      }
    } else {
      gameBoard = [null, null, null, null, null, null, null, null, null];
    }
    
    isMyTurn = room.turn === mySymbol;
    
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
    board: [null, null, null, null, null, null, null, null, null],
    turn: firstPlayer,
    winner: null
  });

  gameBoard = [null, null, null, null, null, null, null, null, null];
  moveCount = 0;
  isMyTurn = isHost;
  gameActive = true;
});

backToMenuBtn.addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = 'home.html';
});

listenToGameChanges();
console.log('[GAME] Script initialization complete');
