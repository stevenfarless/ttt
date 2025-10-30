const DEBUG = true;

const db = firebase.database();

// EMOJI PICKER FUNCTIONALITY
const emojiDisplay = document.getElementById('emojiDisplay');
const emojiPicker = document.getElementById('emojiPicker');
const emojiOptions = document.querySelectorAll('.emoji-option');

if (emojiDisplay) {
  emojiDisplay.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'grid' : 'none';
  });

  emojiOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      const selectedEmoji = e.target.getAttribute('data-emoji');
      emojiDisplay.textContent = selectedEmoji;
      emojiPicker.style.display = 'none';
    });
  });
}

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const createStatus = document.getElementById('createStatus');
const joinStatus = document.getElementById('joinStatus');

function debug(...args) {
  if (DEBUG) console.log(...args);
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ123456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function startGameSession(roomCode, isHost, myEmoji, opponentEmoji) {
  sessionStorage.setItem('isMultiplayer', 'true');
  sessionStorage.setItem('isHost', isHost.toString());
  sessionStorage.setItem('roomCode', roomCode);
  sessionStorage.setItem('mySymbol', myEmoji);
  sessionStorage.setItem('opponentSymbol', opponentEmoji);
  window.location.href = "game.html";
}

if (createRoomBtn) {
  createRoomBtn.addEventListener('click', () => {
    const myEmoji = emojiDisplay.textContent;
    
    createRoomBtn.disabled = true;
    const code = generateRoomCode();
    roomCodeDisplay.textContent = code;
    roomCodeDisplay.style.display = "block";
    createStatus.textContent = "Waiting for player to join...";
    createStatus.classList.remove("error");
    
    db.ref('rooms/' + code).set({
      hostJoined: true,
      guestJoined: false,
      hostEmoji: myEmoji,
      guestEmoji: null,
      board: [null, null, null, null, null, null, null, null, null],
      turn: myEmoji,
      winner: null,
      reset: false
    }).then(() => {
      debug("Room created successfully with code:", code);
    }).catch(err => {
      console.error("Error creating room:", err);
    });
    
    db.ref('rooms/' + code).on('value', snapshot => {
      const data = snapshot.val();
      if (data && data.guestJoined && data.guestEmoji) {
        startGameSession(code, true, myEmoji, data.guestEmoji);
      }
    });
  });
}

if (joinRoomBtn) {
  joinRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    const myEmoji = emojiDisplay.textContent;
    
    if (!code || code.length !== 4) {
      joinStatus.textContent = "Enter 4-character code";
      joinStatus.classList.add("error");
      return;
    }
    joinRoomBtn.disabled = true;
    roomCodeInput.disabled = true;
    joinStatus.textContent = "Checking room...";
    joinStatus.classList.remove("error");
    
    db.ref('rooms/' + code).once('value').then(snapshot => {
      if (!snapshot.exists() || snapshot.val().guestJoined) {
        joinStatus.textContent = "Room not found or already full.";
        joinStatus.classList.add("error");
        joinRoomBtn.disabled = false;
        roomCodeInput.disabled = false;
        return;
      }
      
      const hostEmoji = snapshot.val().hostEmoji;
      
      if (myEmoji === hostEmoji) {
        joinStatus.textContent = "❌ Same as other player, choose another one";
        joinStatus.classList.add("error");
        joinRoomBtn.disabled = false;
        roomCodeInput.disabled = false;
        return;
      }
      
      db.ref('rooms/' + code).update({
        guestJoined: true,
        guestEmoji: myEmoji
      });
      
      startGameSession(code, false, myEmoji, hostEmoji);
    });
  });
}
