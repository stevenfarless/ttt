import { firebaseConfig } from './utils.js';

// Constants
const ANIMATION_DURATION = 600;

// Validate session and initialize Firebase
const roomCode = sessionStorage.getItem('roomCode');
const isHost = sessionStorage.getItem('isHost') === 'true';
const mySymbol = sessionStorage.getItem('mySymbol');
const opponentSymbol = sessionStorage.getItem('opponentSymbol');

window.gameLogger?.log('GAME', 'Game script starting', {
  roomCode,
  isHost,
  mySymbol,
  opponentSymbol,
  sessionValid: !!(roomCode && mySymbol && opponentSymbol)
}, 'info');

if (!roomCode || !mySymbol || !opponentSymbol) {
  window.gameLogger?.log('GAME', 'Invalid session - missing critical data', {
    roomCodePresent: !!roomCode,
    mySymbolPresent: !!mySymbol,
    opponentSymbolPresent: !!opponentSymbol
  }, 'error');
  console.error('[GAME] Missing session data');
  window.location.href = 'index.html';
}

if (!firebase.apps.length) {
  window.gameLogger?.logFirebaseInit(firebaseConfig);
  try {
    firebase.initializeApp(firebaseConfig);
    window.gameLogger?.logFirebaseInitComplete(true);
  } catch (error) {
    window.gameLogger?.logFirebaseInitComplete(false, error);
  }
}

const db = firebase.database();
window.gameLogger?.log('GAME', 'Firebase initialized', {}, 'success');

// DOM References
const player1Indicator = document.querySelector('.player-indicator:nth-child(1)');
const player2Indicator = document.querySelector('.player-indicator:nth-child(2)');
const player1Emoji = document.getElementById('player1-emoji');
const player2Emoji = document.getElementById('player2-emoji');
const cells = document.querySelectorAll('.cell');
const result = document.getElementById('result');
const resetButton = document.getElementById('reset');
const backToMenuBtn = document.getElementById('backToMenu');

window.gameLogger?.log('GAME', 'DOM elements loaded', {
  domElementsFound: [
    player1Indicator, player2Indicator, player1Emoji, player2Emoji, cells,
    result, resetButton, backToMenuBtn
  ].filter(Boolean).length,
  cellCount: cells.length
}, 'debug');

// Game State
let gameBoard = Array(9).fill(null);
let previousBoard = Array(9).fill(null);
let gameActive = false;
let isMyTurn = isHost;
let roomRef = null;
let isLeavingGame = false;

window.gameLogger?.log('GAME', 'Session data validated', {
  roomCode,
  isHost,
  mySymbol,
  opponentSymbol,
  initialTurn: isMyTurn
}, 'info');

// Set player emojis
if (player1Emoji) player1Emoji.textContent = mySymbol;
if (player2Emoji) player2Emoji.textContent = opponentSymbol;

window.gameLogger?.log('GAME', 'Player emojis set', {
  player1: mySymbol,
  player2: opponentSymbol
}, 'debug');

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
    window.gameLogger?.logUIInteraction({
      action: 'Turn highlight updated',
      element: 'player-indicators',
      eventType: 'state_change',
      info: { isMyTurn, mySymbol, opponentSymbol }
    });
  } catch (error) {
    window.gameLogger?.log('GAME', 'Error updating turn highlight', {
      error: error.message,
      stack: error.stack
    }, 'error');
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
      window.gameLogger?.log('GAME', 'Winner found', {
        winner: board[a],
        winningLine: line,
        symbolMatches: `${board[a]} === ${board[b]} === ${board[c]}`
      }, 'info');
      return board[a];
    }
  }

  if (board.every(cell => cell !== null)) {
    window.gameLogger?.log('GAME', 'Draw detected', {
      boardFull: true,
      totalMoves: board.filter(c => c !== null).length
    }, 'info');
    return 'draw';
  }

  return null;
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
    window.gameLogger?.logGameState({
      board: gameBoard,
      gameActive,
      isMyTurn,
      mySymbol,
      opponentSymbol,
      isHost
    });
  } catch (error) {
    window.gameLogger?.log('GAME', 'Error updating board display', {
      error: error.message,
      stack: error.stack
    }, 'error');
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
    window.gameLogger?.log('GAME', 'Move animation started', { cellIndex: index }, 'debug');

    setTimeout(() => {
      cell.classList.remove('clicked');
      window.gameLogger?.log('GAME', 'Move animation completed', { cellIndex: index }, 'debug');
    }, ANIMATION_DURATION);
  } catch (error) {
    window.gameLogger?.log('GAME', 'Error playing animation', {
      error: error.message,
      cellIndex: index
    }, 'error');
  }
}

/**
 * Handles a cell click for making a move
 * @param {number} index - The cell index
 */
function makeMove(index) {
  if (!gameActive || !isMyTurn || gameBoard[index]) {
    if (!gameActive) {
      window.gameLogger?.log('GAME', 'Move rejected: game not active', { cellIndex: index }, 'debug');
    } else if (!isMyTurn) {
      window.gameLogger?.log('GAME', 'Move rejected: not my turn', { cellIndex: index }, 'debug');
    } else {
      window.gameLogger?.log('GAME', 'Move rejected: cell occupied', { cellIndex: index }, 'debug');
    }
    return;
  }

  window.gameLogger?.logMove({
    cellIndex: index,
    player: 'me',
    symbol: mySymbol,
    boardState: gameBoard.slice(),
    timestamp: Date.now()
  });

  playMoveAnimation(index);

  roomRef.transaction((room) => {
    try {
      if (!room) {
        window.gameLogger?.log('GAME', 'Room not found during transaction', {}, 'warn');
        return;
      }

      if (room.turn !== mySymbol) {
        window.gameLogger?.log('GAME', 'Transaction aborted: turn mismatch', {
          expectedTurn: mySymbol,
          actualTurn: room.turn
        }, 'debug');
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
        window.gameLogger?.log('GAME', 'Cell already occupied during transaction', {
          cellIndex: index,
          currentValue: board[index]
        }, 'warn');
        return;
      }

      // Make move
      board[index] = mySymbol;

      // Convert back to Firebase format
      room.board = Object.fromEntries(board.map((val, i) => [i, val]));
      room.turn = opponentSymbol;
      room.winner = checkWinner(board);

      window.gameLogger?.log('GAME', 'Move committed to Firebase', {
        cellIndex: index,
        newTurn: opponentSymbol,
        winner: room.winner || 'ongoing',
        boardState: board
      }, 'info');

      return room;
    } catch (error) {
      window.gameLogger?.log('GAME', 'Transaction error', {
        error: error.message,
        stack: error.stack,
        cellIndex: index
      }, 'error');
      return;
    }
  }, (error) => {
    if (error) {
      window.gameLogger?.log('GAME', 'Transaction failed', {
        error: error.message,
        code: error.code,
        cellIndex: index
      }, 'error');
    }
  });
}

/**
 * Listens to Firebase game changes and updates local state
 */
function listenToGameChanges() {
  roomRef = db.ref('rooms/' + roomCode);

  window.gameLogger?.logFirebaseConnection(roomCode);
  window.gameLogger?.log('GAME', 'Setting up Firebase listener', {
    roomCode,
    timestamp: new Date().toISOString()
  }, 'info');

  roomRef.on('value', (snapshot) => {
    try {
      // Skip processing if we're already leaving
      if (isLeavingGame) {
        window.gameLogger?.log('GAME', 'Ignoring Firebase update: leaving game', {}, 'debug');
        return;
      }

      const room = snapshot.val();

      if (!room) {
        window.gameLogger?.log('GAME', 'Room disappeared from Firebase', {
          roomCode,
          timestamp: new Date().toISOString()
        }, 'warn');

        if (!isLeavingGame) {
          result.textContent = 'Opponent left the game';
          window.gameLogger?.log('GAME', 'Opponent disconnected', {}, 'warn');

          setTimeout(() => {
            isLeavingGame = true;
            roomRef.off('value');
            window.gameLogger?.logPageTransition('game.html', 'index.html', {
              reason: 'opponent_left',
              roomCode
            });
            window.location.href = 'index.html';
          }, 2000);
        }

        return;
      }

      // Check if opponent wants to go back to menu
      if (room.playerLeftRequested) {
        window.gameLogger?.log('GAME', 'Opponent requested to leave', {
          roomCode,
          playerLeftRequested: true
        }, 'warn');

        if (!isLeavingGame) {
          isLeavingGame = true;
          roomRef.off('value');
          alert('Your opponent quit the game.');

          window.gameLogger?.logPageTransition('game.html', 'index.html', {
            reason: 'opponent_quit',
            roomCode
          });

          sessionStorage.clear();
          window.location.href = 'index.html';
        }

        return;
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
          window.gameLogger?.logMove({
            cellIndex: i,
            player: 'opponent',
            symbol: gameBoard[i],
            boardState: gameBoard.slice(),
            timestamp: Date.now()
          });
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
          window.gameLogger?.log('GAME', 'Game ended in draw', {
            roomCode,
            boardState: gameBoard
          }, 'info');
        } else {
          const didIWin = room.winner === mySymbol;
          result.textContent = didIWin ? 'You win! 🎉' : 'You lose';
          window.gameLogger?.log('GAME', 'Game ended with winner', {
            roomCode,
            winner: room.winner,
            didIWin,
            mySymbol,
            opponentSymbol,
            boardState: gameBoard
          }, 'info');
        }
      } else {
        gameActive = true;
        result.textContent = isMyTurn ? 'Your turn' : "Opponent's turn";
        window.gameLogger?.logGameState({
          board: gameBoard,
          gameActive,
          isMyTurn,
          turn: room.turn
        });
      }
    } catch (error) {
      window.gameLogger?.log('GAME', 'Error processing Firebase update', {
        error: error.message,
        stack: error.stack,
        roomCode
      }, 'error');
    }
  }, (error) => {
    window.gameLogger?.logFirebaseConnectionFailure(error, {
      attemptedRoom: roomCode,
      step: 'listening_to_game_changes'
    });
    window.gameLogger?.log('GAME', 'Firebase listener error', {
      error: error.message,
      code: error.code,
      roomCode
    }, 'error');
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

    window.gameLogger?.log('GAME', 'Resetting game', {
      roomCode,
      firstPlayer,
      isHost
    }, 'info');

    roomRef.update({
      board: emptyBoard,
      turn: firstPlayer,
      winner: null
    });

    gameBoard = Array(9).fill(null);
    previousBoard = Array(9).fill(null);
    isMyTurn = isHost;
    gameActive = true;

    window.gameLogger?.log('GAME', 'Game reset complete', {
      roomCode,
      gameActive,
      isMyTurn
    }, 'success');
  } catch (error) {
    window.gameLogger?.log('GAME', 'Reset error', {
      error: error.message,
      stack: error.stack
    }, 'error');
  }
}

/**
 * Navigates back to menu and notifies opponent
 */
function goBackToMenu() {
  try {
    window.gameLogger?.log('GAME', 'Player initiating return to menu', {
      roomCode,
      isHost,
      gameActive
    }, 'info');

    // Prevent re-entrance
    if (isLeavingGame) {
      window.gameLogger?.log('GAME', 'Already leaving game, ignoring duplicate request', {}, 'debug');
      return;
    }

    isLeavingGame = true;

    // Stop listening BEFORE updating Firebase
    roomRef.off('value');
    window.gameLogger?.log('GAME', 'Firebase listener stopped', {}, 'debug');

    // Set flag to notify opponent
    roomRef.update({
      playerLeftRequested: true
    }).then(() => {
      window.gameLogger?.log('GAME', 'Notified opponent of departure', {
        roomCode
      }, 'success');

      sessionStorage.clear();
      window.gameLogger?.logPageTransition('game.html', 'index.html', {
        initiator: 'player',
        roomCode
      });

      // Give opponent time to see notification before we completely leave
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);

    }).catch(error => {
      window.gameLogger?.log('GAME', 'Error notifying opponent of departure', {
        error: error.message,
        code: error.code
      }, 'error');

      // Leave anyway if notification fails
      sessionStorage.clear();
      window.gameLogger?.logPageTransition('game.html', 'index.html', {
        initiator: 'player',
        reason: 'notification_failed',
        roomCode
      });

      window.location.href = 'index.html';
    });
  } catch (error) {
    window.gameLogger?.log('GAME', 'Navigation error', {
      error: error.message,
      stack: error.stack
    }, 'error');

    sessionStorage.clear();
    window.location.href = 'index.html';
  }
}

// Event Listeners
cells.forEach((cell, index) => {
  cell.setAttribute('role', 'button');
  cell.setAttribute('tabindex', '0');

  cell.addEventListener('click', () => {
    window.gameLogger?.logUIInteraction({
      action: 'Cell clicked',
      element: `cell-${index}`,
      eventType: 'click',
      info: { cellIndex: index, cellContent: gameBoard[index] }
    });
    makeMove(index);
  });

  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.gameLogger?.logUIInteraction({
        action: 'Cell activated via keyboard',
        element: `cell-${index}`,
        eventType: 'keydown',
        info: { cellIndex: index, key: e.key }
      });
      makeMove(index);
    }
  });
});

resetButton?.addEventListener('click', () => {
  window.gameLogger?.logUIInteraction({
    action: 'Reset button clicked',
    element: 'resetButton',
    eventType: 'click'
  });
  resetGame();
});

backToMenuBtn?.addEventListener('click', () => {
  window.gameLogger?.logUIInteraction({
    action: 'Back to menu button clicked',
    element: 'backToMenuBtn',
    eventType: 'click'
  });
  goBackToMenu();
});

// Initialize
window.gameLogger?.log('GAME', 'Starting game initialization', {
  roomCode,
  isHost,
  mySymbol,
  opponentSymbol
}, 'info');

listenToGameChanges();
updateTurnHighlight();

window.gameLogger?.log('GAME', 'Game script fully loaded and initialized', {
  roomCode,
  eventListenersAttached: cells.length + 2,
  gameActive,
  isMyTurn
}, 'success');
