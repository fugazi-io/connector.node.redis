# connector.node.redis

A fugazi connector for Redis which adds the ability to use redis from the [fugazi terminal client](https://github.com/fugazi-io/webclient).

## Installing
The package can be found in [npm @fugazi/connector.redis](https://www.npmjs.com/package/@fugazi/connector.redis):
```bash
npm install @fugazi/connector.redis
```

## Running
```bash
/CONNECTOR/PATH > node ./scripts/bin/index.js
```

### Options:
#### --redis-host
The host to which the redis service is bound to, default is `localhost`
```bash
/CONNECTOR/PATH > node ./scripts/bin/index.js --redis-host 0.0.0.0
```

#### --redis-port
The port to which the redis service is bound to, default is `6379`
```bash
/CONNECTOR/PATH > node ./scripts/bin/index.js --redis-port 6333
```

#### --listen-host
The host to which the connector service is bound to, default is `localhost`
```bash
/CONNECTOR/PATH > node ./scripts/bin/index.js --listen-host 0.0.0.0
```

#### --listen-port
The port to which the connector service is bound to, default is `33334`
```bash
/CONNECTOR/PATH > node ./scripts/bin/index.js --listen-port 33333
```

## Using
Once the connector service starts it logs the addresses to which it is bound to along with a url for the fugazi module, i.e.:
```
info: Connected to redis at localhost:6379
info: server started. listening on localhost:33334
info: you can load the following urls from any fugazi terminal:
info: http://localhost:33334/descriptor.json
```

In a fugazi terminal (regardless of where it hosted from) load the module from the provided url:
```
load module from "http://localhost:33334/descriptor.json"
```

Now you're ready to use the redis module, for example:
```
set mykey myvalue
get mykey
```
Should output:
```
"myvalue"
```

## Supported commands
The following commands are supported:
 * [APPEND](https://redis.io/commands/append)
 * [DBSIZE](https://redis.io/commands/dbsize)
 * [DECR](https://redis.io/commands/decr)
 * [DECRBY](https://redis.io/commands/decrby)
 * [DEL](https://redis.io/commands/del)
 * [DUMP](https://redis.io/commands/dump)
 * [EXISTS](https://redis.io/commands/exists)
 * [GET](https://redis.io/commands/get)
 * [SET](https://redis.io/commands/set)
 
More commands to follow.

## Contribution

We'll be happy to get help with this connector (as with all [fugazi repos](https://github.com/fugazi-io)), for example to 
add unimplemented commands.  
Feel free to fork and open pull request, or find us in this gmail.com address: terminal.fugazi.io