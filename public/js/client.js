const client = window.io();

const createMessage = (message) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('msg');

  const messageComponent = `
    <div class="msg-bubble">
      <div class="msg-text" data-testid="message">
        ${message}
      </div>
    </div>
  `;
  messageElement.innerHTML = messageComponent;

  return messageElement;
};

function generateRandomString(size) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < size; i += 1) {
     randomString += chars[Math.floor(Math.random() * 60)];
  }
  return randomString;
}
let nickname = generateRandomString(16);
console.log(nickname);

document.querySelector('#formSendMessage').addEventListener('submit', (e) => {
  e.preventDefault();

  const textMessage = document.querySelector('#messageInput').value;

  client.emit('message', { chatMessage: textMessage, nickname });
});

client.on('message', (message) => {
  const element = createMessage(message);
  document.getElementById('listMessages').append(element);
});

client.emit('sendNicknameToServer', nickname);

client.on('clientsList', (clientsList) => {
  const list = document.getElementById('listUsers');
  list.innerHTML = '';
  const listFiltered = clientsList.filter((nick) => nickname !== nick);
  listFiltered.unshift(nickname);
  listFiltered.forEach((nicknameUser) => {
    const listElement = document.createElement('li');
    listElement.setAttribute('data-testid', 'online-user');
    listElement.innerHTML = nicknameUser;
    list.appendChild(listElement);
  });
});

document.querySelector('#formAlterNick').addEventListener('submit', (e) => {
  e.preventDefault();

  nickname = document.querySelector('#nicknameInput').value;

  client.emit('sendNewNickname', nickname);
});

client.on('history', (history) => {
  history.forEach((histMessage) => {
    const text = `${histMessage.timestamp} - ${histMessage.nickname}: ${histMessage.message}`;
    const element = createMessage(text);
    document.getElementById('listMessages').append(element);
  });
});