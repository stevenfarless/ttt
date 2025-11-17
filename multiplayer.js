// multiplayer.js

import { firebaseConfig, clearStoredLogs } from "./utils.js";

// Initialize Firebase App if not already initialized to avoid duplicate initializations
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const DEBUG = true; // Debug flag for console logs
const db = firebase.database(); // Firebase Realtime Database instance

// Define an array of available emoji icons for players to select
const emojis = [
  "❌", "⭕", "❤️", "💲", "😀", "💀", "🤖",
  "👽", "🐶", "😺", "💩", "🦐", "🍕", "🍣",
  "🍓", "🍤", "🌙", "☀️", "⭐", "🚀",
];

// Cache references to DOM elements used for UI interaction
const emojiDisplay = document.getElementById("emojiDisplay");
const emojiToggle = document.getElementById("emojiToggle");
const emojiModal = document.getElementById("emojiModal");
const closeEmojiModal = document.getElementById("closeEmojiModal");
const emojiPicker = document.getElementById("emojiPicker");
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

// Store the generated room code globally here
let generatedRoomCode = null;

// Function: Checks URL query parameters for a room code to enable instant joining
function checkForRoomInURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomCode = urlParams.get("room");

  if (roomCode && roomCode.length === 4) {
    // Sanitize to uppercase alphanumeric only to avoid injection or invalid chars
    const sanitizedCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (sanitizedCode.length === 4) {
      // Show join UI, hide create UI
      joinModule.classList.remove("hidden");
      createModule.classList.add("hidden");

      // Pre-fill room code in input box for joining
      roomCodeInput.value = sanitizedCode;
      roomCodeInput.dispatchEvent(new Event("input"));

      // Update join button UI to emphasize action
      joinRoomBtn.textContent = "START GAME";
      joinRoomBtn.classList.add("glow");

      // Disable create button to prevent conflict while joining
      createRoomBtn.disabled = true;
      createRoomBtn.style.opacity = "0.4";
      createRoomBtn.style.cursor = "not-allowed";
      createRoomBtn.title = "Clear the room code to create a new game";

      // Inform user the room code was loaded from the URL link
      joinStatus.textContent = "Room code loaded from link.\nReady to join!";
      joinStatus.style.color = "var(--success)";

      // Optionally remove room parameter from URL after processing
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
  }
  return false;
}

// Function: Generate shareable invite link with room code as query parameter
function generateInviteLink(roomCode) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?room=${roomCode}`;
}

// Function: Copy invite link to clipboard with visual feedback on success/failure
async function copyInviteLink(roomCode) {
  const link = generateInviteLink(roomCode);
  try {
    await navigator.clipboard.writeText(link);

    // Temporary UI change on successful copy
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

// Function: Use Web Share API to share invite link on supported platforms (mobile friendly fallback)
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
    // Fallback to copy functionality if Web Share API is not supported
    return await copyInviteLink(roomCode);
  }
}

// Initialize emoji picker UI with available emoji options
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

// Sets the chosen emoji as current emoji and hides picker modal
function selectEmoji(emoji) {
  emojiDisplay.textContent = emoji;
  emojiModal.classList.add("hidden");
}

// Returns a random emoji from the emoji array for initial display
function getRandomEmoji() {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  return emoji;
}

// Initialize emoji display and picker on page load
const initialEmoji = getRandomEmoji();
emojiDisplay.textContent = initialEmoji;
initEmojiPicker();

// Automatically load room if present in URL
checkForRoomInURL();

// Toggle emoji picker modal visibility on button click
emojiToggle.addEventListener("click", () => {
  emojiModal.classList.remove("hidden");
});

// Close emoji picker modal on close button or clicking outside content
closeEmojiModal.addEventListener("click", () => {
  emojiModal.classList.add("hidden");
});
emojiModal.addEventListener("click", (e) => {
  if (e.target === emojiModal) {
    emojiModal.classList.add("hidden");
  }
});

// UI toggles between create and join modules for game lobby
createRoomBtn.addEventListener("click", () => {
  if (!createModule.classList.contains("hidden")) {
    return;
  }
  createModule.classList.remove("hidden");
  joinModule.classList.add("hidden");
  joinRoomBtn.disabled = false;
  joinStatus.textContent = "";

  // Re-enable create room button styling
  createRoomBtn.disabled = false;
  createRoomBtn.style.opacity = "1";

  // Display generated room if exists
  if (generatedRoomCode) {
    roomCodeDisplay.textContent = generatedRoomCode;
    inviteLinkDisplay.textContent = generateInviteLink(generatedRoomCode);
  } else {
    roomCodeDisplay.textContent = "XXXX";
    inviteLinkDisplay.textContent = "Link will appear here...";
  }
});

joinRoomBtn.addEventListener("click", () => {
  if (!joinModule.classList.contains("hidden")) {
    return;
  }
  joinModule.classList.remove("hidden");
  createModule.classList.add("hidden");

  // Reset create button styling when switching to join
  createRoomBtn.disabled = false;
  createStatus.textContent = "";
  createRoomBtn.style.opacity = "1";
});

// Room code input validation and UI state updates on input changes
roomCodeInput.addEventListener("input", (e) => {
  const originalValue = e.target.value;

  // Enforce uppercase letters and digits only, strip invalid chars
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Adjust create and join buttons based on valid code input
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

  // Clear join status feedback while typing
  joinStatus.textContent = "";
});

// Clipboard copy of room code with UI feedback
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

// Clipboard copy for invite link
copyLinkBtn?.addEventListener("click", async () => {
  if (generatedRoomCode) {
    await copyInviteLink(generatedRoomCode);
  }
});

// Share invite link button for Web Share API or fallback copy
shareLinkBtn?.addEventListener("click", async () => {
  if (generatedRoomCode) {
    await shareInviteLink(generatedRoomCode);
  }
});

// Paste clipboard content into room code input, sanitized
pasteCodeBtn?.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();

    // Extract room code param if full URL pasted
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

    // Trigger input event to update UI state accordingly
    roomCodeInput.dispatchEvent(new Event("input"));
  } catch (error) {
    console.error("[MULTIPLAYER] ❌ Paste failed:", error);
  }
});
