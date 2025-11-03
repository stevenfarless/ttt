// Firebase initialized in utils.js
// database is available globally

// DOM Elements
const emojiToggleBtn = document.getElementById('emojiToggleBtn');
const emojiModal = document.getElementById('emojiModal');
const closeEmojiModal = document.getElementById('closeEmojiModal');
const emojiPicker = document.getElementById('emojiPicker');
const selectedEmojiDisplay = document.getElementById('selectedEmoji');

const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const createModule = document.getElementById('createModule');
const joinModule = document.getElementById('joinModule');

const roomCodeDisplay = document.getElementById('roomCode');
const roomCodeInput = document.getElementById('roomCodeInput');
const copyBtn = document.getElementById('copyBtn');
const pasteBtn = document.getElementById('pasteBtn');

const createStatus = document.getElementById('createStatus');
const joinStatus = document.getElementById('joinStatus');

// Emojis
const emojis = ['😀', '😂', '😍', '🤔', '😎', '🤗', '😴', '😤', '🚀', '⭐', '🎮', '🎯', '🍕', '🌙', '💎', '🔥'];

let selectedEmoji = '😀';
let currentRoomCode = null;
let isCreatingGame = false;
let isJoiningGame = false;
let gameStartWatcher = null;
let validJoinCode = null;

function init() {
  populateEmojiPicker();
  setupEventListeners();
}

function populateEmojiPicker() {
  emojiPicker.innerHTML = '';
  emojis.forEach(emoji => {
    const button = document.createElement('div');
    button.className = 'emoji-option';
    button.textContent = emoji;
    button.addEventListener('click', () => selectEmoji(emoji));
    emojiPicker.appendChild(button);
  });
}

function selectEmoji(emoji) {
  selectedEmoji = emoji;
  selectedEmojiDisplay.textContent = emoji;
  closeEmojiModal.click();
}

function setupEventListeners() {
  emojiToggleBtn.addEventListener('click', () => {
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

  createGameBtn.addEventListener('click', toggleCreateGame);
  joinGameBtn.addEventListener('click', handleJoinButtonClick);
  copyBtn.addEventListener('click', copyRoomCode);
  pasteBtn.addEventListener('click', pasteRoomCode);

  roomCodeInput.addEventListener('input', (e) => {
    roomCodeInput.value = roomCodeInput.value.toUpperCase().substring(0, 4);
    if (roomCodeInput.value.length === 4) {
      validateJoinCode(roomCodeInput.value);
    }
  });

  roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && roomCodeInput.value.length === 4 && validJoinCode) {
      startJoiningGame();
    }
  });
}

function toggleCreateGame() {
  if (isJoiningGame) {
    joinModule.classList.add('hidden');
    joinStatus.textContent = '';
    isJoiningGame = false;
    joinGameBtn.textContent = 'Join Game';
    validJoinCode = null;
  }

  isCreatingGame = !isCreatingGame;

  if (isCreatingGame) {
    createModule.classList.remove('hidden');
    if (!currentRoomCode) {
      generateNewRoomCode();
    }
  } else {
    createModule.classList.add('hidden');
    createStatus.textContent = '';
    if (gameStartWatcher) {
      gameStartWatcher.off();
    }
  }
}

function handleJoinButtonClick() {
  if (!isJoiningGame) {
    toggleJoinGameModule();
  } else if (validJoinCode) {
    startJoiningGame();
  }
}

function toggleJoinGameModule() {
  if (isCreatingGame) {
    createModule.classList.add('hidden');
    createStatus.textContent = '';
    isCreatingGame = false;
  }

  isJoiningGame = !isJoiningGame;
  
  if (isJoiningGame) {
    joinModule.classList.remove('hidden');
    roomCodeInput.value = '';
    roomCodeInput.focus();
    joinStatus.textContent = 'Enter a 4-digit code';
    joinGameBtn.textContent = 'Join Game';
  } else {
    joinModule.classList.add('hidden');
    joinStatus.textContent = '';
    validJoinCode = null;
  }
}

function validateJoinCode(code) {
  if (code.length !== 4) {
    validJoinCode = null;
    joinGameBtn.textContent = 'Join Game';
    joinStatus.textContent = 'Enter a 4-digit code';
    return;
  }

  const roomRef = database.ref(`rooms/${code}`);
  roomRef.once('value', (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.player1 && !data.player2) {
        validJoinCode = code;
        joinGameBtn.textContent = 'START GAME';
        joinStatus.textContent = '✓ Code valid! Tap START GAME';
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

function startJoiningGame() {
  if (!validJoinCode) return;

  joinStatus.textContent = 'Joining...';

  database.ref(`rooms/${validJoinCode}`).update({
    player2: selectedEmoji,
    status: 'ready'
  });

  sessionStorage.setItem('roomCode', validJoinCode);
  sessionStorage.setItem('playerEmoji', selectedEmoji);
  sessionStorage.setItem('isHost', 'false');

  setTimeout(() => {
    window.location.href = 'game.html';
  }, 500);
}

function generateNewRoomCode() {
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  currentRoomCode = code;
  roomCodeDisplay.textContent = code;
  createStatus.textContent = '🎮 Waiting for opponent...';
  
  database.ref(`rooms/${code}`).set({
    player1: selectedEmoji,
    status: 'waiting'
  });

  watchForGameStart(code);
}

function watchForGameStart(code) {
  const roomRef = database.ref(`rooms/${code}`);
  gameStartWatcher = roomRef.on('value', (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.player2) {
        createStatus.textContent = '✓ Opponent found! Starting...';
        sessionStorage.setItem('roomCode', code);
        sessionStorage.setItem('playerEmoji', selectedEmoji);
        sessionStorage.setItem('isHost', 'true');
        setTimeout(() => {
          window.location.href = 'game.html';
        }, 500);
      }
    }
  });
}

function copyRoomCode() {
  if (currentRoomCode) {
    navigator.clipboard.writeText(currentRoomCode).then(() => {
      createStatus.textContent = '✓ Copied!';
      setTimeout(() => {
        createStatus.textContent = '🎮 Waiting for opponent...';
      }, 2000);
    });
  }
}

function pasteRoomCode() {
  navigator.clipboard.readText().then(text => {
    const code = text.toUpperCase().substring(0, 4);
    roomCodeInput.value = code;
    if (code.length === 4) {
      validateJoinCode(code);
    }
  }).catch(err => {
    joinStatus.textContent = '❌ Cannot access clipboard';
  });
}

// START THE APP
init();
