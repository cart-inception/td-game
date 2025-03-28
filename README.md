# Tower Defense Game

A multiplayer tower defense game similar to Bloons TD 6, supporting up to 6 players simultaneously.

## Features

- Real-time multiplayer gameplay with up to 6 players
- Multiple tower types with unique abilities
- Various enemy types with different properties
- Tower upgrades and strategic placement
- Three different maps with varying difficulty
- Resource sharing between teammates
- 20 progressively difficult enemy waves

## Tech Stack

- **Frontend**: Next.js, React, Phaser 3, TypeScript
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (optional)
- **Deployment**: Docker, Docker Compose, Dokploy

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB (optional, for persistent storage)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/tower-defense-game.git
cd tower-defense-game
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on the `.env.example` template

4. Start the development server
```bash
npm run dev:all
```

5. Open your browser and navigate to `http://localhost:3000`

## Game Instructions

1. Create a game room or join an existing one
2. Wait for other players to join (at least 2 players required)
3. Each player will be assigned a section of the map
4. Place towers strategically to defend against enemy waves
5. Upgrade towers to increase their power
6. Coordinate with teammates to share resources and strategies
7. Survive all waves to win the game

## Available Tower Types

- **Basic Tower**: Standard tower with balanced stats
- **Rapid Tower**: Fast-firing tower with lower damage
- **Splash Tower**: Area damage tower for multiple enemies
- **Freeze Tower**: Slows down enemies in range
- **Lightning Tower**: Chains attacks to multiple enemies
- **Income Tower**: Generates additional money over time
- **Buff Tower**: Enhances nearby towers' performance

## Development

### Project Structure

```
tower-defense-game/
├── src/
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── game/                 # Phaser game code
│   │   ├── assets/           # Game assets
│   │   ├── scenes/           # Game scenes
│   │   ├── objects/          # Game objects
│   │   ├── config.ts         # Phaser configuration
│   │   └── index.ts          # Game entry point
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── server/               # Server-side code
│       ├── controllers/      # API controllers
│       ├── models/           # MongoDB models
│       ├── routes/           # API routes
│       ├── socket/           # Socket.io handlers
│       └── index.ts          # Server entry point
├── public/                   # Static assets
└── server.js                 # Custom server file
```

### Available Scripts

- `npm run dev` - Run Next.js development server
- `npm run server` - Run backend server
- `npm run dev:all` - Run both frontend and backend concurrently
- `npm run build` - Build the Next.js application
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Assets

The game requires various assets including tower images, enemy sprites, maps, UI elements, and audio files. See the `game_assets_requirements.md` file for a detailed list of required assets and their specifications.

## License

[MIT](LICENSE)