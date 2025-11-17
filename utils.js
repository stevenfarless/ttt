// utils.js

// Firebase Configuration Object
// Replace with your own Firebase project configuration details if you fork or reuse this project
export const firebaseConfig = {
  apiKey: "AIzaSyAQO1xbKz5yjo3TAqqU1gFZYrI-qBugRNs",
  authDomain: "tic-tac-toe-80bd7.firebaseapp.com",
  databaseURL: "https://tic-tac-toe-80bd7-default-rtdb.firebaseio.com",
  projectId: "tic-tac-toe-80bd7",
  storageBucket: "tic-tac-toe-80bd7.firebasestorage.app",
  messagingSenderId: "423174319963",
  appId: "1:423174319963:web:c5329be46c388da0eb347e",
  measurementId: "G-2WC5RPCT3Q"
};

/**
 * Generates a 4-character uppercase room code consisting of
 * letters and digits, excluding ambiguous characters.
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789'; // Excludes letters like I, L, O, 0 for clarity
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Displays an error message on a given DOM element temporarily.
 * Adds 'error' CSS class for styling.
 * Automatically clears message after `timeout` ms (default 5000).
 *
 * @param {HTMLElement} element - The DOM element to display error message in.
 * @param {string} message - The error message text to show.
 * @param {number} timeout - Optional duration in milliseconds before clearing the message.
 */
export function showError(element, message, timeout = 5000) {
  element.textContent = message;
  element.classList.add('error');

  if (timeout) {
    setTimeout(() => {
      element.textContent = '';
      element.classList.remove('error');
    }, timeout);
  }
}

// No-op functions for backward compatibility (currently unused)
export function clearStoredLogs() {
  // Placeholder function - logs are not stored in current version
}

export function replayStoredLogs() {
  // Placeholder function - logs are not stored in current version
}

