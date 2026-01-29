const https = require('https');
const http = require('http');

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const PING_INTERVAL = 30000; // 30 seconds

function pingServer() {
  const url = new URL(BACKEND_URL);
  const client = url.protocol === 'https:' ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: '/health',
    method: 'GET',
    timeout: 5000
  };

  const req = client.request(options, (res) => {
    console.log(`✅ Server ping: ${res.statusCode} at ${new Date().toISOString()}`);
  });

  req.on('error', (err) => {
    console.log(`❌ Server ping failed: ${err.message} at ${new Date().toISOString()}`);
  });

  req.on('timeout', () => {
    console.log(`⏰ Server ping timeout at ${new Date().toISOString()}`);
    req.destroy();
  });

  req.end();
}

// Start pinging immediately
console.log('🚀 Keep-alive script started');
pingServer();

// Set interval to ping every 30 seconds
setInterval(pingServer, PING_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Keep-alive script stopped');
  process.exit(0);
});