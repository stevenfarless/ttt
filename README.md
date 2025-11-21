# 🎮 TTT - Multiplayer Emoji Tic Tac Toe

**Version:** 2.3.2 | **Last Updated:** November 20, 2025

A modern, feature-rich real-time multiplayer Tic Tac Toe game with custom emoji pieces, player perspective colors, and seamless game sharing. Built with vanilla JavaScript and Firebase Realtime Database.

**🎮 Play Now:** [https://stevenfarless.github.io/ttt](https://stevenfarless.github.io/ttt)

***

## 📷 Screenshots

<img height="600" alt="homescreen" src="https://github.com/user-attachments/assets/72f15ab0-e795-4de7-8191-cee53e5eb81d" />
<img height="600" alt="gameboard" src="https://github.com/user-attachments/assets/7d1ee014-7a7c-4fef-aea8-9204b98f56f8" />

***

## ✨ Features

### Core Gameplay

- **🎯 Classic Tic Tac Toe** - Traditional 3x3 grid gameplay with modern enhancements
- **👥 Real-Time Multiplayer** - Firebase-powered instant synchronization across devices
- **🎨 Custom Emoji Input** – Paste *any* Unicode emoji or choose from 20+ presets to personalize your game piece!
- **🌈 Player Perspective Colors** - Your moves in BLUE, opponent's in RED for instant clarity

### Sharing & Connectivity

- **🔗 Shareable Invite Links** - Generate unique game URLs with embedded room codes
- **📋 Smart Copy/Paste** - One-click clipboard integration for room codes and links
- **📱 Web Share API** - Native mobile sharing on supported devices
- **🚀 URL Auto-Join** - Players automatically join games via shared links

### Visual Polish

- **🎉 Victory Celebrations** - Canvas confetti animations for winning players
- **✨ Animated Win Lines** - SVG-drawn winning combination highlights
- **💫 Smart UI Feedback** - Button glow effects, state indicators, and visual cues
- **🎨 Dracula Theme** - Dark, beautiful color scheme with smooth animations
- **📱 Fully Responsive** - Optimized for desktop, tablet, and mobile devices

### Gameplay Flow

- **🏠 4-Character Room Codes** - Simple, unambiguous codes (no I, L, O, or 0)
- **⚡ Instant Turn Updates** - Real-time board synchronization with move animations
- **🔄 Play Again** - Quick rematch without leaving the game
- **🚪 Smart Exit** - "Back to Menu" notifies opponents when leaving
- **👁️ Active Player Indicators** - Visual highlights show whose turn it is

***

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet connection for multiplayer
- Firebase Realtime Database (configured by default)

### Play Online (Recommended)

1. Visit **[https://stevenfarless.github.io/ttt](https://stevenfarless.github.io/ttt)**
2. Select your emoji (now supports pasting any emoji!)
3. Create or join a game
4. Share the link with your friend

### Local Development

```bash
# Clone the repository
git clone https://github.com/stevenfarless/ttt.git
cd ttt

# Open in browser (requires live server for ES6 modules)
# Using Python:
python -m http.server 8000
# Or using Node.js http-server:
npx http-server

# Navigate to http://localhost:8000
```

### Firebase Configuration (Optional)

To use your own Firebase instance:

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable Realtime Database
3. Update `utils.js` with your credentials:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

***

## 🎮 How to Play

### Creating a Game (Host)

1. Open the app
2. Click the emoji button to select your game piece (supports pasting or choosing any emoji!)
3. Click **"Create Game"**
4. Share the room code OR invite link with your opponent
   - Copy the 4-character code
   - Copy the full invite link
   - Use the Share button (mobile)

### Joining a Game (Guest)

**Option 1: Via Invite Link** (Easiest)

- Click the shared link from your friend
- Select your emoji
- Click **"START GAME"**

**Option 2: Via Room Code**

- Open the app
- Select your emoji
- Click **"Join Game"**
- Enter or paste the 4-character code
- Click **"START GAME"**

### Playing

- **Turn Order:** Host always plays first
- **Your Moves:** Appear in **BLUE** with player glow
- **Opponent Moves:** Appear in **RED** with opponent glow
- **Win Condition:** Three in a row (horizontal, vertical, diagonal)
- **Victory:** Animated win line + confetti celebration 🎉
- **Rematch:** Click "Play Again" for instant rematch
- **Exit:** "Back to Menu" notifies opponent and returns home

***

## 🎨 Available Emoji Pieces

You can paste *any* emoji! Or, choose from these 20 presets:

❌ ⭕ ❤️ 💲<br>
😀 💀 🤖 👽<br>
🐶 😺 💩 🦐<br>
🍕 🍣 🍓 🍤<br>
🌙 ☀️ ⭐ 🚀

***

## 📁 Project Structure

```text
ttt/
├── index.html              # Main menu and lobby interface
├── game.html               # Game board and gameplay interface
├── home.css                # Styling for menu/lobby
├── style.css               # Styling for game board
├── utils.js                # Firebase config + utility functions
├── multiplayer.js          # Room creation, joining, and sharing logic
├── game-multiplayer.js     # Core game logic and Firebase sync
├── svg-icons.html          # SVG icon reference (backup)
├── favicon files           # Various favicon formats
├── README.md               # This file
└── LICENSE                 # GPL-3.0 License
```

***

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox, Grid, animations, and CSS custom properties
- **Vanilla JavaScript (ES6+)** - No frameworks, pure modular JS with ES6 imports
- **Firebase Realtime Database** - Real-time multiplayer synchronization
- **canvas-confetti** - Victory celebration animations ([v1.9.3 CDN](https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3))
- **Web Share API** - Native mobile sharing integration
- **Clipboard API** - Copy/paste functionality for codes and links
- **SVG Graphics** - Animated win line rendering

***

## 🌐 Deployment Branches

This project uses a multi-environment deployment strategy via GitHub Pages:

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Main** | `/ttt` | Production-stable release |
| **Beta** | `/ttt/beta` | Testing new features |
| **Alpha** | `/ttt/alpha` | Early feature development |
| **Experimental** | `/ttt/experimental` | Cutting-edge experiments |

Use the environment switcher at the bottom of the home screen to navigate between versions.

***

## 📱 Browser & Device Support

### Desktop Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile Browsers

- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+
- ✅ Samsung Internet 13+

### Feature Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core Gameplay | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ | ✅ |
| Web Share API | ✅ | ⚠️ Android Only | ✅ | ✅ |
| Canvas Confetti | ✅ | ✅ | ✅ | ✅ |
| URL Parameters | ✅ | ✅ | ✅ | ✅ |

***

## 🐛 Known Issues & Limitations

- Firebase free tier rate limits may affect rapid gameplay on high-traffic days
- Emoji rendering varies across operating systems (iOS, Android, Windows render differently)
- Web Share API unavailable on desktop Firefox (falls back to copy link)
- Room data persists in Firebase after games end (cleanup required)
- Very slow connections (<1 Mbps) may experience brief turn indicator lag
- Mobile emoji sizes may vary on devices with older OS versions

***

## 🗺️ Roadmap

### Planned Features

- [ ] Timed turns with countdown
- [x] Custom emoji input (Closes (https://github.com/stevenfarless/ttt/issues/20))
- [ ] Tournament mode (best of 3/5/7)
- [ ] Sound effects with toggle control
- [ ] AI opponent for single-player mode
- [ ] User authentication & persistent accounts
- [ ] Custom usernames/display names
- [ ] Light/Dark theme switcher
- [ ] Leaderboard and win/loss statistics

### Under Consideration

- [ ] Larger board sizes (4x4, 5x5)
- [ ] Match chat functionality

***

## 🤝 Contributing

Contributions are welcome! This project uses the [GitHub Issue Label Reference](#github-issue-labels) for organization.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### GitHub Issue Labels

When creating issues, use these labels:

**Priority Labels** (Required - choose one):

- `priority: high` - Critical features/bugs, work on next
- `priority: medium` - Important features, plan soon
- `priority: low` - Nice to have, backlog items

**Type Labels** (Required - choose one):

- `enhancement` - New features or requests
- `bug` - Something isn't working
- `documentation` - Improvements to docs/README
- `question` - Further information requested

**Status Labels** (Optional):

- `status: in-progress` - Currently being worked on
- `status: needs-review` - Ready for review
- `status: blocked` - Blocked by dependencies

**Community Labels**:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

### Testing Guidelines

Before submitting PRs:

- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices (iOS and Android)
- Verify Firebase sync works correctly
- Check emoji rendering on different devices
- Test all sharing methods (code, link, Web Share API)

***

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this software freely, but any derivative works must also be open source under GPL-3.0.

***

## 📞 Support & Contact

**Found a bug?** [Open an issue](https://github.com/stevenfarless/ttt/issues)

**Have a feature request?** [Start a discussion](https://github.com/stevenfarless/ttt/issues)

**GitHub Repository:** [github.com/stevenfarless/ttt](https://github.com/stevenfarless/ttt)

***

## ⚡ Development Status

| Component | Status |
|-----------|--------|
| Core Gameplay | ✅ Stable |
| Real-Time Multiplayer | ✅ Production Ready |
| Turn Management | ✅ Fully Functional |
| Player Perspective Colors | ✅ Implemented |
| Invite Link Sharing | ✅ Working |
| Web Share API | ✅ Mobile Supported |
| Copy/Paste Integration | ✅ Functional |
| Victory Animations | ✅ Complete |
| Win Line Drawing | ✅ Animated |
| Mobile Responsive | ✅ Optimized |
| Firebase Integration | ✅ Stable |
| UI/UX Polish | ✅ v2.3 Complete |
| Error Handling | 🟡 In Progress |
| Reconnection Logic | 🟡 Basic Implementation |

***

## 🏆 Changelog

### Version 2.3.2 (Current)

- Added custom emoji input: players can paste or enter any emoji for their game piece
- Emoji selection now persists across sessions for returning users
- Improved input validation for emoji entry to ensure smooth gameplay

### Version 2.3.1

- Full invite link sharing system with URL parameters
- Web Share API integration for mobile devices
- Animated SVG win line overlays
- Canvas confetti victory celebrations
- Smart UI feedback and button states
- Enhanced clipboard integration
- Player indicator active state highlights
- Improved mobile responsiveness

### Version 1.1.0

- Initial public release
- Basic multiplayer functionality
- Custom emoji selection
- Player perspective colors

***

## 👨‍💻 Author

**Steven Farless**

Built with ❤️ and lots of ☕

***

## 🙏 Acknowledgments

- **Firebase** - Real-time database infrastructure
- **canvas-confetti** - Victory celebration animations
- **Dracula Theme** - Color scheme inspiration
- **Open Source Community** - For continuous inspiration

***

**⭐ If you enjoy this game, please consider starring the repository!**

***
