import {Channel, connect, Connection, Options} from 'amqplib';

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

  public async start(amqpUrl: string) {
    this.connection = await connect(amqpUrl);

    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchange, 'topic', this.exchangeOptions);

    const q = await this.channel.assertQueue(this.queue, this.queueOptions);

    const uniqueTopics = [...new Set(this.topics)];

    await Promise.all(
      uniqueTopics.map(async (topic) =>
        await this.channel.bindQueue(q.queue, this.exchange, topic),
      ),
    );

    return this.channel.consume(q.queue, async (msg) => {
      const topic = msg.fields.routingKey;

      const [key] = this.subscribers(topic);

      const callback = this.topicCallbacks[key];

      if (!callback) {
        this.channel.ack(msg);
        return;
      }

      try {
        await callback(topic, JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      } catch (error) {
        this.channel.nack(msg);
      }

    }, {noAck: false});
  }

  public stop() {
    this.connection.close();
  }

  public subscribers(topic) {
    return Object.keys(this.topicCallbacks)
      .filter((topicGlob) => {
        const regexString = topicGlob.replace(/\*/g, '[^.]+').replace(/#/g, '.*');
        return topic.match('^' + regexString + '$');
      });
  }

}

export default TopicConsumer;
