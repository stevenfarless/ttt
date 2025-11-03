function playMoveAnimation(index) {
  const cell = cells[index];
  
  // Animation class
  cell.classList.add('clicked');
  
  // Remove animation class after animation completes (600ms)
  setTimeout(() => {
    cell.classList.remove('clicked');
  }, 600);
}

// Then modify the makeMove function to use it:
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

// And modify listenToGameChanges to play animations when the opponent moves:
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
