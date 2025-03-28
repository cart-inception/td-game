'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const Settings: React.FC = () => {
  const [username, setUsername] = useState('');
  const [volume, setVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(60);
  const [sfxVolume, setSfxVolume] = useState(80);
  const [showTowerRanges, setShowTowerRanges] = useState(false);
  const [showDamageNumbers, setShowDamageNumbers] = useState(true);
  const [fastForward, setFastForward] = useState(false);
  
  useEffect(() => {
    // Load settings from localStorage
    const savedUsername = localStorage.getItem('username');
    const savedVolume = localStorage.getItem('volume');
    const savedMusicVolume = localStorage.getItem('musicVolume');
    const savedSfxVolume = localStorage.getItem('sfxVolume');
    const savedShowTowerRanges = localStorage.getItem('showTowerRanges');
    const savedShowDamageNumbers = localStorage.getItem('showDamageNumbers');
    const savedFastForward = localStorage.getItem('fastForward');
    
    if (savedUsername) setUsername(savedUsername);
    if (savedVolume) setVolume(parseInt(savedVolume));
    if (savedMusicVolume) setMusicVolume(parseInt(savedMusicVolume));
    if (savedSfxVolume) setSfxVolume(parseInt(savedSfxVolume));
    if (savedShowTowerRanges) setShowTowerRanges(savedShowTowerRanges === 'true');
    if (savedShowDamageNumbers) setShowDamageNumbers(savedShowDamageNumbers === 'true');
    if (savedFastForward) setFastForward(savedFastForward === 'true');
  }, []);
  
  const saveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('username', username);
    localStorage.setItem('volume', volume.toString());
    localStorage.setItem('musicVolume', musicVolume.toString());
    localStorage.setItem('sfxVolume', sfxVolume.toString());
    localStorage.setItem('showTowerRanges', showTowerRanges.toString());
    localStorage.setItem('showDamageNumbers', showDamageNumbers.toString());
    localStorage.setItem('fastForward', fastForward.toString());
    
    // Show a saved notification
    alert('Settings saved!');
  };
  
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Settings</h1>
        
        <div className="bg-black/30 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Enter your username"
            />
          </div>
        </div>
        
        <div className="bg-black/30 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Audio</h2>
          <div className="mb-4">
            <label htmlFor="volume" className="block text-sm font-medium mb-1">Master Volume: {volume}%</label>
            <input
              id="volume"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="musicVolume" className="block text-sm font-medium mb-1">Music Volume: {musicVolume}%</label>
            <input
              id="musicVolume"
              type="range"
              min="0"
              max="100"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="sfxVolume" className="block text-sm font-medium mb-1">SFX Volume: {sfxVolume}%</label>
            <input
              id="sfxVolume"
              type="range"
              min="0"
              max="100"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="bg-black/30 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Gameplay</h2>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTowerRanges}
                onChange={(e) => setShowTowerRanges(e.target.checked)}
                className="mr-2"
              />
              Show Tower Ranges
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDamageNumbers}
                onChange={(e) => setShowDamageNumbers(e.target.checked)}
                className="mr-2"
              />
              Show Damage Numbers
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fastForward}
                onChange={(e) => setFastForward(e.target.checked)}
                className="mr-2"
              />
              Enable Fast Forward Button
            </label>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link 
            href="/"
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded"
          >
            Back
          </Link>
          <button
            onClick={saveSettings}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded"
          >
            Save Settings
          </button>
        </div>
      </div>
    </main>
  );
};

export default Settings;