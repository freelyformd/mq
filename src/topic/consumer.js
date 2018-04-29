const amqp = require('amqplib');

class TopicConsumer {

  static create(exchange, queue) {
    return new TopicConsumer(exchange, queue);
  }

  constructor(exchange = null, queue = '') {
    this.connection = null;
    this.channel = null;
    this.exchange = exchange;
    this.exchangeOptions = {};
    this.queue = queue;
    this.queueOptions = {};
    this.topics = [];
    this.topicFunctions = {};
  }

  setExchange(ex, options = {durable: true}) {
    this.exchange = ex;
    this.exchangeOptions = options;

    return this;
  }

  setQueue(q = '', options = {exclusive: true}) {
    this.queue = q;
    this.queueOptions = options;

    return this;
  }

  subscribe(topic, callback) {
    this.topics = [...this.topics, topic];
    this.topicFunctions[topic] = callback;

    return this;
  }

  async start(amqpUrl) {
    this.connection = await amqp.connect(amqpUrl);

    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchange, 'topic', this.exchangeOptions);

    const q = await this.channel.assertQueue(this.queue, this.queueOptions);

    const uniqueTopics = [...new Set(this.topics)];

    uniqueTopics.forEach(topic => {
      this.channel.bindQueue(q.queue, this.exchange, topic);
    });

    this.channel.consume(q.queue, async msg => {
      const topic = msg.fields.routingKey;

      const [key] = Object.keys(this.topicFunctions).filter(t => {
        const regexString = t.replace(/\*/g, '[^.]+').replace(/#/g, '.*');
        const regex = new RegExp('^' + regexString + '$');

        return topic.match(regex);
      });

      const callback = this.topicFunctions[key];

      if (!callback) {
        this.channel.ack(msg);
        return;
      }

      try {
        await callback(JSON.parse(msg.content.toString()), topic);
        this.channel.ack(msg);
      } catch (error) {
        // Catch error
      }

    }, { noAck: false, });

    return this;
  }

  stop() {
    this.connection.stop();
  }

}

module.exports = TopicConsumer;
