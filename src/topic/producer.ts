import {connect, Connection, Channel, Options} from 'amqplib';


class TopicProducer {
    private connection: Connection;
    private channel: Channel;
    private exchange: string;
    private exchangeOptions: Options.AssertExchange;

    static create(connection) {
        return new TopicProducer(connection);
    }

    constructor(connection: Connection) {
        this.connection = connection;
    }

    setExchange(name: string, options: Options.AssertExchange) {
        this.exchange = name;
        this.exchangeOptions = options;
    }

    async start(amqpUrl) {
        if (!this.connection) {
            this.connection = await connect(amqpUrl);
        }

        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange('events', 'topic', {durable: true});

        return this;
    }

    publish(topic, data) {
        const serialised = JSON.stringify(data);
        this.channel.publish(this.exchange, topic, new Buffer(serialised));
    }

    stop() {
        this.connection.close();
    }

}

export default TopicProducer;