//multiplayer.js

import { firebaseConfig, generateRoomCode, validateRoomCode } from "./utils.js";

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const DEBUG = true;
const db = firebase.database();
console.log("[MULTIPLAYER] Script loaded");

// Emojis array
const emojis = [
  "❌",
  "⭕",
  "❤️",
  "💲",
  "😀",
  "💀",
  "🤖",
  "👽",
  "🐶",
  "😺",
  "💩",
  "🦐",
  "🍕",
  "🍣",
  "🍓",
  "🍤",
  "🌙",
  "☀️",
  "⭐",
  "🚀",
];

// Cache sessionStorage values at startup
const cachedSessionData = {
  roomCode: null,
  isHost: false,
  mySymbol: null,
  opponentSymbol: null,
};

function cacheSessionData() {
  cachedSessionData.roomCode = sessionStorage.getItem("roomCode");
  cachedSessionData.isHost = sessionStorage.getItem("isHost") === "true";
  cachedSessionData.mySymbol = sessionStorage.getItem("mySymbol");
  cachedSessionData.opponentSymbol = sessionStorage.getItem("opponentSymbol");
}

// DOM Elements
const emojiDisplay = document.getElementById("emojiDisplay");
const prevBtn = document.getElementById("prevEmoji");
const nextBtn = document.getElementById("nextEmoji");
const createGameBtn = document.getElementById("createGame");
const joinGameBtn = document.getElementById("joinGame");
const roomCodeInput = document.getElementById("roomCodeInput");
const statusDiv = document.getElementById("status");

let selectedIndex = 0;
let selectedEmoji = emojis[selectedIndex];

// Update emoji display
function updateEmojiDisplay() {
  if (emojiDisplay) {
    emojiDisplay.textContent = emojis[selectedIndex];
    selectedEmoji = emojis[selectedIndex];
  }
}

// Event listeners for emoji selection
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    selectedIndex = (selectedIndex - 1 + emojis.length) % emojis.length;
    updateEmojiDisplay();
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    selectedIndex = (selectedIndex + 1) % emojis.length;
    updateEmojiDisplay();
  });
}

// Create game
if (createGameBtn) {
  createGameBtn.addEventListener("click", async () => {
    try {
      const roomCode = generateRoomCode();
      const emptyBoard = Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => [i, null])
      );

      await db.ref("rooms/" + roomCode).set({
        board: emptyBoard,
        turn: selectedEmoji,
        hostEmoji: selectedEmoji,
        guestEmoji: null,
        player1: true,
        player2: false,
        winner: null,
        createdAt: Date.now(),
      });

      sessionStorage.setItem("roomCode", roomCode);
      sessionStorage.setItem("isHost", "true");
      sessionStorage.setItem("mySymbol", selectedEmoji);
      // Don't set opponentSymbol yet - we'll get it from Firebase in game
      sessionStorage.removeItem("opponentSymbol");

      console.log("[MULTIPLAYER] Room created:", roomCode);
      window.location.href = "game.html";
    } catch (error) {
      console.error("[MULTIPLAYER] Create game error:", error);
      if (statusDiv) {
        statusDiv.textContent = "Error creating game. Please try again.";
        statusDiv.style.color = "red";
      }
    }
  });
}

// Join game
if (joinGameBtn) {
  joinGameBtn.addEventListener("click", async () => {
    try {
      const roomCode = roomCodeInput.value.toUpperCase().trim();

      if (!validateRoomCode(roomCode)) {
        if (statusDiv) {
          statusDiv.textContent = "Invalid room code format";
          statusDiv.style.color = "red";
        }
        return;
      }

      const roomRef = db.ref("rooms/" + roomCode);
      const snapshot = await roomRef.once("value");
      const room = snapshot.val();

      if (!room) {
        if (statusDiv) {
          statusDiv.textContent = "Room not found";
          statusDiv.style.color = "red";
        }
        return;
      }

      if (room.player2) {
        if (statusDiv) {
          statusDiv.textContent = "Room is full";
          statusDiv.style.color = "red";
        }
        return;
      }

      // Update room with guest info
      const updateData = {
        guestEmoji: selectedEmoji,
        player2: true,
      };

      if (!room.turn) {
        updateData.turn = room.hostEmoji;
      }

      await roomRef.update(updateData);

      sessionStorage.setItem("roomCode", roomCode);
      sessionStorage.setItem("isHost", "false");
      sessionStorage.setItem("mySymbol", selectedEmoji);
      sessionStorage.setItem("opponentSymbol", room.hostEmoji);

      console.log("[MULTIPLAYER] Joined room:", roomCode);
      window.location.href = "game.html";
    } catch (error) {
      console.error("[MULTIPLAYER] Join game error:", error);
      if (statusDiv) {
        statusDiv.textContent = "Error joining game. Please try again.";
        statusDiv.style.color = "red";
      }
    }
  });
}

// Initialize emoji display
updateEmojiDisplay();

// Cache session data
cacheSessionData();
