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
    const config = { debug: 0 }; // Reduced debug to 0 for cleaner console
    
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
        
        // IMPORTANT: Setup connection handlers BEFORE navigating
        conn.on('open', () => {
            console.log('Connection established with guest');
            createStatus.textContent = 'Player joined! Starting game...';
            setTimeout(() => startGame(), 1000);
        });
        
        conn.on('data', (data) => {
            console.log('Received data:', data);
        });
        
        conn.on('close', () => {
            console.log('Connection closed');
        });
        
        conn.on('error', (err) => {
            console.error('Connection error:', err);
        });
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

// Generate a 4-character alphanumeric room code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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
        const roomCode = roomCodeInput.value.trim().toUpperCase();
        
        if (!roomCode) {
            joinStatus.textContent = 'Please enter a room code';
            joinStatus.classList.add('error');
            return;
        }
        
        if (roomCode.length !== 4) {
            joinStatus.textContent = 'Room code must be 4 characters';
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
            conn = peer.connect(roomCode, { reliable: true });
            
            conn.on('open', () => {
                console.log('Connected to host');
                joinStatus.textContent = 'Connected! Starting game...';
                setTimeout(() => startGame(), 1000);
            });
            
            conn.on('data', (data) => {
                console.log('Received data:', data);
            });
            
            conn.on('close', () => {
                console.log('Connection closed');
            });
            
            conn.on('error', (err) => {
                console.error('Connection error:', err);
                joinStatus.textContent = 'Failed to connect. Check the code.';
                joinStatus.classList.add('error');
                joinRoomBtn.disabled = false;
                roomCodeInput.disabled = false;
            });
        }, 1000);
    });
}

// Redirect to game page
function startGame() {
    // Store multiplayer state in sessionStorage
    sessionStorage.setItem('isMultiplayer', 'true');
    sessionStorage.setItem('isHost', isHost.toString());
    sessionStorage.setItem('mySymbol', mySymbol);
    sessionStorage.setItem('opponentSymbol', opponentSymbol);
    
    // Store peer ID for reconnection
    sessionStorage.setItem('peerId', peer.id);
    
    window.location.href = 'game.html';
}

// Export peer and connection for use in game
window.multiplayerState = {
    peer: peer,
    conn: conn,
    isHost: isHost,
    mySymbol: mySymbol,
    opponentSymbol: opponentSymbol
};
