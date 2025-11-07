import { firebaseConfig, generateRoomCode, showError, validateRoomCode } from './utils.js';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

// DOM elements
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const emojiPicker = document.getElementById('emojiPicker');
const selectedEmojiDisplay = document.getElementById('selectedEmoji');
const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCode');
const joinStatus = document.getElementById('joinStatus');
const createStatus = document.getElementById('createStatus');
const createRoomCodeDisplay = document.getElementById('createRoomCode');

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
    selectedEmojiDisplay.textContent = selectedEmoji;
  }
});

// Set initial selected emoji
document.querySelector('[data-emoji="🎮"]').classList.add('selected');
selectedEmojiDisplay.textContent = selectedEmoji;

// Create Game Flow
createGameBtn.addEventListener('click', async () => {
  try {
    const roomCode = generateRoomCode();
    const roomRef = db.ref(`rooms/${roomCode}`);
    
    // Initialize room with host emoji
    await roomRef.set({
      host: true,
      hostEmoji: selectedEmoji,
      board: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i, null])),
      turn: selectedEmoji,
      winner: null,
      createdAt: Date.now()
    });

    createStatus.textContent = `Game created! Code: ${roomCode}`;
    createRoomCodeDisplay.textContent = roomCode;
    createRoomCodeDisplay.style.display = 'block';
    createGameBtn.disabled = true;

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

// Join Game Flow
joinRoomBtn.addEventListener('click', async () => {
  const code = roomCodeInput.value.trim().toUpperCase();

  if (!validateRoomCode(code)) {
    showError(joinStatus, 'Invalid room code format');
    return;
  }

  try {
    joinRoomBtn.disabled = true;
    const roomRef = db.ref(`rooms/${code}`);
    const snapshot = await roomRef.once('value');
    const room = snapshot.val();

    if (!room) {
      showError(joinStatus, 'Room not found');
      joinRoomBtn.disabled = false;
      return;
    }

    // CRITICAL FIX: Prevent guest from choosing same emoji as host
    if (selectedEmoji === room.hostEmoji) {
      joinStatus.textContent = 'Please choose a different emoji';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        joinStatus.textContent = '';
        joinStatus.style.color = '';
      }, 5000);
      return;
    }

    // Proceed with join
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
    joinRoomBtn.disabled = false;
    console.error('Join game error:', error);
  }
});

// UI Flow Management
createBtn.addEventListener('click', () => {
  document.getElementById('homeSection').style.display = 'none';
  document.getElementById('createSection').style.display = 'block';
});

joinBtn.addEventListener('click', () => {
  document.getElementById('homeSection').style.display = 'none';
  document.getElementById('joinSection').style.display = 'block';
});

// Back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('homeSection').style.display = 'block';
    document.getElementById('createSection').style.display = 'none';
    document.getElementById('joinSection').style.display = 'none';
    roomCodeInput.value = '';
    joinStatus.textContent = '';
    createStatus.textContent = '';
    createRoomCodeDisplay.style.display = 'none';
  });
});
