/**
 * Created by nitzan on 28/02/2017.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var connector = require("fugazi.connector.node");
var program = require("commander");
var redis = require("./redis");
var pjson = require("../../package.json");
var VERSION = pjson.version, DEFAULT_HOST = "localhost", DEFAULT_REDIS_PORT = 6379, DEFAULT_LISTEN_PORT = 33334;
var redisPort, redisHost;
var CONNECTOR;
(function () {
    program.version(VERSION)
        .option("--redis-host [host]", "Port on which Redis is listening")
        .option("--redis-port [port]", "Host on which Redis is listening")
        .option("--listen-host [host]", "Host on which the service will listen on")
        .option("--listen-port [port]", "Port on which the service will listen on")
        .parse(process.argv);
    var listenHost = program.listenHost || DEFAULT_HOST;
    var listenPort = Number(program.listenPort) || DEFAULT_LISTEN_PORT;
    redisHost = program.mongoHost || DEFAULT_HOST;
    redisPort = Number(program.mongoPort) || DEFAULT_REDIS_PORT;
    var builder = new connector.Builder();
    builder.server().host(listenHost).port(listenPort);
    var module = {
        name: "redis",
        title: "Redis connector",
        commands: {}
    };
    redis.init(module, redisHost, redisPort)
        .then(function (commands) {
        builder.module("/descriptor.json", module, true);
        commands.forEach(function (command) {
            builder.command(command.path, command.method, command.handler);
        });
        CONNECTOR = builder.build();
        CONNECTOR.logger.info("Connected to redis at " + redisHost + ":" + redisPort);
        CONNECTOR.start();
    })
        .catch(function (e) {
        if (e instanceof Error) {
            console.error("failed to start redis, message: " + e.message);
        }
        else {
            console.error("failed to start redis, error: ", e);
        }
    });
})();
