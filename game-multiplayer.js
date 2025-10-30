const db = firebase.database();

const player1Indicator = document.getElementById('player1-indicator');
const player2Indicator = document.getElementById('player2-indicator');
const player1Emoji = document.getElementById('player1-emoji');
const player2Emoji = document.getElementById('player2-emoji');
const cells = document.querySelectorAll('.cell');
const result = document.getElementById('result');
const resetButton = document.getElementById('reset');
const backToMenuBtn = document.getElementById('backToMenu');

let roomCode = sessionStorage.getItem('roomCode');
let isHost = sessionStorage.getItem('isHost') === "true";
let mySymbol = sessionStorage.getItem('mySymbol') || "🎮";
let opponentSymbol = sessionStorage.getItem('opponentSymbol') || "🚀";
let isMultiplayer = sessionStorage.getItem('isMultiplayer') === "true";

let gameBoard = Array(9).fill(null);
let gameActive = false;
let currentPlayer = mySymbol;
let isMyTurn = true;
let moveCount = 0;

// Set player emojis in indicators
player1Emoji.textContent = mySymbol;
player2Emoji.textContent = opponentSymbol;

function updateTurnHighlight() {
  if (isMyTurn) {
    player1Indicator.classList.add('active');
    player1Indicator.classList.remove('inactive');
    player2Indicator.classList.remove('active');
    player2Indicator.classList.add('inactive');
  } else {
    player2Indicator.classList.add('active');
    player2Indicator.classList.remove('inactive');
    player1Indicator.classList.remove('active');
    player1Indicator.classList.add('inactive');
  }
}

function updateFirebaseGame(data) {
  firebase.database().ref('rooms/' + roomCode).update(data);
}

if (isMultiplayer && roomCode) {
  firebase.database().ref('rooms/' + roomCode).on('value', snapshot => {
    const data = snapshot.val();
    
    if (!data) return;
    
    if (data.board) {
      gameBoard = Array(9).fill(null);
      Object.keys(data.board).forEach(key => {
        const index = parseInt(key);
        if (!isNaN(index) && index >= 0 && index < 9) {
          gameBoard[index] = data.board[key];
        }
      });
    } else {
      gameBoard = Array(9).fill(null);
    }
    
    currentPlayer = data.turn || mySymbol;
    moveCount = gameBoard.filter(cell => cell !== null).length;
    
    isMyTurn = (currentPlayer === mySymbol && !data.winner);
    
    // RENDER CELLS WITH COLOR GRADIENTS
    cells.forEach((cell, i) => {
      cell.textContent = gameBoard[i] || "";
      
      // Set data-player attribute for colored gradient backgrounds
      if (gameBoard[i] === mySymbol) {
        cell.setAttribute('data-player', 'player1');
      } else if (gameBoard[i] === opponentSymbol) {
        cell.setAttribute('data-player', 'player2');
      } else {
        cell.setAttribute('data-player', '');
      }
    });
    
    if (data.winner) {
      result.textContent = (data.winner === mySymbol) ? "You won! 🎉" : (data.winner === "draw" ? "It's a draw! 🤝" : "Opponent won! 😔");
      result.style.color = "#f1fa8c";
      gameActive = false;
      player1Indicator.classList.remove('active', 'inactive');
      player2Indicator.classList.remove('active', 'inactive');
    } else {
      result.textContent = isMyTurn ? "Your turn!" : "Opponent's turn...";
      result.style.color = isMyTurn ? "#50fa7b" : "#f1fa8c";
      gameActive = true;
      updateTurnHighlight();
    }
    
    if (data.reset) resetGameState(true);
  });
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
  currentPlayer = mySymbol;
  isMyTurn = (currentPlayer === mySymbol);
  gameActive = true;
  cells.forEach(cell => {
    cell.textContent = "";
    cell.setAttribute('data-player', '');
  });
  result.textContent = isMyTurn ? "Your turn!" : "Opponent's turn...";
  result.style.color = isMyTurn ? "#50fa7b" : "#f1fa8c";
  updateTurnHighlight();
  
  if (!fromFirebase && isMultiplayer && roomCode) {
    updateFirebaseGame({
      board: gameBoard,
      turn: mySymbol,
      winner: null,
      reset: true
    });
    setTimeout(() => updateFirebaseGame({reset: false}), 100);
  }
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

updateTurnHighlight();
