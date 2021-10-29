const amqp = require('amqplib');
const accounts = require('./accounts.json');
const { v4: uuidv4 } = require('uuid');

let delay = process.argv[2] || 1000;
async function emitter() {
  let connection = await amqp.connect('amqp://guest:guest@localhost:5672');
  let channel = await connection.createChannel();
  let queue = 'transactions';
  await channel.assertQueue(queue, { durable: true });
  setInterval(async () => {
    let isCorrupted = Math.random() < 0.1;
    let accountIndex = Math.floor(Math.random() * 99);
    let transaction = {
      account_num: accounts[accountIndex].account_id,
      timestamp: Date.now(),
      transactionId: uuidv4(),
      amount: isCorrupted ? -1 : Math.floor(Math.random() * (10000 + 2 + 1)) - 2,
    };

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(transaction)), { persistent: true });

    console.log(
      `[EMITTER] Transaction n°${transaction.transactionId} (${transaction.amount}€) envoyée`
    );
  }, delay);
}

emitter();
