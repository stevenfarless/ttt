# TTT - Real-Time Multiplayer Tic-Tac-Toe

**TTT** (Tic Tac Toe) is a peer-to-peer multiplayer web game with instant room creation. Play with anyone using simple 4-digit room codes!

🎮 **[Play Now](https://stevenfarless.github.io/ttt/)**

## ✨ Features

- 🌐 **Real-Time Multiplayer** - Play with friends in real-time
- 🔐 **Simple 4-Digit Codes** - Easy room codes like `A7K2` or `Q5M8`
- 🚀 **Peer-to-Peer Connection** - Direct browser-to-browser via WebRTC
- 🎨 **Dracula Theme** - Dark mode color scheme
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🆓 **100% Free** - No accounts, no ads
- ⚡ **Instant Setup** - Create or join a game in seconds
- 🔄 **In-Game Reset** - Start a new match without leaving the room

## ⚠️ Known Limitations (Current Version)

**Cross-Network Connectivity Issues:**
- ✅ **Works reliably:** Two browsers on the same device or same local network (WiFi/LAN)
- ❌ **Does NOT work reliably:** Connections across different networks (PC to mobile on different networks, different ISPs, etc.)
- ❌ **May fail completely:** Mobile devices on cellular data, especially behind carrier-grade NAT (CGNAT)

**Why these limitations exist:**
The current implementation uses peer-to-peer WebRTC with free TURN servers. Free TURN servers are often overloaded and unreliable, causing connection failures for:
- Cross-network connections (different WiFi networks, PC + mobile cellular)
- Mobile devices behind restrictive carrier NAT
- Corporate/school WiFi with P2P blocking

**🔧 Coming Soon: Server-Based Architecture**
Migrating to **Firebase Realtime Database** for:
- 🎯 99.9% connection reliability across all networks and devices
- 📱 Full mobile device support (cellular + WiFi)
- 🌍 Guaranteed cross-network connectivity
- 🆓 Still completely free (Firebase free tier: 100 simultaneous connections, 1GB storage)

This migration will provide rock-solid connections while maintaining the same user experience.

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
- Moves sync in real-time to your opponent's screen
- First to get 3 in a row wins!
- Click **"Reset Game"** to play another round
- Click **"← Back to Menu"** to return to the lobby

## 🛠️ Technical Details

### Built With
- **HTML5/CSS3** - Structure and styling
- **Vanilla JavaScript** - Game logic and state management
- **PeerJS (WebRTC)** - Peer-to-peer connections with STUN/TURN support
- **sessionStorage** - Connection state persistence across navigation
- **GitHub Pages** - Static hosting

### Architecture
- **No Backend Required** - Entirely client-side application (current version)
- **P2P Communication** - Direct browser connections using WebRTC (when it works)
- **NAT Traversal Attempts** - Multiple STUN/TURN servers configured, but unreliable with free servers
- **4-Digit Room Codes** - Alphanumeric peer IDs for easy sharing
- **Connection Lifecycle Management** - Automatic peer recreation and reconnection handling
- **State Persistence** - sessionStorage maintains multiplayer session data across page navigation

### Browser Compatibility
- ✅ Chrome/Edge 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+ (Desktop - same network only)
- ⚠️ Safari/iOS (Mobile - limited cross-network support due to WebKit + restrictive NAT)
- ✅ Opera 76+
- ⚠️ Brave (Works well on desktop, iOS version uses WebKit so has same limitations as Safari)

### Network Requirements
- ✅ **Same Local Network (LAN):** ~100% success rate
- ⚠️ **Same WiFi Network:** ~95% success rate (unless AP Isolation is enabled)
- ❌ **Cross-Network (WAN):** ~10-30% success rate with free TURN servers
- ❌ **Mobile Cellular:** ~5-15% success rate due to carrier-grade NAT (CGNAT)
- ❌ **Corporate/School WiFi:** Often blocks P2P connections entirely
- Requires WebRTC support (enabled by default in modern browsers)

## 📂 Project Structure

```
ttt/
├── index.html              # Entry point (redirects to home)
├── home.html               # Multiplayer lobby
├── home.css                # Lobby styling
├── game.html               # Game board page
├── style.css               # Game styling (Dracula theme)
├── multiplayer.js          # Room creation & WebRTC connection setup
├── game-multiplayer.js     # Game logic with multiplayer sync
└── README.md               # This file
```

## 🚀 Local Development

### Prerequisites
- Modern web browser with WebRTC support
- Local server (optional but recommended for testing)

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
   - Open two browser tabs or two different browsers
   - Create room in first tab
   - Join with code in second tab
   - Should work instantly on same machine

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
Edit `multiplayer.js` around line 33-34:
```
mySymbol = '🔥';        // Host symbol
opponentSymbol = '💧';   // Guest symbol
```

### Configure STUN/TURN Servers
Edit the `config` object in both `multiplayer.js` and `game-multiplayer.js`:
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
- **Cause:** PeerJS server temporarily unavailable or network issue
- **Solution:** Refresh page and try creating a new room

### Stuck on "Connecting..." Forever
- **Cause:** Cross-network P2P connection failing due to NAT/firewall or TURN server overload
- **Solution:** 
  - ✅ **Best workaround:** Both players connect from same WiFi network
  - Try refreshing and creating new room (low success rate for cross-network)
  - **Proper fix:** Wait for Firebase migration

### Moves Not Syncing
- **Cause:** Connection dropped or never fully established
- **Solution:** Return to menu, create new room, try again

### Room Code Not Working
- **Cause:** Host closed browser tab, or code was entered incorrectly
- **Solution:** Verify code is correct (4 characters, case-sensitive), host must keep tab open

### Connection Works on Same Network But Not Different Networks
- **Status:** This is a **known limitation** of the current P2P implementation
- **Explanation:** Free TURN servers are unreliable; WebRTC struggles with restrictive NATs
- **Current Workaround:** Both players must be on same local network
- **Permanent Fix:** Firebase migration coming soon

### Mobile Device Won't Connect Across Networks
- **Status:** Expected behavior - mobile carrier NATs block P2P
- **Explanation:** Mobile cellular networks use carrier-grade NAT (CGNAT) that blocks P2P connections
- **Workaround:** Both devices on same WiFi network
- **Permanent Fix:** Firebase migration will solve this

### Works Perfectly on Same WiFi, Fails on Different Networks
- **Status:** This is normal for current architecture
- **Explanation:** Same-network connections use direct P2P; cross-network needs TURN relay (unreliable with free servers)

### Old Room Code Appearing
- **Cause:** Browser cache
- **Solution:** Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or use incognito/private browsing

### Page Not Loading After Push to GitHub
- **Cause:** GitHub Pages deployment in progress
- **Solution:** Wait 2-3 minutes for GitHub to build and deploy

### "ID is taken" Error
- **Cause:** Previous peer connection not fully closed
- **Solution:** Wait 2-3 seconds - game automatically retries with same ID

## 🤝 Contributing

Contributions welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### High-Priority Contributions
- **Firebase Realtime Database migration** (top priority - would fix all connectivity issues!)
- Improved error messages for connection failures
- Connection retry logic with exponential backoff
- Additional free TURN server fallbacks

### Other Ideas
- Sound effects for moves and wins
- Score tracking across games in same session
- Winning line highlight animation
- Light mode theme
- AI opponent for single-player
- In-game chat

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
- ⚖️ You must state significant changes made

## 👤 Author

**Steven Farless**
- GitHub: [@stevenfarless](https://github.com/stevenfarless)
- Repository: [ttt](https://github.com/stevenfarless/ttt)

## 🙏 Acknowledgments

- [PeerJS](https://peerjs.com) - Simplified WebRTC API wrapper
- [OpenRelay by Metered](https://www.metered.ca/tools/openrelay/) - Free TURN servers (used but unreliable)
- [ExpressTurn](https://expressturn.com/) - Additional free TURN server
- [Dracula Theme](https://draculatheme.com/) - Color scheme
- GitHub Pages - Free static hosting

## 📊 Project Stats

- **Lines of Code:** ~1,100
- **Load Time:** < 1 second
- **External Dependencies:** 1 (PeerJS via CDN)
- **Hosting Costs:** $0.00 (GitHub Pages)
- **Same-Network Success Rate:** ~100%
- **Cross-Network Success Rate:** ~10-30% (free TURN server limitations)
- **Mobile Cross-Network Success Rate:** ~5-15% (CGNAT + free TURN issues)

---

**Made with ❤️ by Steven Farless**

*Works great on same network - reliable cross-network support coming soon!* 🎮✨
