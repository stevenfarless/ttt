# Custom Tic-Tac-Toe (Multiplayer)

A fully functional real-time multiplayer Tic-Tac-Toe game built with vanilla JavaScript and Firebase Realtime Database. Play with friends online using simple 4-character room codes.

## Screenshots

<img width="500" alt="image" src="https://github.com/user-attachments/assets/512a5805-0d78-4d75-8878-639ca165ef83" />

<img width="500" alt="image" src="https://github.com/user-attachments/assets/4ae1a7f0-f8d0-47ef-9ddd-838319d3f014" />


## Features

✅ **Real-time Multiplayer** - Play with anyone, anywhere using Firebase  
✅ **Room Code System** - Easy-to-share 4-character codes  
✅ **Turn-based Gameplay** - Clear indicators for whose turn it is  
✅ **Auto-sync** - Moves sync instantly across all connected players  
✅ **Winner Detection** - Automatic win/draw detection  
✅ **Responsive Design** - Clean, modern UI with Dracula theme colors  
✅ **Session Management** - Proper room cleanup and player disconnect handling

## Quick Start

### Create a Room

1. Open the game
2. Click **"Create New Room"**
3. Share the 4-character room code with your friend
4. Wait for them to join
5. Game starts automatically when both players are connected!

### Join a Room

1. Open the game
2. Enter the 4-character room code
3. Click **"Join Room"**
4. Start playing!

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase Realtime Database v8
- **Hosting**: GitHub Pages

## Room Code Design

Room codes use an optimized character set:

```
ABCDEFGHJKMNPQRSTUVWXYZ123456789
```

**Why these characters?**

- Removed **I, L, O, 0** to prevent confusion
- 32 characters providing over 1 million unique combinations
- Easy to read and share verbally or via text

## Installation

### Prerequisites

- Firebase project (free tier supported)
- Node.js or a local server for development

### Setup

1. Clone the repository
   ```
   git clone https://github.com/stevenfarless/ttt.git
   cd ttt
   ```

2. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

3. Enable **Realtime Database** in Firebase

4. Copy your Firebase config and add it to `game.html` and `home.html`:

   ```
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. Deploy to GitHub Pages or serve locally

### Local Development

1. Use a local server (e.g., Live Server VS Code extension)
2. Open `index.html`

**Note:** Do not open HTML files directly - Firebase requires a proper HTTP server.

## File Structure

```
├── index.html              # Landing page
├── home.html               # Main menu (create/join room)
├── game.html               # Game board
├── multiplayer.js          # Room creation/join logic
├── game-multiplayer.js     # Core game logic & Firebase sync
├── style.css               # Game board styles
├── home.css                # Menu styles
├── LICENSE                 # GPL-3.0 license
└── README.md               # This file
```

## Configuration

### Debug Mode

To enable/disable debug logging in `game-multiplayer.js` and `multiplayer.js`:

```
const DEBUG = true;   // Enable debug logs
const DEBUG = false;  // Disable debug logs
```

## Roadmap

- 🎯 Chat functionality
- 🎯 Player statistics tracking
- 🎯 Rematch button
- 🎯 Sound effects & animations
- 🎯 AI opponent mode

## Troubleshooting

**Game won't load?**
- Ensure Firebase config is correctly set in HTML files
- Check that you're using a local server (not `file://`)
- Verify Firebase Realtime Database is enabled

**Moves not syncing?**
- Check your Firebase connection
- Verify both players are in the same room code
- Check browser console for errors

**Room code not working?**
- Ensure code is exactly 4 characters
- Verify the room creator is still connected
- Try creating a new room

## Contributing

Found a bug or have a feature request? Feel free to open an issue or submit a pull request!

## License

GPL-3.0 License - See LICENSE file for details

## Credits

Developed by **Steven Farless**  
Built with Firebase and vanilla JavaScript  
UI inspired by Dracula color theme

## Version History

**v1.0.0** (November 2025) - First Official Release
- Production-ready Firebase integration
- Refined multiplayer synchronization
- Improved error handling and edge cases
- Optimized performance for real-time updates
- Enhanced session management
- Polished UI and user experience

**v0.2.0-Alpha** (October 2025)
- Fixed Firebase sparse array handling
- Optimized room code character set
- Added real-time game state synchronization
- Improved turn tracking logic
- Added debug logging system
