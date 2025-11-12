// game-multiplayer.js

import { firebaseConfig, replayStoredLogs } from "./utils.js";

// Constants
const ANIMATION_DURATION = 600;

// ============================================
// REPLAY STORED LOGS FROM PREVIOUS PAGE
// ============================================
replayStoredLogs();

console.log("[GAME] 🎮 Game script starting at", new Date().toISOString());
console.log(`[GAME] ⚙️ Animation duration: ${ANIMATION_DURATION}ms`);

// Validate session and initialize Firebase
const roomCode = sessionStorage.getItem("roomCode");
const isHost = sessionStorage.getItem("isHost") === "true";
const mySymbol = sessionStorage.getItem("mySymbol");
const opponentSymbol = sessionStorage.getItem("opponentSymbol");
const myRole = isHost ? "host" : "guest"; // ✅ NEW: Determine player role

console.log("[GAME] 💾 Loading session data...");
console.log(`[GAME] 📋 Room Code: ${roomCode}`);
console.log(`[GAME] 👤 Role: ${isHost ? "Host" : "Guest"}`);
console.log(`[GAME] 🎨 My Symbol: ${mySymbol}`);
console.log(`[GAME] 🎨 Opponent Symbol: ${opponentSymbol}`);

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
  console.log("[GAME] 🔥 Initializing Firebase...");
  firebase.initializeApp(firebaseConfig);
  console.log("[GAME] ✅ Firebase initialized");
}

const db = firebase.database();
console.log("[GAME] ✅ Database connection established");

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

console.log("[GAME] ✅ DOM elements loaded successfully");
console.log(`[GAME] 📊 Found ${cells.length} game cells`);

// Game State
let gameBoard = Array(9).fill(null);
let previousBoard = Array(9).fill(null);
let gameActive = false;
let isMyTurn = isHost;
let roomRef = null;
let isLeavingGame = false;

console.log("[GAME] 🎮 Initial game state:");
console.log(`[GAME] - Board: ${gameBoard.join(",")}`);
console.log(`[GAME] - Game Active: ${gameActive}`);
console.log(`[GAME] - My Turn: ${isMyTurn}`);

// Set player emojis
if (player1Emoji) {
  player1Emoji.textContent = mySymbol;
  console.log(`[GAME] 🎨 Player 1 emoji set to: ${mySymbol}`);
}

if (player2Emoji) {
  player2Emoji.textContent = opponentSymbol;
  console.log(`[GAME] 🎨 Player 2 emoji set to: ${opponentSymbol}`);
}

/**
 * Updates the turn indicator highlight
 */
function updateTurnHighlight() {
  try {
    console.log(`[GAME] 🔄 Updating turn highlight - My Turn: ${isMyTurn}`);
    if (isMyTurn) {
      player1Indicator.classList.add("active");
      player2Indicator.classList.remove("active");
      console.log("[GAME] ✅ Player 1 (You) turn highlighted");
    } else {
      player1Indicator.classList.remove("active");
      player2Indicator.classList.add("active");
      console.log("[GAME] ✅ Player 2 (Opponent) turn highlighted");
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
  const startTime = performance.now();
  console.log("[GAME] 🔍 Checking for winner...");
  console.log(
    `[GAME] 📊 Current board state: [${board
      .map((c, i) => `${i}:${c || "_"}`)
      .join(", ")}]`
  );

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
      const endTime = performance.now();
      console.log(
        `[GAME] 🏆 Winner found: ${board[a]} via line [${a},${b},${c}] in ${(
          endTime - startTime
        ).toFixed(2)}ms`
      );
      return board[a]; // Returns 'host' or 'guest'
    }
  }

  const isDraw = board.every((cell) => cell !== null);
  const endTime = performance.now();

  if (isDraw) {
    console.log(
      `[GAME] 🤝 Game is a draw (checked in ${(endTime - startTime).toFixed(
        2
      )}ms)`
    );
    return "draw";
  }

  console.log(
    `[GAME] ➡️ No winner yet (checked in ${(endTime - startTime).toFixed(2)}ms)`
  );
  return null;
}

/**
 * Updates the visual board display
 * ✅ UPDATED: Now sets data-player attribute for gradient effects
 */
function updateBoard() {
  const startTime = performance.now();
  console.log("[GAME] 🎨 Updating board display...");
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

    const endTime = performance.now();
    console.log(
      `[GAME] ✅ Board display updated in ${(endTime - startTime).toFixed(2)}ms`
    );
    console.log(
      `[GAME] 📊 Displayed board: [${gameBoard
        .map((c, i) => `${i}:${c || "_"}`)
        .join(", ")}]`
    );
  } catch (error) {
    console.error("[GAME] ❌ Error updating board:", error);
  }
}

/**
 * Plays animation for a cell move
 * @param {number} index - The cell index
 */
function playMoveAnimation(index) {
  const startTime = performance.now();
  console.log(`[GAME] 🎬 Playing animation for cell ${index}`);
  try {
    const cell = cells[index];
    cell.classList.add("clicked");
    console.log(`[GAME] ✅ Animation class added to cell ${index}`);

    setTimeout(() => {
      cell.classList.remove("clicked");
      const endTime = performance.now();
      console.log(
        `[GAME] ✅ Animation completed for cell ${index} (total ${(
          endTime - startTime
        ).toFixed(2)}ms)`
      );
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
  const startTime = performance.now();
  console.log(`[GAME] 🎯 Player clicked cell ${index}`);
  console.log(
    `[GAME] 🎮 Move context: gameActive=${gameActive}, isMyTurn=${isMyTurn}, cellEmpty=${!gameBoard[
      index
    ]}`
  );

  if (!gameActive || !isMyTurn || gameBoard[index]) {
    if (!gameActive) console.log("[GAME] ⚠️ Move rejected: Game not active");
    if (!isMyTurn) console.log("[GAME] ⚠️ Move rejected: Not your turn");
    if (gameBoard[index])
      console.log(
        `[GAME] ⚠️ Move rejected: Cell ${index} already occupied by ${gameBoard[index]}`
      );
    return;
  }

  console.log(
    `[GAME] ✅ Move validated - Proceeding with ${myRole} at cell ${index}`
  );
  playMoveAnimation(index);

  roomRef.transaction(
    (room) => {
      try {
        if (!room) {
          console.log("[GAME] ❌ Transaction aborted: Room not found");
          return;
        }

        if (room.turn !== myRole) {
          // ✅ CHANGED: Check role instead of emoji
          console.log(
            `[GAME] ⚠️ Transaction aborted: Turn mismatch (expected ${myRole}, got ${room.turn})`
          );
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
          console.log(
            `[GAME] ⚠️ Transaction aborted: Cell ${index} occupied in Firebase`
          );
          return;
        }

        // Make move - store role instead of emoji
        board[index] = myRole; // ✅ CHANGED: Store 'host' or 'guest'
        console.log(
          `[GAME] ✅ Move executed: ${myRole} placed at cell ${index}`
        );

        // Convert back to Firebase format
        room.board = Object.fromEntries(board.map((val, i) => [i, val]));
        room.turn = isHost ? "guest" : "host"; // ✅ CHANGED: Toggle between roles
        room.winner = checkWinner(board);

        console.log(`[GAME] 📤 Updating Firebase:`);
        console.log(
          `[GAME] - Board: [${board
            .map((c, i) => `${i}:${c || "_"}`)
            .join(", ")}]`
        );
        console.log(`[GAME] - Next turn: ${room.turn}`);
        console.log(`[GAME] - Winner: ${room.winner || "none yet"}`);

        return room;
      } catch (error) {
        console.error("[GAME] ❌ Transaction error:", error);
        return;
      }
    },
    (error, committed, snapshot) => {
      const endTime = performance.now();
      if (error) {
        console.error(
          `[GAME] ❌ Transaction failed after ${(endTime - startTime).toFixed(
            2
          )}ms:`,
          error
        );
      } else if (committed) {
        console.log(
          `[GAME] ✅ Move committed to Firebase in ${(
            endTime - startTime
          ).toFixed(2)}ms`
        );
        console.log(`[GAME] 🎮 Move summary: ${myRole} played cell ${index}`);
      } else {
        console.log(
          `[GAME] ⚠️ Transaction not committed (aborted) after ${(
            endTime - startTime
          ).toFixed(2)}ms`
        );
      }
    }
  );
}

/**
 * Listens to Firebase game changes and updates local state
 */
function listenToGameChanges() {
  console.log("[GAME] 👂 Setting up Firebase listener...");
  roomRef = db.ref("rooms/" + roomCode);
  console.log(`[GAME] 📡 Listening to: rooms/${roomCode}`);

  roomRef.on(
    "value",
    (snapshot) => {
      const listenerStartTime = performance.now();
      console.log("[GAME] 📥 Firebase update received");

      try {
        // Skip processing if we're already leaving
        if (isLeavingGame) {
          console.log("[GAME] ⚠️ Ignoring update - already leaving game");
          return;
        }

        const room = snapshot.val();

        if (!room) {
          console.log("[GAME] ⚠️ Room disappeared from Firebase");
          if (!isLeavingGame) {
            result.textContent = "Opponent left the game";
            console.log("[GAME] 👋 Opponent left - redirecting in 2s...");
            setTimeout(() => {
              isLeavingGame = true;
              roomRef.off("value");
              window.location.href = "index.html";
            }, 2000);
          }
          return;
        }

        console.log(
          "[GAME] 📊 Room data received:",
          JSON.stringify(room, null, 2)
        );

        // Check if opponent wants to go back to menu
        if (room.playerLeftRequested) {
          console.log("[GAME] 👋 Opponent quit the game");
          if (!isLeavingGame) {
            isLeavingGame = true;
            roomRef.off("value");
            console.log("[GAME] 🚪 Stopping listener and returning to menu");
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
        let moveDetected = false;
        for (let i = 0; i < 9; i++) {
          const changed = previousBoard[i] !== gameBoard[i];
          const isNewMove = gameBoard[i] !== null && gameBoard[i] !== undefined;
          if (changed && isNewMove) {
            console.log(`[GAME] 🎯 Opponent move detected!`);
            console.log(`[GAME] - Cell: ${i}`);
            console.log(`[GAME] - Previous: ${previousBoard[i] || "empty"}`);
            console.log(`[GAME] - New: ${gameBoard[i]}`);
            console.log(`[GAME] - Role: ${gameBoard[i]}`);
            playMoveAnimation(i);
            moveDetected = true;
          }
        }
        if (!moveDetected && previousBoard.some((c) => c !== null)) {
          console.log("[GAME] ℹ️ No new moves detected in this update");
        }

        // Update previousBoard for next comparison
        previousBoard = gameBoard.map((cell) => cell);

        // Update game state
        const wasMyTurn = isMyTurn;
        isMyTurn = room.turn === myRole; // ✅ CHANGED: Compare with role

        if (wasMyTurn !== isMyTurn) {
          console.log(
            `[GAME] 🔄 Turn changed: ${
              wasMyTurn ? "My turn" : "Opponent turn"
            } -> ${isMyTurn ? "My turn" : "Opponent turn"}`
          );
        }

        updateBoard();
        updateTurnHighlight();

        // Check for winner
        if (room.winner) {
          gameActive = false;
          console.log(`[GAME] 🏁 Game ended! Result: ${room.winner}`);

          if (room.winner === "draw") {
            result.textContent = "It's a draw!";
            console.log("[GAME] 🤝 Game result: DRAW");
          } else {
            const iWon = room.winner === myRole; // ✅ CHANGED: Compare with role
            result.textContent = iWon ? "You win! 🎉" : "You lose";
            console.log(
              `[GAME] ${iWon ? "🎉" : "😢"} Game result: ${
                iWon ? "YOU WIN!" : "YOU LOSE"
              } (Winner: ${room.winner})`
            );
          }
        } else {
          gameActive = true;
          result.textContent = isMyTurn ? "Your turn" : "Opponent's turn";
          console.log(
            `[GAME] ➡️ Game continues - ${
              isMyTurn ? "Your turn" : "Opponent's turn"
            }`
          );
        }

        const listenerEndTime = performance.now();
        console.log(
          `[GAME] ✅ Firebase update processed in ${(
            listenerEndTime - listenerStartTime
          ).toFixed(2)}ms`
        );
      } catch (error) {
        console.error("[GAME] ❌ Error in listener:", error);
      }
    },
    (error) => {
      console.error("[GAME] ❌ Firebase listener error:", error);
    }
  );

  console.log("[GAME] ✅ Firebase listener active");
}

/**
 * Resets the game state
 */
function resetGame() {
  const startTime = performance.now();
  console.log("[GAME] 🔄 Reset button clicked");
  console.log(`[GAME] 🔄 Resetting game... First player: host`);

  try {
    const emptyBoard = Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [i, null])
    );

    console.log("[GAME] 📤 Sending reset to Firebase...");
    roomRef.update({
      board: emptyBoard,
      turn: "host", // ✅ CHANGED: Always start with host
      winner: null,
    });

    gameBoard = Array(9).fill(null);
    previousBoard = Array(9).fill(null);
    isMyTurn = isHost;
    gameActive = true;

    const endTime = performance.now();
    console.log(
      `[GAME] ✅ Game reset complete in ${(endTime - startTime).toFixed(2)}ms`
    );
    console.log(`[GAME] 🎮 New game started - First turn: host`);
  } catch (error) {
    console.error("[GAME] ❌ Reset error:", error);
  }
}

/**
 * Navigates back to menu and notifies opponent
 */
function goBackToMenu() {
  const startTime = performance.now();
  console.log("[GAME] 🚪 Back to menu button clicked");

  try {
    // Prevent re-entrance
    if (isLeavingGame) {
      console.log("[GAME] ⚠️ Already leaving game, ignoring click");
      return;
    }

    isLeavingGame = true;
    console.log("[GAME] 🛑 Stopping Firebase listener...");

    // Stop listening BEFORE updating Firebase
    roomRef.off("value");
    console.log("[GAME] ✅ Listener stopped");

    // Set flag to notify opponent
    console.log("[GAME] 📤 Notifying opponent of departure...");
    roomRef
      .update({
        playerLeftRequested: true,
      })
      .then(() => {
        const endTime = performance.now();
        console.log(
          `[GAME] ✅ Opponent notified in ${(endTime - startTime).toFixed(2)}ms`
        );
        console.log("[GAME] 🗑️ Clearing session storage...");
        sessionStorage.clear();

        // Give opponent time to see notification before we completely leave
        console.log("[GAME] 🚀 Redirecting to home in 500ms...");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      })
      .catch((error) => {
        console.error("[GAME] ❌ Error notifying opponent:", error);
        console.log("[GAME] ⚠️ Leaving anyway despite notification failure");
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
console.log("[GAME] 🎧 Attaching event listeners...");

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

console.log(`[GAME] ✅ Attached click listeners to ${cells.length} cells`);

resetButton?.addEventListener("click", resetGame);
console.log("[GAME] ✅ Reset button listener attached");

backToMenuBtn?.addEventListener("click", goBackToMenu);
console.log("[GAME] ✅ Back to menu button listener attached");

// Initialize
console.log("[GAME] 🚀 Initializing game...");
listenToGameChanges();
updateTurnHighlight();

console.log("[GAME] ✅ Script initialization complete");
console.log("[GAME] 🎮 Game ready! Room:", roomCode);
console.log(`[GAME] 🎮 ${mySymbol} (You) vs ${opponentSymbol} (Opponent)`);
console.log(
  `[GAME] 🎮 ${isMyTurn ? "Your turn to start!" : "Waiting for opponent..."}`
);

// In game-multiplayer.js after game ends
setTimeout(() => {
  db.ref('rooms/' + roomCode).remove();
}, 30000); // 30 seconds after game finish
