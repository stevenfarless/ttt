import { firebaseConfig } from './utils.js';

// Constants
const ANIMATION_DURATION = 600;

// Validate session and initialize Firebase
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

// DOM References
const player1Indicator = document.querySelector('.player-indicator:nth-child(1)');
const player2Indicator = document.querySelector('.player-indicator:nth-child(2)');
const player1Emoji = document.getElementById('player1-emoji');
const player2Emoji = document.getElementById('player2-emoji');
const cells = document.querySelectorAll('.cell');
const result = document.getElementById('result');
const resetButton = document.getElementById('reset');
const backToMenuBtn = document.getElementById('backToMenu');

// Game State
let gameBoard = Array(9).fill(null);
let previousBoard = Array(9).fill(null);
let gameActive = false;
let isMyTurn = isHost;
let resetNotificationShown = false;

console.log('[GAME] Session data loaded:', { roomCode, isHost, mySymbol, opponentSymbol });

// Set player emojis
if (player1Emoji) player1Emoji.textContent = mySymbol;
if (player2Emoji) player2Emoji.textContent = opponentSymbol;

/**
 * Updates the turn indicator highlight
 */
function updateTurnHighlight() {
  try {
    if (isMyTurn) {
      player1Indicator.classList.add('active');
      player2Indicator.classList.remove('active');
    } else {
      player1Indicator.classList.remove('active');
      player2Indicator.classList.add('active');
    }
  } catch (error) {
    console.error('[GAME] Error updating turn highlight:', error);
  }
}

/**
 * Checks for a winner on the board
 * @param {Array} board - The game board
 * @returns {string|null} Winner symbol, 'draw', or null
 */
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

  return board.every(cell => cell !== null) ? 'draw' : null;
}

/**
 * Updates the visual board display
 */
function updateBoard() {
  try {
    cells.forEach((cell, index) => {
      const symbol = gameBoard[index];
      cell.textContent = symbol || '';

      cell.classList.remove('my-move', 'opponent-move');
      cell.style.color = '';

      if (symbol === mySymbol) {
        cell.style.color = '#3B82F6';
        cell.classList.add('my-move');
      } else if (symbol === opponentSymbol) {
        cell.style.color = '#EF4444';
        cell.classList.add('opponent-move');
      }
    });
  } catch (error) {
    console.error('[GAME] Error updating board:', error);
  }
}

/**
 * Plays animation for a cell move
 * @param {number} index - The cell index
 */
function playMoveAnimation(index) {
  try {
    const cell = cells[index];
    cell.classList.add('clicked');

    setTimeout(() => {
      cell.classList.remove('clicked');
    }, ANIMATION_DURATION);
  } catch (error) {
    console.error('[GAME] Error playing animation:', error);
  }
}

/**
 * Handles a cell click for making a move
 * @param {number} index - The cell index
 */
function makeMove(index) {
  if (!gameActive || !isMyTurn || gameBoard[index]) {
    return;
  }

  playMoveAnimation(index);

  const roomRef = db.ref('rooms/' + roomCode);

  roomRef.transaction((room) => {
    try {
      if (!room) {
        console.log('[GAME] Room not found');
        return;
      }

      if (room.turn !== mySymbol) {
        console.log('[GAME] Transaction aborted: not my turn');
        return;
      }

      // Normalize board from Firebase
      let board = [];
      if (room.board) {
        for (let i = 0; i < 9; i++) {
          board[i] = room.board[i] || null;
        }
      } else {
        board = Array(9).fill(null);
      }

      if (board[index] !== null) {
        console.log('[GAME] Cell occupied');
        return;
      }

      // Make move
      board[index] = mySymbol;

      // Convert back to Firebase format
      room.board = Object.fromEntries(board.map((val, i) => [i, val]));
      room.turn = opponentSymbol;
      room.winner = checkWinner(board);

      console.log('[GAME] Move made at index', index);
      return room;
    } catch (error) {
      console.error('[GAME] Transaction error:', error);
      return;
    }
  }, (error) => {
    if (error) {
      console.error('[GAME] Transaction failed:', error);
    }
  });
}

/**
 * Listens to Firebase game changes and updates local state
 */
function listenToGameChanges() {
  const roomRef = db.ref('rooms/' + roomCode);

  roomRef.on('value', (snapshot) => {
    try {
      const room = snapshot.val();

      if (!room) {
        result.textContent = 'Room not found';
        gameActive = false;
        return;
      }

      // Check if opponent reset the game
      if (room.resetRequested && !resetNotificationShown) {
        resetNotificationShown = true;
        console.log('[GAME] Opponent requested reset');
        
        const confirmed = confirm('Your opponent reset the game. Return to menu?');
        if (confirmed) {
          sessionStorage.clear();
          window.location.href = 'index.html';
        } else {
          // Reset the flag if user cancels
          resetNotificationShown = false;
          db.ref('rooms/' + roomCode).update({ resetRequested: false });
        }
        return;
      }

      // Reset the flag when game state changes back to normal
      if (!room.resetRequested) {
        resetNotificationShown = false;
      }

      // Normalize board
      if (room.board) {
        gameBoard = Array.isArray(room.board)
          ? room.board
          : Array.from({ length: 9 }, (_, i) => room.board[i] || null);
      } else {
        gameBoard = Array(9).fill(null);
      }

      // Detect opponent move and play animation
      for (let i = 0; i < 9; i++) {
        const changed = previousBoard[i] !== gameBoard[i];
        const isNewMove = gameBoard[i] !== null && gameBoard[i] !== undefined;

        if (changed && isNewMove) {
          console.log(`[GAME] Opponent move detected at index ${i}: ${previousBoard[i]} -> ${gameBoard[i]}`);
          playMoveAnimation(i);
        }
      }

      // Update previousBoard for next comparison
      previousBoard = gameBoard.map(cell => cell);

      // Update game state
      isMyTurn = room.turn === mySymbol;
      updateBoard();
      updateTurnHighlight();

      // Check for winner
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
    } catch (error) {
      console.error('[GAME] Error in listener:', error);
    }
  }, (error) => {
    console.error('[GAME] Firebase listener error:', error);
  });
}

/**
 * Resets the game state and notifies opponent
 */
function resetGame() {
  try {
    console.log('[GAME] Reset requested by player');
    
    // Set resetRequested flag to notify opponent
    db.ref('rooms/' + roomCode).update({
      resetRequested: true
    }).then(() => {
      console.log('[GAME] Reset notification sent');
      
      // Reset local state
      const firstPlayer = isHost ? mySymbol : opponentSymbol;
      const emptyBoard = Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => [i, null])
      );

      // Give opponent time to see notification, then reset
      setTimeout(() => {
        db.ref('rooms/' + roomCode).update({
          board: emptyBoard,
          turn: firstPlayer,
          winner: null,
          resetRequested: false
        });

        gameBoard = Array(9).fill(null);
        previousBoard = Array(9).fill(null);
        isMyTurn = isHost;
        gameActive = true;
        resetNotificationShown = false;
      }, 300);
    }).catch(error => {
      console.error('[GAME] Reset error:', error);
    });
  } catch (error) {
    console.error('[GAME] Reset error:', error);
  }
}

/**
 * Navigates back to home
 */
function goBackToMenu() {
  try {
    sessionStorage.clear();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('[GAME] Navigation error:', error);
  }
}

// Event Listeners
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

resetButton?.addEventListener('click', resetGame);
backToMenuBtn?.addEventListener('click', goBackToMenu);

// Initialize
listenToGameChanges();
updateTurnHighlight();

console.log('[GAME] Script initialization complete');
