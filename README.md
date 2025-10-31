# Tic-Tac-Toe Multiplayer Game

A fully functional real-time multiplayer Tic-Tac-Toe game built with vanilla JavaScript and Firebase Realtime Database. Play with friends online using simple 4-character room codes.

<img height="450" alt="image" src="https://github.com/user-attachments/assets/182684e0-7fa4-4782-8d7b-80cff1afb728" />

<img height="450" alt="image" src="https://github.com/user-attachments/assets/85f83128-a0d6-46a4-ba22-2049e4b9d90b" />

<img height="450" alt="image" src="https://github.com/user-attachments/assets/255d73e8-ae0f-44e8-99ec-40aa9b3f27f5" />

## Features

✅ **Real-time Multiplayer** - Play with anyone, anywhere using Firebase  
✅ **Room Code System** - Easy-to-share 4-character codes
✅ **Turn-based Gameplay** - Clear indicators for whose turn it is  
✅ **Auto-sync** - Moves sync instantly across all connected players  
✅ **Winner Detection** - Automatic win/draw detection  
✅ **Responsive Design** - Clean, modern UI with Dracula theme colors  
✅ **Session Management** - Proper room cleanup and player disconnect handling

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase Realtime Database v8
- **Hosting**: GitHub Pages compatible

## How to Play

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

## Room Code Design

Room codes use an optimized character set: `ABCDEFGHJKMNPQRSTUVWXYZ123456789`

**Why these characters?**
- Removed **I, L, O, 0** to prevent confusion
- 32 characters providing over 1 million unique combinations
- Easy to read and share verbally or via text

## File Structure

```
├── index.html              # Landing page
├── home.html               # Main menu (create/join room)
├── game.html               # Game board page
├── multiplayer.js          # Room creation/join logic
├── game-multiplayer.js     # Core game logic & Firebase sync
├── style.css               # Game board styles
├── home.css                # Menu styles
└── README.md               # Documentation
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Realtime Database**
3. Copy your Firebase config
4. Replace the config in `game.html` and `home.html`:

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

## Development

### Debug Mode

The game includes optional debug logging. To enable/disable:

In `game-multiplayer.js` and `multiplayer.js`, set:
```
const DEBUG = true;  // Enable debug logs
const DEBUG = false; // Disable debug logs
```

### Local Testing

1. Clone the repository
2. Use a local server (e.g., Live Server VS Code extension)
3. Open `index.html`

**Note:** Do not open HTML files directly - Firebase requires a proper HTTP server.

## Known Limitations

- Rooms are not password-protected
- No spectator mode
- Room codes expire when all players disconnect
- Maximum 2 players per room

## Future Enhancements

- [ ] Chat functionality
- [ ] Player statistics tracking
- [ ] Rematch button
- [ ] Sound effects
- [ ] Mobile app version
- [ ] AI opponent mode

## License

GPL-3.0

## Credits

Developed by Steven Farless  
Firebase integration and multiplayer functionality  
Dracula color theme for modern UI

## Version History

**v0.2.0-Alpha** (October 2025)
- Fixed Firebase sparse array handling
- Optimized room code character set
- Added real-time game state synchronization
- Improved turn tracking logic
- Added debug logging system
- Basic multiplayer functionality
- Room creation and joining
- Simple UI

---
