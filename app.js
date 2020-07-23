const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const auth = require('./auth').auth;

const users = [],
  sockets = [],
  mainRoomId = 'main';

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/auth.html');
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/publish', (req, res) => {
  const user = users.find(user => user.id === req.headers.userid);
  if (!user) return res.status(403).json({message: 'Not Authorized'});
  let all = ''
  req.on('data', (data) => {
    all += data;
  })
    .on('end', () => {
      all = JSON.parse(all);
      const socket = sockets.find(socket => socket.userId === user.id);
      if (!all.message) return res.status(403).json({message: 'Empty Message'})
      // emit message to clients in the room only
      io.to(req.headers.roomid).emit('chatMessage', {
        roomId: req.headers.roomid,
        username: socket.username,
        message: all.message
      });
      res.json({message: 'ok'});
    });
});

io.on('connection', (socket) => {
  let connectedUser;

  auth(socket, users);

  // receive userId when an user logins
  socket.on('sendUserId', (userId) => {
    // default join main room
    socket.join(mainRoomId)
    connectedUser = users.find(user => user.id === userId);
    if (!connectedUser) return socket.emit('appError', {message: 'Not Authorized'});
    socket.username = connectedUser.username;
    socket.userId = userId;
    sockets.push(socket);
    io.to(mainRoomId).emit('userConnect', connectedUser, users);
  });

  socket.on('disconnect', () => {
    if (connectedUser) {
      const index = sockets.findIndex(socket => socket.userId === connectedUser.id);
      sockets.splice(index, 1);
    }
  });
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});
