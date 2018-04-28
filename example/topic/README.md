# RabbitMQ Topics

This example illustrates how to use rabbitmq topic with this library as described in [this tutorial](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html) 

Assumme you want to route messages from a producer to consumers as shown in the diagram below

[![Producers and Consumers]](https://www.rabbitmq.com/img/tutorials/python-five.png)

Run this command to create C1

```
./receive_logs_topic.js "X" "Q1" "*.orange.*"
```

In another terminal, run this command

```
./receive_logs_topic.js "X" "Q2" "*.*.rabbit" "lazy.#"
```

Now we can run a producer to send test this proposition

> A message with a routing key set to "quick.orange.rabbit" will be delivered to both queues. Message "lazy.orange.elephant" also will go to both of them. On the other hand "quick.orange.fox" will only go to the first queue, and "lazy.brown.fox" only to the second. "lazy.pink.rabbit" will be delivered to the second queue only once, even though it matches two bindings. "quick.brown.fox" doesn't match any binding so it will be discarded.

```
./emit_log_topic.js "X" "quick.orange.rabbit" "the quick orange rabbit"
./emit_log_topic.js "X" "lazy.orange.elephant" "the lazy orange elephant"
./emit_log_topic.js "X" "quick.orange.rabbit" "the quick orange rabbit"
./emit_log_topic.js "X" "quick.orange.fox" "the quick orange fox"
./emit_log_topic.js "X" "lazy.brown.fox" "the lazy brown fox"
./emit_log_topic.js "X" "lazy.pink.rabbit" "the lazy pink rabbit"
./emit_log_topic.js "X" "quick.orange.male.rabbit" "the quick orange male rabbit"
./emit_log_topic.js "X" "lazy.orange.male.rabbit" "the lazy orange male rabbit"
```

Your first tab should look like this

```
$ ./receive_logs_topic.js X Q1 "*.orange.*"                
[*] Binding `Q1` to `*.orange.*` from `X`
[*] Waiting for `X`. To exit press CTRL+C
the quick orange rabbit quick.orange.rabbit
the lazy orange elephant lazy.orange.elephant
the quick orange rabbit quick.orange.rabbit
the quick orange fox quick.orange.fox

```

And the second...
```
$ ./receive_logs_topic.js X Q2 "*.*.rabbit" "lazy.#"       
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