// multiplayer.js - Handles room creation, joining, and peer connections

let peer = null;
let conn = null;
let isHost = false;
let mySymbol = '';
let opponentSymbol = '';

// Home screen elements
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const createStatus = document.getElementById('createStatus');
const joinStatus = document.getElementById('joinStatus');

// Initialize PeerJS
function initPeer(roomCode = null) {
    const config = roomCode ? { debug: 2 } : { debug: 2 };

    if (roomCode) {
        // Joining a room
        peer = new Peer(config);
    } else {
        // Creating a room with custom ID
        const customId = generateRoomCode();
        peer = new Peer(customId, config);
    }

    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);

        if (!roomCode) {
            // Host created room
            isHost = true;
            mySymbol = '❌';
            opponentSymbol = '⭕';
            displayRoomCode(id);
            createStatus.textContent = 'Waiting for player to join...';
            createStatus.classList.remove('error');
        }
    });

    peer.on('connection', (connection) => {
        // Host receives connection from guest
        conn = connection;
        setupConnection();
        createStatus.textContent = 'Player joined! Starting game...';
        setTimeout(() => startGame(), 1000);
    });

    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        const errorMsg = 'Connection error. Please try again.';
        if (isHost) {
            createStatus.textContent = errorMsg;
            createStatus.classList.add('error');
        } else {
            joinStatus.textContent = errorMsg;
            joinStatus.classList.add('error');
        }
    });
}

// Generate a simple 6-character room code
function generateRoomCode() {
    return 'TTT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Display room code to host
function displayRoomCode(code) {
    roomCodeDisplay.textContent = code;
    roomCodeDisplay.style.display = 'block';
}

// Create room button handler
if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
        createRoomBtn.disabled = true;
        initPeer();
    });
}

// Join room button handler
if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => {
        const roomCode = roomCodeInput.value.trim();

        if (!roomCode) {
            joinStatus.textContent = 'Please enter a room code';
            joinStatus.classList.add('error');
            return;
        }

        joinRoomBtn.disabled = true;
        roomCodeInput.disabled = true;
        joinStatus.textContent = 'Connecting...';
        joinStatus.classList.remove('error');

        isHost = false;
        mySymbol = '⭕';
        opponentSymbol = '❌';

        initPeer(roomCode);

        // Connect to host
        setTimeout(() => {
            conn = peer.connect(roomCode);
            setupConnection();

            conn.on('open', () => {
                joinStatus.textContent = 'Connected! Starting game...';
                setTimeout(() => startGame(), 1000);
            });
        }, 1000);
    });
}

// Setup connection event handlers
function setupConnection() {
    conn.on('data', (data) => {
        handleReceivedData(data);
    });

    conn.on('close', () => {
        alert('Opponent disconnected!');
        window.location.href = 'home.html';
    });

    conn.on('error', (err) => {
        console.error('Connection error:', err);
    });
}

// Send data to opponent
function sendData(data) {
    if (conn && conn.open) {
        conn.send(data);
    }
}

// Handle received data from opponent
function handleReceivedData(data) {
    if (data.type === 'move') {
        // Opponent made a move
        makeOpponentMove(data.cellIndex, data.symbol);
    } else if (data.type === 'reset') {
        // Opponent wants to reset
        resetGameState();
    }
}

// Redirect to game page
function startGame() {
    // Store multiplayer state in sessionStorage
    sessionStorage.setItem('isMultiplayer', 'true');
    sessionStorage.setItem('isHost', isHost.toString());
    sessionStorage.setItem('mySymbol', mySymbol);
    sessionStorage.setItem('opponentSymbol', opponentSymbol);

    window.location.href = 'game.html';
}

// Export peer and connection for use in game
window.multiplayerState = {
    peer,
    conn,
    isHost,
    mySymbol,
    opponentSymbol,
    sendData,
    setupConnection
};