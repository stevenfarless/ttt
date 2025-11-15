// multiplayer.js

import { firebaseConfig } from './utils.js';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

// Emojis array
const emojis = [
  "❌",
  "⭕",
  "❤️",
  "💲",
  "😀",
  "💀",
  "🤖",
  "👽",
  "🐶",
  "😺",
  "💩",
  "🦐",
  "🍕",
  "🍣",
  "🍓",
  "🍤",
  "🌙",
  "☀️",
  "⭐",
  "🚀",
];

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

// Track generated room code
let generatedRoomCode = null;

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
  if (!createModule.classList.contains('hidden')) {
    return;
  }
  createModule.classList.remove('hidden');
  joinModule.classList.add('hidden');
  joinRoomBtn.disabled = false;
  joinStatus.textContent = '';
  roomCodeInput.value = '';
  
  // Display existing code or placeholder
  if (generatedRoomCode) {
    roomCodeDisplay.textContent = generatedRoomCode;
  } else {
    roomCodeDisplay.textContent = 'XXXX';
  }
});

joinRoomBtn.addEventListener('click', (e) => {
  if (!joinModule.classList.contains('hidden')) {
    return;
  }
  joinModule.classList.remove('hidden');
  createModule.classList.add('hidden');
  createRoomBtn.disabled = false;
  createStatus.textContent = '';
});

// Room code input validation
roomCodeInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Update button text based on input length
  if (e.target.value.length === 4) {
    joinRoomBtn.textContent = 'START GAME';
  } else {
    joinRoomBtn.textContent = 'Join Game';
  }
  
  // Clear status when user is typing
  joinStatus.textContent = '';
});

// Copy room code
copyCodeBtn?.addEventListener('click', async () => {
  const startTime = performance.now();
  console.log('[MULTIPLAYER] 📋 Copy button clicked');
  try {
    const code = roomCodeDisplay.textContent;
    await navigator.clipboard.writeText(code);
    const endTime = performance.now();
    console.log(`[MULTIPLAYER] ✅ Room code copied to clipboard: ${code} (took ${(endTime - startTime).toFixed(2)}ms)`);
    const originalText = copyCodeBtn.textContent;
    copyCodeBtn.textContent = '✓';
    copyCodeBtn.style.background = 'var(--success)';
    console.log('[MULTIPLAYER] ✅ Copy button feedback displayed');
    setTimeout(() => {
      copyCodeBtn.textContent = originalText;
      copyCodeBtn.style.background = '';
      console.log('[MULTIPLAYER] ✅ Copy button reset to original state');
    }, 1500);
  } catch (error) {
    console.error('[MULTIPLAYER] ❌ Copy failed:', error);
  }
});


// Paste room code
pasteCodeBtn?.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    const sanitized = text.toUpperCase().substring(0, 4).replace(/[^A-Z0-9]/g, '');
    roomCodeInput.value = sanitized;
    // Trigger input event to update button text
    roomCodeInput.dispatchEvent(new Event('input'));
  } catch (error) {
    console.error('Paste failed:', error);
  }
});

// Create game
createRoomBtn.addEventListener('click', () => {
  // If code already exists, just show the module
  if (generatedRoomCode) {
    createModule.classList.remove('hidden');
    return;
  }

  createRoomBtn.disabled = true;
  
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  generatedRoomCode = code;
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

  db.ref('rooms/' + code).set(roomData).then(() => {
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
        sessionStorage.setItem('opponentSymbol', room.guestEmoji);
        roomRef.off('value');
        setTimeout(() => window.location.href = 'game.html', 300);
      }
    });
  }).catch(err => {
    console.error('Error creating game:', err);
    createStatus.textContent = 'Error creating game';
    createStatus.style.color = 'var(--danger)';
    createRoomBtn.disabled = false;
    generatedRoomCode = null;
  });
});

// Join game
joinRoomBtn.addEventListener('click', () => {
  const code = roomCodeInput.value.trim().toUpperCase();
  
  if (code.length !== 4) {
    return;
  }

  joinRoomBtn.disabled = true;
  const selectedEmoji = emojiDisplay.textContent;

  db.ref('rooms/' + code).once('value').then(snapshot => {
    if (!snapshot.exists()) {
      joinStatus.textContent = 'Game not found';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      return;
    }

    const room = snapshot.val();
    
    if (room.guestJoined) {
      joinStatus.textContent = 'Game is full';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      return;
    }

    // Validate emoji uniqueness
    if (room.hostEmoji === selectedEmoji) {
      joinStatus.textContent = 'Please choose a different emoji';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      return;
    }

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
      joinStatus.textContent = 'Joined! Starting game...';
      joinStatus.style.color = 'var(--success)';
      
      sessionStorage.setItem('roomCode', code);
      sessionStorage.setItem('isHost', 'false');
      sessionStorage.setItem('mySymbol', selectedEmoji);
      sessionStorage.setItem('opponentSymbol', room.hostEmoji);
      
      setTimeout(() => window.location.href = 'game.html', 300);
    }).catch(err => {
      console.error('Error joining game:', err);
      joinStatus.textContent = 'Error joining game';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
    });
  });
});

