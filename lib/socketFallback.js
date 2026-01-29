// Fallback system for when Socket.IO is not available (like on Vercel)
class SocketFallback {
  constructor() {
    this.connected = false;
    this.listeners = new Map();
    this.pollInterval = null;
    this.roomId = null;
    this.userId = null;
  }

  connect() {
    this.connected = true;
    this.emit('connect');
    return this;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Socket fallback callback error:', error);
        }
      });
    }

    // Handle specific events that need API calls
    if (event === 'join-room' && data) {
      this.roomId = typeof data === 'string' ? data : data.roomId;
      this.startPolling();
    }

    if (event === 'register-user' && data?.userId) {
      this.userId = data.userId;
    }

    if (event === 'register-doctor' && data?.doctorId) {
      this.userId = data.doctorId;
    }

    // WebRTC signaling through API
    if (['offer', 'answer', 'ice-candidate'].includes(event) && data) {
      this.sendSignalingData(event, data);
    }

    return this;
  }

  async sendSignalingData(type, data) {
    try {
      await fetch('/api/webrtc/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          roomId: this.roomId,
          data: type === 'offer' ? data.offer : type === 'answer' ? data.answer : data.candidate,
          userId: this.userId
        })
      });
    } catch (error) {
      console.error('Signaling API error:', error);
    }
  }

  startPolling() {
    if (this.pollInterval) return;
    
    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/webrtc/poll?roomId=${this.roomId}&userId=${this.userId}`);
        const data = await response.json();
        
        if (data.signals && data.signals.length > 0) {
          data.signals.forEach(signal => {
            this.emit(signal.type, signal.data);
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000);
  }

  disconnect() {
    this.connected = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.emit('disconnect');
  }

  // Simulate socket.to() for compatibility
  to(room) {
    return {
      emit: (event, data) => {
        // In fallback mode, we rely on polling to get messages
        console.log(`Fallback: Would emit ${event} to room ${room}`);
      }
    };
  }
}

// Create a factory function that tries Socket.IO first, then falls back
export function createSocket(url, options = {}) {
  return new Promise((resolve) => {
    // Try to import socket.io-client
    import('socket.io-client').then(({ default: io }) => {
      const socket = io(url, {
        ...options,
        timeout: 5000, // Quick timeout for fallback
      });

      const fallbackTimer = setTimeout(() => {
        console.log('Socket.IO timeout, using fallback');
        socket.disconnect();
        const fallback = new SocketFallback();
        resolve(fallback.connect());
      }, 5000);

      socket.on('connect', () => {
        clearTimeout(fallbackTimer);
        console.log('Socket.IO connected successfully');
        resolve(socket);
      });

      socket.on('connect_error', () => {
        clearTimeout(fallbackTimer);
        console.log('Socket.IO failed, using fallback');
        socket.disconnect();
        const fallback = new SocketFallback();
        resolve(fallback.connect());
      });
    }).catch(() => {
      // If socket.io-client import fails, use fallback
      console.log('Socket.IO not available, using fallback');
      const fallback = new SocketFallback();
      resolve(fallback.connect());
    });
  });
}

export default SocketFallback;