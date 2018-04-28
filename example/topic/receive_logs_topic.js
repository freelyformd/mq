#!/usr/bin/env node

const TopicConsumer = require('../../src/topic/consumer');

const [ex, q, ...topics] = process.argv.slice(2);

const consumer = TopicConsumer.create(ex, q);

topics.forEach(topic => {
  consumer.subscribe(topic, console.log)
});

consumer.start('amqp://localhost');