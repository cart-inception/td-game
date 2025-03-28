import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface LobbyProps {
  socket: Socket;
  onGameStart: () => void;
}

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
}

const Lobby: React.FC<LobbyProps> = ({ socket, onGameStart }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    socket.on('roomsList', (roomsList: Room[]) => {
      setRooms(roomsList);
    });

    socket.on('playersInRoom', (playersList: string[], owner: boolean) => {
      setPlayers(playersList);
      setIsOwner(owner);
    });

    socket.on('gameStarting', () => {
      onGameStart();
    });

    // Request the list of available rooms
    socket.emit('getRooms');

    return () => {
      socket.off('roomsList');
      socket.off('playersInRoom');
      socket.off('gameStarting');
    };
  }, [socket, onGameStart]);

  const createRoom = () => {
    if (roomName && username) {
      socket.emit('createRoom', { roomName, username });
      setJoined(true);
      setIsOwner(true);
    }
  };

  const joinRoom = (room: string) => {
    if (username) {
      socket.emit('joinRoom', { roomName: room, username });
      setRoomName(room);
      setJoined(true);
    }
  };

  const startGame = () => {
    socket.emit('startGame', { roomName });
  };

  return (
    <div className="lobby-container p-4 max-w-2xl mx-auto mt-8 bg-gray-800 rounded-lg shadow-lg">
      {!joined ? (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Game Lobby</h2>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Your Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 w-full border rounded bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-1">
              Room Name
            </label>
            <div className="flex">
              <input
                id="roomName"
                type="text"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="p-2 flex-grow border rounded-l bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={createRoom}
                disabled={!roomName || !username}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-r"
              >
                Create Room
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">Available Rooms</h3>
            <div className="border rounded p-2 bg-gray-700 border-gray-600">
              {rooms.length > 0 ? (
                <ul>
                  {rooms.map((room) => (
                    <li key={room.id} className="mb-2 p-2 border-b border-gray-600 flex justify-between items-center">
                      <div>
                        <span className="text-white">{room.name}</span>
                        <span className="ml-2 text-gray-400">({room.players}/{room.maxPlayers})</span>
                      </div>
                      <button
                        onClick={() => joinRoom(room.name)}
                        className="ml-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white py-1 px-3 rounded"
                        disabled={room.players >= room.maxPlayers || !username}
                      >
                        Join
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 p-2 text-center">No rooms available</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="waiting-room">
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Room: {roomName}</h2>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-gray-300">Players ({players.length}/6)</h3>
            <div className="border rounded p-2 bg-gray-700 border-gray-600">
              {players.map((player, index) => (
                <div key={index} className="mb-1 p-1 text-white">
                  {player} {index === 0 && <span className="text-yellow-500 ml-1">(Owner)</span>}
                </div>
              ))}
            </div>
          </div>
          {isOwner && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded w-full"
              disabled={players.length < 2}
            >
              Start Game {players.length < 2 && '(Need at least 2 players)'}
            </button>
          )}
          {!isOwner && (
            <div className="text-center text-gray-300">
              Waiting for room owner to start the game...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Lobby;