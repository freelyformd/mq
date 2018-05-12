import {Channel, connect, Connection, Options} from 'amqplib';

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
    }

    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(
      this.exchange,
      TopicProducer.EXCHANGE_TYPE,
      {
        durable: true,
      },
    );

    return this;
  }

  public publish(topic, data) {
    const content = new Buffer(JSON.stringify(data));
    this.channel.publish(this.exchange, topic, content);
  }

  public async stop() {
    return await this.connection.close();
  }

}

export default TopicProducer;
