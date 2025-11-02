function makeMove(index) {
  if (!gameActive || !isMyTurn || gameBoard[index]) {
    return;
  }

  moveCount++;
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
    
    console.log('[GAME] Move made. New turn:', room.turn, 'Winner:', room.winner);
    
    return room;
  }, (error, committed, snapshot) => {
    if (error) {
      console.error('[GAME] Transaction error:', error);
    } else {
      console.log('[GAME] Transaction committed:', committed);
    }
  });
}
