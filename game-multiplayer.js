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

// Helper to update Firebase DB with moves
function updateFirebaseGame(data) {
  firebase.database().ref('rooms/' + roomCode).update(data);
}

// Listen to Firebase Board/Turn
if (isMultiplayer && roomCode) {
  firebase.database().ref('rooms/' + roomCode).on('value', snapshot => {
    const data = snapshot.val();
    if (!data || !data.board) return;  // <-- CRITICAL FIX: Check if board exists
    
    gameBoard = data.board;
    currentPlayer = data.turn;
    moveCount = data.board.filter(cell => cell !== null).length;  // <-- Also check for null explicitly
    
    // Turn logic - MUST BE CALCULATED FIRST
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
}

function handleCellClick(event) {
  if (!gameActive || !isMyTurn) return;
  const cellIndex = parseInt(event.target.id) - 1;
  if (gameBoard[cellIndex]) return;
  
  gameBoard[cellIndex] = mySymbol;
  moveCount++;
  
  // Check for win/draw
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

// Input setup (names/symbols)
if (playerOneInput && playerTwoInput) {
  playerOneInput.value = mySymbol;
  playerTwoInput.value = opponentSymbol;
  playerOneInput.disabled = true;
  playerTwoInput.disabled = true;
}

// Cell click listeners
cells.forEach(cell => {
  cell.addEventListener('click', handleCellClick);
});

// Reset and menu
if (resetButton) resetButton.addEventListener('click', () => resetGameState(false));
if (backToMenuBtn) backToMenuBtn.addEventListener('click', () => {
  if (isMultiplayer && roomCode) firebase.database().ref('rooms/' + roomCode).remove();
  sessionStorage.clear();
  window.location.href = "home.html";
});
