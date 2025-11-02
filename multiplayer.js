const DEBUG = true;
const db = firebase.database();

// EMOJI PICKER FUNCTIONALITY
const emojiDisplay = document.getElementById('emojiDisplay');
const emojiPicker = document.getElementById('emojiPicker');
const emojiOptions = document.querySelectorAll('.emoji-option');

const emojis = ['❌', '⭕', '❤️', '💲', '😀', '💀', '🤖', '👽', '🐶', '😺', '💩', '🦐', '🍕', '🍣', '🍓', '🍤', '🌙', '☀️', '⭐', '🚀'];

function getRandomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Set random default emoji on page load
if (emojiDisplay) {
  emojiDisplay.textContent = getRandomEmoji();
  emojiDisplay.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'grid' ? 'none' : 'grid';
  });

  emojiDisplay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      emojiDisplay.click();
    }
  });
}

emojiOptions.forEach(option => {
  option.addEventListener('click', (e) => {
    const selectedEmoji = e.target.getAttribute('data-emoji');
    emojiDisplay.textContent = selectedEmoji;
    emojiPicker.style.display = 'none';
  });

  option.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      option.click();
    }
  });
});

// ROOM MANAGEMENT
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const createStatus = document.getElementById('createStatus');
const joinStatus = document.getElementById('joinStatus');
const codeRow = document.getElementById('codeRow');

// Format room code input
if (roomCodeInput) {
  roomCodeInput.addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-HJ-KM-NP-Z1-9]/g, '');
  });
}

// CREATE ROOM
if (createRoomBtn) {
  createRoomBtn.addEventListener('click', () => {
    createRoomBtn.disabled = true;
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const selectedEmoji = emojiDisplay.textContent;
    const roomData = {
      roomCode: code,
      hostJoined: true,
      guestJoined: false,
      hostEmoji: selectedEmoji,
      guestEmoji: null,
      board: Array(9).fill(null),
      turn: selectedEmoji,
      winner: null,
      createdAt: new Date().getTime()
    };

    db.ref('rooms/' + code).set(roomData)
      .then(() => {
        roomCodeDisplay.textContent = code;
        codeRow.style.display = 'block';
        createStatus.textContent = 'Room created. Waiting for opponent...';
        
        // Store host data
        sessionStorage.setItem('roomCode', code);
        sessionStorage.setItem('isHost', 'true');
        sessionStorage.setItem('mySymbol', selectedEmoji);
        
        // Listen for guest
        const roomRef = db.ref('rooms/' + code);
        let listenerAttached = false;
        
        const checkGuest = roomRef.on('value', (snapshot) => {
          if (!listenerAttached) {
            listenerAttached = true;
            const room = snapshot.val();
            if (room && room.guestJoined && room.guestEmoji) {
              sessionStorage.setItem('opponentSymbol', room.guestEmoji);
              roomRef.off('value', checkGuest);
              setTimeout(() => window.location.href = 'game.html', 300);
            }
          }
        });
      })
      .catch(err => {
        createStatus.textContent = 'Error: ' + (err.message || 'Failed to create room');
        createRoomBtn.disabled = false;
      });
  });
}

// JOIN ROOM
if (joinRoomBtn) {
  joinRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    
    if (!/^[A-HJ-KM-NP-Z1-9]{4}$/.test(code)) {
      joinStatus.textContent = 'Invalid room code format';
      return;
    }

    joinRoomBtn.disabled = true;
    const selectedEmoji = emojiDisplay.textContent;
    const roomRef = db.ref('rooms/' + code);

    roomRef.once('value')
      .then(snapshot => {
        if (!snapshot.exists()) {
          joinStatus.textContent = 'Room not found';
          joinRoomBtn.disabled = false;
          return;
        }

        const room = snapshot.val();
        if (room.guestJoined) {
          joinStatus.textContent = 'Room is full';
          joinRoomBtn.disabled = false;
          return;
        }

        // Join room
        roomRef.update({ 
          guestJoined: true,
          guestEmoji: selectedEmoji
        })
          .then(() => {
            joinStatus.textContent = 'Joined! Starting game...';
            
            // Store guest data
            sessionStorage.setItem('roomCode', code);
            sessionStorage.setItem('isHost', 'false');
            sessionStorage.setItem('mySymbol', selectedEmoji);
            sessionStorage.setItem('opponentSymbol', room.hostEmoji);
            
            setTimeout(() => window.location.href = 'game.html', 300);
          })
          .catch(err => {
            joinStatus.textContent = 'Error joining: ' + err.message;
            joinRoomBtn.disabled = false;
          });
      })
      .catch(err => {
        joinStatus.textContent = 'Error: ' + err.message;
        joinRoomBtn.disabled = false;
      });
  });
}
