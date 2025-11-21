// multiplayer.js

import { firebaseConfig, clearStoredLogs, validateCustomEmoji } from "./utils.js";

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const DEBUG = true;
const db = firebase.database();

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

// DOM Elements
const emojiDisplay = document.getElementById("emojiDisplay");
const emojiToggle = document.getElementById("emojiToggle");
const emojiModal = document.getElementById("emojiModal");
const closeEmojiModal = document.getElementById("closeEmojiModal");
const emojiPicker = document.getElementById("emojiPicker");
const customEmojiInput = document.getElementById("customEmojiInput");

customEmojiInput.addEventListener('focus', function () {
  setTimeout(() => {
    customEmojiInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
});

const useCustomEmojiBtn = document.getElementById("useCustomEmoji");
const customEmojiHint = document.querySelector(".custom-emoji-hint");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const createModule = document.getElementById("createModule");
const joinModule = document.getElementById("joinModule");
const roomCodeInput = document.getElementById("roomCodeInput");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const createStatus = document.getElementById("createStatus");
const joinStatus = document.getElementById("joinStatus");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const pasteCodeBtn = document.getElementById("pasteCodeBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const shareLinkBtn = document.getElementById("shareLinkBtn");
const inviteLinkDisplay = document.getElementById("inviteLinkDisplay");

// Restore persisted emoji selection or default to ❌
const persistedEmoji = sessionStorage.getItem('currentEmojiSelection');
if (persistedEmoji) {
  emojiDisplay.textContent = persistedEmoji;
} else {
  // emojiDisplay.textContent = "❌";
}

// Track generated room code
let generatedRoomCode = null;

// ============================================
// URL PARAMETER HANDLING
// ============================================
function checkForRoomInURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomCode = urlParams.get("room");

  if (roomCode && roomCode.length >= 4) {
    const sanitizedCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (sanitizedCode.length === 4) {
      // Set default to "O" for joining player via URL
      // Only set default emoji for join via URL if not already a custom emoji
      if (!emojiDisplay.textContent || emojiDisplay.textContent === "❌") {
        emojiDisplay.textContent = "⭕";
      }

      // Show join module
      joinModule.classList.remove("hidden");
      createModule.classList.add("hidden");

      // Pre-populate room code
      roomCodeInput.value = sanitizedCode;
      roomCodeInput.dispatchEvent(new Event("input"));

      // Manually apply button styling for invite link
      joinRoomBtn.textContent = "START GAME";
      joinRoomBtn.classList.add("glow"); // Add glow effect

      createRoomBtn.disabled = true;
      createRoomBtn.style.opacity = "0.4";
      createRoomBtn.style.cursor = "not-allowed";
      createRoomBtn.title = "Clear the room code to create a new game";

      // Update status
      joinStatus.textContent = "Room code loaded from link.\nReady to join!";
      joinStatus.style.color = "var(--success)";

      // Clean URL (optional)
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
  }
  return false;
}

// Generates shareable invitation link
function generateInviteLink(roomCode) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?room=${roomCode}`;
}

// Copies invite link to clipboard
async function copyInviteLink(roomCode) {
  const link = generateInviteLink(roomCode);
  try {
    await navigator.clipboard.writeText(link);

    // Visual feedback
    const originalText = copyLinkBtn.textContent;
    copyLinkBtn.textContent = "✓ Copied!";
    copyLinkBtn.style.background = "var(--success)";
    setTimeout(() => {
      copyLinkBtn.textContent = originalText;
      copyLinkBtn.style.background = "";
    }, 2000);
    return true;
  } catch (error) {
    console.error("[MULTIPLAYER] ❌ Failed to copy invite link:", error);
    copyLinkBtn.textContent = "❌ Failed";
    setTimeout(() => {
      copyLinkBtn.textContent = "📋 Copy Link";
    }, 2000);
    return false;
  }
}

// Shares invite link using Web Share API (mobile-friendly)
async function shareInviteLink(roomCode) {
  const link = generateInviteLink(roomCode);
  const hostEmoji = emojiDisplay.textContent;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Join my Tic Tac Toe game!",
        text: `Join ${hostEmoji} for a game of Tic Tac Toe! Room code: ${roomCode}`,
        url: link,
      });
      return true;
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("[MULTIPLAYER] ❌ Share failed:", error);
      }
      return false;
    }
  } else {
    return await copyInviteLink(roomCode);
  }
}

// Initialize emoji picker
function initEmojiPicker() {
  emojiPicker.innerHTML = "";
  emojis.forEach((emoji) => {
    const option = document.createElement("button");
    option.className = "emoji-option";
    option.textContent = emoji;
    option.setAttribute("data-emoji", emoji);
    option.addEventListener("click", (e) => {
      e.preventDefault();
      selectEmoji(emoji);
    });
    emojiPicker.appendChild(option);
  });
}

// Select emoji from picker or custom input
function selectEmoji(emoji) {
  emojiDisplay.textContent = emoji;
  sessionStorage.setItem('currentEmojiSelection', emoji);
  emojiModal.classList.add("hidden");
}

// Custom emoji input handler
useCustomEmojiBtn.addEventListener("click", () => {
  const input = customEmojiInput.value;
  const validation = validateCustomEmoji(input);
  if (validation.valid) {
    selectEmoji(validation.emoji);
    customEmojiHint.textContent = "✓ Custom emoji selected!";
    customEmojiHint.style.color = "var(--success)";
    setTimeout(() => {
      emojiModal.classList.add("hidden");
      customEmojiInput.value = "";
      customEmojiHint.textContent = "Paste a single emoji character";
      customEmojiHint.style.color = "var(--info)";
    }, 800);
  } else {
    customEmojiHint.textContent = "✗ " + validation.error;
    customEmojiHint.style.color = "var(--danger)";
    customEmojiInput.classList.add("shake");
    setTimeout(() => {
      customEmojiInput.classList.remove("shake");
    }, 500);
  }
});

// Submit custom emoji on Enter key
customEmojiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    useCustomEmojiBtn.click();
  }
});

// Reset custom emoji hint on input
customEmojiInput.addEventListener("input", () => {
  customEmojiHint.textContent = "Paste a single emoji character";
  customEmojiHint.style.color = "var(--info)";
});

// Set default to "❌" on initial load (hosting player default)
// emojiDisplay.textContent = "❌";

// Initialize emoji picker so users can customize
initEmojiPicker();

// Check for room code in URL on page load
checkForRoomInURL();

// Emoji modal toggle
emojiToggle.addEventListener("click", () => {
  emojiModal.classList.remove("hidden");
});

closeEmojiModal.addEventListener("click", () => {
  emojiModal.classList.add("hidden");
});

emojiModal.addEventListener("click", (e) => {
  if (e.target === emojiModal) {
    emojiModal.classList.add("hidden");
  }
});

// Toggle modules when buttons clicked
createRoomBtn.addEventListener("click", (e) => {
  if (!createModule.classList.contains("hidden")) {
    return;
  }

  // Set default emoji to "❌" for hosting player if desired
  // emojiDisplay.textContent = "❌";

  createModule.classList.remove("hidden");
  joinModule.classList.add("hidden");

  joinRoomBtn.disabled = false;
  joinStatus.textContent = "";
  roomCodeInput.value = "";

  // Re-enable create button when switching back
  createRoomBtn.disabled = false;
  createRoomBtn.style.opacity = "1";

  // Display existing code or placeholder
  if (generatedRoomCode) {
    roomCodeDisplay.textContent = generatedRoomCode;
    inviteLinkDisplay.textContent = generateInviteLink(generatedRoomCode);
  } else {
    roomCodeDisplay.textContent = "XXXX";
    inviteLinkDisplay.textContent = "Link will appear here...";
  }
});

// Join game handler with full logic
joinRoomBtn.addEventListener("click", async () => {
  const code = roomCodeInput.value.trim().toUpperCase();

  if (code.length !== 4) {
    joinStatus.textContent = "Please enter a valid 4-character room code";
    joinStatus.style.color = "var(--danger)";
    return;
  }

  joinRoomBtn.disabled = true;
  joinStatus.textContent = "Joining...";
  joinStatus.style.color = "var(--info)";

  const selectedEmoji = emojiDisplay.textContent;

  try {
    const snapshot = await db.ref("rooms/" + code).once("value");

    if (!snapshot.exists()) {
      joinStatus.textContent = "Game not found";
      joinStatus.style.color = "var(--danger)";
      joinRoomBtn.disabled = false;
      return;
    }

    const room = snapshot.val();

    if (room.guestJoined) {
      joinStatus.textContent = "Game is full";
      joinStatus.style.color = "var(--danger)";
      joinRoomBtn.disabled = false;
      return;
    }

    const updateData = {
      guestJoined: true,
      guestEmoji: selectedEmoji,
    };

    if (!room.board) {
      updateData.board = {
        0: null,
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
        7: null,
        8: null,
      };
    }

    if (!room.turn) {
      updateData.turn = "host";
    }

    await db.ref("rooms/" + code).update(updateData);

    joinStatus.textContent = "Joined! Starting game...";
    joinStatus.style.color = "var(--success)";

    sessionStorage.setItem("roomCode", code);
    sessionStorage.setItem("isHost", "false");
    sessionStorage.setItem("mySymbol", selectedEmoji);
    sessionStorage.setItem("opponentSymbol", room.hostEmoji);

    setTimeout(() => {
      window.location.href = "game.html";
    }, 300);

  } catch (error) {
    console.error("[MULTIPLAYER] ❌ Error joining game:", error);
    joinStatus.textContent = "Error joining game";
    joinStatus.style.color = "var(--danger)";
    joinRoomBtn.disabled = false;
  }
});

// Smart UI feedback on room code input
roomCodeInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (e.target.value.length === 4) {
    joinRoomBtn.textContent = "START GAME";
    joinRoomBtn.classList.add("glow");
    createRoomBtn.disabled = true;
    createRoomBtn.style.opacity = "0.4";
    createRoomBtn.style.cursor = "not-allowed";
    createRoomBtn.title = "Clear the room code to create a new game";
  } else {
    joinRoomBtn.textContent = "Join Game";
    joinRoomBtn.classList.remove("glow");
    createRoomBtn.disabled = false;
    createRoomBtn.style.opacity = "1";
    createRoomBtn.style.cursor = "pointer";
    createRoomBtn.title = "";
  }

  joinStatus.textContent = "";
});

// Copy room code button
copyCodeBtn?.addEventListener("click", async () => {
  try {
    const code = roomCodeDisplay.textContent;
    await navigator.clipboard.writeText(code);

    const originalText = copyCodeBtn.textContent;
    copyCodeBtn.textContent = "✓";
    copyCodeBtn.style.background = "var(--success)";

    setTimeout(() => {
      copyCodeBtn.textContent = originalText;
      copyCodeBtn.style.background = "";
    }, 1500);
  } catch (error) {
    console.error("[MULTIPLAYER] ❌ Copy failed:", error);
  }
});

// Copy invite link button
copyLinkBtn?.addEventListener("click", async () => {
  if (generatedRoomCode) {
    await copyInviteLink(generatedRoomCode);
  }
});

// Share invite link button
shareLinkBtn?.addEventListener("click", async () => {
  if (generatedRoomCode) {
    await shareInviteLink(generatedRoomCode);
  }
});

// Paste room code button
pasteCodeBtn?.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();

    // Check if it's a full URL
    let sanitized;
    if (text.includes("?room=")) {
      const urlParams = new URLSearchParams(text.split("?")[1]);
      sanitized = urlParams.get("room") || "";
    } else {
      sanitized = text;
    }

    sanitized = sanitized
      .toUpperCase()
      .substring(0, 4)
      .replace(/[^A-Z0-9]/g, "");

    roomCodeInput.value = sanitized;

    // Trigger input event to update button text and UI state
    roomCodeInput.dispatchEvent(new Event("input"));
  } catch (error) {
    console.error("[MULTIPLAYER] ❌ Paste failed:", error);
  }
});
