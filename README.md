# 🎮 Custom Tic Tac Toe - (Multiplayer Edition)

**Version:** 0.3.0-alpha | **Release Date:** October 31, 2025

> ⚠️ **ALPHA RELEASE NOTICE** 
> 
> This is an early-stage alpha release. The project is actively under development and may experience breaking changes or unexpected behavior without notice. Features are subject to change as core functionality is refined and stabilized. We recommend using this for testing and feedback purposes only. Stability and backwards compatibility are not guaranteed at this stage.

A modern, real-time multiplayer Tic Tac Toe game with custom emoji pieces, built with vanilla JavaScript and Firebase.

---

## ✨ Features

- **🎯 Classic Tic Tac Toe Gameplay** - The timeless 3x3 grid game you know and love
- **👥 Real-Time Multiplayer** - Firebase-powered live game synchronization
- **🎨 Custom Emoji Pieces** - Choose any emoji as your game piece (🎮, 🚀, 🌟, etc.)
- **🏠 Room Codes** - Share a 4-character room code with your opponent to join a game
- **🎭 Player Perspective Colors** - Each player sees their moves in BLUE and opponent's in RED (personalized per player)
- **📱 Mobile Responsive** - Play on desktop, tablet, or mobile seamlessly
- **⚡ Real-Time Sync** - Moves sync instantly across both players' screens
- **🎨 Dark UI** - Dracula-inspired color scheme with smooth animations

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Firebase project (for multiplayer functionality).

### Installation

1. **Clone the repository**
```
git clone https://github.com/yourusername/tic-tac-toe.git
cd tic-tac-toe
```

2. **Open in your browser**
```
# Simply open index.html in your browser
open index.html
```

3. **Configure Firebase (Multiplayer Mode)**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Realtime Database
   - Update Firebase config in `index.html` with your project credentials

---

## 🎮 How to Play

### Single Player (Local)
1. Open `index.html`
2. Click "Create Room" to play locally
3. Select your emoji piece
4. Make moves on the board

### Multiplayer
1. **Player 1 (Host)**: Opens the game, selects emoji, clicks "Create Room"
2. **Share room code** with Player 2 (e.g., "AB2K")
3. **Player 2**: Enters room code, selects emoji, clicks "Join Room"
4. **Take turns** making moves
5. **Win** by getting three in a row (horizontal, vertical, or diagonal)

---

## 📁 Project Structure

```
tic-tac-toe/
├── index.html              # Entry point
├── home.html               # Main menu/lobby
├── game.html               # Game board
├── style.css               # Game styling
├── home.css                # Menu styling
├── multiplayer.js          # Room/lobby logic
├── game-multiplayer.js     # Game & Firebase logic
├── README.md               # This file
└── LICENSE                 # GPL License
```

---

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox & Grid
- **Vanilla JavaScript** - No frameworks, pure JS
- **Firebase Realtime Database** - Real-time multiplayer sync
- **Emoji API** - Dynamic emoji rendering

---

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🐛 Known Issues & Limitations (Alpha Stage)

- Room data may persist unexpectedly after games
- Reconnection handling during interrupted connections is limited
- Performance may vary on slower connections
- Firebase free tier rate limits may apply
- Player indicators may briefly desync during rapid moves
- Some emoji combinations may render inconsistently on older devices

---

## 🗺️ Roadmap (Post-Alpha)

- [ ] Leaderboard system
- [ ] AI opponent
- [ ] Sound effects toggle
- [ ] Dark/Light theme selector
- [ ] User authentication
- [ ] Tournament mode

---

## 🤝 Contributing

This is an alpha project, so contributions are welcome! Please feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Test on different devices

---

## 📄 License

GPL 3 License - see LICENSE file for details

---

## 📞 Support & Feedback

Found a bug? Have a suggestion? Please open an issue on GitHub!

**GitHub Issues:** [https://github.com/yourusername/tic-tac-toe/issues](https://github.com/yourusername/tic-tac-toe/issues)

---

## ⚡ Development Status

| Aspect | Status |
|--------|--------|
| Core Gameplay | ✅ Stable |
| Multiplayer Sync | ✅ Working |
| Mobile Responsive | ✅ Responsive |
| UI/UX Polish | 🟡 In Progress |
| Firebase Integration | ✅ Functional |
| Error Handling | 🟡 In Progress |
| Performance | 🟡 Optimizing |

---

**Built with ❤️ - Alpha Stage Software**
