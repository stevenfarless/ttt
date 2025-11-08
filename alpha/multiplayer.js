import { firebaseConfig } from './utils.js';

// Initialize Firebase

if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}

const DEBUG = true;
const db = firebase.database();
console.log('[MULTIPLAYER] Script loaded at', new Date().toISOString());

// Emojis array
const emojis = ['❌', '⭕', '❤️', '💲', '😀', '💀', '🤖', '👽', '🐶', '😺', '💩', '🦐', '🍕', '🍣', '🍓', '🍤', '🌙', '☀️', '⭐', '🚀'];
console.log('[MULTIPLAYER] 🎨 Available emojis:', emojis.join(' '));

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

console.log('[MULTIPLAYER] ✅ DOM elements loaded successfully');

// Track generated room code
let generatedRoomCode = null;

// Initialize emoji picker
function initEmojiPicker() {
  const startTime = performance.now();
  console.log('[MULTIPLAYER] 🎨 Initializing emoji picker...');
  
  emojiPicker.innerHTML = '';
  emojis.forEach((emoji, index) => {
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
  
  const endTime = performance.now();
  console.log(`[MULTIPLAYER] ✅ Emoji picker initialized with ${emojis.length} emojis in ${(endTime - startTime).toFixed(2)}ms`);
}

function selectEmoji(emoji) {
  console.log(`[MULTIPLAYER] 🎨 Player selected emoji: ${emoji}`);
  emojiDisplay.textContent = emoji;
  emojiModal.classList.add('hidden');
  console.log('[MULTIPLAYER] ✅ Emoji modal closed');
}

function getRandomEmoji() {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  console.log(`[MULTIPLAYER] 🎲 Random emoji generated: ${emoji}`);
  return emoji;
}

// Set random emoji on page load
const initialEmoji = getRandomEmoji();
emojiDisplay.textContent = initialEmoji;
console.log(`[MULTIPLAYER] 🎨 Initial player emoji set to: ${initialEmoji}`);
initEmojiPicker();

// Emoji modal toggle
emojiToggle.addEventListener('click', () => {
  console.log('[MULTIPLAYER] 🎨 Emoji modal opened');
  emojiModal.classList.remove('hidden');
});

closeEmojiModal.addEventListener('click', () => {
  console.log('[MULTIPLAYER] 🎨 Emoji modal closed via close button');
  emojiModal.classList.add('hidden');
});

emojiModal.addEventListener('click', (e) => {
  if (e.target === emojiModal) {
    console.log('[MULTIPLAYER] 🎨 Emoji modal closed via backdrop click');
    emojiModal.classList.add('hidden');
  }
});

// Toggle modules when buttons clicked
createRoomBtn.addEventListener('click', (e) => {
  console.log('[MULTIPLAYER] 🎮 Create Game button clicked');
  
  if (!createModule.classList.contains('hidden')) {
    console.log('[MULTIPLAYER] ⚠️ Create module already visible, ignoring click');
    return;
  }
  
  createModule.classList.remove('hidden');
  joinModule.classList.add('hidden');
  joinRoomBtn.disabled = false;
  joinStatus.textContent = '';
  roomCodeInput.value = '';
  console.log('[MULTIPLAYER] ✅ Create module displayed, join module hidden');
  
  // Display existing code or placeholder
  if (generatedRoomCode) {
    roomCodeDisplay.textContent = generatedRoomCode;
    console.log(`[MULTIPLAYER] 📋 Displaying existing room code: ${generatedRoomCode}`);
  } else {
    roomCodeDisplay.textContent = 'XXXX';
    console.log('[MULTIPLAYER] 📋 Displaying placeholder room code');
  }
});

joinRoomBtn.addEventListener('click', (e) => {
  console.log('[MULTIPLAYER] 🎮 Join Game button clicked');
  
  if (!joinModule.classList.contains('hidden')) {
    console.log('[MULTIPLAYER] ⚠️ Join module already visible, ignoring click');
    return;
  }
  
  joinModule.classList.remove('hidden');
  createModule.classList.add('hidden');
  createRoomBtn.disabled = false;
  createStatus.textContent = '';
  console.log('[MULTIPLAYER] ✅ Join module displayed, create module hidden');
});

// Room code input validation and button text update
roomCodeInput.addEventListener('input', (e) => {
  const originalValue = e.target.value;
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (originalValue !== e.target.value) {
    console.log(`[MULTIPLAYER] 🔤 Room code sanitized: "${originalValue}" -> "${e.target.value}"`);
  }
  
  // Update button text based on input length
  if (e.target.value.length === 4) {
    joinRoomBtn.textContent = 'START GAME';
    console.log(`[MULTIPLAYER] ✅ Room code complete: ${e.target.value} - Button text changed to "START GAME"`);
  } else {
    joinRoomBtn.textContent = 'Join Game';
    console.log(`[MULTIPLAYER] ⏳ Room code incomplete: ${e.target.value} (${e.target.value.length}/4 characters)`);
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
  const startTime = performance.now();
  console.log('[MULTIPLAYER] 📋 Paste button clicked');
  
  try {
    const text = await navigator.clipboard.readText();
    const sanitized = text.toUpperCase().substring(0, 4).replace(/[^A-Z0-9]/g, '');
    roomCodeInput.value = sanitized;
    const endTime = performance.now();
    console.log(`[MULTIPLAYER] ✅ Room code pasted from clipboard: "${text}" -> "${sanitized}" (took ${(endTime - startTime).toFixed(2)}ms)`);
    
    // Trigger input event to update button text
    roomCodeInput.dispatchEvent(new Event('input'));
  } catch (error) {
    console.error('[MULTIPLAYER] ❌ Paste failed:', error);
  }
});

// Create game
createRoomBtn.addEventListener('click', () => {
  const startTime = performance.now();
  console.log('[MULTIPLAYER] 🎮 Create Game clicked');
  
  // If code already exists, just show the module
  if (generatedRoomCode) {
    createModule.classList.remove('hidden');
    console.log(`[MULTIPLAYER] ⚠️ Room code already exists: ${generatedRoomCode}, showing module`);
    return;
  }

  createRoomBtn.disabled = true;
  console.log('[MULTIPLAYER] 🔒 Create button disabled');
  
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  generatedRoomCode = code;
  const selectedEmoji = emojiDisplay.textContent;
  console.log(`[MULTIPLAYER] 🎲 Generated room code: ${code}`);
  console.log(`[MULTIPLAYER] 🎨 Host emoji: ${selectedEmoji}`);
  
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
  
  console.log('[MULTIPLAYER] 📤 Creating game with data:', JSON.stringify(roomData, null, 2));
  
  db.ref('rooms/' + code).set(roomData).then(() => {
    const endTime = performance.now();
    console.log(`[MULTIPLAYER] ✅ Game created successfully in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`[MULTIPLAYER] 🎮 Room: ${code} | Host: ${selectedEmoji} | Waiting for opponent...`);
    
    roomCodeDisplay.textContent = code;
    createStatus.textContent = 'Waiting for opponent...';
    createStatus.style.color = 'var(--warning)';
    
    sessionStorage.setItem('roomCode', code);
    sessionStorage.setItem('isHost', 'true');
    sessionStorage.setItem('mySymbol', selectedEmoji);
    console.log('[MULTIPLAYER] 💾 Session storage updated with host data');
    
    const roomRef = db.ref('rooms/' + code);
    console.log('[MULTIPLAYER] 👂 Listening for opponent to join...');
    
    roomRef.on('value', (snapshot) => {
      const room = snapshot.val();
      if (room && room.guestJoined && room.guestEmoji) {
        console.log(`[MULTIPLAYER] 🎉 Guest joined! Guest emoji: ${room.guestEmoji}`);
        console.log(`[MULTIPLAYER] 🎮 Game ready! Host ${selectedEmoji} vs Guest ${room.guestEmoji}`);
        
        sessionStorage.setItem('opponentSymbol', room.guestEmoji);
        console.log('[MULTIPLAYER] 💾 Opponent symbol saved to session storage');
        
        roomRef.off('value');
        console.log('[MULTIPLAYER] 👂 Stopped listening to room updates');
        console.log('[MULTIPLAYER] 🚀 Navigating to game page in 300ms...');
        
        setTimeout(() => window.location.href = 'game.html', 300);
      }
    });
  }).catch(err => {
    const endTime = performance.now();
    console.error(`[MULTIPLAYER] ❌ Error creating game after ${(endTime - startTime).toFixed(2)}ms:`, err);
    createStatus.textContent = 'Error creating game';
    createStatus.style.color = 'var(--danger)';
    createRoomBtn.disabled = false;
    generatedRoomCode = null;
    console.log('[MULTIPLAYER] 🔓 Create button re-enabled, room code cleared');
  });
});

// Join game
joinRoomBtn.addEventListener('click', () => {
  const startTime = performance.now();
  const code = roomCodeInput.value.trim().toUpperCase();
  console.log(`[MULTIPLAYER] 🎮 Join Game clicked with code: ${code}`);
  
  if (code.length !== 4) {
    console.log(`[MULTIPLAYER] ⚠️ Invalid room code length: ${code.length} (expected 4)`);
    return;
  }

  joinRoomBtn.disabled = true;
  console.log('[MULTIPLAYER] 🔒 Join button disabled');
  
  const selectedEmoji = emojiDisplay.textContent;
  console.log(`[MULTIPLAYER] 🎨 Guest emoji: ${selectedEmoji}`);
  console.log(`[MULTIPLAYER] 📡 Checking if room ${code} exists...`);
  
  db.ref('rooms/' + code).once('value').then(snapshot => {
    if (!snapshot.exists()) {
      const endTime = performance.now();
      console.log(`[MULTIPLAYER] ❌ Room not found: ${code} (checked in ${(endTime - startTime).toFixed(2)}ms)`);
      joinStatus.textContent = 'Game not found';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      console.log('[MULTIPLAYER] 🔓 Join button re-enabled');
      return;
    }

    const room = snapshot.val();
    console.log(`[MULTIPLAYER] ✅ Room found: ${code}`);
    console.log(`[MULTIPLAYER] 📊 Room data:`, JSON.stringify(room, null, 2));
    
    if (room.guestJoined) {
      const endTime = performance.now();
      console.log(`[MULTIPLAYER] ⚠️ Room ${code} is full (checked in ${(endTime - startTime).toFixed(2)}ms)`);
      joinStatus.textContent = 'Game is full';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      console.log('[MULTIPLAYER] 🔓 Join button re-enabled');
      return;
    }

    console.log(`[MULTIPLAYER] 📤 Joining game ${code}...`);
    console.log(`[MULTIPLAYER] 🎮 Matchup: Host ${room.hostEmoji} vs Guest ${selectedEmoji}`);
    
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
      console.log('[MULTIPLAYER] ⚠️ Room missing board, adding default board');
    }
    
    if (!room.turn) {
      updateData.turn = room.hostEmoji;
      console.log(`[MULTIPLAYER] ⚠️ Room missing turn, setting turn to host: ${room.hostEmoji}`);
    }
    
    db.ref('rooms/' + code).update(updateData).then(() => {
      const endTime = performance.now();
      console.log(`[MULTIPLAYER] ✅ Joined successfully in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`[MULTIPLAYER] 🎉 Game starting! Room: ${code}`);
      
      joinStatus.textContent = 'Joined! Starting game...';
      joinStatus.style.color = 'var(--success)';
      
      sessionStorage.setItem('roomCode', code);
      sessionStorage.setItem('isHost', 'false');
      sessionStorage.setItem('mySymbol', selectedEmoji);
      sessionStorage.setItem('opponentSymbol', room.hostEmoji);
      console.log('[MULTIPLAYER] 💾 Session storage updated with guest data');
      console.log(`[MULTIPLAYER] 💾 Saved: roomCode=${code}, isHost=false, mySymbol=${selectedEmoji}, opponentSymbol=${room.hostEmoji}`);
      console.log('[MULTIPLAYER] 🚀 Navigating to game page in 300ms...');
      
      setTimeout(() => window.location.href = 'game.html', 300);
    }).catch(err => {
      const endTime = performance.now();
      console.error(`[MULTIPLAYER] ❌ Error joining after ${(endTime - startTime).toFixed(2)}ms:`, err);
      joinStatus.textContent = 'Error joining game';
      joinStatus.style.color = 'var(--danger)';
      joinRoomBtn.disabled = false;
      console.log('[MULTIPLAYER] 🔓 Join button re-enabled');
    });
  });
});

console.log('[MULTIPLAYER] ✅ All event listeners attached successfully');
console.log('[MULTIPLAYER] 🎮 Multiplayer lobby ready!');
