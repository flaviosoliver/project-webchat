const connection = require('./connection');

const createMessage = async (message, nickname, timestamp) => {
  await connection()
    .then((db) =>
    db.collection('messages')
    .insertOne({ message, nickname, timestamp }));
};

const getAllMessages = async () => {
  const messages = await connection()
    .then((db) =>
    db.collection('messages')
    .find().toArray());
  return messages;
};

module.exports = {
  createMessage,
  getAllMessages,
};