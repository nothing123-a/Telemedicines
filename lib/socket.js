const { Server } = require("socket.io");

let io;
const userSockets = new Map(); // Store user socket connections

function initIO(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ["https://claritycare2-0.onrender.com", "https://claritycare20.vercel.app"]
        : "*",
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on("connection", (socket) => {
    console.log("🔌 New Socket.IO:", socket.id);

    socket.on("register-doctor", ({ doctorId }) => {
      const doctorRoom = `doctor_${doctorId}`;
      console.log(`Doctor ${doctorId} joined room: ${doctorRoom}`);
      socket.join(doctorRoom);
    });

    socket.on("register-user", ({ userId }) => {
      const userRoom = `user_${userId}`;
      console.log(`👤 User ${userId} joined room: ${userRoom} with socket: ${socket.id}`);
      socket.join(userRoom);
      socket.join(userId.toString()); // Also join with just userId for compatibility
      userSockets.set(userRoom, socket.id);
      userSockets.set(userId.toString(), socket.id);
      console.log(`🗺️ Current user sockets:`, Array.from(userSockets.keys()));
    });
    
    socket.on("test-connection", ({ userId }) => {
      console.log(`📞 Test connection from user: ${userId}`);
      socket.emit("test-response", { message: "Socket connection working!", userId });
    });

    socket.on("join-room", (data) => {
      const roomId = typeof data === 'string' ? data : data.roomId;
      const userType = data.userType || 'unknown';
      socket.join(roomId);
      console.log(`${userType} joined room: ${roomId}`);
      
      // Notify other users in the room
      socket.to(roomId).emit('user-connected', { userType, socketId: socket.id });
      
      // Check if both users are present
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      if (roomSockets && roomSockets.size >= 2) {
        console.log(`Both users present in room ${roomId}`);
        io.to(roomId).emit('call-ready');
        
        // Tell doctor to start the call
        socket.to(roomId).emit('start-call');
      }
    });

    // WebRTC signaling
    socket.on("offer", ({ roomId, offer }) => {
      console.log(`📞 Relaying offer to room: ${roomId}`);
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      console.log(`📞 Relaying answer to room: ${roomId}`);
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      console.log(`🧊 Relaying ICE candidate to room: ${roomId}`);
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    socket.on("end-call", (roomId) => {
      console.log(`📞 Call ended in room: ${roomId}`);
      socket.to(roomId).emit("user-disconnected");
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
      // Notify all rooms this user was in
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit("user-disconnected");
        }
      });
      
      // Remove from userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });

    // Handle session start events
    socket.on("start-session", ({ roomId, connectionType }) => {
      socket.join(roomId);
      console.log(`User joined session room: ${roomId} for ${connectionType}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
      // Remove from userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

function getUserSocket(userId) {
  return userSockets.get(userId);
}

function emitToUser(userId, event, data) {
  if (!io) return false;
  
  const userRoom = `user_${userId}`;
  const socketId = userSockets.get(userRoom);
  if (socketId) {
    // Emit to specific socket
    io.to(socketId).emit(event, data);
    console.log(`📡 Emitted ${event} to user ${userId} via socket ${socketId}`);
    return true;
  } else {
    // Fallback: emit to room
    io.to(userRoom).emit(event, data);
    console.log(`📡 Emitted ${event} to user room ${userRoom}`);
    return false;
  }
}

module.exports = {
  initIO,
  getIO,
  getUserSocket,
  emitToUser
};