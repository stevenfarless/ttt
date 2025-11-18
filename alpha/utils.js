// utils.js

// Firebase Configuration object containing all keys and identifiers to connect to Firebase services
const firebaseConfig = {
  apiKey: "AIzaSyAQO1xbKz5yjo3TAqqU1gFZYrI-qBugRNs",
  authDomain: "tic-tac-toe-80bd7.firebaseapp.com",
  databaseURL: "https://tic-tac-toe-80bd7-default-rtdb.firebaseio.com",
  projectId: "tic-tac-toe-80bd7",
  storageBucket: "tic-tac-toe-80bd7.firebasestorage.app",
  messagingSenderId: "423174319963",
  appId: "1:423174319963:web:c5329be46c388da0eb347e",
  measurementId: "G-2WC5RPCT3Q"
};


// Utility Functions

/**
 * Generates a random 4-character room code using a predefined character set.
 * The characters exclude ambiguous ones like I, L, O, and 0 for clarity.
 * @returns {string} - A 4-character uppercase room code
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789'; // Allowed characters (no I, L, O, or 0)
  let code = '';
  for (let i = 0; i < 4; i++) {
    // Pick a random character from chars and append to code
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Displays an error message inside a given HTML element and adds 'error' CSS class.
 * Optionally clears the message and error styling after specified timeout.
 * @param {HTMLElement} element - The DOM element to show error in
 * @param {string} message - The error message text to display
 * @param {number} timeout - Duration in ms to show error before clearing (default 5000ms)
 */
function showError(element, message, timeout = 5000) {
  element.textContent = message;           // Set text content with error message
  element.classList.add('error');          // Add 'error' class for styling
  if (timeout) {
    // Clear message and error styling after timeout
    setTimeout(() => {
      element.textContent = '';
      element.classList.remove('error');
    }, timeout);
  }
}

/**
 * Validates a room code string.
 * Ensures it is exactly 4 characters, uppercase, and only allowed characters.
 * @param {string} code - The room code string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateRoomCode(code) {
  // Regex explanation:
  // ^ = start of string
  // [A-HJ-KM-NP-Z1-9]{4} = exactly 4 chars, in allowed range (no ambiguous letters/numbers)
  // $ = end of string
  // trim and uppercase to normalize input before testing
  return /^[A-HJ-KM-NP-Z1-9]{4}$/.test(code.trim().toUpperCase());
}

/**
 * Sanitizes a chosen emoji from the user against a list of allowed emojis.
 * Returns the choice if allowed, otherwise defaults to the first allowed emoji.
 * @param {string} choice - The emoji chosen by the user
 * @param {string[]} allowedEmojis - Array of string emojis allowed in the game
 * @returns {string} - The sanitized emoji choice
 */
function sanitizeEmojiChoice(choice, allowedEmojis) {
  return allowedEmojis.includes(choice) ? choice : allowedEmojis[0];
}


// Placeholder functions kept for backwards compatibility.
// They used to handle console log persistence but now do nothing.

/**
 * Placeholder function to replay stored logs (no operation).
 */
function replayStoredLogs() {
  // Removed: console log persistence system
}

/**
 * Placeholder function to clear stored logs (no operation).
 */
function clearStoredLogs() {
  // Removed: console log persistence system
}
