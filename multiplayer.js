import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBfJzZ52dh9lKJ8Eo9CvYZd9RK9WwQwx-U",
  authDomain: "tic-tac-toe-multiplayer-7e3ea.firebaseapp.com",
  projectId: "tic-tac-toe-multiplayer-7e3ea",
  storageBucket: "tic-tac-toe-multiplayer-7e3ea.appspot.com",
  messagingSenderId: "816848127676",
  appId: "1:816848127676:web:b35d0a4f8c9e3d6f7c2a1b",
  databaseURL: "https://tic-tac-toe-multiplayer-7e3ea-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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

// Initialize
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
  // Emoji modal
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

  // Create Game Button
  createGameBtn.addEventListener('click', toggleCreateGame);

  // Join Game Button
  joinGameBtn.addEventListener('click', toggleJoinGame);

  // Copy button
  copyBtn.addEventListener('click', copyRoomCode);

  // Paste button
  pasteBtn.addEventListener('click', pasteRoomCode);

  // Room code input - auto-join when 4 characters
  roomCodeInput.addEventListener('input', (e) => {
    roomCodeInput.value = roomCodeInput.value.toUpperCase().substring(0, 4);
    if (roomCodeInput.value.length === 4) {
      joinWithCode(roomCodeInput.value);
    }
  });

  roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && roomCodeInput.value.length === 4) {
      joinWithCode(roomCodeInput.value);
    }
  });
}

function toggleCreateGame() {
  if (isJoiningGame) {
    // Close join module first
    joinModule.classList.add('hidden');
    joinStatus.textContent = '';
    isJoiningGame = false;
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
      gameStartWatcher();
    }
  }
}

function toggleJoinGame() {
  if (isCreatingGame) {
    // Close create module first
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
  } else {
    joinModule.classList.add('hidden');
    joinStatus.textContent = '';
    roomCodeInput.value = '';
  }
}

function generateNewRoomCode() {
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  currentRoomCode = code;
  roomCodeDisplay.textContent = code;
  createStatus.textContent = '🎮 Waiting for opponent...';
  
  // Store in Firebase
  const roomRef = ref(database, `rooms/${code}`);
  set(roomRef, {
    player1: selectedEmoji,
    status: 'waiting'
  });

  // Watch for opponent
  watchForGameStart(code);
}

function watchForGameStart(code) {
  const roomRef = ref(database, `rooms/${code}`);
  gameStartWatcher = onValue(roomRef, (snapshot) => {
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
      joinWithCode(code);
    }
  }).catch(err => {
    joinStatus.textContent = '❌ Cannot access clipboard';
  });
}

function joinWithCode(code) {
  if (code.length !== 4) {
    joinStatus.textContent = '❌ Invalid code (must be 4 characters)';
    return;
  }

  joinStatus.textContent = 'Checking room...';
  
  const roomRef = ref(database, `rooms/${code}`);
  onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.player1) {
        joinStatus.textContent = '✓ Room found! Joining...';
        
        // Add player2 to the room
        update(ref(database, `rooms/${code}`), {
          player2: selectedEmoji,
          status: 'ready'
        });
        
        // Store session and navigate
        sessionStorage.setItem('roomCode', code);
        sessionStorage.setItem('playerEmoji', selectedEmoji);
        sessionStorage.setItem('isHost', 'false');
        
        setTimeout(() => {
          window.location.href = 'game.html';
        }, 500);
      } else {
        joinStatus.textContent = '❌ Room not available';
      }
    } else {
      joinStatus.textContent = '❌ Room not found';
    }
  }, { onlyOnce: true }); // Only listen once to avoid multiple triggers
}

init();
