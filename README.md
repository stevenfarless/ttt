# TTT - Multiplayer Tic-Tac-Toe

**TTT** (Tic Tac Toe) is a real-time multiplayer web-based game featuring peer-to-peer connections. Play with friends anywhere in the world with zero server costs!

![TTT Game Screenshot](https://github.com/user-attachments/assets/c5be143e-c540-4c20-be29-37ed7bcad573)

## 🎮 Play Now

**Live Demo:** [https://stevenfarless.github.io/ttt/](https://stevenfarless.github.io/ttt/)

## ✨ Features

- 🌐 **Real-Time Multiplayer** - Play with anyone, anywhere
- 🔐 **Simple Room Codes** - Easy 6-character codes to share
- 🚀 **Peer-to-Peer Connection** - No server required (uses WebRTC)
- 🎨 **Custom Symbols** - Use emojis or any characters
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🆓 **100% Free** - No costs, no ads, no accounts needed
- ⚡ **Instant Setup** - Create or join a game in seconds

## 🎯 How to Play

### Create a Room (Host)
1. Visit the game URL
2. Click **"Create New Room"**
3. Share the generated room code (e.g., `TTT-ABC123`) with your friend
4. Wait for them to join
5. Game starts automatically - you play as ❌ and go first!

### Join a Room (Guest)
1. Visit the game URL
2. Get the room code from your friend
3. Enter the code and click **"Join Room"**
3. Game starts automatically - you play as ⭕ and go second!

### During the Game
- Click any empty cell when it's your turn
- Moves sync instantly between players
- First to get 3 in a row wins!
- Click **"Reset Game"** to play again
- Click **"Back to Menu"** to return to the lobby

## 🛠️ Technical Details

### Built With
- **HTML5** - Structure
- **CSS3** - Styling with Dracula theme
- **Vanilla JavaScript** - Game logic
- **PeerJS** - WebRTC peer-to-peer connections
- **GitHub Pages** - Free hosting

### Architecture
- **No Backend Required** - Fully client-side application
- **Peer-to-Peer** - Direct browser-to-browser communication
- **Session Storage** - Maintains state across page navigation

### Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 📂 Project Structure

```
TTT/
├── index.html              # Entry point (redirects to lobby)
├── home.html               # Multiplayer lobby
├── home.css                # Lobby styling
├── game.html               # Game page
├── style.css               # Game styling
├── multiplayer.js          # Connection & room logic
├── game-multiplayer.js     # Game logic & state management
└── README.md               # Documentation
```

## 🚀 Local Development

### Prerequisites
- Any modern web browser
- Local server (optional but recommended)

### Setup

1. **Clone the repository**
   ```
   git clone https://github.com/stevenfarless/ttt.git
   cd ttt
   ```

2. **Run a local server**
   
   Option A - Python:
   ```
   python -m http.server 8080
   ```
   
   Option B - Node.js:
   ```
   npx http-server -p 8080
   ```
   
   Option C - VS Code:
   Install "Live Server" extension and click "Go Live"

3. **Open in browser**
   ```
   http://localhost:8080
   ```

4. **Test multiplayer**
   - Open two browser tabs/windows
   - Create room in first tab
   - Join with code in second tab

## 🎨 Customization

### Change Colors
Edit `style.css` and `home.css` to customize the Dracula theme colors:
- Background: `#282a36`
- Foreground: `#f8f8f2`
- Accent: `#50fa7b`
- Purple: `#bd93f9`
- Yellow: `#f1fa8c`

### Change Game Symbols
Edit `multiplayer.js` (lines 38-39) to change default symbols:
```
mySymbol = '🔥';        // Host symbol
opponentSymbol = '💧';   // Guest symbol
```

## 🐛 Troubleshooting

### "Connection Error" Message
- **Cause:** PeerJS server unavailable or network issues
- **Solution:** Refresh the page and try again, or check your internet connection

### Moves Not Syncing
- **Cause:** Connection dropped or firewall blocking WebRTC
- **Solution:** Create a new room or check firewall settings

### Room Code Not Working
- **Cause:** Host closed their browser/tab
- **Solution:** Host must keep their tab open; create a new room

### Page Not Loading
- **Cause:** GitHub Pages deployment in progress
- **Solution:** Wait 2-3 minutes after pushing changes

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions
- Add sound effects
- Implement score tracking across multiple games
- Add animations for winning combinations
- Create different themes
- Add AI opponent for single-player mode
- Implement chat between players

## 📜 License

This project is open source and available under the MIT License.

## 👤 Author

**Steven Farless**
- GitHub: [@stevenfarless](https://github.com/stevenfarless)
- Repository: [ttt](https://github.com/stevenfarless/ttt)

## 🙏 Acknowledgments

- [PeerJS](https://peerjs.com) - Simple WebRTC peer-to-peer connections
- [Dracula Theme](https://draculatheme.com/) - Color scheme inspiration
- GitHub Pages - Free hosting platform
- Development assisted by Claude (Anthropic)

## 📊 Stats

- **Lines of Code:** ~800
- **Load Time:** < 1 second
- **Dependencies:** 1 (PeerJS via CDN)
- **Server Costs:** $0.00 forever!

---

*Play anywhere, anytime, with anyone!*
