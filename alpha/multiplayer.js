// Wait for Firebase SDK to be available
function waitForFirebase() {
  return new Promise((resolve) => {
    if (typeof firebase !== 'undefined') {
      console.log('[MULTIPLAYER] Firebase already loaded');
      resolve();
    } else {
      console.log('[MULTIPLAYER] Waiting for Firebase...');
      const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined') {
          console.log('[MULTIPLAYER] Firebase loaded!');
          clearInterval(checkFirebase);
          resolve();
        }
      }, 100);
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkFirebase);
        console.error('[MULTIPLAYER] Firebase failed to load after 5 seconds');
        resolve(); // Continue anyway
      }, 5000);
    }
  });
}

// Wait for DOM and Firebase, then init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await waitForFirebase();
    initMultiplayer();
  });
} else {
  waitForFirebase().then(initMultiplayer);
}

function initMultiplayer() {
  if (typeof firebase === 'undefined') {
    console.error('[MULTIPLAYER] FATAL: Firebase is not defined. Check CDN scripts loaded.');
    return;
  }

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
  console.log('[MULTIPLAYER] Script loaded and Firebase initialized');

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
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const pasteCodeBtn = document.getElementById('pasteCodeBtn');

  if (!createRoomBtn || !joinRoomBtn) {
    console.error('[MULTIPLAYER] ERROR: Button elements not found!');
    return;
  }

  const EMOJI_OPTIONS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤'];
  let selectedEmoji = EMOJI_OPTIONS[0];

  if (emojiPicker) {
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
  }

  if (emojiToggle) {
    emojiToggle.addEventListener('click', () => {
      emojiModal.classList.remove('hidden');
    });
  }

  if (closeEmojiModal) {
    closeEmojiModal.addEventListener('click', () => {
      emojiModal.classList.add('hidden');
    });
  }

  if (emojiModal) {
    emojiModal.addEventListener('click', (e) => {
      if (e.target === emojiModal) {
        emojiModal.classList.add('hidden');
      }
    });
  }

  const firstEmoji = document.querySelector(`[data-emoji="${selectedEmoji}"]`);
  if (firstEmoji) {
    firstEmoji.classList.add('selected');
  }

  if (createRoomBtn) {
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

        if (createStatus) createStatus.textContent = `Game created! Code: ${roomCode}`;
        if (roomCodeDisplay) roomCodeDisplay.textContent = roomCode;
        if (mainSection) mainSection.classList.add('hidden');
        if (createModule) createModule.classList.remove('hidden');
        createRoomBtn.disabled = true;

        sessionStorage.setItem('roomCode', roomCode);
        sessionStorage.setItem('isHost', 'true');
        sessionStorage.setItem('mySymbol', selectedEmoji);

        setTimeout(() => {
          window.location.href = 'game.html';
        }, 2000);
      } catch (error) {
        if (createStatus) createStatus.textContent = 'Failed to create game';
        if (createStatus) createStatus.style.color = 'var(--danger)';
        console.error('Create game error:', error);
      }
    });
  }

  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => {
      if (mainSection) mainSection.classList.add('hidden');
      if (joinModule) joinModule.classList.remove('hidden');
    });
  }

  if (joinGameBtn) {
    joinGameBtn.addEventListener('click', async () => {
      const code = roomCodeInput.value.trim().toUpperCase();

      if (code.length !== 4 || !/^[A-HJ-NPQ-Z1-9]{4}$/.test(code)) {
        if (joinStatus) joinStatus.textContent = 'Invalid room code format';
        if (joinStatus) joinStatus.style.color = 'var(--danger)';
        return;
      }

      try {
        joinGameBtn.disabled = true;
        const roomRef = db.ref(`rooms/${code}`);
        const snapshot = await roomRef.once('value');
        const room = snapshot.val();

        if (!room) {
          if (joinStatus) joinStatus.textContent = 'Room not found';
          if (joinStatus) joinStatus.style.color = 'var(--danger)';
          joinGameBtn.disabled = false;
          return;
        }

        if (selectedEmoji === room.hostEmoji) {
          if (joinStatus) joinStatus.textContent = 'Please choose a different emoji';
          if (joinStatus) joinStatus.style.color = 'var(--danger)';
          joinGameBtn.disabled = false;
          
          setTimeout(() => {
            if (joinStatus) joinStatus.textContent = '';
            if (joinStatus) joinStatus.style.color = '';
          }, 5000);
          return;
        }

        sessionStorage.setItem('roomCode', code);
        sessionStorage.setItem('isHost', 'false');
        sessionStorage.setItem('mySymbol', selectedEmoji);
        sessionStorage.setItem('opponentSymbol', room.hostEmoji);

        if (joinStatus) joinStatus.textContent = 'Joining game...';
        if (joinStatus) joinStatus.style.color = 'var(--success)';

        setTimeout(() => {
          window.location.href = 'game.html';
        }, 1000);
      } catch (error) {
        if (joinStatus) joinStatus.textContent = 'Error joining game';
        if (joinStatus) joinStatus.style.color = 'var(--danger)';
        joinGameBtn.disabled = false;
        console.error('Join game error:', error);
      }
    });
  }

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', async () => {
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
  }

  if (pasteCodeBtn) {
    pasteCodeBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        roomCodeInput.value = text.toUpperCase().substring(0, 4).replace(/[^A-Z0-9]/g, '');
      } catch (error) {
        console.error('[MULTIPLAYER] Paste failed:', error);
      }
    });
  }

  console.log('[MULTIPLAYER] Initialization complete');
}
