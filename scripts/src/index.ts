/**
 * Created by nitzan on 28/02/2017.
 */

import * as connector from "@fugazi/connector";
import program = require("commander");

declare module "commander" {
	interface ICommand {
		redisHost?: string;
		redisPort?: number | string;
		listenHost?: string;
		listenPort?: number | string;
	}
}

import * as redis from "./redis";
const pjson = require("../../package.json");

const VERSION = pjson.version as string,
	DEFAULT_HOST = "localhost",
	DEFAULT_REDIS_PORT = 6379,
	DEFAULT_LISTEN_PORT = 33334;

let redisPort: number,
	redisHost: string;

let CONNECTOR: connector.Connector;

(() => {
	program.version(VERSION)
		.option("--redis-host [host]", "Port on which Redis is listening")
		.option("--redis-port [port]", "Host on which Redis is listening")
		.option("--listen-host [host]", "Host on which the service will listen on")
		.option("--listen-port [port]", "Port on which the service will listen on")
		.parse(process.argv);

	const listenHost = program.listenHost || DEFAULT_HOST;
	const listenPort = Number(program.listenPort) || DEFAULT_LISTEN_PORT;

	redisHost = program.redisHost || DEFAULT_HOST;
	redisPort = Number(program.redisPort) || DEFAULT_REDIS_PORT;

	const builder = new connector.ConnectorBuilder();
	builder.server().host(listenHost).port(listenPort).cors(true);
	const module = builder.module({
		name: "redis",
		title: "Redis connector"
	});

	redis.init(module, redisHost, redisPort).then(() => {
		CONNECTOR = builder.build();
		CONNECTOR.logger.info(`Connected to redis at ${ redisHost }:${ redisPort }`);
		CONNECTOR.start().then(() => CONNECTOR.logger.info("connector started"));
	}).catch((e: any) => {
		if (e instanceof Error) {
			console.error("failed to start redis, message: " + e.message);
		} else {
			console.error("failed to start redis, error: ", e);
		}
	});
})();
