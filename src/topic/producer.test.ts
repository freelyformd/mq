import TopicProducer from './producer';

describe('Producer', () => {

  it('configures exchange correctly using constructor', () => {
    const consumer = TopicProducer.create('x');

    expect(consumer.exchange).toBe('x');
  });

  it('configures exchange and queue correctly using methods', () => {
    const consumer = TopicProducer.create();

    consumer.setExchange('x');

    expect(consumer.exchange).toBe('x');
  });

  it('configures exchange options correctly', () => {
    const consumer = new TopicProducer();

    consumer.setExchange('x', {durable: true});

    expect(consumer.exchange).toBe('x');
    expect(consumer.exchangeOptions.durable).toBe(true);
  });

});
