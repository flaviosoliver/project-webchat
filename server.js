const express = require('express');
const dateformat = require('dateformat');

const app = express();
const http = require('http').createServer(app);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

const io = require('socket.io')(http, {
  cors: {
    origin: 'http//localhost:3000',
    methods: ['GET', 'POST'], 
  },
});

const { createMessage, getAllMessages } = require('./models/chatModel');

const clients = {};
let clientsList = [];

const messageUser = async (message) => {
  console.log('message', message);
  const date = dateformat(new Date(), 'dd-MM-yyyy HH:mm:ss');
  const text = `${date} - ${message.nickname}: ${message.chatMessage}`;
  io.emit('message', text);
  await createMessage(
    message.chatMessage,
    message.nickname,
    date,
  );
};

const sendNickname = (nickname, socket) => {
  console.log('nickname', nickname);
  clientsList.push(nickname);
  console.log('clientList', clientsList);
  clients[socket.id] = nickname;
  io.emit('clientsList', clientsList);
};

const alterNickname = (nickname, socket) => {
  const atualNickname = clients[socket.id];
  clientsList = clientsList.filter((nick) => atualNickname !== nick);
  clientsList.push(nickname);
  clients[socket.id] = nickname;
  io.emit('clientsList', clientsList);
};

const disconnect = (socket) => {
  const userDisconnected = clients[socket.id];
    clientsList = clientsList.filter((nickname) => userDisconnected !== nickname);
    io.emit('clientsList', clientsList);
};

io.on('connection', async (socket) => {
  console.log('novo usuário conectado:', socket.id);
  socket.on('message', (message) => 
  messageUser(message));
  socket.on('sendNicknameToServer', (nickname) =>
    sendNickname(nickname, socket));
  socket.on('disconnect', () =>
    disconnect(socket));
  socket.on('sendNewNickname', (nickname) =>
  alterNickname(nickname, socket));
  socket.emit('history', await getAllMessages());
});

const PORT = 3000;

http.listen(PORT, () =>
  console.log('App rodando na porta', PORT));