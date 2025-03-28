# Bloons TD 6 Research

## Core Game Mechanics

Bloons TD 6 is a tower defense game where players place monkey-based towers to prevent enemy balloons (called "Bloons") from traversing a track and taking lives. The game features:

- 3D graphics with top-down perspective
- Line-of-sight mechanics where obstacles can block tower vision
- Multiple Bloon types with different properties (Camo, Regrow, Fortified)
- Specialized tower types divided into categories (Primary, Military, Magic, Support)
- Heroes with unique abilities that level up during gameplay
- Upgrade paths (3 paths with 5 tiers each) for each tower
- In-game currency (Monkey Money) for purchasing upgrades and items
- Various game modes and difficulty levels

## Multiplayer Implementation (Co-Op Mode)

The Co-Op mode in Bloons TD 6 has the following characteristics:

- Supports 2-4 players per game
- Introduced in Version 11.0
- Players share map space universally on certain maps
- Land can be divided differently across map formats
- Players can exchange income with each other
- Quick Match option for public play with random players
- Create Match and Join Match options for private games
- Victory statistics and rewards displayed after winning

## Limitations for Our Implementation

- Bloons TD 6 only supports up to 4 players, while our requirement is for 6 players (user + 5 friends)
- We'll need to extend the multiplayer architecture to support more players
- May need to redesign map divisions to accommodate more players
- Will require robust synchronization mechanisms for real-time gameplay

## Technical Considerations for Multiplayer Tower Defense

Based on research, effective multiplayer tower defense implementations typically use:

- WebSockets for real-time communication between clients and server
- JSON for data exchange format
- Server-side game state management to prevent cheating
- Client-side prediction for responsive gameplay
- Consistent hashing for message routing in scaled environments
- Load balancing for handling multiple concurrent games
- Database storage for persistent game data
