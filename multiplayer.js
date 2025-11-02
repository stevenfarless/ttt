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
let gameBoard = Array(9).fill(null);
let gameActive = false;
let currentPlayer = mySymbol;
let isMyTurn = false;
let moveCount = 0;

console.log('[GAME] Session data loaded:', {
  roomCode,
  isHost,
  mySymbol,
  opponentSymbol
});

// Set player emojis in indicators
player1Emoji.textContent = mySymbol;
player2Emoji.textContent = opponentSymbol;

console.log('[GAME] Player indicators set:', {
  player1: mySymbol,
  player2: opponentSymbol
});

function updateTurnHighlight() {
  console.log('[GAME] Updating turn highlight. isMyTurn:', isMyTurn);
  if (isMyTurn) {
    player1Indicator.classList.add('active');
    player2Indicator.classList.remove('active');
    console.log('[GAME] Set active to player 1');
  } else {
    player1Indicator.classList.remove('active');
    player2Indicator.classList.add('active');
    console.log('[GAME] Set active to player 2');
  }
}

// Keyboard accessibility
cells.forEach((cell, index) => {
  cell.setAttribute('role', 'button');
  cell.setAttribute('tabindex', '0');
  cell.setAttribute('aria-label', `Cell ${index + 1}`);
  
  cell.addEventListener('click', () => {
    console.log('[GAME] Cell clicked at index:', index);
    makeMove(index);
  });
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      console.log('[GAME] Cell activated via keyboard at index:', index);
      makeMove(index);
    }
  });
});

function checkWinner(board) {
  console.log('[GAME] Checking for winner on board:', board);
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      console.log('[GAME] Winner found:', board[a], 'on line:', line);
      return board[a];
    }
  }

  if (board.every(cell => cell !== null)) {
    console.log('[GAME] Board is full - draw!');
    return 'draw';
  }

  console.log('[GAME] No winner yet');
  return null;
}

function updateBoard() {
  console.log('[GAME] Updating board display:', gameBoard);
  cells.forEach((cell, index) => {
    cell.textContent = gameBoard[index] || '';
  });
}

function makeMove(index) {
  console.log('[GAME] makeMove called at index:', index, 'gameActive:', gameActive, 'isMyTurn:', isMyTurn, 'cellOccupied:', !!gameBoard[index]);
  
  if (!gameActive || !isMyTurn || gameBoard[index]) {
    console.log('[GAME] Move rejected');
    return;
  }

  moveCount++;
  console.log('[GAME] Move accepted. Move count:', moveCount);
  const roomRef = db.ref('rooms/' + roomCode);
  
  roomRef.transaction((room) => {
    console.log('[GAME] Transaction started:', room);
    if (!room) {
      console.warn('[GAME] Room is null in transaction');
      return;
    }
    
    // IMPORTANT: Ensure board exists
    if (!room.board || !Array.isArray(room.board)) {
      console.warn('[GAME] Board is invalid, initializing');
      room.board = Array(9).fill(null);
    }
    
    if (room.board[index] !== null) {
      console.warn('[GAME] Cell already occupied in transaction');
      return;
    }

    room.board[index] = mySymbol;
    room.turn = room.turn === mySymbol ? opponentSymbol : mySymbol;
    room.winner = checkWinner(room.board);
    
    console.log('[GAME] Transaction data:', {
      boardChange: index + ' -> ' + mySymbol,
      nextTurn: room.turn,
      winner: room.winner
    });
    
    return room;
  }, (error, committed, snapshot) => {
    if (error) {
      console.error('[GAME] Transaction error:', error);
    } else {
      console.log('[GAME] Transaction completed. Committed:', committed);
    }
  });
}

function listenToGameChanges() {
  console.log('[GAME] Starting game listener for room:', roomCode);
  const roomRef = db.ref('rooms/' + roomCode);
  
  roomRef.on('value', (snapshot) => {
    const room = snapshot.val();
    
    console.log('[GAME] Game state update received:', {
      board: room?.board,
      turn: room?.turn,
      winner: room?.winner,
      guestJoined: room?.guestJoined
    });
    
    if (!room) {
      console.error('[GAME] Room not found');
      result.textContent = 'Room not found';
      gameActive = false;
      return;
    }

    // IMPORTANT: Ensure board is always an array
    gameBoard = (room.board && Array.isArray(room.board)) ? room.board : Array(9).fill(null);
    currentPlayer = room.turn;
    isMyTurn = room.turn === mySymbol;
    
    console.log('[GAME] State updated:', {
      currentPlayer,
      isMyTurn,
      mySymbol,
      board: gameBoard
    });
    
    updateBoard();
    updateTurnHighlight();

    // Check game state
    if (room.winner) {
      console.log('[GAME] Game has winner/draw:', room.winner);
      gameActive = false;
      if (room.winner === 'draw') {
        result.textContent = "It's a draw!";
      } else {
        result.textContent = room.winner === mySymbol ? 'You win! 🎉' : 'You lose';
      }
    } else if (moveCount === 0) {
      console.log('[GAME] Game starting');
      gameActive = true;
      result.textContent = 'Game started!';
    } else {
      gameActive = true;
      result.textContent = isMyTurn ? 'Your turn' : "Opponent's turn";
    }
  }, (error) => {
    console.error('[GAME] Listener error:', error);
  });
}

resetButton.addEventListener('click', () => {
  console.log('[GAME] Reset button clicked');
  const roomRef = db.ref('rooms/' + roomCode);
  const firstPlayer = isHost ? mySymbol : opponentSymbol;
  
  console.log('[GAME] Resetting game. First player:', firstPlayer);
  
  roomRef.update({
    board: Array(9).fill(null),
    turn: firstPlayer,
    winner: null
  });

  gameBoard = Array(9).fill(null);
  moveCount = 0;
  isMyTurn = isHost;
  gameActive = true;
  
  console.log('[GAME] Local state reset');
});

backToMenuBtn.addEventListener('click', () => {
  console.log('[GAME] Back to menu clicked');
  sessionStorage.clear();
  console.log('[GAME] Session storage cleared');
  window.location.href = 'home.html';
});

// Initialize game
console.log('[GAME] Initializing game listener');
listenToGameChanges();

console.log('[GAME] Script initialization complete');
