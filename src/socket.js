const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/mainConfig');
const port = process.env.PORT || 8000;
const _ = require('lodash');

let io = null;

const checkToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return false;
  }
};

const registerAuth = () => {
  io.on('connection', (socket) => {
    socket.auth = false;
    socket.on('authenticate', (data) => {
      const decoded = checkToken(data.token);
      if (decoded) {
        console.log('Authenticated: ', socket.id);
        socket.auth = true;
        socket.user = decoded;
        socket.join('authenticated');
      }
    });
    socket.on('disconnect', () => {
      console.log('Disconnected: ', socket.id);
      socket.leave('authenticated');
    });
    setTimeout(function () {
      if (!socket.auth) {
        console.log('Disconnecting socket ', socket.id);
        socket.disconnect('unauthorized');
      }
    }, 1000);
  });
};

const sendNotice = async (userId, message) => {
  const sockets = await io.in('authenticated').fetchSockets();
  console.log(sockets.length);
  _.each(sockets, (socket) => {
    if (socket.user._id == userId.toString()) {
      console.log('Sending notice to ', socket.id);
      socket.emit('notice', { message });
    }
  });
};

module.exports = {
  initServer(app) {
    const httpServer = createServer(app);
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        optionsSuccessStatus: 200,
      },
    });
    registerAuth();
    httpServer.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  },
  sendNotice,
};
