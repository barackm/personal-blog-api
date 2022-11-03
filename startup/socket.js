const { Server } = require('socket.io');
const createSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('socket connected');
    socket.on('disconnect', () => {
      console.log('desconnected');
    });
  });

  global.io = io;
};

module.exports = createSocketServer;
