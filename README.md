# SugarMQ

[![Build Status](https://travis-ci.org/freelyformd/mq.svg?branch=master)](https://travis-ci.org/freelyformd/mq)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![GitHub license](https://img.shields.io/github/license/freelyformd/mq.svg)](https://github.com/freelyformd/mq)

An opinionated expressive wrapper around amqplib. This library aims to make it simpler to build event driven microservices that use RabbitMQ as a messaging broker.

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
