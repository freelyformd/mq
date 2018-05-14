# SugarMQ

[![Build Status](https://travis-ci.org/freelyformd/mq.svg?branch=master)](https://travis-ci.org/freelyformd/mq)
[![Coverage Status](https://coveralls.io/repos/github/freelyformd/mq/badge.svg?branch=master)](https://coveralls.io/github/freelyformd/mq?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/sugarmq.svg)](https://www.npmjs.com/package/sugarmq)
[![npm downloads](https://img.shields.io/npm/dt/sugarmq.svg)](https://www.npmjs.com/package/sugarmq)

An opinionated declarative wrapper around the node amqplib. We use this library to make it simpler for us to build event driven microservices that use RabbitMQ as a message broker.

## Installation

```
npm install sugarmq --save
# or
yarn add sugarmq
```

## Road Map

This library is still under active development, we encourage you to try it and give us feedback in the issues. Below are some of the the things we intend to work on over the next couple of weeks;
- [x] Topic Producer and Consumer
- [ ] Scheduled Producers (publish to a delayed messages exchange)
- [ ] Direct Queue Producer and Consumer
- [ ] Create Docker image for RabbitMQ bundled with plugins needed for library.

## Usage

### Topic Pub/Sub

RabbitMQ allows multiple programs to receive messages about a topic on an exchange. It also allows multiple programs to publish messages about any topic to an exchange. In this section, we'll see how to consume and publish different topics to an exchange.

#### Creating a topic consumer

```js
// consume.js
const {TopicConsumer} = require('sugarmq');

TopicConsumer.create()
  .setExchange('x')
  .setQueue('q')
  .subscribe('lazy.#', (topic, message) => {
    // Do interesting stuff to lazy.# messages here
    // ...
    console.log(topic, message);
  }) 
  .subscribe('*.*.rabbit', (topic, message) => {
    // Do interesting stuff to *.*.rabbit messages here
    // ...
    console.log(topic, message);
  })
  .start('amqp://localhost');

```

The above code snippet, does five things;
- Ensures a topic exchange named "x" exists on our RabbitMQ exchange. It doesn't it will be created. If it does but does not match your declaration, an exception will be thrown and our code will fail.
- Ensures a queue named "q" exists on the instance. Again, if it doesn't it will be created, and if it exists with a different declaration, our code fails with an "blah blah" exception.
- Subscribes to all messages sent to exchange `x` whose topic starts with `lazy`. 
- Subscribes to all messages sent to exchange `x` whose topic matches the expression `*.*.rabbit`
- Starts the topic consumer. In the background, this establishes an amqp connection, asserts the exchange and queue, and binds topics to queue. When a message is received from the queue for a given topic, the respective callback is called. It is important to note that *only one* callback is invoked even if more than one match the topic. It is therefore best to ensure you subscribe to mutually exclusive topic globs.

To run this snippet, copy and paste the code to file named "consume.js", and run it as a command;
```sh
node consume.js
```

To see logs from the library;

```sh
DEBUG=sugarmq node consume.js
```

#### Creating a topic publisher

```js
const {TopicProducer} = require('sugarmq');

TopicProducer.create()
  .setExchange('x')
  .start('amqp://localhost')
  .then(producer => {
    producer.publish("quick.orange.rabbit", "the quick orange rabbit");
    setTimeout(() => producer.stop(), 500);
  });
```

In the above snippet, our script;
- Declares an exchange `x`
- Starts the producer. In the background this establishes connection, asserts the exchange and returns our producer ready to publish messages). This is an "async" method, so we have to "await" the  producer.
- Publishes to the `quick.orange.rabbit` topic on exchange `x` and stops the producer (closes connection) after half a second.

To run this snippet, copy and paste the code to file named 'produce.js', and run it as a command;
```sh
node produce.js
```

To see logs from the library;

```sh
DEBUG=sugarmq node produce.js
```


