import {connect, Channel, Connection, Options} from 'amqplib';

class TopicConsumer {
    private connection: Connection;
    private channel: Channel;
    private exchange: string;
    private exchangeOptions: Options.AssertExchange;
    private queue: string;
    private queueOptions: Options.AssertQueue;
    private topics: string[];
    private topicFunctions = {};

    static create(exchange, queue) {
        return new TopicConsumer(exchange, queue);
    }

    constructor(exchange = null, queue = '') {
        this.exchange = exchange;
        this.queue = queue;
    }

    setExchange(exchange: string, options: Options.AssertExchange) {
        this.exchange = exchange;
        this.exchangeOptions = options;

        return this;
    }

    setQueue(queue: string, options: Options.AssertQueue) {
        this.queue = queue;
        this.queueOptions = options;

        return this;
    }

    subscribe(topic: string, callback: any) {
        this.topics = [...this.topics, topic];
        this.topicFunctions[topic] = callback;

        return this;
    }

    async start(amqpUrl: string) {
        this.connection = await connect(amqpUrl);

        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange(this.exchange, 'topic', this.exchangeOptions);

        const q = await this.channel.assertQueue(this.queue, this.queueOptions);

        const uniqueTopics = [...new Set(this.topics)];

        await Promise.all(
            uniqueTopics.map(async topic =>
                await this.channel.bindQueue(q.queue, this.exchange, topic)
            )
        );

        return this.channel.consume(q.queue, async msg => {
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
                await callback(topic, JSON.parse(msg.content.toString()));
                this.channel.ack(msg);
            } catch (error) {
                this.channel.nack(msg)
            }

        }, {noAck: false,});
    }

    stop() {
        this.connection.close();
    }

}

export default TopicConsumer;
