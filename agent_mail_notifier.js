var amqp = require('amqplib');

async function EmailNotifier() {
  let connection = await amqp.connect('amqp://guest:guest@localhost:5672');
  let channel = await connection.createChannel();
  let queue = 'notification_email';
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, 'notifications', '');
  channel.consume(
    queue,
    (message) => {
      let notification = JSON.parse(message.content.toString());
      console.log(
        `[MAIL] Mail envoyé au ${notification.owner_mail} avec succès ${JSON.stringify(
          notification
        )}`
      );
    },
    { noAck: false }
  );
}

EmailNotifier();
