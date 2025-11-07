import { firebaseConfig } from './utils.js';

// Initialize Firebase
if (!firebase.apps.length) {
  window.gameLogger?.logFirebaseInit(firebaseConfig);
  try {
    firebase.initializeApp(firebaseConfig);
    window.gameLogger?.logFirebaseInitComplete(true);
  } catch (error) {
    window.gameLogger?.logFirebaseInitComplete(false, error);
  }
}

const DEBUG = true;
const db = firebase.database();
window.gameLogger?.log('MULTIPLAYER', 'Script loaded and Firebase ready', {}, 'info');

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

// Track generated room code
let generatedRoomCode = null;

window.gameLogger?.log('MULTIPLAYER', 'DOM elements loaded', {
  elementsFound: [
    emojiDisplay, emojiToggle, emojiModal, closeEmojiModal, emojiPicker,
    createRoomBtn, joinRoomBtn, createModule, joinModule,
    roomCodeInput, roomCodeDisplay, createStatus, joinStatus,
    copyCodeBtn, pasteCodeBtn
  ].filter(Boolean).length
}, 'debug');

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
      window.gameLogger?.logUIInteraction({
        action: 'Emoji selected',
        element: 'emoji-option',
        eventType: 'click',
        info: { emoji }
      });
      selectEmoji(emoji);
    });
    emojiPicker.appendChild(option);
  });
  window.gameLogger?.log('MULTIPLAYER', 'Emoji picker initialized', { emojiCount: emojis.length }, 'debug');
}

function selectEmoji(emoji) {
  emojiDisplay.textContent = emoji;
  emojiModal.classList.add('hidden');
  window.gameLogger?.log('MULTIPLAYER', 'Emoji selected', { emoji }, 'info');
}

function getRandomEmoji() {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  window.gameLogger?.log('MULTIPLAYER', 'Random emoji assigned', { emoji }, 'debug');
  return emoji;
}

// Set random emoji on page load
emojiDisplay.textContent = getRandomEmoji();
initEmojiPicker();

// Emoji modal toggle
emojiToggle.addEventListener('click', () => {
  window.gameLogger?.logUIInteraction({
    action: 'Emoji modal opened',
    element: 'emojiToggle',
    eventType: 'click'
  });
  emojiModal.classList.remove('hidden');
});

closeEmojiModal.addEventListener('click', () => {
  window.gameLogger?.logUIInteraction({
    action: 'Emoji modal closed',
    element: 'closeEmojiModal',
    eventType: 'click'
  });
  emojiModal.classList.add('hidden');
});

emojiModal.addEventListener('click', (e) => {
  if (e.target === emojiModal) {
    emojiModal.classList.add('hidden');
    window.gameLogger?.logUIInteraction({
      action: 'Emoji modal closed via backdrop',
      element: 'emojiModal',
      eventType: 'click'
    });
  }
});

// Toggle modules when buttons clicked
createRoomBtn.addEventListener('click', (e) => {
  if (!createModule.classList.contains('hidden')) return;
  window.gameLogger?.logUIInteraction({
    action: 'Create room module opened',
    element: 'createRoomBtn',
    eventType: 'click'
  });
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
  if (!joinModule.classList.contains('hidden')) return;
  window.gameLogger?.logUIInteraction({
    action: 'Join room module opened',
    element: 'joinRoomBtn',
    eventType: 'click'
  });
  joinModule.classList.remove('hidden');
  createModule.classList.add('hidden');
  createRoomBtn.disabled = false;
  createStatus.textContent = '';
});

// Room code input validation and button text update
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

  window.gameLogger?.logUIInteraction({
    action: 'Room code input',
    element: 'roomCodeInput',
    eventType: 'input',
    info: { codeLength: e.target.value.length }
  });
});

// Copy room code
copyCodeBtn?.addEventListener('click', async () => {
  try {
    const code = roomCodeDisplay.textContent;
    await navigator.clipboard.writeText(code);
    window.gameLogger?.logUIInteraction({
      action: 'Room code copied',
      element: 'copyCodeBtn',
      eventType: 'click',
      info: { code }
    });
    const originalText = copyCodeBtn.textContent;
    copyCodeBtn.textContent = '✓';
    copyCodeBtn.style.background = 'var(--success)';
    setTimeout(() => {
      copyCodeBtn.textContent = originalText;
      copyCodeBtn.style.background = '';
    }, 1500);
  } catch (error) {
    window.gameLogger?.log('NETWORK', 'Copy room code failed', {
      error: error.message,
      code: error.code
    }, 'error');
  }
});

// Paste room code
pasteCodeBtn?.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    roomCodeInput.value = text.toUpperCase().substring(0, 4).replace(/[^A-Z0-9]/g, '');

    // Trigger input event to update button text
    roomCodeInput.dispatchEvent(new Event('input'));

    window.gameLogger?.logUIInteraction({
      action: 'Room code pasted',
      element: 'pasteCodeBtn',
      eventType: 'click',
      info: { codeLength: roomCodeInput.value.length }
    });
  } catch (error) {
    window.gameLogger?.log('NETWORK', 'Paste room code failed', {
      error: error.message,
      code: error.code
    }, 'error');
  }
});

// Create game
createRoomBtn.addEventListener('click', () => {
  window.gameLogger?.log('MULTIPLAYER', 'Create game button clicked', {
    generatedCodeExists: !!generatedRoomCode
  }, 'info');

  // If code already exists, just show the module
  if (generatedRoomCode) {
    window.gameLogger?.log('MULTIPLAYER', 'Reusing existing room code', { code: generatedRoomCode }, 'info');
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
    winner: null,
    createdAt: Date.now()
  };

  window.gameLogger?.logFirebaseConnection(code);
  window.gameLogger?.log('MULTIPLAYER', 'Creating game room', {
    code,
    hostEmoji: selectedEmoji,
    timestamp: new Date().toISOString()
  }, 'info');

  db.ref('rooms/' + code).set(roomData).then(() => {
    window.gameLogger?.logFirebaseConnectionSuccess(roomData);
    window.gameLogger?.log('MULTIPLAYER', 'Game created successfully', { code }, 'success');

    roomCodeDisplay.textContent = code;
    createStatus.textContent = 'Waiting for opponent...';
    createStatus.style.color = 'var(--warning)';

    sessionStorage.setItem('roomCode', code);
    sessionStorage.setItem('isHost', 'true');
    sessionStorage.setItem('mySymbol', selectedEmoji);

    window.gameLogger?.logSessionData('roomCode', code);
    window.gameLogger?.logSessionData('isHost', 'true');
    window.gameLogger?.logSessionData('mySymbol', selectedEmoji);

    const roomRef = db.ref('rooms/' + code);
    let connectionCheckInterval = null;

    roomRef.on('value', (snapshot) => {
      const room = snapshot.val();
      window.gameLogger?.log('FIREBASE', 'Room data received', {
        hasRoom: !!room,
        guestJoined: room?.guestJoined,
        roomKeys: room ? Object.keys(room) : []
      }, 'debug');

      if (room && room.guestJoined && room.guestEmoji) {
        window.gameLogger?.log('MULTIPLAYER', 'Guest joined - game starting', {
          guestEmoji: room.guestEmoji,
          roomCode: code
        }, 'success');

        sessionStorage.setItem('opponentSymbol', room.guestEmoji);
        window.gameLogger?.logSessionData('opponentSymbol', room.guestEmoji);

        roomRef.off('value');
        window.gameLogger?.logPageTransition('index.html', 'game.html', {
          roomCode: code,
          isHost: 'true',
          mySymbol: selectedEmoji,
          opponentSymbol: room.guestEmoji
        });

        setTimeout(() => {
          window.location.href = 'game.html';
        }, 300);
      }
    }, (error) => {
      window.gameLogger?.logFirebaseConnectionFailure(error, {
        attemptedCode: code,
        selectedEmoji,
        step: 'listening_for_guest'
      });

      createStatus.textContent = 'Connection error';
      createStatus.style.color = 'var(--danger)';
      createRoomBtn.disabled = false;
      generatedRoomCode = null;
    });

  }).catch(err => {
    window.gameLogger?.logFirebaseConnectionFailure(err, {
      attemptedCode: code,
      selectedEmoji,
      step: 'creating_room'
    });

    window.gameLogger?.log('MULTIPLAYER', 'Error creating game', {
      error: err.message,
      code: err.code
    }, 'error');

    createStatus.textContent = 'Error creating game';
    createStatus.style.color = 'var(--danger)';
    createRoomBtn.disabled = false;
    generatedRoomCode = null;
  });
});

// Join game
joinRoomBtn.addEventListener('click', () => {
  const code = roomCodeInput.value.trim().toUpperCase();

  window.gameLogger?.log('MULTIPLAYER', 'Join game button clicked', {
    codeEntered: code,
    codeLength: code.length
  }, 'info');

  if (code.length !== 4) {
    window.gameLogger?.log('MULTIPLAYER', 'Invalid room code length', {
      expectedLength: 4,
      actualLength: code.length,
      code
    }, 'warn');
    return;
  }

  joinRoomBtn.disabled = true;
  const selectedEmoji = emojiDisplay.textContent;

  window.gameLogger?.logFirebaseConnection(code);
  window.gameLogger?.log('MULTIPLAYER', 'Attempting to join room', {
    code,
    selectedEmoji,
    timestamp: new Date().toISOString()
  }, 'info');

  db.ref('rooms/' + code).once('value').then(snapshot => {
    if (!snapshot.exists()) {
      window.gameLogger?.log('MULTIPLAYER', 'Room not found', { code }, 'warn');
      joinStatus.textContent = 'Game not found';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      window.gameLogger?.logFirebaseConnectionFailure(
        new Error('Room not found'),
        { attemptedCode: code, step: 'room_lookup' }
      );
      return;
    }

    const room = snapshot.val();
    window.gameLogger?.log('FIREBASE', 'Room found', {
      roomKeys: Object.keys(room),
      guestAlreadyJoined: room.guestJoined
    }, 'debug');

    if (room.guestJoined) {
      window.gameLogger?.log('MULTIPLAYER', 'Room is full', { code }, 'warn');
      joinStatus.textContent = 'Game is full';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      window.gameLogger?.logFirebaseConnectionFailure(
        new Error('Game is full'),
        { attemptedCode: code, step: 'room_full_check' }
      );
      return;
    }

    window.gameLogger?.log('MULTIPLAYER', 'Room validated - joining', { code }, 'info');

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
      window.gameLogger?.logFirebaseConnectionSuccess({ ...room, ...updateData });
      window.gameLogger?.log('MULTIPLAYER', 'Successfully joined game', {
        code,
        hostEmoji: room.hostEmoji,
        guestEmoji: selectedEmoji
      }, 'success');

      joinStatus.textContent = 'Joined! Starting game...';
      joinStatus.style.color = 'var(--success)';

      sessionStorage.setItem('roomCode', code);
      sessionStorage.setItem('isHost', 'false');
      sessionStorage.setItem('mySymbol', selectedEmoji);
      sessionStorage.setItem('opponentSymbol', room.hostEmoji);

      window.gameLogger?.logSessionData('roomCode', code);
      window.gameLogger?.logSessionData('isHost', 'false');
      window.gameLogger?.logSessionData('mySymbol', selectedEmoji);
      window.gameLogger?.logSessionData('opponentSymbol', room.hostEmoji);

      window.gameLogger?.logPageTransition('index.html', 'game.html', {
        roomCode: code,
        isHost: 'false',
        mySymbol: selectedEmoji,
        opponentSymbol: room.hostEmoji
      });

      setTimeout(() => {
        window.location.href = 'game.html';
      }, 300);

    }).catch(err => {
      window.gameLogger?.logFirebaseConnectionFailure(err, {
        attemptedCode: code,
        selectedEmoji,
        step: 'updating_room_with_guest'
      });

      window.gameLogger?.log('MULTIPLAYER', 'Error joining game', {
        error: err.message,
        code: err.code
      }, 'error');

      joinStatus.textContent = 'Error joining game';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
    });

  }).catch(err => {
    window.gameLogger?.logFirebaseConnectionFailure(err, {
      attemptedCode: code,
      step: 'initial_room_lookup'
    });

    window.gameLogger?.log('MULTIPLAYER', 'Connection error during join', {
      error: err.message,
      code: err.code
    }, 'error');

    joinStatus.textContent = 'Connection error';
    joinStatus.style.color = 'var(--danger)';
    joinRoomBtn.disabled = false;
  });
});

window.gameLogger?.log('MULTIPLAYER', 'Multiplayer script fully loaded and ready', {
  eventListenersAttached: 8
}, 'success');
