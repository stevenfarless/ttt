// game-multiplayer.js - Multiplayer version of the game logic

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

// Multiplayer state
let isMultiplayer = false;
let isHost = false;
let mySymbol = '';
let opponentSymbol = '';
let isMyTurn = false;
let peer = null;
let conn = null;

// Check if this is a multiplayer game
function initMultiplayer() {
    isMultiplayer = sessionStorage.getItem('isMultiplayer') === 'true';
    
    if (isMultiplayer) {
        isHost = sessionStorage.getItem('isHost') === 'true';
        mySymbol = sessionStorage.getItem('mySymbol');
        opponentSymbol = sessionStorage.getItem('opponentSymbol');
        
        const myPeerId = sessionStorage.getItem('myPeerId');
        const remotePeerId = sessionStorage.getItem('remotePeerId');
        
        console.log('🎮 Initializing multiplayer game:', {
            isHost,
            mySymbol,
            opponentSymbol,
            myPeerId,
            remotePeerId
        });
        
        // Set player names
        playerOneInput.value = mySymbol;
        playerTwoInput.value = opponentSymbol;
        playerOneInput.disabled = true;
        playerTwoInput.disabled = true;
        
        playerOne = mySymbol;
        playerTwo = opponentSymbol;
        
        // Host goes first
        currentPlayer = '❌';
        isMyTurn = isHost;
        
        gameActive = true;
        updateTurnDisplay();
        
        // Show back to menu button
        if (backToMenuBtn) {
            backToMenuBtn.style.display = 'inline-block';
        }
        
        // Recreate peer connection
        recreatePeerConnection(myPeerId, remotePeerId);
    }
}

// Recreate the peer connection from stored IDs
function recreatePeerConnection(myPeerId, remotePeerId) {
    console.log('🔄 Recreating peer connection...');
    
    // Create peer with my stored ID
    peer = new Peer(myPeerId, { debug: 1 });
    
    peer.on('open', (id) => {
        console.log('✅ Peer reopened with ID:', id);
        
        if (isHost) {
            // Host waits for incoming connection
            console.log('👑 Host waiting for connection...');
            
            peer.on('connection', (connection) => {
                console.log('✅ Host received connection!');
                conn = connection;
                setupConnectionHandlers();
            });
        } else {
            // Guest connects to host
            console.log('🔌 Guest connecting to host:', remotePeerId);
            
            setTimeout(() => {
                conn = peer.connect(remotePeerId, { reliable: true });
                console.log('Connection object created:', conn);
                
                conn.on('open', () => {
                    console.log('✅ Guest connected to host!');
                    setupConnectionHandlers();
                });
                
                conn.on('error', (err) => {
                    console.error('❌ Guest connection error:', err);
                });
            }, 1000);
        }
    });
    
    peer.on('error', (err) => {
        console.error('❌ Peer error:', err);
    });
}

// Setup connection event handlers
function setupConnectionHandlers() {
    if (!conn) {
        console.error('❌ No connection to setup');
        return;
    }
    
    console.log('⚙️ Setting up connection handlers...');
    
    conn.on('data', (data) => {
        console.log('📨 Received data:', data);
        
        if (data.type === 'move') {
            receiveOpponentMove(data.cellIndex);
        } else if (data.type === 'reset') {
            resetGameState();
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
    
    console.log('✅ Connection handlers setup complete!');
}

// Send move to opponent
function sendMove(cellIndex) {
    if (!conn || !conn.open) {
        console.error('❌ Cannot send - connection not ready');
        return;
    }
    
    const moveData = {
        type: 'move',
        cellIndex: cellIndex,
        symbol: mySymbol
    };
    
    console.log('📤 Sending move:', moveData);
    conn.send(moveData);
}

// Receive opponent's move
function receiveOpponentMove(cellIndex) {
    console.log('📥 Processing opponent move at cell:', cellIndex);
    
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

// Update turn display
function updateTurnDisplay() {
    if (isMyTurn) {
        result.textContent = "Your turn! 🎮";
        result.style.color = "#50fa7b";
    } else {
        result.textContent = "Opponent's turn... ⏳";
        result.style.color = "#f1fa8c";
    }
}

// Cell click handler
function handleCellClick(event) {
    if (!gameActive) {
        result.style.animation = "none";
        setTimeout(() => {
            result.style.animation = "shake 0.3s";
        }, 10);
        return;
    }
    
    if (isMultiplayer && !isMyTurn) {
        result.style.animation = "none";
        setTimeout(() => {
            result.style.animation = "shake 0.3s";
        }, 10);
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
        } else {
            if (!isMultiplayer) {
                currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
                result.textContent = `${currentPlayer}'s turn`;
            }
        }
    } else {
        event.target.style.animation = "none";
        setTimeout(() => {
            event.target.style.animation = "shake 0.3s";
        }, 10);
    }
}

// End game
function endGame(winner) {
    gameActive = false;
    
    if (winner) {
        if (isMultiplayer) {
            if (winner === mySymbol) {
                result.textContent = "🎉 You won! 🏆";
            } else {
                result.textContent = "💫 Opponent won! 💫";
            }
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
        if (!currentPlayer) {
            currentPlayer = playerOne;
        }
        result.textContent = `${currentPlayer}'s turn`;
        result.style.color = "#50fa7b";
        gameActive = true;
    }
}

// Event listeners
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

// Initialize
initMultiplayer();
if (!isMultiplayer) updateGameStatus();
