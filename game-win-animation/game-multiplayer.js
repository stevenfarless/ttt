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
const myRole = isHost ? "host" : "guest";

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
const player1Indicator = document.querySelector(".player-indicator:nth-child(1)");
const player2Indicator = document.querySelector(".player-indicator:nth-child(2)");
const player1Emoji = document.getElementById("player1-emoji");
const player2Emoji = document.getElementById("player2-emoji");
const cells = document.querySelectorAll(".cell");
const result = document.getElementById("result");
const resetButton = document.getElementById("reset");
const backToMenuBtn = document.getElementById("backToMenu");
const board = document.getElementById("board");

// Game State
let gameBoard = Array(9).fill(null);
let previousBoard = Array(9).fill(null);
let gameActive = false;
let isMyTurn = isHost;
let roomRef = null;
let isLeavingGame = false;
let winLineOverlay = null;

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
 * Checks for a winner on the board
 * @param {Array} board - The game board with 'host'/'guest' values
 * @returns {Object|null} Object with winner role and winning line, or null
 */
function checkWinner(board) {
  const lines = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6], // Diagonal top-right to bottom-left
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return { winner: board[a], winningLine: line };
    }
  }

  const isDraw = board.every((cell) => cell !== null);
  if (isDraw) {
    return { winner: "draw", winningLine: null };
  }

  return null;
}

/**
 * Updates the visual board display
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
 * Creates and animates the win line overlay
 * @param {Array} winningLine - Array of three cell indices
 * @param {boolean} iWon - Whether the current player won
 */
function drawWinLine(winningLine, iWon) {
  if (!winningLine || winningLine.length !== 3) return;

  // Remove any existing win line
  if (winLineOverlay) {
    winLineOverlay.remove();
  }

  // Get board position
  const boardRect = board.getBoundingClientRect();

  // Create SVG overlay
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "win-line-overlay");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "10";

  // Calculate start and end positions
  const startCell = cells[winningLine[0]];
  const endCell = cells[winningLine[2]];

  const startRect = startCell.getBoundingClientRect();
  const endRect = endCell.getBoundingClientRect();

  const startX = startRect.left + startRect.width / 2 - boardRect.left;
  const startY = startRect.top + startRect.height / 2 - boardRect.top;
  const endX = endRect.left + endRect.width / 2 - boardRect.left;
  const endY = endRect.top + endRect.height / 2 - boardRect.top;

  // Create line element
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", startX);
  line.setAttribute("y2", startY);
  line.setAttribute("stroke", iWon ? "#3B82F6" : "#EF4444");
  line.setAttribute("stroke-width", "6");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("class", "win-line");

  svg.appendChild(line);
  board.style.position = "relative";
  board.appendChild(svg);
  winLineOverlay = svg;

  // Animate the line drawing
  setTimeout(() => {
    line.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    line.setAttribute("x2", endX);
    line.setAttribute("y2", endY);
  }, 100);
}

/**
 * Triggers confetti celebration
 * @param {boolean} iWon - Whether the current player won
 */
function triggerConfetti(iWon) {
  // Only trigger confetti if canvas-confetti is loaded
  if (typeof confetti === "undefined") {
    console.warn("[GAME] ⚠️ canvas-confetti library not loaded");
    return;
  }

  // Use player colors for confetti
  const colors = iWon
    ? ["#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"] // Blue gradient for winner
    : ["#EF4444", "#F87171", "#FCA5A5", "#FEE2E2"]; // Red gradient for loser

  // Fire confetti from multiple angles
  const duration = 2500;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 1000,
    colors: colors
  };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Fire confetti from random positions
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
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

        const winResult = checkWinner(board);
        if (winResult) {
          room.winner = winResult.winner;
          room.winningLine = winResult.winningLine;
        }

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

            // ✅ NEW: Draw win line and trigger confetti
            if (room.winningLine) {
              drawWinLine(room.winningLine, iWon);
            }
            triggerConfetti(iWon);
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
    // Remove win line overlay
    if (winLineOverlay) {
      winLineOverlay.remove();
      winLineOverlay = null;
    }

    const emptyBoard = Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [i, null])
    );
    roomRef.update({
      board: emptyBoard,
      turn: "host",
      winner: null,
      winningLine: null,
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
