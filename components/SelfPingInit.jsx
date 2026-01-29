'use client';

import { useEffect } from 'react';

export default function SelfPingInit() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;
    
    const startSelfPing = async () => {
      try {
        await fetch('/api/start-ping', { method: 'POST' });
        console.log('✅ Self-ping initialized');
      } catch (error) {
        console.log('❌ Failed to start self-ping:', error.message);
      }
    };
    
    startSelfPing();
  }, []);

  return null;
}