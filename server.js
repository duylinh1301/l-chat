import express from "express";
import redis from 'redis';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

import formatMessage from './utils/messages.js';
import { userJoin, getCurrentUser, getRoomUsers, userLeave } from './utils/user.js';

// Initial Express
const app = express();
const server = http.createServer(app);

const io = new Server(server);

const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.PORT || 6379;

const __dirname = path.resolve();

// initalize redis
const client = redis.createClient({
  host: '127.0.0.1',
  port: REDIS_PORT
});
await client.connect();
client.on('error', (err) => console.log('Redis Client Error', err));

const setRedis = (key, value) => {

  if (typeof key !== 'string') {
    key = JSON.stringify(key);
  }

  if (typeof value !== 'string') {
    value = JSON.stringify(value);
  }

  client.set(key, value);
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'L chat bot';

// Run when client connect
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    console.log(socket.id, username, room);

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
    const room = getRoomUsers(user.room)
    console.log(room.id);
    setRedis(room.room, formatMessage(user.name, msg));
    io.to(user.room).emit('message', formatMessage(user.name, msg));
  })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
