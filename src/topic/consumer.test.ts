import {TopicConsumer} from './';

describe('Consumer', () => {

  it('configures exchange and queue correctly using constructor', () => {
    const consumer = TopicConsumer.create('x', 'q');

    expect(consumer.exchange).toBe('x');
    expect(consumer.queue).toBe('q');
  });

  it('configures exchange and queue correctly using methods', () => {
    const consumer = TopicConsumer.create();

    consumer.setExchange('x');
    consumer.setQueue('q');

    expect(consumer.exchange).toBe('x');
    expect(consumer.queue).toBe('q');
  });

  it('configures exchange options correctly', () => {
    const consumer = new TopicConsumer();

    consumer.setExchange('x', {durable: true});

    expect(consumer.exchangeOptions.durable).toBe(true);
  });

  it('configures queue options correctly', () => {
    const consumer = new TopicConsumer();

    consumer.setQueue('x', {exclusive: false});

    expect(consumer.queueOptions.exclusive).toBe(false);
  });

  it('configures subscriptions correctly', () => {
    const consumer = new TopicConsumer();

    consumer.subscribe('topic.*', (topic) => topic);

    const [topicGlob] = consumer.subscribers('topic.sub');

    const subscriber = consumer.topicCallbacks[topicGlob];

    expect(subscriber('topic.sub', {})).toBe('topic.sub');

    consumer.subscribe('topic.#', (topic) => topic);

    const [topicGlob1] = consumer.subscribers('topic.sub.sub');

    const subscriber1 = consumer.topicCallbacks[topicGlob1];

    expect(subscriber1('topic.sub.sub', {})).toBe('topic.sub.sub');
  });

});
