# @freelyformd/mq

A sweet syntax wrapper around amqplib. We use this with rabbitmq

## Usage

## Installation

```
npm install @freelyformd/mq 
# or
yarn @freelyformd/mq
```

### A rabbitmq topic consumer

```js
const {TopicConsumer} = require('@freelyformd/mq');


TopicConsumer
  .create('exchange', 'q')
  .subscribe('lazy.#', console.log)
  .subscribe('*.*.rabbit', console.log)
  .start('amqp://localhost');

```

### A rabbitmq topic publisher

```js
const {TopicProducer} = require('@freelyformd/mq');

const producer = TopicProducer.create('exchange', 'q').start();

producer.then(producer => {
  producer.publish("quick.orange.rabbit", "the quick orange rabbit");
  setTimeout(() => producer.stop(), 500);
});
```


> Still in active development!