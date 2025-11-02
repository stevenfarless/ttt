import { generateRoomCode, showError, validateRoomCode, sanitizeEmojiChoice } from './utils.js';

const DEBUG = true;
const db = firebase.database();

const emojiDisplay = document.getElementById('emojiDisplay');
const emojiPicker = document.getElementById('emojiPicker');
const emojiOptions = document.querySelectorAll('.emoji-option');

const emojis = ['👍', '👑', '🐱', '🤖', '🎉', '🔥', '⚡', '🌈', '🍕', '❤️']; // allowed emojis

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
    emojiPicker.style.display = emojiPicker.style.display === 'grid' ? 'none' : 'grid';
  });

  emojiDisplay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      emojiPicker.style.display = emojiPicker.style.display === 'grid' ? 'none' : 'grid';
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

if (roomCodeInput) {
  roomCodeInput.addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-HJ-KM-NP-Z1-9]/g, '');
  });
}

if (createRoomBtn) {
  createRoomBtn.addEventListener('click', () => {
    createRoomBtn.disabled = true;
    const code = generateRoomCode();
    const roomData = {
      roomCode: code,
      hostJoined: true,
      guestJoined: false,
      board: Array(9).fill(null),
      turn: '',
      winner: null
    };
    db.ref('rooms/' + code).set(roomData)
      .then(() => {
        if (roomCodeDisplay) roomCodeDisplay.textContent = code;
        if (createStatus) createStatus.textContent = 'Room created. Waiting for opponent...';
      })
      .catch(err => {
        showError(createStatus, 'Failed to create room: ' + (err.message || 'unknown error'));
      })
      .finally(() => {
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
    const roomRef = db.ref('rooms/' + code);
    roomRef.once('value')
      .then(snapshot => {
        if (!snapshot.exists()) {
          showError(joinStatus, 'Room not found.');
          return;
        }
        const room = snapshot.val();
        if (room.guestJoined) {
          showError(joinStatus, 'Room is full.');
          return;
        }
        roomRef.update({ guestJoined: true })
          .then(() => {
            if (joinStatus) joinStatus.textContent = 'Joined room. Starting game...';
            // Proceed to game page etc.
          })
          .catch(err => {
            showError(joinStatus, 'Failed to join room.');
          });
      })
      .catch(err => {
        showError(joinStatus, 'Database error occurred: ' + (err.message || 'unknown'));
      })
      .finally(() => {
        joinRoomBtn.disabled = false;
      });
  });
}
