// Initialize Firebase - use compat SDK which doesn't require modules
(function() {
  console.log('[MULTIPLAYER] Starting initialization');
  
  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyAQO1xbKz5yjo3TAqqU1gFZYrI-qBugRNs",
    authDomain: "tic-tac-toe-80bd7.firebaseapp.com",
    databaseURL: "https://tic-tac-toe-80bd7-default-rtdb.firebaseio.com",
    projectId: "tic-tac-toe-80bd7",
    storageBucket: "tic-tac-toe-80bd7.firebasestorage.app",
    messagingSenderId: "423174319963",
    appId: "1:423174319963:web:c5329be46c388da0eb347e"
  };

  // Initialize if DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Check if firebase exists
    if (typeof firebase === 'undefined') {
      console.error('[MULTIPLAYER] Firebase not loaded! Check CDN scripts.');
      document.body.innerHTML += '<div style="color:red;padding:20px;">ERROR: Firebase SDK failed to load. Please refresh.</div>';
      return;
    }

    console.log('[MULTIPLAYER] Firebase SDK available');

    // Initialize
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.database();
    console.log('[MULTIPLAYER] Firebase initialized');

    // Get DOM elements
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

    // Emoji picker
    if (emojiPicker) {
      emojiPicker.innerHTML = EMOJI_OPTIONS.map(e => `<button class="emoji-btn" data-emoji="${e}">${e}</button>`).join('');
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

    document.querySelector(`[data-emoji="${selectedEmoji}"]`)?.classList.add('selected');

    if (emojiToggle) emojiToggle.addEventListener('click', () => emojiModal.classList.remove('hidden'));
    if (closeEmojiModal) closeEmojiModal.addEventListener('click', () => emojiModal.classList.add('hidden'));
    if (emojiModal) emojiModal.addEventListener('click', (e) => { if (e.target === emojiModal) emojiModal.classList.add('hidden'); });

    // CREATE GAME
    if (createRoomBtn) {
      createRoomBtn.addEventListener('click', async () => {
        try {
          const roomCode = Array.from({length:4}, () => 'ABCDEFGHJKMNPQRSTUVWXYZ123456789'[Math.floor(Math.random()*31)]).join('');
          const roomRef = db.ref(`rooms/${roomCode}`);
          
          await roomRef.set({
            host: true,
            hostEmoji: selectedEmoji,
            board: Object.fromEntries(Array.from({length:9}, (_,i) => [i, null])),
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

          setTimeout(() => window.location.href = 'game.html', 2000);
        } catch (error) {
          if (createStatus) createStatus.textContent = 'Failed to create game';
          console.error('Create error:', error);
        }
      });
    }

    // JOIN ROOM TOGGLE
    if (joinRoomBtn) {
      joinRoomBtn.addEventListener('click', () => {
        if (mainSection) mainSection.classList.add('hidden');
        if (joinModule) joinModule.classList.remove('hidden');
      });
    }

    // JOIN GAME
    if (joinGameBtn) {
      joinGameBtn.addEventListener('click', async () => {
        const code = roomCodeInput.value.trim().toUpperCase();

        if (code.length !== 4 || !/^[A-HJ-NPQ-Z1-9]{4}$/.test(code)) {
          if (joinStatus) joinStatus.textContent = 'Invalid code';
          return;
        }

        try {
          joinGameBtn.disabled = true;
          const snapshot = await db.ref(`rooms/${code}`).once('value');
          const room = snapshot.val();

          if (!room) {
            if (joinStatus) joinStatus.textContent = 'Room not found';
            joinGameBtn.disabled = false;
            return;
          }

          if (selectedEmoji === room.hostEmoji) {
            if (joinStatus) joinStatus.textContent = 'Choose different emoji';
            joinGameBtn.disabled = false;
            return;
          }

          sessionStorage.setItem('roomCode', code);
          sessionStorage.setItem('isHost', 'false');
          sessionStorage.setItem('mySymbol', selectedEmoji);
          sessionStorage.setItem('opponentSymbol', room.hostEmoji);

          if (joinStatus) joinStatus.textContent = 'Joining...';
          setTimeout(() => window.location.href = 'game.html', 1000);
        } catch (error) {
          if (joinStatus) joinStatus.textContent = 'Error joining';
          joinGameBtn.disabled = false;
          console.error('Join error:', error);
        }
      });
    }

    // COPY/PASTE
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(roomCodeDisplay.textContent);
          copyCodeBtn.textContent = '✓';
          setTimeout(() => copyCodeBtn.textContent = '📋', 1500);
        } catch (e) { console.error('Copy error:', e); }
      });
    }

    if (pasteCodeBtn) {
      pasteCodeBtn.addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          roomCodeInput.value = text.toUpperCase().substring(0, 4).replace(/[^A-Z0-9]/g, '');
        } catch (e) { console.error('Paste error:', e); }
      });
    }

    console.log('[MULTIPLAYER] Init complete');
  }
})();
