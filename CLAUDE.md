# CLAUDE.md - Tower Defense Game Project Guide

## Build & Test Commands
```bash
# Install dependencies
npm install

# Development
npm run dev          # Run Next.js development server

# Build
npm run build        # Build the Next.js application
npm start            # Start the production server

# Testing
npm test             # Run all tests
npm test -- -t "test name"  # Run specific test

# Linting & TypeScript
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checker
```

## Code Style Guidelines
- **TypeScript**: Use strict typing for all code
- **Component Structure**: React functional components with hooks
- **Naming**: 
  - PascalCase for components and classes
  - camelCase for variables and functions
  - UPPER_SNAKE_CASE for constants
- **Imports**: Group imports (React, libraries, components, utils)
- **Error Handling**: Use try/catch for async operations, handle Socket.io disconnections
- **Game Architecture**: 
  - Phaser for game engine, React for UI
  - Express/Socket.io for backend
  - MongoDB for data storage
  - Client-server model with server-authoritative state

## Project Structure
- `/src/app/` - Next.js app directory
- `/src/components/` - React components
- `/src/game/` - Phaser game code
- `/src/hooks/` - Custom React hooks
- `/src/lib/` - Utility functions
- `/src/server/` - Server-side code