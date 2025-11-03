import { firebaseConfig } from './utils.js';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const DEBUG = true;
const db = firebase.database();
console.log('[MULTIPLAYER] Script loaded');

// Emojis array
const emojis = ['❌', '⭕', '❤️', '💲', '😀', '💀', '🤖', '👽', '🐶', '😺', '💩', '🦐', '🍕', '🍣', '🍓', '🍤', '🌙', '☀️', '⭐', '🚀'];

// DOM Elements
const emojiDisplay = document.getElementById('emojiDisplay');
const emojiToggle = document.getElementById('emojiToggle');
const emojiModal = document.getElementById('emojiModal');
const closeEmojiModal = document.getElementById('closeEmojiModal');
const emojiPicker = document.getElementById('emojiPicker');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const createModule = document.getElementById('createModule');
const joinModule = document.getElementById('joinModule');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const createStatus = document.getElementById('createStatus');
const joinStatus = document.getElementById('joinStatus');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const pasteCodeBtn = document.getElementById('pasteCodeBtn');

// Initialize emoji picker
function initEmojiPicker() {
  emojiPicker.innerHTML = '';
  emojis.forEach(emoji => {
    const option = document.createElement('button');
    option.className = 'emoji-option';
    option.textContent = emoji;
    option.setAttribute('data-emoji', emoji);
    option.addEventListener('click', (e) => {
      e.preventDefault();
      selectEmoji(emoji);
    });
    emojiPicker.appendChild(option);
  });
}

function selectEmoji(emoji) {
  emojiDisplay.textContent = emoji;
  emojiModal.classList.add('hidden');
}

function getRandomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Set random emoji on page load
emojiDisplay.textContent = getRandomEmoji();
initEmojiPicker();

// Emoji modal toggle
emojiToggle.addEventListener('click', () => {
  emojiModal.classList.remove('hidden');
});

closeEmojiModal.addEventListener('click', () => {
  emojiModal.classList.add('hidden');
});

emojiModal.addEventListener('click', (e) => {
  if (e.target === emojiModal) {
    emojiModal.classList.add('hidden');
  }
});

// Toggle modules when buttons clicked
createRoomBtn.addEventListener('click', (e) => {
  if (!createModule.classList.contains('hidden')) return; // Already showing create module
  
  createModule.classList.remove('hidden');
  joinModule.classList.add('hidden');
});

joinRoomBtn.addEventListener('click', (e) => {
  if (!joinModule.classList.contains('hidden')) return; // Already showing join module
  
  joinModule.classList.remove('hidden');
  createModule.classList.add('hidden');
});

// Room code input validation and button text update
roomCodeInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-HJ-KM-NP-Z1-9]/g, '');
  
  // Update button text based on input length
  if (e.target.value.length === 4) {
    joinRoomBtn.textContent = 'START GAME';
  } else {
    joinRoomBtn.textContent = 'Join Room';
  }
});

// Copy room code
copyCodeBtn?.addEventListener('click', async () => {
  try {
    const code = roomCodeDisplay.textContent;
    await navigator.clipboard.writeText(code);
    
    const originalText = copyCodeBtn.textContent;
    copyCodeBtn.textContent = '✓';
    copyCodeBtn.style.background = 'var(--success)';
    
    setTimeout(() => {
      copyCodeBtn.textContent = originalText;
      copyCodeBtn.style.background = '';
    }, 1500);
  } catch (error) {
    console.error('[MULTIPLAYER] Copy failed:', error);
  }
});

// Paste room code
pasteCodeBtn?.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    roomCodeInput.value = text.toUpperCase().substring(0, 4);
    
    // Trigger input event to update button text
    roomCodeInput.dispatchEvent(new Event('input'));
  } catch (error) {
    console.error('[MULTIPLAYER] Paste failed:', error);
  }
});

// Create room
createRoomBtn.addEventListener('click', () => {
  console.log('[MULTIPLAYER] Create Room clicked');
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
    createStatus.textContent = 'Waiting for opponent...';
    createStatus.style.color = 'var(--warning)';
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
    createStatus.style.color = 'var(--danger)';
    createRoomBtn.disabled = false;
  });
});

// Join room
joinRoomBtn.addEventListener('click', () => {
  const code = roomCodeInput.value.trim().toUpperCase();
  console.log('[MULTIPLAYER] Join Room clicked:', code);

  if (!/^[A-HJ-KM-NP-Z1-9]{4}$/.test(code)) {
    joinStatus.textContent = 'Invalid code format';
    joinStatus.style.color = 'var(--danger)';
    return;
  }

  joinRoomBtn.disabled = true;
  const selectedEmoji = emojiDisplay.textContent;

  db.ref('rooms/' + code).once('value').then(snapshot => {
    if (!snapshot.exists()) {
      joinStatus.textContent = 'Room not found';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      return;
    }

    const room = snapshot.val();

    if (room.guestJoined) {
      joinStatus.textContent = 'Room is full';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      return;
    }

    console.log('[MULTIPLAYER] Joining room:', code);

    const updateData = {
      guestJoined: true,
      guestEmoji: selectedEmoji
    };

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
      joinStatus.style.color = 'var(--success)';
      sessionStorage.setItem('roomCode', code);
      sessionStorage.setItem('isHost', 'false');
      sessionStorage.setItem('mySymbol', selectedEmoji);
      sessionStorage.setItem('opponentSymbol', room.hostEmoji);
      setTimeout(() => window.location.href = 'game.html', 300);
    }).catch(err => {
      console.error('[MULTIPLAYER] Error joining:', err);
      joinStatus.textContent = 'Error joining room';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
    });
  });
});
