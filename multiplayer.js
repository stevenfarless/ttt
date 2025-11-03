import { firebaseConfig } from './utils.js';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const DEBUG = true;
const db = firebase.database();

console.log('[MULTIPLAYER] Script loaded');

const emojiDisplay = document.getElementById('emojiDisplay');
const emojiPicker = document.getElementById('emojiPicker');
const emojiOptions = document.querySelectorAll('.emoji-option');
const emojis = ['❌', '⭕', '❤️', '💲', '😀', '💀', '🤖', '👽', '🐶', '😺', '💩', '🦐', '🍕', '🍣', '🍓', '🍤', '🌙', '☀️', '⭐', '🚀'];

function getRandomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

if (emojiDisplay) {
  emojiDisplay.textContent = getRandomEmoji();
  emojiDisplay.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'grid' ? 'none' : 'grid';
  });
}

emojiOptions.forEach(option => {
  option.addEventListener('click', (e) => {
    emojiDisplay.textContent = e.target.getAttribute('data-emoji');
    emojiPicker.style.display = 'none';
  });
});

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const createStatus = document.getElementById('createStatus');
const joinStatus = document.getElementById('joinStatus');
const codeRow = document.getElementById('codeRow');

if (roomCodeInput) {
  roomCodeInput.addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-HJ-KM-NP-Z1-9]/g, '');
  });
}

if (createRoomBtn) {
  createRoomBtn.addEventListener('click', () => {
    console.log('[MULTIPLAYER] Create Room clicked');
    createRoomBtn.disabled = true;
    
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const selectedEmoji = emojiDisplay.textContent;
    
    // CRITICAL: Use object notation to force array storage in Firebase
    const roomData = {
      roomCode: code,
      hostJoined: true,
      guestJoined: false,
      hostEmoji: selectedEmoji,
      guestEmoji: null,
      board: {
        0: null, 1: null, 2: null,
        3: null, 4: null, 5: null,
        6: null, 7: null, 8: null
      },
      turn: selectedEmoji,
      winner: null
    };
    
    console.log('[MULTIPLAYER] Creating room:', code);
    
    db.ref('rooms/' + code).set(roomData).then(() => {
      console.log('[MULTIPLAYER] Room created');
      roomCodeDisplay.textContent = code;
      codeRow.style.display = 'block';
      createStatus.textContent = 'Room created. Waiting for opponent...';
      
      sessionStorage.setItem('roomCode', code);
      sessionStorage.setItem('isHost', 'true');
      sessionStorage.setItem('mySymbol', selectedEmoji);
      
      const roomRef = db.ref('rooms/' + code);
      roomRef.on('value', (snapshot) => {
        const room = snapshot.val();
        if (room && room.guestJoined && room.guestEmoji) {
          console.log('[MULTIPLAYER] Guest joined, navigating');
          sessionStorage.setItem('opponentSymbol', room.guestEmoji);
          roomRef.off('value');
          setTimeout(() => window.location.href = 'game.html', 300);
        }
      });
    }).catch(err => {
      console.error('[MULTIPLAYER] Error creating room:', err);
      createStatus.textContent = 'Error creating room';
      createRoomBtn.disabled = false;
    });
  });
}

if (joinRoomBtn) {
  joinRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    console.log('[MULTIPLAYER] Join Room clicked:', code);
    
    if (!/^[A-HJ-KM-NP-Z1-9]{4}$/.test(code)) {
      joinStatus.textContent = 'Invalid code';
      return;
    }
    
    joinRoomBtn.disabled = true;
    const selectedEmoji = emojiDisplay.textContent;
    
    db.ref('rooms/' + code).once('value').then(snapshot => {
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
      
      console.log('[MULTIPLAYER] Joining room:', code);
      
      // Keep existing board structure
      const updateData = {
        guestJoined: true,
        guestEmoji: selectedEmoji
      };
      
      // Only set board/turn if they don't exist
      if (!room.board) {
        updateData.board = {
          0: null, 1: null, 2: null,
          3: null, 4: null, 5: null,
          6: null, 7: null, 8: null
        };
      }
      
      if (!room.turn) {
        updateData.turn = room.hostEmoji;
      }
      
      db.ref('rooms/' + code).update(updateData).then(() => {
        console.log('[MULTIPLAYER] Joined successfully');
        joinStatus.textContent = 'Joined! Starting game...';
        
        sessionStorage.setItem('roomCode', code);
        sessionStorage.setItem('isHost', 'false');
        sessionStorage.setItem('mySymbol', selectedEmoji);
        sessionStorage.setItem('opponentSymbol', room.hostEmoji);
        
        setTimeout(() => window.location.href = 'game.html', 300);
      }).catch(err => {
        console.error('[MULTIPLAYER] Error joining:', err);
        joinStatus.textContent = 'Error joining';
        joinRoomBtn.disabled = false;
      });
    });
  });
}
