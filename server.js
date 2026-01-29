const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Make io globally available for API routes
  global._io = io;

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register-doctor", ({ doctorId }) => {
      socket.join(`doctor_${doctorId}`);
    });

    socket.on("register-user", ({ userId }) => {
      socket.join(`user_${userId}`);
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
      
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      if (roomSockets && roomSockets.size >= 2) {
        console.log(`Both users in room ${roomId}, ready for call`);
      }
    });

    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    socket.on("end-call", (roomId) => {
      socket.to(roomId).emit("user-disconnected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});