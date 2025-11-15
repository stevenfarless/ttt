// game-multiplayer.js

import { firebaseConfig, replayStoredLogs } from "./utils.js";

// Constants
const ANIMATION_DURATION = 600;

// ============================================
// REPLAY STORED LOGS FROM PREVIOUS PAGE
// ============================================
replayStoredLogs();

// Validate session and initialize Firebase
const roomCode = sessionStorage.getItem("roomCode");
const isHost = sessionStorage.getItem("isHost") === "true";
const mySymbol = sessionStorage.getItem("mySymbol");
const opponentSymbol = sessionStorage.getItem("opponentSymbol");
const myRole = isHost ? "host" : "guest"; // ✅ NEW: Determine player role

if (!roomCode || !mySymbol || !opponentSymbol) {
  console.error("[GAME] ❌ Missing session data - redirecting to home");
  console.error("[GAME] Missing:", {
    roomCode: !roomCode,
    mySymbol: !mySymbol,
    opponentSymbol: !opponentSymbol,
  });
  window.location.href = "index.html";
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

// DOM References
const player1Indicator = document.querySelector(
  ".player-indicator:nth-child(1)"
);
const player2Indicator = document.querySelector(
  ".player-indicator:nth-child(2)"
);
const player1Emoji = document.getElementById("player1-emoji");
const player2Emoji = document.getElementById("player2-emoji");
const cells = document.querySelectorAll(".cell");
const result = document.getElementById("result");
const resetButton = document.getElementById("reset");
const backToMenuBtn = document.getElementById("backToMenu");

// Game State
let gameBoard = Array(9).fill(null);
let previousBoard = Array(9).fill(null);
let gameActive = false;
let isMyTurn = isHost;
let roomRef = null;
let isLeavingGame = false;

// Set player emojis
if (player1Emoji) {
  player1Emoji.textContent = mySymbol;
}

if (player2Emoji) {
  player2Emoji.textContent = opponentSymbol;
}

/**
* Updates the turn indicator highlight
*/
function updateTurnHighlight() {
  try {
    if (isMyTurn) {
      player1Indicator.classList.add("active");
      player2Indicator.classList.remove("active");
    } else {
      player1Indicator.classList.remove("active");
      player2Indicator.classList.add("active");
    }
  } catch (error) {
    console.error("[GAME] ❌ Error updating turn highlight:", error);
  }
}

/**
* Checks for a winner on the board
* @param {Array} board - The game board with 'host'/'guest' values
* @returns {string|null} Winner role ('host'/'guest'), 'draw', or null
*/
function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a]; // Returns 'host' or 'guest'
    }
  }

  const isDraw = board.every((cell) => cell !== null);

  if (isDraw) {
    return "draw";
  }

  return null;
}

/**
* Updates the visual board display
* ✅ UPDATED: Now sets data-player attribute for gradient effects
*/
function updateBoard() {
  try {
    cells.forEach((cell, index) => {
      const role = gameBoard[index]; // 'host', 'guest', or null

      // Translate role to emoji for display
      let displaySymbol = "";
      if (role === "host") {
        displaySymbol = isHost ? mySymbol : opponentSymbol;
      } else if (role === "guest") {
        displaySymbol = isHost ? opponentSymbol : mySymbol;
      }

      cell.textContent = displaySymbol;
      cell.classList.remove("my-move", "opponent-move");
      cell.style.color = "";

      // ✅ NEW: Set data-player attribute for gradient effect
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
* Plays animation for a cell move
* @param {number} index - The cell index
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
* Handles a cell click for making a move
* @param {number} index - The cell index
*/
function makeMove(index) {
  if (!gameActive || !isMyTurn || gameBoard[index]) {
    return;
  }

  playMoveAnimation(index);

  roomRef.transaction(
    (room) => {
      try {
        if (!room) {
          return;
        }

        if (room.turn !== myRole) {
          return;
        }

        // Normalize board from Firebase
        let board = [];
        if (room.board) {
          for (let i = 0; i < 9; i++) {
            board[i] = room.board[i] || null;
          }
        } else {
          board = Array(9).fill(null);
        }

        if (board[index] !== null) {
          return;
        }

        // Make move - store role instead of emoji
        board[index] = myRole;

        // Convert back to Firebase format
        room.board = Object.fromEntries(board.map((val, i) => [i, val]));
        room.turn = isHost ? "guest" : "host";
        room.winner = checkWinner(board);

        return room;
      } catch (error) {
        console.error("[GAME] ❌ Transaction error:", error);
        return;
      }
    },
    (error, committed, snapshot) => {
      if (error) {
        console.error("[GAME] ❌ Transaction failed:", error);
      }
    }
  );
}

/**
* Listens to Firebase game changes and updates local state
*/
function listenToGameChanges() {
  roomRef = db.ref("rooms/" + roomCode);

  roomRef.on(
    "value",
    (snapshot) => {
      try {
        // Skip processing if we're already leaving
        if (isLeavingGame) {
          return;
        }

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

        // Check if opponent wants to go back to menu
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

        // Normalize board
        if (room.board) {
          gameBoard = Array.isArray(room.board)
            ? room.board
            : Array.from({ length: 9 }, (_, i) => room.board[i] || null);
        } else {
          gameBoard = Array(9).fill(null);
        }

        // Detect opponent move and play animation
        for (let i = 0; i < 9; i++) {
          const changed = previousBoard[i] !== gameBoard[i];
          const isNewMove = gameBoard[i] !== null && gameBoard[i] !== undefined;
          if (changed && isNewMove) {
            playMoveAnimation(i);
          }
        }

        // Update previousBoard for next comparison
        previousBoard = gameBoard.map((cell) => cell);

        // Update game state
        isMyTurn = room.turn === myRole;

        updateBoard();
        updateTurnHighlight();

        // Check for winner
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
    },
    (error) => {
      console.error("[GAME] ❌ Firebase listener error:", error);
    }
  );
}

/**
* Resets the game state
*/
function resetGame() {
  try {
    const emptyBoard = Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [i, null])
    );

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
* Navigates back to menu and notifies opponent
*/
function goBackToMenu() {
  try {
    // Prevent re-entrance
    if (isLeavingGame) {
      return;
    }

    isLeavingGame = true;

    // Stop listening BEFORE updating Firebase
    roomRef.off("value");

    // Set flag to notify opponent
    roomRef
      .update({
        playerLeftRequested: true,
      })
      .then(() => {
        sessionStorage.clear();

        // Give opponent time to see notification before we completely leave
        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      })
      .catch((error) => {
        console.error("[GAME] ❌ Error notifying opponent:", error);
        // Leave anyway if notification fails
        sessionStorage.clear();
        window.location.href = "index.html";
      });
  } catch (error) {
    console.error("[GAME] ❌ Navigation error:", error);
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

// Event Listeners
cells.forEach((cell, index) => {
  cell.setAttribute("role", "button");
  cell.setAttribute("tabindex", "0");
  cell.addEventListener("click", () => makeMove(index));
  cell.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      makeMove(index);
    }
  });
});

resetButton?.addEventListener("click", resetGame);
backToMenuBtn?.addEventListener("click", goBackToMenu);

// Initialize
listenToGameChanges();
updateTurnHighlight();
