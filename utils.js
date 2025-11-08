// utils.js

console.log('[UTILS] 🔧 Utils module loading...');

// Firebase Configuration
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

console.log('[UTILS] ✅ Firebase config loaded');

// Utility Functions
export function generateRoomCode() {
  const startTime = performance.now();
  console.log('[UTILS] 🎲 Generating room code...');
  
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const endTime = performance.now();
  console.log(`[UTILS] ✅ Room code generated: ${code} (took ${(endTime - startTime).toFixed(2)}ms)`);
  return code;
}

export function showError(element, message, timeout = 5000) {
  console.log(`[UTILS] ⚠️ Showing error: "${message}" (timeout: ${timeout}ms)`);
  
  element.textContent = message;
  element.classList.add('error');
  
  if (timeout) {
    setTimeout(() => {
      element.textContent = '';
      element.classList.remove('error');
      console.log('[UTILS] ✅ Error message cleared');
    }, timeout);
  }
}

export function validateRoomCode(code) {
  const startTime = performance.now();
  console.log(`[UTILS] 🔍 Validating room code: "${code}"`);
  
  const isValid = /^[A-HJ-KM-NP-Z1-9]{4}$/.test(code.trim().toUpperCase());
  const endTime = performance.now();
  
  console.log(`[UTILS] ${isValid ? '✅' : '❌'} Room code "${code}" is ${isValid ? 'valid' : 'invalid'} (checked in ${(endTime - startTime).toFixed(2)}ms)`);
  return isValid;
}

export function sanitizeEmojiChoice(choice, allowedEmojis) {
  const startTime = performance.now();
  console.log(`[UTILS] 🎨 Sanitizing emoji choice: ${choice}`);
  
  const sanitized = allowedEmojis.includes(choice) ? choice : allowedEmojis[0];
  const endTime = performance.now();
  
  if (choice !== sanitized) {
    console.log(`[UTILS] ⚠️ Emoji "${choice}" not allowed, using default: ${sanitized} (took ${(endTime - startTime).toFixed(2)}ms)`);
  } else {
    console.log(`[UTILS] ✅ Emoji "${choice}" validated (took ${(endTime - startTime).toFixed(2)}ms)`);
  }
  
  return sanitized;
}

console.log('[UTILS] ✅ Utils module loaded successfully');
