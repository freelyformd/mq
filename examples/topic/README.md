# Publishing and consuming topics with RabbitMQ

This example illustrates how to use rabbitmq topics with this library as described in [this tutorial](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html) 

It contains two scripts;
- `consumer.js`: accepts an exchange, a queue, and a list of topics it wants to bind to the queue.
- `publish.js`: accepts an exchange, a topic, and a message to publish to the broker

For simplicity, the scripts assume the rabbitmq server is running at 'amqp://localhost'

## How to run

Let's say you want to route messages as shown in the diagram below

[![Producers, exchanges, queues and consumers]](https://www.rabbitmq.com/img/tutorials/python-five.png)

- Run a rabbitmq instance using docker

```
docker run -d --hostname rabbitmq -p 5672:5672 -p 8888:15672 --name rabbit rabbitmq:management-alpine
```



- Run this command to create C1

```
./consume.js "X" "Q1" "*.orange.*"
```

- In another terminal, run this command to create C2

```
./consume.js "X" "Q2" "*.*.rabbit" "lazy.#"
```

- Now we can run a produce messages to test the proposition;

> A message with a routing key set to "quick.orange.rabbit" will be delivered to both queues. Message "lazy.orange.elephant" also will go to both of them. On the other hand "quick.orange.fox" will only go to the first queue, and "lazy.brown.fox" only to the second. "lazy.pink.rabbit" will be delivered to the second queue only once, even though it matches two bindings. "quick.brown.fox" doesn't match any binding so it will be discarded.

```
./publish.js "X" "quick.orange.rabbit" "the quick orange rabbit"
./publish.js "X" "lazy.orange.elephant" "the lazy orange elephant"
./publish.js "X" "quick.orange.rabbit" "the quick orange rabbit"
./publish.js "X" "quick.orange.fox" "the quick orange fox"
./publish.js "X" "lazy.brown.fox" "the lazy brown fox"
./publish.js "X" "lazy.pink.rabbit" "the lazy pink rabbit"
./publish.js "X" "quick.orange.male.rabbit" "the quick orange male rabbit"
./publish.js "X" "lazy.orange.male.rabbit" "the lazy orange male rabbit"
```

- Your first tab should look like this

```
$ ./consume.js "X" "Q1" "*.orange.*"             
[*] Binding `Q1` to `*.orange.*` from `X`
[*] Waiting for `X`. To exit press CTRL+C
the quick orange rabbit quick.orange.rabbit
the lazy orange elephant lazy.orange.elephant
the quick orange rabbit quick.orange.rabbit
the quick orange fox quick.orange.fox

```

- And the second...
```
$ ./publish.js "X" "Q2" "*.*.rabbit" "lazy.#"     
[*] Binding `Q2` to `*.*.rabbit` from `X`
[*] Binding `Q2` to `lazy.#` from `X`
[*] Waiting for `X`. To exit press CTRL+C
the quick orange rabbit quick.orange.rabbit
the lazy orange elephant lazy.orange.elephant
the quick orange rabbit quick.orange.rabbit
the lazy brown fox lazy.brown.fox
the lazy pink rabbit lazy.pink.rabbit
the lazy orange male rabbit lazy.orange.male.rabbit
```