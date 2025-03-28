'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Game from '@/components/Game';
import Lobby from '@/components/Lobby';

const GamePage: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Connect to the socket server
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (!socket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Connecting to server...</div>
      </div>
    );
  }

  return (
    <div className="game-page min-h-screen bg-gray-900">
      {gameStarted ? (
        <Game socket={socket} />
      ) : (
        <Lobby socket={socket} onGameStart={() => setGameStarted(true)} />
      )}
    </div>
  );
};

export default GamePage;