const DEBUG = true;
const db = firebase.database();

console.log('[MULTIPLAYER] Script loaded');

// EMOJI PICKER FUNCTIONALITY
const emojiDisplay = document.getElementById('emojiDisplay');
const emojiPicker = document.getElementById('emojiPicker');
const emojiOptions = document.querySelectorAll('.emoji-option');

const emojis = ['❌', '⭕', '❤️', '💲', '😀', '💀', '🤖', '👽', '🐶', '😺', '💩', '🦐', '🍕', '🍣', '🍓', '🍤', '🌙', '☀️', '⭐', '🚀'];

console.log('[MULTIPLAYER] Available emojis:', emojis);

function getRandomEmoji() {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  console.log('[MULTIPLAYER] Random emoji selected:', emoji);
  return emoji;
}

// Set random default emoji on page load
if (emojiDisplay) {
  emojiDisplay.textContent = getRandomEmoji();
  console.log('[MULTIPLAYER] emojiDisplay initialized');
  
  emojiDisplay.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'grid' ? 'none' : 'grid';
    console.log('[MULTIPLAYER] Emoji picker toggled:', emojiPicker.style.display);
  });

  emojiDisplay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      console.log('[MULTIPLAYER] Emoji picker opened via keyboard');
      emojiDisplay.click();
    }
  });
}

emojiOptions.forEach((option, idx) => {
  option.addEventListener('click', (e) => {
    const selectedEmoji = e.target.getAttribute('data-emoji');
    console.log('[MULTIPLAYER] Emoji selected:', selectedEmoji, 'at index:', idx);
    emojiDisplay.textContent = selectedEmoji;
    emojiPicker.style.display = 'none';
  });

  option.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      console.log('[MULTIPLAYER] Emoji selected via keyboard');
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

console.log('[MULTIPLAYER] Room elements initialized:', {
  createRoomBtn: !!createRoomBtn,
  joinRoomBtn: !!joinRoomBtn,
  roomCodeInput: !!roomCodeInput,
  codeRow: !!codeRow
});

// Format room code input
if (roomCodeInput) {
  roomCodeInput.addEventListener('input', e => {
    const oldValue = e.target.value;
    e.target.value = e.target.value.toUpperCase().replace(/[^A-HJ-KM-NP-Z1-9]/g, '');
    if (oldValue !== e.target.value) {
      console.log('[MULTIPLAYER] Room code input formatted:', e.target.value);
    }
  });
}

// CREATE ROOM
if (createRoomBtn) {
  createRoomBtn.addEventListener('click', () => {
    console.log('[MULTIPLAYER] Create Room button clicked');
    createRoomBtn.disabled = true;
    
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const selectedEmoji = emojiDisplay.textContent;
    console.log('[MULTIPLAYER] Generated room code:', code, 'with emoji:', selectedEmoji);
    
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

    console.log('[MULTIPLAYER] Writing room data to Firebase:', roomData);
    
    db.ref('rooms/' + code).set(roomData)
      .then(() => {
        console.log('[MULTIPLAYER] Room created successfully in Firebase');
        roomCodeDisplay.textContent = code;
        codeRow.style.display = 'block';
        createStatus.textContent = 'Room created. Waiting for opponent...';
        
        // Store host data
        sessionStorage.setItem('roomCode', code);
        sessionStorage.setItem('isHost', 'true');
        sessionStorage.setItem('mySymbol', selectedEmoji);
        console.log('[MULTIPLAYER] Session storage set for host:', {
          roomCode: code,
          isHost: true,
          mySymbol: selectedEmoji
        });
        
        // Listen for guest
        const roomRef = db.ref('rooms/' + code);
        let listenerAttached = false;
        
        const checkGuest = roomRef.on('value', (snapshot) => {
          const room = snapshot.val();
          console.log('[MULTIPLAYER] Room data received:', room);
          
          if (!listenerAttached) {
            listenerAttached = true;
            if (room && room.guestJoined && room.guestEmoji) {
              console.log('[MULTIPLAYER] Guest joined with emoji:', room.guestEmoji);
              sessionStorage.setItem('opponentSymbol', room.guestEmoji);
              roomRef.off('value', checkGuest);
              console.log('[MULTIPLAYER] Navigating to game...');
              setTimeout(() => window.location.href = 'game.html', 300);
            } else {
              console.log('[MULTIPLAYER] Waiting for guest... Current state:', { guestJoined: room?.guestJoined, guestEmoji: room?.guestEmoji });
            }
          }
        });
      })
      .catch(err => {
        console.error('[MULTIPLAYER] Error creating room:', err);
        createStatus.textContent = 'Error: ' + (err.message || 'Failed to create room');
        createRoomBtn.disabled = false;
      });
  });
}

// JOIN ROOM
if (joinRoomBtn) {
  joinRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    console.log('[MULTIPLAYER] Join Room button clicked with code:', code);
    
    if (!/^[A-HJ-KM-NP-Z1-9]{4}$/.test(code)) {
      console.warn('[MULTIPLAYER] Invalid room code format:', code);
      joinStatus.textContent = 'Invalid room code format';
      return;
    }

    joinRoomBtn.disabled = true;
    const selectedEmoji = emojiDisplay.textContent;
    console.log('[MULTIPLAYER] Attempting to join room with emoji:', selectedEmoji);
    
    const roomRef = db.ref('rooms/' + code);

    roomRef.once('value')
      .then(snapshot => {
        console.log('[MULTIPLAYER] Room snapshot received:', snapshot.val());
        
        if (!snapshot.exists()) {
          console.warn('[MULTIPLAYER] Room does not exist:', code);
          joinStatus.textContent = 'Room not found';
          joinRoomBtn.disabled = false;
          return;
        }

        const room = snapshot.val();
        if (room.guestJoined) {
          console.warn('[MULTIPLAYER] Room is full');
          joinStatus.textContent = 'Room is full';
          joinRoomBtn.disabled = false;
          return;
        }

        // Join room
        console.log('[MULTIPLAYER] Updating room with guest data...');
        roomRef.update({ 
          guestJoined: true,
          guestEmoji: selectedEmoji
        })
          .then(() => {
            console.log('[MULTIPLAYER] Successfully joined room');
            joinStatus.textContent = 'Joined! Starting game...';
            
            // Store guest data
            sessionStorage.setItem('roomCode', code);
            sessionStorage.setItem('isHost', 'false');
            sessionStorage.setItem('mySymbol', selectedEmoji);
            sessionStorage.setItem('opponentSymbol', room.hostEmoji);
            console.log('[MULTIPLAYER] Session storage set for guest:', {
              roomCode: code,
              isHost: false,
              mySymbol: selectedEmoji,
              opponentSymbol: room.hostEmoji
            });
            
            setTimeout(() => window.location.href = 'game.html', 300);
          })
          .catch(err => {
            console.error('[MULTIPLAYER] Error joining room:', err);
            joinStatus.textContent = 'Error joining: ' + err.message;
            joinRoomBtn.disabled = false;
          });
      })
      .catch(err => {
        console.error('[MULTIPLAYER] Error fetching room:', err);
        joinStatus.textContent = 'Error: ' + err.message;
        joinRoomBtn.disabled = false;
      });
  });
}

console.log('[MULTIPLAYER] Script initialization complete');
