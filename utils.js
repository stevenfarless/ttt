// utils.js

// Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAQO1xbKz5yjo3TAqqU1gFZYrI-qBugRNs",
  authDomain: "tic-tac-toe-80bd7.firebaseapp.com",
  databaseURL: "https://tic-tac-toe-80bd7-default-rtdb.firebaseio.com",
  projectId: "tic-tac-toe-80bd7",
  storageBucket: "tic-tac-toe-80bd7.firebasestorage.app",
  messagingSenderId: "423174319963",
  appId: "1:423174319963:web:c5329be46c388da0eb347e",
  measurementId: "G-2WC5RPCT3Q",
};

// Utility Functions
export function generateRoomCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function showError(element, message, timeout = 5000) {
  element.textContent = message;
  element.classList.add("error");
  if (timeout) {
    setTimeout(() => {
      element.textContent = "";
      element.classList.remove("error");
    }, timeout);
  }
}

export function validateRoomCode(code) {
  return /^[A-HJ-KM-NP-Z1-9]{4}$/.test(code.trim().toUpperCase());
}

export function sanitizeEmojiChoice(choice, allowedEmojis) {
  return allowedEmojis.includes(choice) ? choice : allowedEmojis[0];
}
