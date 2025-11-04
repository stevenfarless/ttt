# 🎮 TTT - 2 Player Emoji Tic Tac Toe

**Version:** 1.1.0 | **Release Date:** November 4, 2025

A modern, real-time multiplayer Tic Tac Toe game with custom emoji pieces and player perspective colors, built with vanilla JavaScript and Firebase.

## 📷 Screenshots

<img height="600" alt="homescreen" src="https://github.com/user-attachments/assets/72f15ab0-e795-4de7-8191-cee53e5eb81d" />
<img height="600" alt="gameboard" src="https://github.com/user-attachments/assets/7d1ee014-7a7c-4fef-aea8-9204b98f56f8" />

---

## ✨ Features

- **🎯 Classic Tic Tac Toe Gameplay** - The timeless 3x3 grid game you know and love
- **👥 Real-Time Multiplayer** - Firebase-powered live game synchronization
- **🎨 Custom Emoji Pieces** - Choose from 20+ emojis as your game piece
- **🌈 Player Perspective Colors** - See your moves in BLUE and opponent's in RED for clarity
- **🏠 Room Codes** - Share a 4-character room code with your opponent to join a game
- **📱 Mobile Responsive** - Play on desktop, tablet, or mobile seamlessly
- **⚡ Real-Time Sync** - Moves sync instantly across both players' screens
- **🎨 Dark UI** - Dracula-inspired color scheme with smooth animations

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
   - Update the Firebase configuration in `home.html` with your credentials:
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
- Open `index.html`
- Select your emoji piece from the picker
- Click "Create Room"
- Share the 4-character room code with Player 2

### Player 2 (Guest)
- Open `index.html`
- Select your emoji piece
- Enter the room code from Player 1
- Click "Join Room"

### Playing
- Players take turns clicking cells on the 3x3 grid
- Host always goes first
- Your moves appear in **BLUE**, opponent's in **RED**
- Win by getting three in a row (horizontal, vertical, or diagonal)
- Game ends with a win or draw

---

## 🎨 Available Emoji Pieces

Choose any of these 20 emojis as your game piece:

❌ ⭕ ❤️ 💲
😀 💀 🤖 👽
🐶 😺 💩 🦐
🍕 🍣 🍓 🍤
🌙 ☀️ ⭐ 🚀

---

## 📁 Project Structure

```
ttt/
├── index.html               # Main menu/lobby
├── game.html               # Game board interface
├── style.css               # Game board styling
├── home.css                # Menu styling
├── multiplayer.js          # Room creation & joining logic
├── game-multiplayer.js     # Game logic & Firebase sync
├── utils.js                # Utility functions
├── README.md               # This file
└── LICENSE                 # GPL License
```

---

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox & Grid, animations
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS
- **Firebase Realtime Database** - Real-time multiplayer synchronization
- **Emoji Support** - Dynamic emoji rendering and display

---

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🐛 Known Issues & Limitations

- Firebase free tier has rate limits (may affect rapid gameplay)
- Emoji rendering varies across browsers and operating systems
- Reconnection handling is basic (full page refresh recommended if disconnected)
- Room data persists in Firebase after game ends
- Player indicator updates may briefly lag on very slow connections
- Mobile emoji sizes may render inconsistently on older devices

---

## 🗺️ Roadmap

- [ ] AI opponent for single player
- [ ] User authentication & accounts
- [ ] Leaderboard and statistics tracking
- [ ] Sound effects toggle
- [ ] Dark/Light theme selector
- [ ] Tournament mode (best of 3/5)
- [ ] Custom username display
- [ ] Game history & replays

---

## 🤝 Contributing

This project welcomes contributions and feedback! Please feel free to:
- Report bugs via GitHub Issues
- Suggest features and improvements
- Submit pull requests with enhancements
- Test on different devices and browsers

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
| Mobile Responsive | ✅ Responsive |
| Firebase Integration | ✅ Functional |
| UI/UX Polish | 🟡 In Progress |
| Error Handling | 🟡 In Progress |

---

**Built with ❤️ by Steven Farless**
```
