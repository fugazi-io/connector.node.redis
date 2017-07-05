# connector.node.redis

A fugazi connector for Redis which adds the ability to use redis from the [fugazi terminal client](https://github.com/fugazi-io/webclient).

## Installing
The connector requires [node.js](https://nodejs.org/en/) to run, if you don't have it then [download](https://nodejs.org/en/download/) or use [a package manager](https://nodejs.org/en/download/package-manager/).  

The package can be found in [npm @fugazi/connector.redis](https://www.npmjs.com/package/@fugazi/connector.redis):
```bash
npm install @fugazi/connector.redis
```

You then need to compile the typescript files:
```bash
npm run compile
// or
node_modules/typescript/bin/tsc -p scripts
```

## Running
```bash
npm run start
// or
node scripts/bin/index.js
```

If you want to pass arguments then:
```bash
npm run start -- --redis-host 3232
// or
node scripts/bin/index.js --redis-host 3232
```

### Options:
#### --redis-host
The host to which the redis service is bound to, default is `localhost`
```bash
node scripts/bin/index.js --redis-host 0.0.0.0
```

#### --redis-port
The port to which the redis service is bound to, default is `6379`
```bash
node scripts/bin/index.js --redis-port 6333
```

#### --listen-host
The host to which the connector service is bound to, default is `localhost`
```bash
node scripts/bin/index.js --listen-host 0.0.0.0
```

#### --listen-port
The port to which the connector service is bound to, default is `33334`
```bash
node scripts/bin/index.js --listen-port 33333
```

## Using
Once the connector service starts it should print something like:
```
info: ===== ROUTES START =====
... served routes ...
info: # Root modules:
info:     /redis.json
info: ====== ROUTES END ======
info: Connected to redis at localhost:6379
info: server started. listening on localhost:33334
info: connector started
```

In a fugazi terminal ([http://fugazi.io](http://fugazi.io) or if hosted anywhere else) load the module from the provided url:
```
load module from "http://localhost:33334/redis.json"
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
 * [TYPE](https://redis.io/commands/type)
 
More commands to follow.

## Contribution
We'll be happy to get help with this connector (as with all [fugazi repos](https://github.com/fugazi-io)), for example to 
add unimplemented commands (more info in [Add a Redis command](https://github.com/fugazi-io/connector.node.redis/wiki/Add-a-Redis-command)).  

## Contact
Feel free to [create issues](https://github.com/fugazi-io/connector.node.redis/issues) if you're running into trouble, 
and welcome to ask any question in [our gitter](https://gitter.im/fugazi-io/Lobby).
