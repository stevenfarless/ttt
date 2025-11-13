# 🎮 TTT - 2 Player Emoji Tic Tac Toe

**Version:** 2.0.0 | **Release Date:** November 12, 2025

A modern, real-time multiplayer Tic Tac Toe game with custom emoji pieces, visual gradients, and role-based player tracking, built with vanilla JavaScript and Firebase.

## 🆕 What's New in v2.0.0

### Major Features

- **✨ Duplicate Emoji Selection** - Both players can now choose the same emoji without conflicts!
- **🎨 Visual Gradient Effects** - Blue radial glow behind your moves, red glow behind opponent's moves
- **🔄 Role-Based Architecture** - Backend now tracks players as Host/Guest for more reliable game state
- **♿ Enhanced Accessibility** - Better visual distinction through both color AND gradient highlights

### ⚠️ Breaking Changes

**Important:** v2.0.0 introduces architectural changes that makes it incompatible with v1.x games.

- All players must be on v2.0.0 to play together
- You may need to clear Firebase rooms from previous versions

---

## 📷 Screenshots

<img height="500" alt="image" src="https://github.com/user-attachments/assets/2be32ba4-c4c5-43a6-b0ec-9dc76ba95536" />

<img height="500" alt="image" src="https://github.com/user-attachments/assets/ec9cec66-785b-4324-ad91-bb75a88800a2" />

<img height="500" alt="image" src="https://github.com/user-attachments/assets/d839cca0-b27f-4023-ac32-592ef677358f" />


---

## ✨ Features

- **🎯 Classic Tic Tac Toe Gameplay** - The timeless 3x3 grid game you know and love
- **👥 Real-Time Multiplayer** - Firebase-powered live game synchronization
- **🎨 Custom Emoji Pieces** - Choose from 20+ emojis as your game piece
- **✨ Duplicate Emoji Support** - **NEW!** Both players can select the same emoji
- **🌈 Visual Gradient Effects** - **NEW!** Blue glow for your moves, red glow for opponent's moves
- **🎨 Player Perspective Colors** - Your moves in BLUE text, opponent's in RED text
- **🏠 Room Codes** - Share a 4-character room code with your opponent to join a game
- **📱 Mobile Responsive** - Play on desktop, tablet, or mobile seamlessly
- **⚡ Real-Time Sync** - Moves sync instantly across both players' screens
- **🎨 Dark UI** - Dracula-inspired color scheme with smooth animations
- **🔄 Role-Based Tracking** - **NEW!** More reliable player identification and turn management

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
   - Update the Firebase configuration in `multiplayer.js` with your credentials:

     ```
     const firebaseConfig = {
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
4. Share the 4-character room code with Player 2

### Player 2 (Guest)

1. Open `index.html`
2. Select your emoji piece (can be the same as Player 1!)
3. Enter the room code from Player 1
4. Click **"Join Game"**

### Playing

- Players take turns clicking cells on the 3x3 grid
- Host (Player 1) always goes first
- **Your moves appear with BLUE text + blue gradient glow**
- **Opponent's moves appear with RED text + red gradient glow**
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

![Recording 2025-11-12 041408](https://github.com/user-attachments/assets/351a60d8-7326-4ad2-af55-bfe272376687)

---

## 📁 Project Structure

```
ttt/
├── index.html              # Main menu/lobby
├── game.html               # Game board interface
├── style.css               # Game board styling (includes gradient effects)
├── home.css                # Menu styling
├── multiplayer.js          # Room creation & joining logic (role-based)
├── game-multiplayer.js     # Game logic & Firebase sync (role-based)
├── utils.js                # Utility functions & console logging
├── README.md               # This file
└── LICENSE                 # GPL License
```

---

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox, Grid, animations, and radial gradients
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS with ES6 modules
- **Firebase Realtime Database** - Real-time multiplayer synchronization
- **Emoji Support** - Dynamic emoji rendering and display

---

## 🏗️ Architecture (v2.0.0)

### Role-Based Player Identity

In v2.0.0, the backend tracks players as **Host** and **Guest** rather than by their chosen emojis. This allows:

- Both players to select the same emoji
- More reliable turn and winner detection
- Cleaner separation between game logic and visual display

### Data Structure

```
// Firebase stores roles, not emojis
room: {
  board: { 0: 'host', 1: 'guest', 2: null, ... },
  turn: 'host',  // or 'guest'
  winner: 'host', // or 'guest', or 'draw'
  hostEmoji: '🚀',
  guestEmoji: '🚀'  // Can be the same!
}
```

---

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🐛 Known Issues & Limitations

- Emoji rendering varies across browsers and operating systems
- Reconnection handling is basic (full page refresh recommended if disconnected)
- Room data persists in Firebase after game ends
- Player indicator updates may briefly lag on very slow connections
- Mobile emoji sizes may render inconsistently on older devices
- **Games from v1.x are incompatible with v2.0.0 due to architectural changes**

---

## 🗺️ Roadmap

- [x] ~~Visual gradients for player distinction~~ ✅ Completed in v2.0.0
- [x] ~~Duplicate emoji selection~~ ✅ Completed in v2.0.0
- [ ] Room cleanup automation
- [ ] AI opponent for single player
- [ ] User authentication & accounts
- [ ] Leaderboard and statistics tracking
- [ ] Sound effects toggle
- [ ] Dark/Light theme selector
- [ ] Tournament mode (best of 3/5)
- [ ] Custom username display

---

## 🔄 Migration from v1.x to v2.0.0

If you're upgrading from v1.x:

1. **Clear old Firebase rooms** - v1.x games won't work with v2.0.0
2. **Ensure all players update** - Mixed versions cannot play together
3. **No code changes needed** - Just pull the latest version
4. **Note:** Game data structure has changed (emoji-based → role-based)

---

## 🤝 Contributing

This project welcomes contributions and feedback! Please feel free to:

- Report bugs via GitHub Issues
- Suggest features and improvements
- Submit pull requests with enhancements
- Test on different devices and browsers

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

GPL 3 License - see LICENSE file for details

---

## 📞 Support & Feedback

Found a bug? Have a suggestion? Please open an issue on GitHub!

**GitHub Issues:** [https://github.com/stevenfarless/ttt/issues](https://github.com/stevenfarless/ttt/issues)

---

## ⚡ Development Status

| Aspect | Status |
|--------|--------|
| Core Gameplay | ✅ Stable |
| Real-Time Multiplayer | ✅ Working |
| Turn Management | ✅ Functional |
| Player Perspective Colors | ✅ Implemented |
| Visual Gradients | ✅ **NEW in v2.0.0** |
| Duplicate Emoji Support | ✅ **NEW in v2.0.0** |
| Role-Based Architecture | ✅ **NEW in v2.0.0** |
| Mobile Responsive | ✅ Responsive |
| Firebase Integration | ✅ Functional |
| UI/UX Polish | ✅ Improved |
| Error Handling | 🟡 In Progress |

---

## 📝 Changelog

### v2.0.0 (November 12, 2025)

- ✨ Added duplicate emoji selection support
- ✨ Added visual gradient effects (blue/red glows)
- 🔄 Refactored to role-based player tracking (Host/Guest)
- 🐛 Fixed z-index layering for gradients
- ⚠️ **BREAKING:** Incompatible with v1.x Firebase data structure

### v1.1.0 (November 4, 2025)

- 🎨 Improved player perspective colors
- 🐛 Bug fixes and stability improvements

---

**Built with ❤️ by Steven Farless**

🌟 **Star this repo if you enjoy the game!** 🌟
