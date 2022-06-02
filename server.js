const express = require("express");
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT;

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'L chat bot';

// Run when client connect
io.on('connection', socket => {
  // Welcome current current
  socket.emit('message', formatMessage(botName,'Welcome to L-chat!')); // emit to current connection

  // Broadcast when a user connect
  socket.broadcast.emit('message', formatMessage(botName,'A user has joined the chat')); // emit to very connection expect current connection

  // Run when client disconnect
  socket.on('disconnect', () => {
    io.emit('message', formatMessage(botName,'A user has left the chat'));
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    io.emit('message', formatMessage('User', msg));
  })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
