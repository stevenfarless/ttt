// multiplayer.js - Handles room creation, joining, and peer connections

let peer = null;
let conn = null;
let isHost = false;
let mySymbol = '';
let opponentSymbol = '';

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const createStatus = document.getElementById('createStatus');
const joinStatus = document.getElementById('joinStatus');

function initPeer(roomCode = null) {
    const config = {
        debug: 2,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }  // Google's free public STUN server
            ]
        }
    };
    
    if (roomCode) {
        peer = new Peer(config);
    } else {
        const customId = generateRoomCode();
        peer = new Peer(customId, config);
    }


    peer.on('open', (id) => {
        console.log('✅ Peer opened:', id);
        localStorage.setItem('myPeerId', id);
        
        if (!roomCode) {
            isHost = true;
            mySymbol = '❌';
            opponentSymbol = '⭕';
            displayRoomCode(id);
            createStatus.textContent = 'Waiting for player to join...';
            createStatus.classList.remove('error');
        }
    });

    peer.on('connection', (connection) => {
        console.log('👑 Host received connection');
        conn = connection;
        localStorage.setItem('remotePeerId', connection.peer);
        
        conn.on('open', () => {
            console.log('✅ Connection opened');
            createStatus.textContent = 'Player joined! Starting game...';
            setTimeout(() => startGame(), 1000);
        });
    });

    peer.on('error', (err) => {
        console.error('❌ Peer error:', err);
        const errorMsg = 'Connection error. Try again.';
        if (isHost) {
            createStatus.textContent = errorMsg;
            createStatus.classList.add('error');
        } else {
            joinStatus.textContent = errorMsg;
            joinStatus.classList.add('error');
        }
    });
}

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function displayRoomCode(code) {
    roomCodeDisplay.textContent = code;
    roomCodeDisplay.style.display = 'block';
}

if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
        // IMPORTANT: Clear old localStorage data
        localStorage.removeItem('myPeerId');
        localStorage.removeItem('remotePeerId');
        
        createRoomBtn.disabled = true;
        initPeer();
    });
}

if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => {
        const roomCode = roomCodeInput.value.trim().toUpperCase();
        
        if (!roomCode || roomCode.length !== 4) {
            joinStatus.textContent = 'Enter 4-character code';
            joinStatus.classList.add('error');
            return;
        }

        // IMPORTANT: Clear old localStorage data
        localStorage.removeItem('myPeerId');
        localStorage.removeItem('remotePeerId');

        joinRoomBtn.disabled = true;
        roomCodeInput.disabled = true;
        joinStatus.textContent = 'Connecting...';
        joinStatus.classList.remove('error');

        isHost = false;
        mySymbol = '⭕';
        opponentSymbol = '❌';
        
        localStorage.setItem('remotePeerId', roomCode);

        initPeer(roomCode);
        
        setTimeout(() => {
            console.log('🔌 Connecting to:', roomCode);
            conn = peer.connect(roomCode, { reliable: true });
            
            conn.on('open', () => {
                console.log('✅ Connected!');
                joinStatus.textContent = 'Connected! Starting...';
                setTimeout(() => startGame(), 1000);
            });
            
            conn.on('error', (err) => {
                console.error('❌ Connection error:', err);
                joinStatus.textContent = 'Failed. Check code.';
                joinStatus.classList.add('error');
                joinRoomBtn.disabled = false;
                roomCodeInput.disabled = false;
            });
        }, 1500);
    });
}

function startGame() {
    sessionStorage.setItem('isMultiplayer', 'true');
    sessionStorage.setItem('isHost', isHost.toString());
    sessionStorage.setItem('mySymbol', mySymbol);
    sessionStorage.setItem('opponentSymbol', opponentSymbol);
    
    console.log('🎮 Starting game');
    window.location.href = 'game.html';
}
