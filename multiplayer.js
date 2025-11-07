import { firebaseConfig, generateRoomCode, showError, validateRoomCode } from './utils.js';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
console.log('[MULTIPLAYER] Script loaded');

// DOM Elements
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const createModule = document.getElementById('createModule');
const joinModule = document.getElementById('joinModule');
const mainSection = document.getElementById('mainSection');
const emojiToggle = document.getElementById('emojiToggle');
const emojiModal = document.getElementById('emojiModal');
const closeEmojiModal = document.getElementById('closeEmojiModal');
const emojiPicker = document.getElementById('emojiPicker');
const emojiDisplay = document.getElementById('emojiDisplay');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const roomCodeInput = document.getElementById('roomCodeInput');
const joinGameBtn = document.getElementById('joinGameBtn');
const createStatus = document.getElementById('createStatus');
const joinStatus = document.getElementById('joinStatus');

const EMOJI_OPTIONS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤'];
let selectedEmoji = EMOJI_OPTIONS[0];

// Initialize emoji picker
emojiPicker.innerHTML = EMOJI_OPTIONS.map(emoji => 
  `<button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`
).join('');

emojiPicker.addEventListener('click', (e) => {
  if (e.target.classList.contains('emoji-btn')) {
    document.querySelectorAll('.emoji-btn').forEach(btn => btn.classList.remove('selected'));
    e.target.classList.add('selected');
    selectedEmoji = e.target.dataset.emoji;
    emojiDisplay.textContent = selectedEmoji;
    emojiModal.classList.add('hidden');
  }
});

// Emoji Modal Toggle
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

// Set initial selected emoji
document.querySelector(`[data-emoji="${selectedEmoji}"]`).classList.add('selected');

// CREATE GAME BUTTON
createRoomBtn.addEventListener('click', async () => {
  try {
    const roomCode = generateRoomCode();
    const roomRef = db.ref(`rooms/${roomCode}`);
    
    await roomRef.set({
      host: true,
      hostEmoji: selectedEmoji,
      board: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i, null])),
      turn: selectedEmoji,
      winner: null,
      createdAt: Date.now()
    });

    createStatus.textContent = `Game created! Code: ${roomCode}`;
    roomCodeDisplay.textContent = roomCode;
    mainSection.classList.add('hidden');
    createModule.classList.remove('hidden');
    createRoomBtn.disabled = true;

    sessionStorage.setItem('roomCode', roomCode);
    sessionStorage.setItem('isHost', 'true');
    sessionStorage.setItem('mySymbol', selectedEmoji);

    setTimeout(() => {
      window.location.href = 'game.html';
    }, 2000);
  } catch (error) {
    showError(createStatus, 'Failed to create game');
    console.error('Create game error:', error);
  }
});

// JOIN GAME BUTTON (Show Join Module)
joinRoomBtn.addEventListener('click', () => {
  mainSection.classList.add('hidden');
  joinModule.classList.remove('hidden');
});

// JOIN GAME SUBMIT BUTTON
joinGameBtn.addEventListener('click', async () => {
  const code = roomCodeInput.value.trim().toUpperCase();

  if (!validateRoomCode(code)) {
    showError(joinStatus, 'Invalid room code format');
    return;
  }

  try {
    joinGameBtn.disabled = true;
    const roomRef = db.ref(`rooms/${code}`);
    const snapshot = await roomRef.once('value');
    const room = snapshot.val();

    if (!room) {
      showError(joinStatus, 'Room not found');
      joinGameBtn.disabled = false;
      return;
    }

    // CRITICAL FIX: Prevent guest from choosing same emoji as host
    if (selectedEmoji === room.hostEmoji) {
      joinStatus.textContent = 'Please choose a different emoji';
      joinStatus.style.color = 'var(--danger)';
      joinGameBtn.disabled = false;
      
      setTimeout(() => {
        joinStatus.textContent = '';
        joinStatus.style.color = '';
      }, 5000);
      return;
    }

    sessionStorage.setItem('roomCode', code);
    sessionStorage.setItem('isHost', 'false');
    sessionStorage.setItem('mySymbol', selectedEmoji);
    sessionStorage.setItem('opponentSymbol', room.hostEmoji);

    joinStatus.textContent = 'Joining game...';
    joinStatus.style.color = 'var(--success)';

    setTimeout(() => {
      window.location.href = 'game.html';
    }, 1000);
  } catch (error) {
    showError(joinStatus, 'Error joining game');
    joinGameBtn.disabled = false;
    console.error('Join game error:', error);
  }
});
