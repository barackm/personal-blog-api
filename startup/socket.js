const { Server } = require('socket.io');
const { autoSaveArticle } = require('../services/articles');
const { FRONTEND_URL } = require('../utlis/constants');
const createSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('socket connected');
    socket.on('disconnect', () => {
      console.log('desconnected');
    });

    socket.on('auto-save-article', async (data) => {
      const { article, currentUser } = data;
      await autoSaveArticle(
        article._id,
        { draft: article.draft, title: article.title, tags: article.tags },
        currentUser._id,
      );
    });
  });

  global.io = io;
};

module.exports = createSocketServer;
