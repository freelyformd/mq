#!/usr/bin/env node

const {TopicProducer} = require('../../lib/topic');

const [ex, topic, message] = process.argv.slice(2);

const producer = TopicProducer.create(ex).start();

producer.then(producer => {
  producer.publish(topic, message);
  setTimeout(() => producer.stop(), 500);
});