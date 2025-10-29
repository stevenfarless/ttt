// game-multiplayer.js - Multiplayer version

const playerOneInput = document.querySelector("#playerOneInput");
const playerTwoInput = document.querySelector("#playerTwoInput");
const cells = document.querySelectorAll(".cell");
const result = document.querySelector("#result");
const resetButton = document.querySelector("#reset");
const backToMenuBtn = document.querySelector("#backToMenu");

let playerOne = "";
let playerTwo = "";
let currentPlayer = "";
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let gameActive = false;
let moveCount = 0;

let isMultiplayer = false;
let isHost = false;
let mySymbol = '';
let opponentSymbol = '';
let isMyTurn = false;

let peer = null;
let conn = null;
let connectionReady = false;

function initMultiplayer() {
    isMultiplayer = sessionStorage.getItem('isMultiplayer') === 'true';
    
    if (isMultiplayer) {
        isHost = sessionStorage.getItem('isHost') === 'true';
        mySymbol = sessionStorage.getItem('mySymbol');
        opponentSymbol = sessionStorage.getItem('opponentSymbol');
        
        console.log('🎮 Init multiplayer:', { isHost, mySymbol, opponentSymbol });

        playerOneInput.value = mySymbol;
        playerTwoInput.value = opponentSymbol;
        playerOneInput.disabled = true;
        playerTwoInput.disabled = true;
        
        playerOne = mySymbol;
        playerTwo = opponentSymbol;
        currentPlayer = '❌';
        isMyTurn = isHost;
        gameActive = true;
        
        updateTurnDisplay();
        if (backToMenuBtn) backToMenuBtn.style.display = 'inline-block';
        
        recreatePeerConnection();
    }
}

function recreatePeerConnection() {
    const myPeerId = sessionStorage.getItem('myPeerId');
    const remotePeerId = sessionStorage.getItem('remotePeerId');
    
    console.log('🔄 Recreating connection:', { myPeerId, remotePeerId, isHost });
    
    if (!myPeerId || !remotePeerId) {
        console.error('❌ Missing peer IDs');
        alert('Connection data lost. Returning to menu...');
        endMultiplayerSession();
        return;
    }

    const config = {
        debug: 2,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:relay1.expressturn.com:3478',
                    username: 'ef3N5RMW42DAXRQEOT',
                    credential: 'sxNiOHPmVPa1bpH83O'
                }
            ]
        }
    };

    peer = new Peer(myPeerId, config);

    peer.on('open', (id) => {
        console.log('✅ Peer reopened:', id);
        
        if (isHost) {
            console.log('👑 Host waiting for connection...');
        } else {
            console.log('⏳ Guest waiting 2s for host to be ready...');
            setTimeout(() => {
                console.log('🔌 Guest connecting to:', remotePeerId);
                conn = peer.connect(remotePeerId, { reliable: true });
                
                conn.on('open', () => {
                    console.log('✅ Guest connected!');
                    setupHandlers();
                });

                conn.on('error', (err) => {
                    console.error('❌ Connection error:', err);
                    alert('Failed to connect. Returning to menu...');
                    endMultiplayerSession();
                });
            }, 2000);
        }
    });

    peer.on('connection', (connection) => {
        console.log('📞 Host received connection from:', connection.peer);
        conn = connection;
        
        conn.on('open', () => {
            console.log('✅ Host connection opened!');
            setupHandlers();
        });
        
        conn.on('error', (err) => {
            console.error('❌ Connection error:', err);
        });
    });

    peer.on('error', (err) => {
        console.error('❌ Peer error:', err);
        
        if (err.type === 'unavailable-id') {
            console.log('🔄 ID taken, retrying in 2 seconds...');
            setTimeout(() => {
                if (peer) peer.destroy();
                recreatePeerConnection();
            }, 2000);
        } else {
            alert('Connection error. Returning to menu...');
            endMultiplayerSession();
        }
    });
}

function setupHandlers() {
    if (!conn) return;
    console.log('⚙️ Setting up handlers');
    
    // ⭐ FIX: Check if connection is already open
    if (conn.open) {
        console.log('✅ Connection was already open!');
        markConnectionReady();
    }
    
    conn.on('data', (data) => {
        console.log('📨 Received:', data);
        if (data.type === 'move') {
            receiveOpponentMove(data.cellIndex);
        } else if (data.type === 'reset') {
            resetGameState();
        } else if (data.type === 'ready') {
            console.log('✅ Opponent is ready!');
            markConnectionReady();
        }
    });

    conn.on('close', () => {
        console.log('🔌 Connection closed');
        alert('Opponent disconnected!');
        endMultiplayerSession();
    });

    conn.on('error', (err) => {
        console.error('❌ Connection error:', err);
    });

    console.log('✅ Handlers ready!');
    
    setTimeout(() => {
        if (conn && conn.open) {
            conn.send({ type: 'ready' });
            console.log('📤 Sent ready signal');
            markConnectionReady();
        }
    }, 500);
}

function markConnectionReady() {
    if (!connectionReady) {
        connectionReady = true;
        console.log('🎮 Connection fully ready - game can start!');
        updateTurnDisplay();
    }
}

function sendMove(cellIndex) {
    if (!conn || !conn.open) {
        console.error('❌ Cannot send - connection not open');
        return;
    }
    
    console.log('📤 Sending move:', cellIndex);
    conn.send({ type: 'move', cellIndex: cellIndex, symbol: mySymbol });
}

function receiveOpponentMove(cellIndex) {
    console.log('📥 Opponent move:', cellIndex);
    
    if (gameBoard[cellIndex] === "") {
        gameBoard[cellIndex] = opponentSymbol;
        cells[cellIndex].textContent = opponentSymbol;
        cells[cellIndex].style.animation = "pop 0.3s";
        moveCount++;

        const winner = checkWinner();
        if (winner) {
            endGame(winner);
        } else if (moveCount === 9) {
            endGame(null);
        } else {
            currentPlayer = mySymbol;
            isMyTurn = true;
            updateTurnDisplay();
        }
    }
}

function updateTurnDisplay() {
    if (!connectionReady) {
        result.textContent = "Connecting... ⏳";
        result.style.color = "#f1fa8c";
    } else {
        result.textContent = isMyTurn ? "Your turn! 🎮" : "Opponent's turn... ⏳";
        result.style.color = isMyTurn ? "#50fa7b" : "#f1fa8c";
    }
}

function handleCellClick(event) {
    if (isMultiplayer && !connectionReady) {
        result.style.animation = "none";
        setTimeout(() => { result.style.animation = "shake 0.3s"; }, 10);
        return;
    }

    if (!gameActive) {
        result.style.animation = "none";
        setTimeout(() => { result.style.animation = "shake 0.3s"; }, 10);
        return;
    }

    if (isMultiplayer && !isMyTurn) {
        result.style.animation = "none";
        setTimeout(() => { result.style.animation = "shake 0.3s"; }, 10);
        return;
    }

    const cellIndex = parseInt(event.target.id) - 1;
    
    if (gameBoard[cellIndex] === "") {
        gameBoard[cellIndex] = currentPlayer;
        event.target.textContent = currentPlayer;
        event.target.style.animation = "pop 0.3s";
        moveCount++;

        if (isMultiplayer) {
            sendMove(cellIndex);
            isMyTurn = false;
            currentPlayer = opponentSymbol;
            updateTurnDisplay();
        }

        const winner = checkWinner();
        if (winner) {
            endGame(winner);
        } else if (moveCount === 9) {
            endGame(null);
        } else if (!isMultiplayer) {
            currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
            result.textContent = `${currentPlayer}'s turn`;
        }
    } else {
        event.target.style.animation = "none";
        setTimeout(() => { event.target.style.animation = "shake 0.3s"; }, 10);
    }
}

function endGame(winner) {
    gameActive = false;
    if (winner) {
        if (isMultiplayer) {
            result.textContent = winner === mySymbol ? "🎉 You won! 🏆" : "💫 Opponent won! 💫";
        } else {
            result.textContent = `🎉 ${winner} wins! 🏆`;
        }
        result.style.color = "#f1fa8c";
    } else {
        result.textContent = "It's a draw! 🤝";
        result.style.color = "#bd93f9";
    }
}

function checkWinner() {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of winConditions) {
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return gameBoard[a];
        }
    }
    return null;
}

function resetGame() {
    if (isMultiplayer && conn && conn.open) {
        conn.send({ type: 'reset' });
    }
    resetGameState();
}

function resetGameState() {
    gameBoard = ["", "", "", "", "", "", "", "", ""];
    moveCount = 0;
    
    cells.forEach((cell) => {
        cell.textContent = "";
        cell.style.animation = "none";
    });

    if (isMultiplayer) {
        currentPlayer = '❌';
        isMyTurn = isHost;
        gameActive = true;
        updateTurnDisplay();
    } else {
        playerOneInput.value = "";
        playerTwoInput.value = "";
        playerOne = "";
        playerTwo = "";
        currentPlayer = "";
        gameActive = false;
        result.textContent = "Enter both player names to start";
        result.style.color = "#f8f8f2";
    }
}

function endMultiplayerSession() {
    if (conn) conn.close();
    if (peer) peer.destroy();
    
    connectionReady = false;
    sessionStorage.clear();
    window.location.href = 'home.html';
}

function updateGameStatus() {
    if (isMultiplayer) return;
    
    if (!playerOne || !playerTwo) {
        result.textContent = "Enter both player names to start";
        result.style.color = "#f8f8f2";
        gameActive = false;
    } else if (playerOne === playerTwo) {
        result.textContent = "Players must use different symbols";
        result.style.color = "#ff5555";
        gameActive = false;
    } else {
        if (!currentPlayer) currentPlayer = playerOne;
        result.textContent = `${currentPlayer}'s turn`;
        result.style.color = "#50fa7b";
        gameActive = true;
    }
}

// Initialize
cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetButton.addEventListener("click", resetGame);
if (backToMenuBtn) backToMenuBtn.addEventListener("click", endMultiplayerSession);

if (!isMultiplayer) {
    playerOneInput.addEventListener("input", () => {
        playerOne = playerOneInput.value.trim();
        updateGameStatus();
    });

    playerTwoInput.addEventListener("input", () => {
        playerTwo = playerTwoInput.value.trim();
        updateGameStatus();
    });
}

initMultiplayer();
if (!isMultiplayer) updateGameStatus();
