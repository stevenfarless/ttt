// multiplayer.js

import { firebaseConfig, clearStoredLogs, validateCustomEmoji } from "./utils.js";

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
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

  // Track generated room code
  let generatedRoomCode = null;

  // Restore persisted emoji selection
  const persistedEmoji = sessionStorage.getItem('currentEmojiSelection');
  if (persistedEmoji && emojiDisplay) {
    emojiDisplay.textContent = persistedEmoji;
  } else if (emojiDisplay && !emojiDisplay.textContent) {
    emojiDisplay.textContent = "❌";
  }

  // Custom emoji input scroll handler
  if (customEmojiInput) {
    customEmojiInput.addEventListener('focus', function () {
      setTimeout(() => {
        customEmojiInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  }

  // ============================================
  // URL PARAMETER HANDLING
  // ============================================
  function checkForRoomInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get("room");

    if (roomCode && roomCode.length >= 4) {
      const sanitizedCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (sanitizedCode.length === 4) {
        if (emojiDisplay && (!emojiDisplay.textContent || emojiDisplay.textContent === "❌")) {
          emojiDisplay.textContent = "⭕";
        }
        if (joinModule) joinModule.classList.remove("hidden");
        if (createModule) createModule.classList.add("hidden");
        if (roomCodeInput) {
          roomCodeInput.value = sanitizedCode;
          roomCodeInput.dispatchEvent(new Event("input"));
        }
        if (joinRoomBtn) {
          joinRoomBtn.textContent = "START GAME";
          joinRoomBtn.classList.add("glow");
        }
        if (createRoomBtn) {
          createRoomBtn.disabled = true;
          createRoomBtn.style.opacity = "0.4";
          createRoomBtn.style.cursor = "not-allowed";
          createRoomBtn.title = "Clear the room code to create a new game";
        }
        if (joinStatus) {
          joinStatus.textContent = "Room code loaded from link.\nReady to join!";
          joinStatus.style.color = "var(--success)";
        }
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
      if (copyLinkBtn) {
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = "✓ Copied!";
        copyLinkBtn.style.background = "var(--success)";
        setTimeout(() => {
          copyLinkBtn.textContent = originalText;
          copyLinkBtn.style.background = "";
        }, 2000);
      }
      return true;
    } catch (error) {
      console.error("[MULTIPLAYER] ❌ Failed to copy invite link:", error);
      if (copyLinkBtn) {
        copyLinkBtn.textContent = "❌ Failed";
        setTimeout(() => {
          copyLinkBtn.textContent = "📋 Copy Link";
        }, 2000);
      }
      return false;
    }
  }

  // Shares invite link using Web Share API
  async function shareInviteLink(roomCode) {
    const link = generateInviteLink(roomCode);
    const hostEmoji = emojiDisplay ? emojiDisplay.textContent : "❌";
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
    if (!emojiPicker) return;
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
    if (emojiDisplay) {
      emojiDisplay.textContent = emoji;
      sessionStorage.setItem('currentEmojiSelection', emoji);
    }
    if (emojiModal) {
      emojiModal.classList.add("hidden");
    }
  }

  // Custom emoji input handler
  if (useCustomEmojiBtn) {
    useCustomEmojiBtn.addEventListener("click", () => {
      if (!customEmojiInput) return;
      const input = customEmojiInput.value;
      const validation = validateCustomEmoji(input);
      if (validation.valid) {
        selectEmoji(validation.emoji);
        if (customEmojiHint) {
          customEmojiHint.textContent = "✓ Custom emoji selected!";
          customEmojiHint.style.color = "var(--success)";
        }
        setTimeout(() => {
          if (emojiModal) emojiModal.classList.add("hidden");
          customEmojiInput.value = "";
          if (customEmojiHint) {
            customEmojiHint.textContent = "Paste a single emoji character";
            customEmojiHint.style.color = "var(--info)";
          }
        }, 800);
      } else {
        if (customEmojiHint) {
          customEmojiHint.textContent = "✗ " + validation.error;
          customEmojiHint.style.color = "var(--danger)";
        }
        customEmojiInput.classList.add("shake");
        setTimeout(() => {
          customEmojiInput.classList.remove("shake");
        }, 500);
      }
    });
  }

  // Submit custom emoji on Enter key
  if (customEmojiInput) {
    customEmojiInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (useCustomEmojiBtn) useCustomEmojiBtn.click();
      }
    });

    customEmojiInput.addEventListener("input", () => {
      if (customEmojiHint) {
        customEmojiHint.textContent = "Paste a single emoji character";
        customEmojiHint.style.color = "var(--info)";
      }
    });
  }

  // Initialize emoji picker
  initEmojiPicker();

  // Check for room code in URL on page load
  checkForRoomInURL();

  // Emoji modal toggle handlers
  if (emojiToggle) {
    emojiToggle.addEventListener("click", () => {
      if (emojiModal) emojiModal.classList.remove("hidden");
    });
  }

  if (closeEmojiModal) {
    closeEmojiModal.addEventListener("click", () => {
      if (emojiModal) emojiModal.classList.add("hidden");
    });
  }

  if (emojiModal) {
    emojiModal.addEventListener("click", (e) => {
      if (e.target === emojiModal) {
        emojiModal.classList.add("hidden");
      }
    });
  }

  // Create room toggle UI
  if (createRoomBtn) {
    createRoomBtn.addEventListener("click", (e) => {
      if (createModule && !createModule.classList.contains("hidden")) return;

      if (createModule) createModule.classList.remove("hidden");
      if (joinModule) joinModule.classList.add("hidden");

      if (joinRoomBtn) joinRoomBtn.disabled = false;
      if (joinStatus) joinStatus.textContent = "";
      if (roomCodeInput) roomCodeInput.value = "";

      if (createRoomBtn) {
        createRoomBtn.disabled = false;
        createRoomBtn.style.opacity = "1";
      }

      if (generatedRoomCode) {
        if (roomCodeDisplay) roomCodeDisplay.textContent = generatedRoomCode;
        if (inviteLinkDisplay) inviteLinkDisplay.textContent = generateInviteLink(generatedRoomCode);
      } else {
        if (roomCodeDisplay) roomCodeDisplay.textContent = "XXXX";
        if (inviteLinkDisplay) inviteLinkDisplay.textContent = "Link will appear here...";
      }
    });
  }

  // Create game handler
  if (createRoomBtn) {
    createRoomBtn.addEventListener("click", async () => {
      if (createRoomBtn.disabled) return;

      const selectedEmoji = emojiDisplay ? emojiDisplay.textContent : "❌";

      if (generatedRoomCode) {
        if (createModule) createModule.classList.remove("hidden");
        return;
      }

      createRoomBtn.disabled = true;

      const chars = "ABCDEFGHJKMNPQRSTUVWXYZ123456789";
      let code = "";
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      generatedRoomCode = code;

      const firstTurn = Math.random() < 0.5 ? "host" : "guest";

      const roomData = {
        roomCode: code,
        hostJoined: true,
        guestJoined: false,
        hostEmoji: selectedEmoji,
        guestEmoji: null,
        board: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
        turn: firstTurn,
        winner: null,
      };

      db.ref("rooms/" + code)
        .set(roomData)
        .then(() => {
          if (roomCodeDisplay) roomCodeDisplay.textContent = code;
          if (inviteLinkDisplay) inviteLinkDisplay.textContent = generateInviteLink(code);
          if (createStatus) {
            createStatus.textContent = `Waiting for opponent... (Player to start: ${firstTurn === "host" ? "You" : "Opponent"})`;
            createStatus.style.color = "var(--warning)";
          }

          sessionStorage.setItem("roomCode", code);
          sessionStorage.setItem("isHost", "true");
          sessionStorage.setItem("mySymbol", selectedEmoji);

          const roomRef = db.ref("rooms/" + code);

          roomRef.on("value", (snapshot) => {
            const room = snapshot.val();
            if (room && room.guestJoined && room.guestEmoji) {
              sessionStorage.setItem("opponentSymbol", room.guestEmoji);
              roomRef.off("value");
              setTimeout(() => (window.location.href = "game.html"), 300);
            }
          });
        })
        .catch((err) => {
          console.error("[MULTIPLAYER] ❌ Error creating game:", err);
          if (createStatus) {
            createStatus.textContent = "Error creating game";
            createStatus.style.color = "var(--danger)";
          }
          createRoomBtn.disabled = false;
          generatedRoomCode = null;
        });
    });
  }

  // Join game handler
  if (joinRoomBtn) {
    joinRoomBtn.addEventListener("click", async () => {
  console.log("Join button clicked");
  if (!roomCodeInput) return;

  const code = roomCodeInput.value.trim().toUpperCase();

  if (code.length !== 4) {
    if (joinStatus) {
      joinStatus.textContent = "Please enter a valid 4-character room code";
      joinStatus.style.color = "var(--danger)";
    }
    return;
  }

  joinRoomBtn.disabled = true;
  if (joinStatus) {
    joinStatus.textContent = "Joining...";
    joinStatus.style.color = "var(--info)";
  }

  const selectedEmoji = emojiDisplay ? emojiDisplay.textContent : "⭕";

  try {
    const snapshot = await db.ref("rooms/" + code).once("value");

    if (!snapshot.exists()) {
      if (joinStatus) {
        joinStatus.textContent = "Game not found";
        joinStatus.style.color = "var(--danger)";
      }
      joinRoomBtn.disabled = false;
      return;
    }

    const room = snapshot.val();

    if (room.guestJoined) {
      if (joinStatus) {
        joinStatus.textContent = "Game is full";
        joinStatus.style.color = "var(--danger)";
      }
      joinRoomBtn.disabled = false;
      return;
    }

    const updateData = {
      guestJoined: true,
      guestEmoji: selectedEmoji,
    };

    if (!room.board) {
      updateData.board = {
        0: null,1: null,2: null,3: null,4: null,5: null,6: null,7: null,8: null,
      };
    }

    if (!room.turn) {
      updateData.turn = "host";
    }

    await db.ref("rooms/" + code).update(updateData);

    if (joinStatus) {
      joinStatus.textContent = "Joined! Starting game...";
      joinStatus.style.color = "var(--success)";
    }

    sessionStorage.setItem("roomCode", code);
    sessionStorage.setItem("isHost", "false");
    sessionStorage.setItem("mySymbol", selectedEmoji);
    sessionStorage.setItem("opponentSymbol", room.hostEmoji);

    setTimeout(() => {
      window.location.href = "game.html";
    }, 300);
  } catch (error) {
    console.error("[MULTIPLAYER] ❌ Error joining game:", error);
    if (joinStatus) {
      joinStatus.textContent = "Error joining game";
      joinStatus.style.color = "var(--danger)";
    }
    joinRoomBtn.disabled = false;
  }
});

