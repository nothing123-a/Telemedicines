'use client';

import { useEffect } from 'react';

export default function KeepAlive() {
  useEffect(() => {
    const isProduction = process.env.NODE_ENV === 'production';
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    const pingServer = async () => {
      try {
        // Ping local health endpoint
        await fetch('/api/health', { 
          method: 'GET',
          cache: 'no-cache'
        });
        
        // Also ping backend server if URL is provided
        if (BACKEND_URL && isProduction) {
          await fetch(`${BACKEND_URL}/api/health`, { 
            method: 'GET',
            cache: 'no-cache'
          });
        }
        
        console.log('✅ Keep-alive ping successful');
      } catch (error) {
        console.log('❌ Keep-alive ping failed:', error.message);
      }
    };

    // Ping immediately
    pingServer();
    
    // Ping every 25 seconds (under Render's 30s limit)
    const interval = setInterval(pingServer, 25000);
    
    return () => clearInterval(interval);
  }, []);

  return null;
}