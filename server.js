const express = require("express");
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require('./utils/user');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT;

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'L chat bot';

// Run when client connect
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room);

    // Welcome current current
    socket.emit('message', formatMessage(botName,'Welcome to L-chat!')); // emit to current connection

    // Broadcast when a user connect
    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage(botName,`${username} has joined the chat`)); // emit to very connection expect current connection

    // Send user and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.name} has left the chat`)
      );

      // Send users and room info
    }
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.name, msg));
  })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
