let pingInterval;

export function startSelfPing() {
  if (pingInterval) return; // Already running
  
  const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  const ping = async () => {
    try {
      await fetch(`${SITE_URL}/api/health`, {
        method: 'GET',
        headers: { 'User-Agent': 'SelfPing/1.0' }
      });
      console.log('🔄 Self-ping successful');
    } catch (error) {
      console.log('❌ Self-ping failed:', error.message);
    }
  };
  
  // Ping every 60 seconds
  pingInterval = setInterval(ping, 60000);
  console.log('🚀 Self-ping started');
}

export function stopSelfPing() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('🛑 Self-ping stopped');
  }
}