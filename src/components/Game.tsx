import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import { gameConfig } from '@/game/config';
import BootScene from '@/game/scenes/BootScene';
import GameScene from '@/game/scenes/GameScene';
import UIScene from '@/game/scenes/UIScene';

interface GameProps {
  socket: Socket;
}

const Game: React.FC<GameProps> = ({ socket }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !gameRef.current) {
      // Define the game config
      const config = {
        ...gameConfig,
        parent: containerRef.current,
        scene: [BootScene, GameScene, UIScene],
      };
      
      // Initialize the game
      gameRef.current = new Phaser.Game(config);
      
      // Pass the socket to the game scene
      const gameScene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        gameScene.setSocket(socket);
      }
    }

    // Clean up
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [socket]);

  return (
    <div className="game-wrapper w-full h-screen flex flex-col items-center justify-center bg-black">
      <div ref={containerRef} className="game-container w-full h-full max-w-screen-xl max-h-screen" />
    </div>
  );
};

export default Game;