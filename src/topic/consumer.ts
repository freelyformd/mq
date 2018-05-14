import {Channel, connect, Connection, Message, Options} from 'amqplib';
import log from '../utils/logger';

class TopicConsumer {

  public static create(exchange?: string, queue?: string) {
    return new TopicConsumer(exchange, queue);
  }

  public exchange: string;
  public exchangeOptions: Options.AssertExchange;
  public queue: string;
  public queueOptions: Options.AssertQueue;
  public topics: string[];
  public topicCallbacks: {[topicGlob: string]: (topic: string, payload: any) => any};
  private connection: Connection;
  private channel: Channel;

  constructor(exchange?: string, queue?: string) {
    this.exchange = exchange;
    this.queue = queue;
  }

  public setExchange(exchange: string, options?: Options.AssertExchange) {
    this.exchange = exchange;
    this.exchangeOptions = options;

    return this;
  }

  public setQueue(queue: string, options?: Options.AssertQueue) {
    this.queue = queue;
    this.queueOptions = options;

    return this;
  }

  public subscribe(topic: string, callback: any) {
    this.topics = [...this.topics || [], topic];
    this.topicCallbacks = {
      ...this.topicCallbacks || {},
      [topic]: callback,
    };

    return this;
  }

  public async start(url: string) {
    if (!this.connection) {
      this.connection = await connect(url);
      log('connection.open', url);
    }

    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchange, 'topic', this.exchangeOptions);
    log('exchange.assert', this.exchange);

    const q = await this.channel.assertQueue(this.queue, this.queueOptions);
    log('queue.assert', this.queue);

    const uniqueTopics = [...new Set(this.topics)];

    await Promise.all(
      uniqueTopics.map(async (topic) => {
        await this.channel.bindQueue(q.queue, this.exchange, topic);
        log('channel.bind',  `"${topic}" topic to "${q.queue}" queue on "${this.exchange}" exchange`);
      }),
    );

    return await this.consume(q);
  }

  public stop() {
    this.connection.close();
    log('connection.close');
  }

  public subscribers(topic) {
    return Object.keys(this.topicCallbacks)
      .filter((topicGlob) => {
        const regexString = topicGlob.replace(/\*/g, '[^.]+').replace(/#/g, '.*');
        return topic.match('^' + regexString + '$');
      });
  }

  private async consume(q) {
    return this.channel.consume(q.queue, async (msg: Message) => {
      const topic = msg.fields.routingKey;
      const time = Date.now();
      log('channel.message', `${topic}:${time}`);

      const [key] = this.subscribers(topic);

      const callback = this.topicCallbacks[key];

      if (!callback) {
        this.channel.ack(msg);
        return;
      }

      try {
        const content = JSON.parse(msg.content.toString());
        await callback(topic, content);
        this.channel.ack(msg);
        log('channel.ack', `${topic}:${time}`);
      } catch (error) {
        this.channel.nack(msg);
        log('channel.nack', `${topic}:${time}`);
      }

    }, {noAck: false});
  }

}

export default TopicConsumer;
