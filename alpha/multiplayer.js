import { firebaseConfig, generateRoomCode, validateRoomCode } from './utils.js';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const DEBUG = true;
const db = firebase.database();
console.log('[MULTIPLAYER] Script loaded');

// Emojis array
const emojis = ['\u274c', '\u2b55', '\u2764\ufe0f', '\U0001f4b2', '\U0001f600', '\U0001f480', '\U0001f916', '\U0001f47d', '\U0001f436', '\U0001f63a', '\U0001f4a9', '\U0001f990', '\U0001f355', '\U0001f363', '\U0001f353', '\U0001f364', '\U0001f319', '\u2600\ufe0f', '\u2b50', '\U0001f680'];

// Cache sessionStorage values at startup
const cachedSessionData = {
  roomCode: null,
  isHost: false,
  mySymbol: null,
  opponentSymbol: null
};

function cacheSessionData() {
  cachedSessionData.roomCode = sessionStorage.getItem('roomCode');
  cachedSessionData.isHost = sessionStorage.getItem('isHost') === 'true';
  cachedSessionData.mySymbol = sessionStorage.getItem('mySymbol');
  cachedSessionData.opponentSymbol = sessionStorage.getItem('opponentSymbol');
}

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
let emojiPickerInitialized = false;

// Debounce input handler
let inputDebounceTimer = null;
const DEBOUNCE_DELAY = 150;

/**
 * Initialize emoji picker once
 */
function initEmojiPicker() {
  if (emojiPickerInitialized) {
    return;
  }
  
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
  
  emojiPickerInitialized = true;
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

/**
 * Toggle create module
 */
function showCreateModule() {
  if (!createModule.classList.contains('hidden')) return;
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
}

/**
 * Toggle join module
 */
function showJoinModule() {
  if (!joinModule.classList.contains('hidden')) return;
  joinModule.classList.remove('hidden');
  createModule.classList.add('hidden');
  createRoomBtn.disabled = false;
  createStatus.textContent = '';
}

// Button toggle handlers - single listener per button
createRoomBtn.addEventListener('click', showCreateModule);
joinRoomBtn.addEventListener('click', showJoinModule);

// Room code input validation with debounce
roomCodeInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Clear previous debounce timer
  if (inputDebounceTimer) {
    clearTimeout(inputDebounceTimer);
  }

  // Debounce button text update
  inputDebounceTimer = setTimeout(() => {
    if (e.target.value.length === 4) {
      joinRoomBtn.textContent = 'START GAME';
    } else {
      joinRoomBtn.textContent = 'Join Game';
    }
  }, DEBOUNCE_DELAY);

  // Clear status immediately when typing
  joinStatus.textContent = '';
});

// Copy room code
copyCodeBtn?.addEventListener('click', async () => {
  try {
    const code = roomCodeDisplay.textContent;
    await navigator.clipboard.writeText(code);
    const originalText = copyCodeBtn.textContent;
    copyCodeBtn.textContent = '\u2713';
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
    roomCodeInput.value = text.toUpperCase().substring(0, 4).replace(/[^A-Z0-9]/g, '');
    // Trigger input event to update button text
    roomCodeInput.dispatchEvent(new Event('input'));
  } catch (error) {
    console.error('[MULTIPLAYER] Paste failed:', error);
  }
});

// Create game - separate listener
createRoomBtn.addEventListener('click', () => {
  console.log('[MULTIPLAYER] Create Game clicked');

  // If code already exists, just show the module (already handled by showCreateModule)
  if (generatedRoomCode) {
    return;
  }

  createRoomBtn.disabled = true;

  const code = generateRoomCode();
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

  console.log('[MULTIPLAYER] Creating game:', code);

  db.ref('rooms/' + code).set(roomData).then(() => {
    console.log('[MULTIPLAYER] Game created');
    roomCodeDisplay.textContent = code;
    createStatus.textContent = 'Waiting for opponent...';
    createStatus.style.color = 'var(--warning)';

    sessionStorage.setItem('roomCode', code);
    sessionStorage.setItem('isHost', 'true');
    sessionStorage.setItem('mySymbol', selectedEmoji);

    const roomRef = db.ref('rooms/' + code);

    const listener = (snapshot) => {
      const room = snapshot.val();
      if (room && room.guestJoined && room.guestEmoji) {
        console.log('[MULTIPLAYER] Guest joined, navigating');
        sessionStorage.setItem('opponentSymbol', room.guestEmoji);
        roomRef.off('value', listener);
        setTimeout(() => window.location.href = 'game.html', 300);
      }
    };

    roomRef.on('value', listener);

  }).catch(err => {
    console.error('[MULTIPLAYER] Error creating game:', err);
    createStatus.textContent = 'Error creating game';
    createStatus.style.color = 'var(--danger)';
    createRoomBtn.disabled = false;
    generatedRoomCode = null;
  });
});

// Join game - separate listener
joinRoomBtn.addEventListener('click', () => {
  const code = roomCodeInput.value.trim().toUpperCase();
  console.log('[MULTIPLAYER] Join Game clicked:', code);

  if (!validateRoomCode(code)) {
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

    console.log('[MULTIPLAYER] Joining game:', code);

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
      joinStatus.textContent = 'Error joining game';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
    });

  });
});
