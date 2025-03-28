'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-900 to-purple-900">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-5xl font-bold text-white mb-8">Tower Defense 6</h1>
        <div className="bg-black/30 p-8 rounded-xl w-full max-w-md flex flex-col items-center">
          <Link 
            href="/game" 
            className="mb-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded w-full text-center text-xl"
          >
            Play Game
          </Link>
          <Link 
            href="/tutorial" 
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded w-full text-center text-xl"
          >
            Tutorial
          </Link>
          <Link 
            href="/settings" 
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded w-full text-center text-xl"
          >
            Settings
          </Link>
        </div>
      </div>
    </main>
  );
}