var amqp = require('amqplib');

async function SMSNotifier() {
  let connection = await amqp.connect('amqp://guest:guest@localhost:5672');
  let channel = await connection.createChannel();
  let queue = 'notification_sms';
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, 'notifications', '');
  channel.consume(
    queue,
    (message) => {
      let notification = JSON.parse(message.content.toString());
      console.log(
        `[SMS] SMS envoyé au ${notification.owner_phone} avec succès ${JSON.stringify(
          notification
        )}`
      );
    },
    { noAck: false }
  );
}

SMSNotifier();
