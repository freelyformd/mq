import {Channel, connect, Connection, Options} from 'amqplib';
import log from '../utils/logger';

class TopicProducer {
  public static EXCHANGE_TYPE = 'topic';

  public static create(exchange?: string) {
    return new TopicProducer(exchange);
  }

  public exchange: string;
  public exchangeOptions: Options.AssertExchange;
  private connection: Connection;
  private channel: Channel;

  constructor(exchange?: string) {
    this.exchange = exchange;
  }

  public setExchange(name: string, options?: Options.AssertExchange) {
    this.exchange = name;
    this.exchangeOptions = options;
  }

  public async start(url: string) {
    if (!this.connection) {
      this.connection = await connect(url);
      log('connection.open', url);
    }

    this.channel = await this.connection.createChannel();
    log('channel.create', this.exchange);

    await this.channel.assertExchange(this.exchange, TopicProducer.EXCHANGE_TYPE, {
      durable: true,
    });
    log('exchange.assert', this.exchange);

    return this;
  }

  public publish(topic, data) {
    const content = new Buffer(JSON.stringify(data));
    this.channel.publish(this.exchange, topic, content);
    log('channel.publish', topic);
  }

  public async stop() {
    await this.connection.close();
    log('connection.close');
  }

}

export default TopicProducer;
