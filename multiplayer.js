// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyAQO1xbKz5yjo3TAqqU1gFZYrI-qBugRNs",
    authDomain: "tic-tac-toe-80bd7.firebaseapp.com",
    databaseURL: "https://tic-tac-toe-80bd7-default-rtdb.firebaseio.com",
    projectId: "tic-tac-toe-80bd7",
    storageBucket: "tic-tac-toe-80bd7.firebasestorage.app",
    messagingSenderId: "423174319963",
    appId: "1:423174319963:web:c5329be46c388da0eb347e",
    measurementId: "G-2WC5RPCT3Q"
  });
}

const db = firebase.database();
console.log('[MULTIPLAYER] Script loaded');

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
const copyCodeBtn = document.getElementById('copyCodeBtn');
const pasteCodeBtn = document.getElementById('pasteCodeBtn');

const EMOJI_OPTIONS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤'];
let selectedEmoji = EMOJI_OPTIONS[0];

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

document.querySelector(`[data-emoji="${selectedEmoji}"]`).classList.add('selected');

createRoomBtn.addEventListener('click', async () => {
  try {
    const roomCode = (() => {
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
      let code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    })();

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
    createStatus.textContent = 'Failed to create game';
    createStatus.style.color = 'var(--danger)';
    console.error('Create game error:', error);
  }
});

joinRoomBtn.addEventListener('click', () => {
  mainSection.classList.add('hidden');
  joinModule.classList.remove('hidden');
});

joinGameBtn.addEventListener('click', async () => {
  const code = roomCodeInput.value.trim().toUpperCase();

  if (code.length !== 4 || !/^[A-HJ-NPQ-Z1-9]{4}$/.test(code)) {
    joinStatus.textContent = 'Invalid room code format';
    joinStatus.style.color = 'var(--danger)';
    return;
  }

  try {
    joinGameBtn.disabled = true;
    const roomRef = db.ref(`rooms/${code}`);
    const snapshot = await roomRef.once('value');
    const room = snapshot.val();

    if (!room) {
      joinStatus.textContent = 'Room not found';
      joinStatus.style.color = 'var(--danger)';
      joinGameBtn.disabled = false;
      return;
    }

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
    joinStatus.textContent = 'Error joining game';
    joinStatus.style.color = 'var(--danger)';
    joinGameBtn.disabled = false;
    console.error('Join game error:', error);
  }
});

copyCodeBtn?.addEventListener('click', async () => {
  try {
    const code = roomCodeDisplay.textContent;
    await navigator.clipboard.writeText(code);
    const originalText = copyCodeBtn.textContent;
    copyCodeBtn.textContent = '✓';
    setTimeout(() => {
      copyCodeBtn.textContent = originalText;
    }, 1500);
  } catch (error) {
    console.error('[MULTIPLAYER] Copy failed:', error);
  }
});

pasteCodeBtn?.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    roomCodeInput.value = text.toUpperCase().substring(0, 4).replace(/[^A-Z0-9]/g, '');
  } catch (error) {
    console.error('[MULTIPLAYER] Paste failed:', error);
  }
});
