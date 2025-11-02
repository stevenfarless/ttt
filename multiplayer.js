import { generateRoomCode, showError, validateRoomCode, sanitizeEmojiChoice } from './utils.js';

const DEBUG = true;
const db = firebase.database();

const emojiDisplay = document.getElementById('emojiDisplay');
const emojiPicker = document.getElementById('emojiPicker');
const emojiOptions = document.querySelectorAll('.emoji-option');

const emojis = ['❌', '⭕', '❤️', '💲', '😀', '💀', '🤖', '👽', '🐶', '😺', '💩', '🦐', '🍕', '🍣', '🍓', '🍤', '🌙', '☀️', '⭐', '🚀'];

function getRandomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Initialize default emoji
if (emojiDisplay) {
  emojiDisplay.textContent = getRandomEmoji();
  emojiDisplay.setAttribute('tabindex', 0);
  emojiDisplay.setAttribute('role', 'button');
  emojiDisplay.setAttribute('aria-label', 'Select your game piece emoji');
  emojiDisplay.addEventListener('click', () => {
    const isOpen = emojiPicker.style.display === 'grid';
    emojiPicker.style.display = isOpen ? 'none' : 'grid';
    emojiDisplay.setAttribute('aria-expanded', !isOpen);
    emojiPicker.setAttribute('aria-hidden', isOpen);
  });

  emojiDisplay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      emojiDisplay.click();
    }
  });
}

emojiOptions.forEach(option => {
  option.setAttribute('tabindex', 0);
  option.setAttribute('role', 'button');
  option.addEventListener('click', (e) => {
    const selectedEmoji = e.target.getAttribute('data-emoji');
    emojiDisplay.textContent = sanitizeEmojiChoice(selectedEmoji, emojis);
    emojiPicker.style.display = 'none';
    emojiDisplay.setAttribute('aria-expanded', 'false');
    emojiPicker.setAttribute('aria-hidden', 'true');
  });
  option.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      option.click();
    }
  });
});

// Room buttons and inputs
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
    createRoomBtn.disabled = true;
    const code = generateRoomCode();
    const selectedEmoji = emojiDisplay.textContent;
    const roomData = {
      roomCode: code,
      hostJoined: true,
      guestJoined: false,
      hostEmoji: selectedEmoji,
      guestEmoji: null,
      board: Array(9).fill(null),
      turn: 'X',
      winner: null,
      createdAt: new Date().getTime()
    };

    db.ref('rooms/' + code).set(roomData)
      .then(() => {
        if (roomCodeDisplay) roomCodeDisplay.textContent = code;
        if (codeRow) codeRow.style.display = 'block';
        if (createStatus) createStatus.textContent = 'Room created. Waiting for opponent...';
        
        // Store session data
        sessionStorage.setItem('roomCode', code);
        sessionStorage.setItem('isHost', 'true');
        sessionStorage.setItem('mySymbol', selectedEmoji);
        sessionStorage.setItem('opponentSymbol', '');
        
        // Listen for guest joining
        const roomRef = db.ref('rooms/' + code);
        const guestListener = roomRef.on('value', snapshot => {
          const room = snapshot.val();
          if (room && room.guestJoined && room.guestEmoji) {
            sessionStorage.setItem('opponentSymbol', room.guestEmoji);
            roomRef.off('value', guestListener);
            window.location.href = 'game.html';
          }
        });
      })
      .catch(err => {
        showError(createStatus, 'Failed to create room: ' + (err.message || 'unknown error'));
        createRoomBtn.disabled = false;
      });
  });
}

if (joinRoomBtn) {
  joinRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (!validateRoomCode(code)) {
      showError(joinStatus, 'Invalid room code format.');
      return;
    }
    joinRoomBtn.disabled = true;
    const selectedEmoji = emojiDisplay.textContent;
    const roomRef = db.ref('rooms/' + code);
    
    roomRef.once('value')
      .then(snapshot => {
        if (!snapshot.exists()) {
          showError(joinStatus, 'Room not found.');
          joinRoomBtn.disabled = false;
          return;
        }
        const room = snapshot.val();
        if (room.guestJoined) {
          showError(joinStatus, 'Room is full.');
          joinRoomBtn.disabled = false;
          return;
        }
        
        // Join the room
        roomRef.update({ 
          guestJoined: true,
          guestEmoji: selectedEmoji,
          turn: 'X'
        })
          .then(() => {
            if (joinStatus) joinStatus.textContent = 'Joined room. Starting game...';
            
            // Store session data
            sessionStorage.setItem('roomCode', code);
            sessionStorage.setItem('isHost', 'false');
            sessionStorage.setItem('mySymbol', selectedEmoji);
            sessionStorage.setItem('opponentSymbol', room.hostEmoji);
            
            // Navigate to game
            setTimeout(() => {
              window.location.href = 'game.html';
            }, 500);
          })
          .catch(err => {
            showError(joinStatus, 'Failed to join room: ' + err.message);
            joinRoomBtn.disabled = false;
          });
      })
      .catch(err => {
        showError(joinStatus, 'Database error: ' + (err.message || 'unknown'));
        joinRoomBtn.disabled = false;
      });
  });
}
