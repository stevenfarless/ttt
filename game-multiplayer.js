// Firebase config and initialization (skipped here - already called in HTML)
const db = firebase.database();

const playerOneInput = document.getElementById('playerOneInput');
const playerTwoInput = document.getElementById('playerTwoInput');
const cells = document.querySelectorAll('.cell');
const result = document.getElementById('result');
const resetButton = document.getElementById('reset');
const backToMenuBtn = document.getElementById('backToMenu');

let roomCode = sessionStorage.getItem('roomCode');
let isHost = sessionStorage.getItem('isHost') === "true";
let mySymbol = sessionStorage.getItem('mySymbol') || "X";
let opponentSymbol = sessionStorage.getItem('opponentSymbol') || "O";
let isMultiplayer = sessionStorage.getItem('isMultiplayer') === "true";

let gameBoard = Array(9).fill(null);
let gameActive = false;
let currentPlayer = "X";
let isMyTurn = (mySymbol === "X");
let moveCount = 0;

// DEBUG LOG
console.log("DEBUG: roomCode=" + roomCode + ", isMultiplayer=" + isMultiplayer);

// Helper to update Firebase DB with moves
function updateFirebaseGame(data) {
  firebase.database().ref('rooms/' + roomCode).update(data);
}

// Listen to Firebase Board/Turn
if (isMultiplayer && roomCode) {
  console.log("Starting Firebase listener for room: " + roomCode);
  firebase.database().ref('rooms/' + roomCode).on('value', snapshot => {
    const data = snapshot.val();
    console.log("Firebase data received:", data);
    
    // Check if data exists
    if (!data) return;
    
    // Convert Firebase board (which might be sparse) to full array
    if (data.board) {
      gameBoard = Array(9).fill(null);
      // Firebase stores arrays as objects with numeric keys
      Object.keys(data.board).forEach(key => {
        const index = parseInt(key);
        if (!isNaN(index) && index >= 0 && index < 9) {
          gameBoard[index] = data.board[key];
        }
      });
    } else {
      // No board yet - initialize it
      gameBoard = Array(9).fill(null);
    }
    
    currentPlayer = data.turn || "X";
    moveCount = gameBoard.filter(cell => cell !== null).length;
    
    // Turn logic
    isMyTurn = (currentPlayer === mySymbol && !data.winner);
    
    // Sync board to UI
    cells.forEach((cell, i) => {
      cell.textContent = gameBoard[i] || "";
      cell.style.animation = "";
    });
    
    // Show result/winner
    if (data.winner) {
      result.textContent = (data.winner === mySymbol) ? "You won!" : (data.winner === "draw" ? "It's a draw!" : "Opponent won!");
      result.style.color = "#f1fa8c";
      gameActive = false;
    } else {
      result.textContent = isMyTurn ? "Your turn!" : "Opponent's turn...";
      result.style.color = isMyTurn ? "#50fa7b" : "#f1fa8c";
      gameActive = true;
    }
    
    // Handle reset
    if (data.reset) resetGameState(true);
  });
} else {
  console.log("NOT starting Firebase listener. isMultiplayer=" + isMultiplayer + ", roomCode=" + roomCode);
}

function handleCellClick(event) {
  if (!gameActive || !isMyTurn) return;
  const cellIndex = parseInt(event.target.id) - 1;
  if (gameBoard[cellIndex]) return;
  
  gameBoard[cellIndex] = mySymbol;
  moveCount++;
  
  const winner = checkWinner(gameBoard);
  updateFirebaseGame({
    board: gameBoard,
    turn: opponentSymbol,
    winner: winner ? mySymbol : (moveCount === 9 ? "draw" : null),
    reset: false
  });
}

function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function resetGameState(fromFirebase = false) {
  gameBoard = Array(9).fill(null);
  moveCount = 0;
  currentPlayer = "X";
  isMyTurn = (mySymbol === "X");
  gameActive = true;
  cells.forEach(cell => {
    cell.textContent = "";
    cell.style.animation = "";
  });
  result.textContent = isMyTurn ? "Your turn!" : "Opponent's turn...";
  result.style.color = isMyTurn ? "#50fa7b" : "#f1fa8c";
  if (!fromFirebase && isMultiplayer && roomCode) {
    updateFirebaseGame({
      board: gameBoard,
      turn: "X",
      winner: null,
      reset: true
    });
    setTimeout(() => updateFirebaseGame({reset: false}), 100);
  }
}

if (playerOneInput && playerTwoInput) {
  playerOneInput.value = mySymbol;
  playerTwoInput.value = opponentSymbol;
  playerOneInput.disabled = true;
  playerTwoInput.disabled = true;
}

cells.forEach(cell => {
  cell.addEventListener('click', handleCellClick);
});

if (resetButton) resetButton.addEventListener('click', () => resetGameState(false));
if (backToMenuBtn) backToMenuBtn.addEventListener('click', () => {
  if (isMultiplayer && roomCode) firebase.database().ref('rooms/' + roomCode).remove();
  sessionStorage.clear();
  window.location.href = "home.html";
});
