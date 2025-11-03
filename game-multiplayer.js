// game-multiplayer.js
import { firebaseConfig } from './utils.js';

// Initialize Firebase app
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

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
let isHost = sessionStorage.getItem('isHost') === 'true';
let mySymbol = sessionStorage.getItem('mySymbol');
let opponentSymbol = sessionStorage.getItem('opponentSymbol');
let isMultiplayer = sessionStorage.getItem('isMultiplayer') === 'true';

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
    player2Indicator.classList.remove('active');
  } else {
    player1Indicator.classList.remove('active');
    player2Indicator.classList.add('active');
  }
}

function handleCellClick(event) {
  // Your existing game logic here
}

cells.forEach(cell => {
  cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', () => {
  // Your reset logic here
});

backToMenuBtn.addEventListener('click', () => {
  // Logic to return to menu
});

updateTurnHighlight();

// Add your multiplayer synchronization logic here, interacting with `db`

