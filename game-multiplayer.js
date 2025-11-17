// game-multiplayer.js

import { firebaseConfig, replayStoredLogs } from "./utils.js";

// Duration in ms for cell click animation
const ANIMATION_DURATION = 600;

// Replay logs previously stored (used for debugging, currently no-op)
replayStoredLogs();

// Retrieve session data for this player's game and symbol details
const roomCode = sessionStorage.getItem("roomCode");
const isHost = sessionStorage.getItem("isHost") === "true";
const mySymbol = sessionStorage.getItem("mySymbol");
const opponentSymbol = sessionStorage.getItem("opponentSymbol");
const myRole = isHost ? "host" : "guest";

// Redirect to index if mandatory session data missing (user flow validation)
if (!roomCode || !mySymbol || !opponentSymbol) {
  console.error("[GAME] ❌ Missing session data - redirecting to home");
  console.error("[GAME] Missing:", {
    roomCode: !roomCode,
    mySymbol: !mySymbol,
    opponentSymbol: !opponentSymbol,
  });
  window.location.href = "index.html";
}

// Initialize Firebase if not already initialized in this session
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

// Cache DOM elements for interaction
const player1Indicator = document.querySelector(".player-indicator:nth-child(1)");
const player2Indicator = document.querySelector(".player-indicator:nth-child(2)");
const player1Emoji = document.getElementById("player1-emoji");
const player2Emoji = document.getElementById("player2-emoji");
const cells = document.querySelectorAll(".cell");
const result = document.getElementById("result");
const resetButton = document.getElementById("reset");
const backToMenuBtn = document.getElementById("backToMenu");

// Initialize game state variables
let gameBoard = Array(9).fill(null);
let previousBoard = Array(9).fill(null);
let gameActive = false;
let isMyTurn = isHost; // Host always starts
let roomRef = null;
let isLeavingGame = false;

// Set player emojis in UI
if (player1Emoji) player1Emoji.textContent = mySymbol;
if (player2Emoji) player2Emoji.textContent = opponentSymbol;

/**
 * Updates the visual highlight on whose turn it is.
 */
function updateTurnHighlight() {
  try {
    if (isMyTurn) {
      player1Indicator.classList.add("active");
      player1Indicator.setAttribute("data-player", "self");
      player2Indicator.classList.remove("active");
      player2Indicator.removeAttribute("data-player");
    } else {
      player1Indicator.classList.remove("active");
      player1Indicator.removeAttribute("data-player");
      player2Indicator.classList.add("active");
      player2Indicator.setAttribute("data-player", "opponent");
    }
  } catch (error) {
    console.error("[GAME] ❌ Error updating turn highlight:", error);
  }
}

/**
 * Checks for a winner or draw given the current board.
 * Returns winner role ('host', 'guest'), 'draw', or null.
 */
function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // columns
    [0, 4, 8], [2, 4, 6],              // diagonals
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a]; // Returns 'host' or 'guest'
    }
  }

  const isDraw = board.every(cell => cell !== null);
  if (isDraw) return "draw";

  return null;
}

/**
 * Updates the board UI cells to reflect current game state.
 */
function updateBoard() {
  try {
    cells.forEach((cell, index) => {
      const role = gameBoard[index];
      let displaySymbol = "";

      if (role === "host") {
        displaySymbol = isHost ? mySymbol : opponentSymbol;
      } else if (role === "guest") {
        displaySymbol = isHost ? opponentSymbol : mySymbol;
      }

      cell.textContent = displaySymbol;
      cell.classList.remove("my-move", "opponent-move");
      cell.style.color = "";

      if (role === myRole) {
        cell.setAttribute("data-player", "self");
        cell.style.color = "#3B82F6";
        cell.classList.add("my-move");
      } else if (role && role !== myRole) {
        cell.setAttribute("data-player", "opponent");
        cell.style.color = "#EF4444";
        cell.classList.add("opponent-move");
      } else {
        cell.removeAttribute("data-player");
      }
    });
  } catch (error) {
    console.error("[GAME] ❌ Error updating board:", error);
  }
}

/**
 * Plays a quick animation on a cell when clicked.
 */
function playMoveAnimation(index) {
  try {
    const cell = cells[index];
    cell.classList.add("clicked");
    setTimeout(() => {
      cell.classList.remove("clicked");
    }, ANIMATION_DURATION);
  } catch (error) {
    console.error("[GAME] ❌ Error playing animation:", error);
  }
}

/**
 * Perform a move on the board if valid and update Firebase.
 */
function makeMove(index) {
  if (!gameActive || !isMyTurn || gameBoard[index]) return;

  playMoveAnimation(index);

  roomRef.transaction(room => {
    try {
      if (!room) return;

      // Log current turn and player role for debugging
      console.log("Transaction attempt - room.turn:", room.turn, "myRole:", myRole);

      // Normalize turn and role to lower case and trim whitespace before comparing
      if ((room.turn || '').toLowerCase().trim() !== (myRole || '').toLowerCase().trim()) return;

      let board = room.board ? Object.values(room.board) : Array(9).fill(null);

      if (board[index] !== null) return;

      board[index] = myRole;

      room.board = Object.fromEntries(board.map((val, i) => [i, val]));
      room.turn = isHost ? "guest" : "host";

      const winResult = checkWinner(board);
      if (winResult) {
        room.winner = winResult;
      }

      return room;
    } catch (error) {
      console.error("[GAME] ❌ Transaction error:", error);
      return;
    }
  }, (error, committed) => {
    if (error) console.error("[GAME] ❌ Transaction failed:", error);
  });
}

/**
 * Listen for real-time changes in game room and update UI accordingly.
 */
function listenToGameChanges() {
  roomRef = db.ref("rooms/" + roomCode);
  roomRef.on("value", snapshot => {
    try {
      if (isLeavingGame) return;

      const room = snapshot.val();

      if (!room) {
        if (!isLeavingGame) {
          result.textContent = "Opponent left the game";
          setTimeout(() => {
            isLeavingGame = true;
            roomRef.off("value");
            window.location.href = "index.html";
          }, 2000);
        }
        return;
      }

      if (room.playerLeftRequested) {
        if (!isLeavingGame) {
          isLeavingGame = true;
          roomRef.off("value");
          alert("Your opponent quit the game.");
          sessionStorage.clear();
          window.location.href = "index.html";
        }
        return;
      }

      gameBoard = Array.isArray(room.board)
        ? room.board
        : room.board
          ? Array.from({ length: 9 }, (_, i) => room.board[i] || null)
          : Array(9).fill(null);

      for (let i = 0; i < 9; i++) {
        const changed = previousBoard[i] !== gameBoard[i];
        const isNewMove = gameBoard[i] !== null && gameBoard[i] !== undefined;
        if (changed && isNewMove) {
          playMoveAnimation(i);
        }
      }

      previousBoard = [...gameBoard];

      isMyTurn = room.turn === myRole;
      updateBoard();
      updateTurnHighlight();

      if (room.winner) {
        gameActive = false;

        if (room.winner === "draw") {
          result.textContent = "It's a draw!";
        } else {
          const iWon = room.winner === myRole;
          result.textContent = iWon ? "You win! 🎉" : "You lose";
        }
      } else {
        gameActive = true;
        result.textContent = isMyTurn ? "Your turn" : "Opponent's turn";
      }
    } catch (error) {
      console.error("[GAME] ❌ Error in listener:", error);
    }
  }, error => {
    console.error("[GAME] ❌ Firebase listener error:", error);
  });
}

/**
 * Reset game state on Firebase and locally.
 */
function resetGame() {
  try {
    const emptyBoard = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i, null]));

    roomRef.update({
      board: emptyBoard,
      turn: "host",
      winner: null,
    });

    gameBoard = Array(9).fill(null);
    previousBoard = Array(9).fill(null);
    isMyTurn = isHost;
    gameActive = true;
  } catch (error) {
    console.error("[GAME] ❌ Reset error:", error);
  }
}

/**
 * Handle user going back to menu, notifying opponent with flag in Firebase.
 */
function goBackToMenu() {
  try {
    if (isLeavingGame) return;

    isLeavingGame = true;

    roomRef.off("value");

    roomRef.update({
      playerLeftRequested: true,
    }).then(() => {
      sessionStorage.clear();
      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    }).catch((error) => {
      console.error("[GAME] ❌ Error notifying opponent:", error);
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  } catch (error) {
    console.error("[GAME] ❌ Navigation error:", error);
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

// Setup event listeners for each cell for click and keyboard navigation
cells.forEach((cell, index) => {
  cell.setAttribute("role", "button");
  cell.setAttribute("tabindex", "0");
  cell.addEventListener("click", () => makeMove(index));
  cell.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      makeMove(index);
    }
  });
});

resetButton?.addEventListener("click", resetGame);
backToMenuBtn?.addEventListener("click", goBackToMenu);

// Initialize game state and event listeners on load
listenToGameChanges();
updateTurnHighlight();
