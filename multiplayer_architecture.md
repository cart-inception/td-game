# Multiplayer Architecture Design

This document outlines the architecture design for our 6-player tower defense game, based on the selected frontend and backend technologies.

## System Overview

Our multiplayer tower defense game will use a client-server architecture with the following components:

1. **Client Application**: Next.js application with React for UI and Phaser 3 for game rendering
2. **Game Server**: Node.js with Express and Socket.io for real-time communication
3. **Database**: MongoDB for persistent data storage
4. **Deployment**: Docker containers orchestrated with Docker Compose, managed by Dokloy on Hostinger VPS

## Multiplayer Architecture

### Client-Server Communication

```
┌─────────────┐                 ┌─────────────┐
│             │  WebSockets     │             │
│   Client    │◄───────────────►│   Server    │
│  (Browser)  │  (Socket.io)    │  (Node.js)  │
│             │                 │             │
└─────────────┘                 └─────────────┘
                                      │
                                      │
                                      ▼
                                ┌─────────────┐
                                │             │
                                │  Database   │
                                │ (MongoDB)   │
                                │             │
                                └─────────────┘
```

- **WebSocket Connection**: Established when a player joins a game
- **Event-Based Communication**: Server and clients exchange events for game actions
- **State Synchronization**: Server maintains authoritative game state and broadcasts updates

### Game Room Management

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Player 1   │     │  Player 2   │     │  Player 3   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   Game Room                         │
│                                                     │
└─────────────────────────────────────────────────────┘
                       │
                       │
                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Player 4   │     │  Player 5   │     │  Player 6   │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **Room Creation**: Players can create new game rooms or join existing ones
- **Room Capacity**: Each room supports up to 6 players (extending beyond Bloons TD 6's 4-player limit)
- **Room State**: Server maintains state for each active game room
- **Player Assignment**: Players are assigned to specific areas of the map

### Game State Management

The game state will be managed using a hybrid approach:

1. **Server Authority**: Server maintains the authoritative game state
2. **Client Prediction**: Clients predict immediate outcomes for responsive gameplay
3. **State Reconciliation**: Server periodically reconciles client states

Key state components:
- Player positions and resources
- Tower placements and upgrades
- Enemy (bloon) positions and health
- Game progression (rounds, scores)

### Scaling Strategy

To support multiple concurrent game sessions:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Game       │     │  Game       │     │  Game       │
│  Instance 1 │     │  Instance 2 │     │  Instance 3 │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│              Socket.io Adapter Layer                │
│                                                     │
└─────────────────────────────────────────────────────┘
                       │
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    MongoDB                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- **Horizontal Scaling**: Multiple game server instances can be deployed
- **Socket.io Adapter**: Redis adapter for Socket.io to manage connections across instances
- **Load Balancing**: Distribute incoming connections across server instances
- **Session Affinity**: Ensure players in the same game connect to the same server instance

## Data Flow

### Game Initialization

1. Player creates or joins a game room
2. Server assigns player to a position on the map
3. Server initializes game state and notifies all players
4. Clients load game assets and render initial state

### Gameplay Loop

1. Player places tower or performs action
2. Client sends action event to server
3. Server validates action and updates game state
4. Server broadcasts state update to all players in the room
5. Clients update their local game state and render changes

### Game Synchronization

To maintain consistency across all players:

1. **Tick-Based Updates**: Server processes game logic in fixed time intervals (ticks)
2. **Delta Compression**: Only send state changes rather than full state
3. **Interpolation**: Clients smoothly interpolate between state updates
4. **Reconciliation**: Resolve conflicts between client prediction and server state

## Technical Implementation

### Server Components

1. **Express Server**: HTTP endpoints for non-real-time operations
2. **Socket.io Server**: WebSocket server for real-time game communication
3. **Game Logic Module**: Core game mechanics and rules
4. **Room Manager**: Handles creation and management of game rooms
5. **State Manager**: Maintains and synchronizes game state
6. **Database Interface**: Interacts with MongoDB for persistent storage

### Client Components

1. **Next.js Application**: Overall application framework
2. **React Components**: UI elements, menus, and non-game screens
3. **Phaser Game Instance**: Renders game canvas and handles game-specific input
4. **Socket.io Client**: Manages real-time communication with server
5. **State Manager**: Handles local state and reconciliation with server state

### Database Schema

1. **Users Collection**: Player profiles and authentication
2. **Games Collection**: Historical game data and statistics
3. **Towers Collection**: Tower configurations and upgrades
4. **Maps Collection**: Map layouts and properties

## Security Considerations

1. **Authentication**: JWT-based authentication for player identity
2. **Authorization**: Validate player actions against game rules
3. **Input Validation**: Sanitize and validate all client inputs
4. **Rate Limiting**: Prevent spam and DoS attacks
5. **Encryption**: Secure communication between client and server

## Performance Optimization

1. **Binary Protocols**: Use binary encoding for game state when possible
2. **Batched Updates**: Combine multiple updates into single transmissions
3. **Asset Optimization**: Optimize game assets for web delivery
4. **Lazy Loading**: Load assets as needed rather than upfront
5. **Caching**: Implement appropriate caching strategies

This architecture design provides a solid foundation for a multiplayer tower defense game that can support 6 players simultaneously, with considerations for performance, scalability, and security.
