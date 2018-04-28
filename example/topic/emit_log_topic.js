#!/usr/bin/env node

const TopicProducer = require('../../src/topic/producer');

const [ex, topic, message] = process.argv.slice(2);

const producer = TopicProducer.create(ex).start();

producer.then(producer => {
  producer.publish(topic, message);
  setTimeout(() => producer.stop(), 500);
});