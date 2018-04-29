# SugarMQ

A sweet syntax wrapper around amqplib. We use this with rabbitmq

## Installation

```
npm install sugarmq --save
# or
yarn add sugarmq
```

## Usage

### Creating a topic consumer

```js
const {TopicConsumer} = require('sugarmq');

TopicConsumer.create()
  .setExchange('exchange')
  .setQueue('q')
  .subscribe('lazy.#', console.log) 
  .subscribe('*.*.rabbit', console.log)
  .start('amqp://localhost');

```

### Creating a topic publisher

```js
const {TopicProducer} = require('sugarmq');

TopicProducer.create()
  .setExchange('exchange')
  .start('amqp://localhost')
  .then(producer => {
    producer.publish("quick.orange.rabbit", "the quick orange rabbit");
    setTimeout(() => producer.stop(), 500);
  });
```