# 🎮 TTT - 2 Player Emoji Tic Tac Toe

**Version:** 2.2.2 | **Release Date:** November 15, 2025

A modern, real-time multiplayer Tic Tac Toe game with custom emoji pieces, visual gradients, role-based player tracking, and enhanced multiplayer sharing features, built with vanilla JavaScript and Firebase.

---

## 🆕 What's New in v2.2.2

### Major Improvements

- **✨ Enhanced Visual Effects**  
  Improved gradient effects with blue glow for your moves and red glow for opponent moves, now applied to both game cells and player indicators.

- **🎯 Smarter UI Feedback**  
  The interface now intelligently disables "Create Game" when you enter a valid room code in the join field, and adds a glowing "START GAME" button for better user experience.

- **📱 Improved Mobile Experience**  
  Optimized spacing, font sizes, and button layouts for better mobile usability with tighter, more efficient spacing.

- **⚡ Performance Optimization**  
  Removed extensive debug logging for cleaner, faster code execution in production.

---

## ✨ Features

- **🎯 Classic Tic Tac Toe Gameplay** – The timeless 3x3 grid game you know and love  
- **👥 Real-Time Multiplayer** – Live game sync powered by Firebase  
- **🎨 Custom Emoji Pieces** – Choose from 20+ emojis (both players can use the same emoji!)  
- **🌈 Enhanced Visual Effects** – Blue glow for your moves, red glow for opponent's moves on both cells and player indicators  
- **🏠 Room Codes & Invite Links** – Share a 4-character room code or invite link with your opponent to join a game  
- **⚡ Real-Time Sync** – Moves sync instantly across both players' screens  
- **🔄 Role-Based Player Tracking** – Host and Guest roles for reliable game state management  
- **🎮 Smart UI Feedback** – Intuitive button states and visual cues guide players through the game flow  
- **📱 Mobile Friendly & Responsive** – Optimized for desktop, tablet, and mobile devices  

---

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)  
- Internet connection  
- Firebase Realtime Database (for multiplayer functionality)  

### Installation

1. **Clone the repository**

   ```
   git clone https://github.com/stevenfarless/ttt.git
   cd ttt
   ```

2. **Open in your browser**

   ```
   open index.html
   ```

3. **Configure Firebase (Multiplayer Mode)**  
   - Go to [Firebase Console](https://console.firebase.google.com)  
   - Create a new project  
   - Enable Realtime Database  
   - Copy your Firebase config from Project Settings  
   - Update the Firebase configuration in `utils.js` with your credentials:

   ```
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## 🎮 How to Play Multiplayer

### Player 1 (Host)

1. Open `index.html`  
2. Select your emoji piece from the picker  
3. Click **"Create Game"**  
4. Share the 4-character room code or invite link with Player 2  

### Player 2 (Guest)

1. Open `index.html` or click the invite link from Player 1
2. Select your emoji piece (can be the same as Player 1!)  
3. Enter the room code or use the invite link from Player 1  
4. Click **"START GAME"** (button glows when ready!)

### Playing

- Players take turns clicking cells on the 3x3 grid  
- Host (Player 1) always goes first  
- **Your moves and turn indicator appear with BLUE gradient glow**  
- **Opponent's moves and turn indicator appear with RED gradient glow**  
- Win by getting three in a row (horizontal, vertical, or diagonal)  
- Game ends with a win or draw  
- Use **"Reset Game"** to start a new match  
- Use **"Back to Menu"** to return to the lobby  

---

## 🎨 Available Emoji Pieces

Choose any of these 20 emojis as your game piece (both players can use the same emoji!):

❌ ⭕ ❤️ 💲  
😀 💀 🤖 👽  
🐶 😺 💩 🦐  
🍕 🍣 🍓 🍤  
🌙 ☀️ ⭐ 🚀  

---

## 📁 Project Structure

```
ttt/
├── index.html              # Main menu/lobby
├── game.html               # Game board interface
├── style.css               # Game board UI styling
├── home.css                # Lobby styling
├── multiplayer.js          # Room creation, joining & invite link handling
├── game-multiplayer.js     # Game logic and Firebase sync
├── utils.js                # Utility functions and Firebase config
├── README.md               # Project information and instructions
└── LICENSE                 # License file
```

---

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and structure  
- **CSS3** - Modern styling with Flexbox, Grid, animations, and gradient effects  
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS with ES6 modules  
- **Firebase Realtime Database** - Real-time multiplayer synchronization  
- **Emoji Support** - Dynamic emoji rendering and display  

---

## 🐛 Recent Bug Fixes & Improvements

### v2.2.2

- Enhanced gradient visual effects for better player distinction
- Improved mobile UI spacing and responsiveness
- Added smart button states (glow effect on "START GAME")
- Optimized code by removing debug logging
- Fixed invite link auto-join button styling

### v2.1.0

- Fixed multiplayer synchronization issues  
- Stabilized automatic joining and room code retrieval  
- Improved user feedback and error handling  

---

## 🐞 Known Issues

- Occasional connection drops on unstable networks  
- Room data persists post-game in Firebase  
- Some UI inconsistencies on older devices  

---

## 🤝 Contributing

Contributions welcome! Please open issues or submit pull requests on GitHub.

---

## 📄 License

GPL 3 License - see LICENSE file.

---
