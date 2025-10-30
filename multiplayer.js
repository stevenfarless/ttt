const db = firebase.database();

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const createStatus = document.getElementById('createStatus');
const joinStatus = document.getElementById('joinStatus');

function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function startGameSession(roomCode, isHost, mySymbol, opponentSymbol) {
  sessionStorage.setItem('isMultiplayer', true);
  sessionStorage.setItem('isHost', isHost.toString());
  sessionStorage.setItem('roomCode', roomCode);
  sessionStorage.setItem('mySymbol', mySymbol);
  sessionStorage.setItem('opponentSymbol', opponentSymbol);
  window.location.href = "game.html";
}

if (createRoomBtn) {
  createRoomBtn.addEventListener('click', () => {
    createRoomBtn.disabled = true;
    const code = generateRoomCode();
    roomCodeDisplay.textContent = code;
    roomCodeDisplay.style.display = "block";
    createStatus.textContent = "Waiting for player to join...";
    createStatus.classList.remove("error");
    db.ref('rooms/' + code).set({
      hostJoined: true,
      guestJoined: false,
      board: Array(9).fill(null),
      turn: "X",
      winner: null,
      reset: false
    });
    // Listen for guest join
    db.ref('rooms/' + code + '/guestJoined').on('value', snapshot => {
      if (snapshot.val()) {
        sessionStorage.setItem('roomCode', code);
        startGameSession(code, true, "X", "O");
      }
    });
  });
}

if (joinRoomBtn) {
  joinRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase();
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
      db.ref('rooms/' + code).update({
        guestJoined: true
      });
      startGameSession(code, false, "O", "X");
    });
  });
}
