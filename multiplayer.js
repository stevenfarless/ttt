function handleJoinButtonClick() {
  console.log('Join button clicked - isJoiningGame:', isJoiningGame, 'validJoinCode:', validJoinCode);
  
  if (!isJoiningGame) {
    // First click - open join module
    toggleJoinGameModule();
  } else if (validJoinCode) {
    // Second click - JOIN THE GAME
    startJoiningGame();
  }
}

function startJoiningGame() {
  if (!validJoinCode) {
    joinStatus.textContent = '❌ Please enter a valid code first';
    return;
  }

  console.log('Starting to join game with code:', validJoinCode);
  joinStatus.textContent = 'Joining game...';
  joinGameBtn.textContent = 'JOINING...'; // Change button immediately
  joinGameBtn.disabled = true; // Disable to prevent multiple clicks

  // Update Firebase with player2
  database.ref(`rooms/${validJoinCode}`).update({
    player2: selectedEmoji,
    status: 'ready'
  }).then(() => {
    console.log('Successfully updated room with player2');
    
    // Store session data
    sessionStorage.setItem('roomCode', validJoinCode);
    sessionStorage.setItem('playerEmoji', selectedEmoji);
    sessionStorage.setItem('isHost', 'false');

    // Redirect after delay
    setTimeout(() => {
      window.location.href = 'game.html';
    }, 500);
  }).catch(err => {
    console.error('Error joining game:', err);
    joinStatus.textContent = '❌ Error joining game. Try again.';
    joinGameBtn.textContent = 'START GAME';
    joinGameBtn.disabled = false;
  });
}

function validateJoinCode(code) {
  if (code.length !== 4) {
    validJoinCode = null;
    joinGameBtn.textContent = 'Join Game';
    joinStatus.textContent = 'Enter a 4-digit code';
    return;
  }

  console.log('Validating code:', code);
  joinStatus.textContent = 'Checking code...';

  const roomRef = database.ref(`rooms/${code}`);
  roomRef.once('value', (snapshot) => {
    console.log('Room snapshot:', snapshot.val());
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.player1 && !data.player2) {
        // Room exists and is waiting for player2
        validJoinCode = code;
        joinGameBtn.textContent = 'START GAME';
        joinStatus.textContent = '✓ Code valid! Tap START GAME';
        console.log('Code valid - button text:', joinGameBtn.textContent);
      } else if (data.player2) {
        validJoinCode = null;
        joinGameBtn.textContent = 'Join Game';
        joinStatus.textContent = '❌ Game already started';
      } else {
        validJoinCode = null;
        joinGameBtn.textContent = 'Join Game';
        joinStatus.textContent = '❌ Invalid room';
      }
    } else {
      validJoinCode = null;
      joinGameBtn.textContent = 'Join Game';
      joinStatus.textContent = '❌ Room not found';
    }
  });
}
