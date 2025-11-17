/**
 * Parses URL parameters and auto-joins room if present.
 * Checks if URL contains a "room" query parameter with a valid 4-character code.
 * If valid, the join game UI module is shown and pre-filled with the code.
 * The create game button is disabled to prevent conflicts.
 * Updates the join status with a success message.
 * Optionally cleans the URL by removing the query parameters.
 * 
 * @returns {boolean} True if a valid room code was found and loaded, else false.
 */
function checkForRoomInURL() {
  // Parse the query parameters from the URL
  const urlParams = new URLSearchParams(window.location.search);
  // Get the 'room' parameter from URL
  const roomCode = urlParams.get("room");

  // Only proceed if room code exists and is exactly 4 characters
  if (roomCode && roomCode.length === 4) {
    // Sanitize input: uppercase and keep only letters A-Z and digits 0-9
    const sanitizedCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    // Confirm sanitized code is still 4 characters
    if (sanitizedCode.length === 4) {
      // Show the "join game" module and hide the "create game" module
      joinModule.classList.remove("hidden");
      createModule.classList.add("hidden");

      // Pre-fill the join room input with the sanitized code
      roomCodeInput.value = sanitizedCode;
      // Dispatch an 'input' event to trigger any input listeners (e.g., validation)
      roomCodeInput.dispatchEvent(new Event("input"));

      // Change join button text to indicate ready to start game
      joinRoomBtn.textContent = "START GAME";
      // Add a glowing effect class to the join button to highlight it
      joinRoomBtn.classList.add("glow");

      // Disable and visually dim the create game button to prevent new room creation
      createRoomBtn.disabled = true;
      createRoomBtn.style.opacity = "0.4";
      createRoomBtn.style.cursor = "not-allowed";
      // Add tooltip text explaining the button is disabled
      createRoomBtn.title = "Clear the room code to create a new game";

      // Update join status area with success message in green text
      joinStatus.textContent = "Room code loaded from link.\nReady to join!";
      joinStatus.style.color = "var(--success)";

      // Optionally replace browser history state to remove URL query parameters from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
  }
  // Return false if no valid room code found in URL
  return false;
}

// ^^^^^^^^^^ DONE 1 **************************************************************************
// break section ******************************************************************************

/**
* Generates shareable invitation link
*/
function generateInviteLink(roomCode) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?room=${roomCode}`;
}

/**
* Copies invite link to clipboard
*/
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

/**
* Shares invite link using Web Share API (mobile-friendly)
*/
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
  emojis.forEach((emoji, index) => {
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

function selectEmoji(emoji) {
  emojiDisplay.textContent = emoji;
  emojiModal.classList.add("hidden");
}

function getRandomEmoji() {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  return emoji;
}

// Set random emoji on page load
const initialEmoji = getRandomEmoji();
emojiDisplay.textContent = initialEmoji;
initEmojiPicker();

// Check for room code in URL on page load
checkForRoomInURL();

// break section ******************************************************************************

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

  createModule.classList.remove("hidden");
  joinModule.classList.add("hidden");
  joinRoomBtn.disabled = false;
  joinStatus.textContent = "";
  roomCodeInput.value = "";

  // ✅ Re-enable create button when switching back
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

joinRoomBtn.addEventListener("click", (e) => {
  if (!joinModule.classList.contains("hidden")) {
    return;
  }

  joinModule.classList.remove("hidden");
  createModule.classList.add("hidden");
  createRoomBtn.disabled = false;
  createStatus.textContent = "";

  // ✅ Reset create button styling when joining
  createRoomBtn.style.opacity = "1";
});

// ============================================
// ✅ Smart UI feedback for room code input
// ============================================
roomCodeInput.addEventListener("input", (e) => {
  const originalValue = e.target.value;
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Update button text and disable Create Game when valid code entered
  if (e.target.value.length === 4) {
    // ✅ Valid code entered - dim/disable Create Game button
    joinRoomBtn.textContent = "START GAME";
    joinRoomBtn.classList.add("glow"); // ✅ ADD GLOW EFFECT
    createRoomBtn.disabled = true;
    createRoomBtn.style.opacity = "0.4";
    createRoomBtn.style.cursor = "not-allowed";
    createRoomBtn.title = "Clear the room code to create a new game";
  } else {
    // ✅ Invalid or incomplete code - re-enable Create Game button
    joinRoomBtn.textContent = "Join Game";
    joinRoomBtn.classList.remove("glow"); // ✅ REMOVE GLOW EFFECT
    createRoomBtn.disabled = false;
    createRoomBtn.style.opacity = "1";
    createRoomBtn.style.cursor = "pointer";
    createRoomBtn.title = "";
  }

  // Clear status when user is typing
  joinStatus.textContent = "";
});


// Copy room code
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

// break section ******************************************************************************


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

// Paste room code
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

// Create game
createRoomBtn.addEventListener("click", () => {
  // ✅ Prevent creating if button is disabled (valid code entered in join field)
  if (createRoomBtn.disabled) {
    return;
  }

  // If code already exists, just show the module
  if (generatedRoomCode) {
    createModule.classList.remove("hidden");
    return;
  }

  createRoomBtn.disabled = true;

  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  generatedRoomCode = code;
  const selectedEmoji = emojiDisplay.textContent;

  const roomData = {
    roomCode: code,
    hostJoined: true,
    guestJoined: false,
    hostEmoji: selectedEmoji,
    guestEmoji: null,
    board: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
    },
    turn: "host",
    winner: null,
  };

  db.ref("rooms/" + code)
    .set(roomData)
    .then(() => {
      roomCodeDisplay.textContent = code;
      const inviteLink = generateInviteLink(code);
      inviteLinkDisplay.textContent = inviteLink;
      createStatus.textContent = "Waiting for opponent...";
      createStatus.style.color = "var(--warning)";

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
      createStatus.textContent = "Error creating game";
      createStatus.style.color = "var(--danger)";
      createRoomBtn.disabled = false;
      generatedRoomCode = null;
    });
});

// Join game
joinRoomBtn.addEventListener("click", () => {
  const code = roomCodeInput.value.trim().toUpperCase();

  if (code.length !== 4) {
    return;
  }

  joinRoomBtn.disabled = true;

  const selectedEmoji = emojiDisplay.textContent;

  db.ref("rooms/" + code)
    .once("value")
    .then((snapshot) => {
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

      db.ref("rooms/" + code)
        .update(updateData)
        .then(() => {
          joinStatus.textContent = "Joined! Starting game...";
          joinStatus.style.color = "var(--success)";

          sessionStorage.setItem("roomCode", code);
          sessionStorage.setItem("isHost", "false");
          sessionStorage.setItem("mySymbol", selectedEmoji);
          sessionStorage.setItem("opponentSymbol", room.hostEmoji);

          setTimeout(() => (window.location.href = "game.html"), 300);
        })
        .catch((err) => {
          console.error("[MULTIPLAYER] ❌ Error joining:", err);
          joinStatus.textContent = "Error joining game";
          joinStatus.style.color = "var(--danger)";
          joinRoomBtn.disabled = false;
        });
    });
});
