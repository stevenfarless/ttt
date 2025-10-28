# TTT - Real-Time Multiplayer Tic-Tac-Toe

**TTT** (Tic Tac Toe) is a peer-to-peer multiplayer web game with instant room creation and zero server costs. Play with anyone, anywhere using simple 4-digit room codes!

🎮 **[Play Now](https://stevenfarless.github.io/ttt/)**

## ✨ Features

- 🌐 **Real-Time Multiplayer** - Play with friends anywhere in the world
- 🔐 **Simple 4-Digit Codes** - Easy room codes like `A7K2` or `Q5M8`
- 🚀 **Peer-to-Peer Connection** - Direct browser-to-browser via WebRTC
- 🎨 **Dracula Theme** - My favorite dark mode colors
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🆓 **100% Free** - No servers, no costs, no accounts, no ads
- ⚡ **Instant Setup** - Create or join a game in seconds
- 🔄 **In-Game Reset** - Start a new match without leaving the room

## 🎯 How to Play

### Host a Game
1. Visit [stevenfarless.github.io/ttt](https://stevenfarless.github.io/ttt/)
2. Click **"Create New Room"**
3. Share your 4-digit room code with a friend (e.g., `B3X9`)
4. Wait for them to join
5. Game starts automatically - you're ❌ and go first!

### Join a Game
1. Get the 4-digit room code from your friend
2. Enter the code and click **"Join Room"**
3. Game starts automatically - you're ⭕ and go second!

### During the Game
- Click any empty cell when it's your turn
- Moves sync instantly to your opponent's screen
- First to get 3 in a row wins!
- Click **"Reset Game"** to play another round
- Click **"← Back to Menu"** to return to the lobby

## 🛠️ Technical Details

### Built With
- **HTML5/CSS3** - Structure and styling
- **Vanilla JavaScript** - Game logic and state management
- **PeerJS (WebRTC)** - Peer-to-peer connections
- **localStorage** - Peer ID persistence across navigation
- **GitHub Pages** - Free static hosting

### Architecture
- **No Backend** - Entirely client-side application
- **P2P Communication** - Direct browser connections using WebRTC
- **4-Digit Room Codes** - Alphanumeric peer IDs for easy sharing
- **State Persistence** - localStorage + sessionStorage for reconnection

### Browser Compatibility
- ✅ Chrome/Edge 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 📂 Project Structure

```
ttt/
├── index.html              # Entry point (redirects to home)
├── home.html               # Multiplayer lobby
├── home.css                # Lobby styling
├── game.html               # Game board page
├── style.css               # Game styling (Dracula theme)
├── multiplayer.js          # Room creation & WebRTC connection
├── game-multiplayer.js     # Game logic with multiplayer support
└── README.md               # This file
```

## 🚀 Local Development

### Prerequisites
- Modern web browser
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
   - Install "Live Server" extension
   - Right-click `home.html` → "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8080
   ```

4. **Test multiplayer locally**
   - Open two browser tabs
   - Create room in first tab
   - Join with code in second tab

## 🎨 Customization

### Change Theme Colors
Edit `style.css` and `home.css`:
```

### Change Default Symbols
Edit `multiplayer.js` (lines 33-34):
```
mySymbol = '🔥';        // Host symbol
opponentSymbol = '💧';   // Guest symbol
```

## 🐛 Troubleshooting

### "Connection Error" Message
- **Cause:** PeerJS server temporarily unavailable or network issues
- **Solution:** Refresh the page and create a new room

### Moves Not Syncing
- **Cause:** Connection dropped or firewall blocking WebRTC
- **Solution:** Create a new room; check firewall/network settings

### Room Code Not Working
- **Cause:** Host closed their browser tab
- **Solution:** Host must keep tab open; create a new room if needed

### Old Room Code Appearing
- **Cause:** Browser cache
- **Solution:** Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or open in incognito mode

### Page Not Loading After Upload
- **Cause:** GitHub Pages deployment in progress
- **Solution:** Wait 2-3 minutes after pushing changes to GitHub

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions
- Sound effects for moves and wins
- Score tracking across multiple games
- Winning line animation
- Additional themes (Light mode, Matrix, etc.)
- AI opponent for single-player mode
- In-game chat between players
- Game history/replay feature

## 📜 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

This means you are free to:
- ✅ Use the software for any purpose
- ✅ Study and modify the source code
- ✅ Share copies of the software
- ✅ Share modified versions

Under the condition that:
- ⚖️ Modified versions must also be open source under GPL-3.0
- ⚖️ You must include the original copyright notice
- ⚖️ You must state significant changes made to the software

## 👤 Author

**Steven Farless**
- GitHub: [@stevenfarless](https://github.com/stevenfarless)
- Repository: [ttt](https://github.com/stevenfarless/ttt)

## 🙏 Acknowledgments

- [PeerJS](https://peerjs.com) - Simplified WebRTC peer-to-peer connections
- [Dracula Theme](https://draculatheme.com/) - Beautiful color scheme
- GitHub Pages - Free, reliable hosting platform

## 📊 Project Stats

- **Lines of Code:** ~800
- **Load Time:** < 1 second
- **External Dependencies:** 1 (PeerJS via CDN)
- **Server Costs:** $0.00 forever!

---

**Made with ❤️ by Steven Farless**

*Play anywhere, anytime, with anyone - completely free!* 🎮✨
```
