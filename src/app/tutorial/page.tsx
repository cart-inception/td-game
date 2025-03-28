'use client';

import Link from 'next/link';
import React from 'react';

const Tutorial: React.FC = () => {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Game Tutorial</h1>
        
        <div className="bg-black/30 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Game Objective</h2>
          <p className="mb-4">
            Defend your territory against waves of enemies (bloons) by strategically placing and upgrading towers.
            Work together with up to 5 other players to prevent enemies from reaching the end of the path.
          </p>
          <p>
            The game ends when you either defeat all 20 waves, or lose all your lives by letting too many enemies through.
          </p>
        </div>
        
        <div className="bg-black/30 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Create a game room or join an existing one in the lobby</li>
            <li>Wait for at least one other player to join (up to 6 players total)</li>
            <li>Once the game starts, you'll be assigned a section of the map</li>
            <li>You start with $650 to spend on towers</li>
            <li>Place towers by selecting a tower type and clicking within your section</li>
            <li>Towers automatically attack enemies within their range</li>
            <li>Earn money by defeating enemies and completing rounds</li>
          </ol>
        </div>
        
        <div className="bg-black/30 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Tower Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Basic Tower ($200)</h3>
              <p>Standard tower with balanced range and damage. Good starter tower.</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Rapid Tower ($350)</h3>
              <p>Fast-firing tower with lower damage per shot. Excellent for weaker, fast enemies.</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Splash Tower ($400)</h3>
              <p>Area damage tower that hits multiple enemies. Great for grouped enemies.</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Freeze Tower ($500)</h3>
              <p>Slows down enemies in range while dealing light damage. Good for crowd control.</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Lightning Tower ($650)</h3>
              <p>Chains attacks to multiple enemies. Effective against enemy groups.</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Income Tower ($800)</h3>
              <p>Generates additional money over time. Investment for long games.</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Buff Tower ($450)</h3>
              <p>Enhances nearby towers' performance. Place centrally for maximum effect.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/30 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Enemy Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-red-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Basic Bloon</h3>
              <p>Standard enemy with balanced speed and health.</p>
            </div>
            <div className="p-3 bg-red-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Fast Bloon</h3>
              <p>Moves quickly but has low health.</p>
            </div>
            <div className="p-3 bg-red-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Heavy Bloon</h3>
              <p>Moves slowly but has increased health.</p>
            </div>
            <div className="p-3 bg-red-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Camo Bloon</h3>
              <p>Can only be detected by certain towers.</p>
            </div>
            <div className="p-3 bg-red-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Regen Bloon</h3>
              <p>Regenerates health over time if not destroyed quickly.</p>
            </div>
            <div className="p-3 bg-red-900/50 rounded">
              <h3 className="text-xl font-bold mb-2">Boss Bloon</h3>
              <p>Very high health and deals significant damage if it reaches the end.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/30 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Multiplayer Tips</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Coordinate with your teammates to cover different parts of the map</li>
            <li>Specialize in different tower types for maximum effectiveness</li>
            <li>Focus income towers in safe areas to generate resources for the team</li>
            <li>Communicate about which enemies are giving you trouble</li>
            <li>Place buff towers in areas that will benefit multiple players' towers</li>
            <li>Don't forget to upgrade your existing towers as the game progresses</li>
          </ul>
        </div>
        
        <div className="text-center">
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded inline-block"
          >
            Return to Main Menu
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Tutorial;