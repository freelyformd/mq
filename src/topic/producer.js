const amqplib = require('amqplib');


class TopicProducer {

  static create(exchange) {
    return new TopicProducer(exchange);
  }

  constructor(exchange) {
    this.connection = null;
    this.channel = null;
    this.exchange = exchange;
  }

  async start(amqpUrl) {
    this.connection = await amqplib.connect(amqpUrl);
    this.channel = await this.connection.createChannel();
    // eslint-disable-next-line no-unused-vars
    await this.channel.assertExchange('events', 'topic', { durable: true });

    return this;
  }

  publish(topic, data) {
    // eslint-disable-next-line no-console
    const serialised = JSON.stringify(data);
    console.log('Broadcast %s: %s', topic, serialised);
    this.channel.publish(this.exchange, topic, new Buffer(serialised));
  }

  stop() {
    this.connection.close();
  }

}

module.exports = TopicProducer;