import { Server } from 'socket.io';

let io;
const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export const initSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL?.replace(/\/$/, ''),
    'http://localhost:5173',
    'https://chatapp-chatify.vercel.app',
    'https://chatapp-chatify.vercel.app/',
    'https://real-time-chat-app-aymc.vercel.app',
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(o => o.replace(/\/$/, '') === normalizedOrigin);
        return callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });



  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== 'undefined') {
      userSocketMap[userId] = socket.id;
    }

    // broadcast to all connected clients the list of online users
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // Handle typing events
    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', { senderId: userId });
      }
    });

    socket.on('stopTyping', ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStoppedTyping', { senderId: userId });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (userId) {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
