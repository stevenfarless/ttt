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
- 🌍 **Cross-Network Support** - STUN server integration for reliable connections

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
- **PeerJS (WebRTC)** - Peer-to-peer connections with STUN server support
- **Google STUN Server** - NAT traversal for cross-network connectivity
- **sessionStorage** - Connection state persistence across navigation
- **GitHub Pages** - Free static hosting

### Architecture
- **No Backend Required** - Entirely client-side application
- **P2P Communication** - Direct browser connections using WebRTC
- **NAT Traversal** - STUN server (`stun.l.google.com:19302`) enables connections across different networks
- **4-Digit Room Codes** - Alphanumeric peer IDs for easy sharing
- **Connection Lifecycle Management** - Automatic peer recreation and reconnection on page navigation
- **State Persistence** - sessionStorage for multiplayer session data

### Browser Compatibility
- ✅ Chrome/Edge 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Network Requirements
- Works on same local network (LAN)
- Works across different networks (WAN) via STUN server
- Requires WebRTC support (enabled by default in modern browsers)
- May require firewall/NAT configuration in restricted networks

## 📂 Project Structure

```
ttt/
├── index.html              # Entry point (redirects to home)
├── home.html               # Multiplayer lobby
├── home.css                # Lobby styling
├── game.html               # Game board page
├── style.css               # Game styling (Dracula theme)
├── multiplayer.js          # Room creation & WebRTC connection with STUN
├── game-multiplayer.js     # Game logic with multiplayer support
└── README.md               # This file
```

## 🚀 Local Development

### Prerequisites
- Modern web browser with WebRTC support
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
:root {
    --background: #282a36;
    --foreground: #f8f8f2;
    --accent: #bd93f9;
}
```

### Change Default Symbols
Edit `multiplayer.js` (lines 33-34):
```
mySymbol = '🔥';        // Host symbol
opponentSymbol = '💧';   // Guest symbol
```

### Configure STUN/TURN Servers
Edit the `config` object in `multiplayer.js` and `game-multiplayer.js`:
```
const config = {
    debug: 2,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            // Add additional STUN/TURN servers here
        ]
    }
};
```

## 🐛 Troubleshooting

### "Connection Error" Message
- **Cause:** PeerJS server temporarily unavailable or network issues
- **Solution:** Refresh the page and create a new room

### Moves Not Syncing
- **Cause:** Connection dropped or firewall blocking WebRTC
- **Solution:** 
  - Create a new room
  - Check firewall/network settings to allow WebRTC
  - Ensure both players have stable internet connections

### Room Code Not Working
- **Cause:** Host closed their browser tab or peer disconnected
- **Solution:** Host must keep tab open; create a new room if needed

### Connection Works on Same Network But Not Different Networks
- **Cause:** NAT/Firewall blocking or STUN server unavailable
- **Solution:**
  - Wait a moment and retry (STUN negotiation can take a few seconds)
  - Check that WebRTC is enabled in browser settings
  - Consider using a TURN server for restricted networks

### Old Room Code Appearing
- **Cause:** Browser cache
- **Solution:** Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or open in incognito mode

### Page Not Loading After Upload
- **Cause:** GitHub Pages deployment in progress
- **Solution:** Wait 2-3 minutes after pushing changes to GitHub

### "ID is taken" Error
- **Cause:** Previous peer connection not fully closed
- **Solution:** Wait 2-3 seconds and the game will automatically retry

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
- Additional themes such as light mode (eww)
- AI opponent for single-player mode
- In-game chat between players
- Custom TURN server integration for better connectivity

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
- [Google STUN Server](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) - Free STUN service for NAT traversal
- [Dracula Theme](https://draculatheme.com/) - Beautiful color scheme
- GitHub Pages - Free, reliable hosting platform

## 📊 Project Stats

- **Lines of Code:** ~1,000
- **Load Time:** < 1 second
- **External Dependencies:** 1 (PeerJS via CDN)
- **Server Costs:** $0.00 forever!
- **Cross-Network Success Rate:** ~95% (with STUN server)

---

**Made with ❤️ by Steven Farless**

*Play anywhere, anytime, with anyone - completely free!* 🎮✨
```
