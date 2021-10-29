var amqp = require('amqplib');

async function agent() {
  let connection = await amqp.connect('amqp://guest:guest@localhost:5672');
  let channel = await connection.createChannel();
  let queue = 'transactions';
  await channel.assertQueue(queue, { durable: true });
  await channel.prefetch(1);
  await channel.assertExchange('notifications', 'fanout', { durable: true });
  channel.consume(
    'transactions',
    (message) => {
      let transaction = JSON.parse(message.content.toString());

      if (transaction.amount > 0) {
        channel.ack(message);
        console.log(
          `[AGENT] Transaction n° ${transaction.transactionId} (${transaction.amount}€) traitée avec succès`
        );

        // Placeholder en attendant d'utiliser le fichier account.json
        let notification = {
          message: `Bonjour ${transaction.owner_first_name} ${transaction.owner_last_name}, votre paiement de ${transaction.amount} a bien été effectué`,
          account_id: transaction.account_id,
          mail: transaction.owner_mail,
          tel: transaction.owner_phone,
        };

        channel.publish('notifications', '', Buffer.from(JSON.stringify(notification)));
      } else {
        channel.nack(message, false, false);
        console.error(
          `[AGENT] Transaction n° ${transaction.transactionId} (${transaction.amount}€) invalide`
        );
      }
    },
    { noAck: false }
  );
}

agent();
