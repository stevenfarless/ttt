import { firebaseConfig } from './utils.js';

// Constants
const ANIMATION_DURATION = 600;

// Cache sessionStorage at startup (only called once)
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
let previousBoard = [...gameBoard];
let gameActive = false;
let isMyTurn = isHost;
let roomRef = null;
let isLeavingGame = false;
let eventListenersActive = true;

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
 * Updates only changed cells on the visual board
 */
function updateBoard() {
  try {
    cells.forEach((cell, index) => {
      const symbol = gameBoard[index];
      
      // Only update cells that have changed
      if (cell.textContent !== (symbol || '')) {
        cell.textContent = symbol || '';
      }

      // Update styling only if symbol changed
      const newColor = symbol === mySymbol ? '#3B82F6' : 
                       symbol === opponentSymbol ? '#EF4444' : '';
      
      const hadMyMove = cell.classList.contains('my-move');
      const hadOpponentMove = cell.classList.contains('opponent-move');
      const shouldHaveMyMove = symbol === mySymbol;
      const shouldHaveOpponentMove = symbol === opponentSymbol;

      if (hadMyMove && !shouldHaveMyMove) {
        cell.classList.remove('my-move');
      } else if (!hadMyMove && shouldHaveMyMove) {
        cell.classList.add('my-move');
      }

      if (hadOpponentMove && !shouldHaveOpponentMove) {
        cell.classList.remove('opponent-move');
      } else if (!hadOpponentMove && shouldHaveOpponentMove) {
        cell.classList.add('opponent-move');
      }

      if (cell.style.color !== newColor) {
        cell.style.color = newColor;
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
 * Normalizes board from Firebase (object or array format)
 */
function normalizeBoardFromFirebase(firebaseBoard) {
  if (!firebaseBoard) {
    return Array(9).fill(null);
  }
  
  if (Array.isArray(firebaseBoard)) {
    return firebaseBoard;
  }
  
  // Convert Firebase object format to array
  const normalized = Array(9).fill(null);
  for (let i = 0; i < 9; i++) {
    if (firebaseBoard[i] !== undefined) {
      normalized[i] = firebaseBoard[i];
    }
  }
  return normalized;
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

      // Normalize board from Firebase once
      const board = normalizeBoardFromFirebase(room.board);

      if (board[index] !== null) {
        console.log('[GAME] Cell occupied');
        return;
      }

      // Make move
      board[index] = mySymbol;

      // Convert back to Firebase format (object with numeric keys)
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
  roomRef = db.ref('rooms/' + roomCode);

  roomRef.on('value', (snapshot) => {
    try {
      // Skip processing if we're already leaving or listeners are inactive
      if (isLeavingGame || !eventListenersActive) {
        return;
      }

      const room = snapshot.val();

      if (!room) {
        console.log('[GAME] Room disappeared');
        if (!isLeavingGame) {
          result.textContent = 'Opponent left the game';
          setTimeout(() => {
            isLeavingGame = true;
            roomRef.off('value');
            window.location.href = 'index.html';
          }, 2000);
        }
        return;
      }

      // Check if opponent wants to go back to menu
      if (room.playerLeftRequested) {
        console.log('[GAME] Opponent quit the game');
        if (!isLeavingGame) {
          isLeavingGame = true;
          eventListenersActive = false;
          roomRef.off('value');
          alert('Your opponent quit the game.');
          sessionStorage.clear();
          window.location.href = 'index.html';
        }
        return;
      }

      // Normalize board once
      const newBoard = normalizeBoardFromFirebase(room.board);

      // Detect opponent move and play animation
      for (let i = 0; i < 9; i++) {
        if (previousBoard[i] !== newBoard[i] && newBoard[i] !== null && newBoard[i] !== undefined) {
          console.log(`[GAME] Opponent move detected at index ${i}: ${previousBoard[i]} -> ${newBoard[i]}`);
          playMoveAnimation(i);
          break; // Only animate the first changed cell
        }
      }

      // Update previousBoard for next comparison
      previousBoard = [...newBoard];
      gameBoard = newBoard;

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
          result.textContent = room.winner === mySymbol ? 'You win! \U0001f389' : 'You lose';
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
 * Resets the game state
 */
function resetGame() {
  try {
    const firstPlayer = isHost ? mySymbol : opponentSymbol;
    const emptyBoard = Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [i, null])
    );

    roomRef.update({
      board: emptyBoard,
      turn: firstPlayer,
      winner: null
    });

    gameBoard = Array(9).fill(null);
    previousBoard = [...gameBoard];
    isMyTurn = isHost;
    gameActive = true;

  } catch (error) {
    console.error('[GAME] Reset error:', error);
  }
}

/**
 * Navigates back to menu and notifies opponent
 */
function goBackToMenu() {
  try {
    console.log('[GAME] Player going back to menu');

    // Prevent re-entrance
    if (isLeavingGame) {
      return;
    }

    isLeavingGame = true;
    eventListenersActive = false;

    // Stop listening BEFORE updating Firebase
    roomRef.off('value');

    // Set flag to notify opponent
    roomRef.update({
      playerLeftRequested: true
    }).then(() => {
      console.log('[GAME] Notified opponent');
      sessionStorage.clear();

      // Give opponent time to see notification before we completely leave
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);

    }).catch(error => {
      console.error('[GAME] Error notifying opponent:', error);
      // Leave anyway if notification fails
      sessionStorage.clear();
      window.location.href = 'index.html';
    });

  } catch (error) {
    console.error('[GAME] Navigation error:', error);
    sessionStorage.clear();
    window.location.href = 'index.html';
  }
}

/**
 * Cleanup function to remove event listeners
 */
function cleanup() {
  try {
    cells.forEach((cell) => {
      // Clone and replace to remove all listeners
      const newCell = cell.cloneNode(true);
      cell.parentNode.replaceChild(newCell, cell);
    });

    resetButton?.removeEventListener('click', resetGame);
    backToMenuBtn?.removeEventListener('click', goBackToMenu);

    eventListenersActive = false;
  } catch (error) {
    console.error('[GAME] Cleanup error:', error);
  }
}

// Event Listeners - with proper cleanup
const cellClickHandler = (index) => () => makeMove(index);
const cellKeydownHandler = (index) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    makeMove(index);
  }
};

cells.forEach((cell, index) => {
  cell.setAttribute('role', 'button');
  cell.setAttribute('tabindex', '0');
  cell.addEventListener('click', cellClickHandler(index));
  cell.addEventListener('keydown', cellKeydownHandler(index));
});

resetButton?.addEventListener('click', resetGame);
backToMenuBtn?.addEventListener('click', goBackToMenu);

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Initialize
listenToGameChanges();
updateTurnHighlight();

console.log('[GAME] Script initialization complete');
