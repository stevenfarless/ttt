export function generateRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

export function validateRoomCode(code) {
  return /^[A-HJ-KM-NP-Z1-9]{4}$/.test(code.trim().toUpperCase());
}

export function sanitizeEmojiChoice(choice, allowedEmojis) {
  return allowedEmojis.includes(choice) ? choice : allowedEmojis[0];
}
