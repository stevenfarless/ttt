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
        
        // Get existing connection from multiplayer.js
        reconnectPeer();
    }
}

// Reconnect to peer after page load
function reconnectPeer() {
    // CRITICAL FIX: Use existing connection from window.multiplayerState
    if (window.opener && window.opener.multiplayerState) {
        // If opened in new window
        peer = window.opener.multiplayerState.peer;
        conn = window.opener.multiplayerState.conn;
    } else if (window.multiplayerState) {
        // Same window navigation
        peer = window.multiplayerState.peer;
        conn = window.multiplayerState.conn;
    }
    
    // Setup handlers for the EXISTING connection
    if (conn && conn.open) {
        console.log('Using existing connection');
        setupMultiplayerHandlers();
    } else if (conn) {
        // Connection exists but not open yet, wait for it
        conn.on('open', () => {
            console.log('Connection opened in game page');
            setupMultiplayerHandlers();
        });
    } else {
        console.error('No connection available - this should not happen');
    }
}

// Setup multiplayer message handlers
function setupMultiplayerHandlers() {
    if (!conn) {
        console.error('No connection to setup handlers');
        return;
    }
    
    console.log('Setting up multiplayer handlers');
    
    // Remove any existing listeners to prevent duplicates
    conn.off('data');
    conn.off('close');
    conn.off('error');
    
    // Setup new listeners
    conn.on('data', (data) => {
        console.log('Game received data:', data);
        if (data.type === 'move') {
            receiveOpponentMove(data.cellIndex);
        } else if (data.type === 'reset') {
            resetGameState();
        }
    });
    
    conn.on('close', () => {
        console.log('Opponent disconnected');
        alert('Opponent disconnected!');
        endMultiplayerSession();
    });
    
    conn.on('error', (err) => {
        console.error('Connection error in game:', err);
    });
}

// Send move to opponent
function sendMove(cellIndex) {
    if (conn && conn.open) {
        console.log('Sending move:', cellIndex);
        conn.send({
            type: 'move',
            cellIndex: cellIndex,
            symbol: mySymbol
        });
    } else {
        console.error('Cannot send move - connection not open');
    }
}

// Receive opponent's move
function receiveOpponentMove(cellIndex) {
    console.log('Received opponent move:', cellIndex);
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

// Modified cell click handler for multiplayer
function handleCellClick(event) {
    if (!gameActive) {
        result.style.animation = "none";
        setTimeout(() => {
            result.style.animation = "shake 0.3s";
        }, 10);
        return;
    }
    
    // Check if it's player's turn in multiplayer
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
        
        // Send move to opponent if multiplayer
        if (isMultiplayer) {
            sendMove(cellIndex);
            isMyTurn = false;
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
            } else {
                currentPlayer = opponentSymbol;
                updateTurnDisplay();
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
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [a, b, c] of winConditions) {
        if (
            gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c]
        ) {
            return gameBoard[a];
        }
    }
    return null;
}

function resetGame() {
    if (isMultiplayer) {
        // Send reset signal to opponent
        if (conn && conn.open) {
            conn.send({ type: 'reset' });
        }
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
    if (conn) {
        conn.close();
    }
    if (peer) {
        peer.destroy();
    }
    sessionStorage.clear();
    window.location.href = 'home.html';
}

function updateGameStatus() {
    if (isMultiplayer) return; // Skip for multiplayer
    
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
cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
});

resetButton.addEventListener("click", resetGame);

if (backToMenuBtn) {
    backToMenuBtn.addEventListener("click", () => {
        endMultiplayerSession();
    });
}

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
if (!isMultiplayer) {
    updateGameStatus();
}
