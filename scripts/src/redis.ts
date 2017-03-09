/**
 * Created by nitzan on 28/02/2017.
 */

import * as redis from "redis";
import * as connector from "fugazi.connector.node";

let client: redis.RedisClient | null = null;

export type Commands = {
	path: string;
	method: string;
	handler: connector.CommandHandler;
}[];

export async function init(module: connector.RootModule, host?: string, port?: number): Promise<Commands> {
	const promise = (host != null && port != null ? redisConnect(host, port) : Promise.resolve()) as Promise<void>;

	return promise.then(() => {
		Object.assign(module.commands, {
			connect: {
				title: "Connect command",
				returns: "ui.message",
				syntax: "connect (host string) (port numbers.integer)",
				handler: {
					endpoint: "connect"
				}
			},
			set: {
				title: "Set command",
				returns: "ui.message",
				syntax: "set (key string) to (value any)",
				handler: {
					endpoint: "set",
					method: "post"
				}
			},
			get: {
				title: "Get command",
				returns: "any",
				syntax: "get (key string)",
				handler: {
					endpoint: "get/{key}",
					method: "get"
				}
			}
		});

		return [{
			path: "/connect",
			method: "get",
			handler: connect
		}, {
			path: "/get/:key",
			method: "get",
			handler: get
		}, {
			path: "/set",
			method: "post",
			handler: set
		}];
	});
}

/*function connect(host: string, port: number): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		client = redis.createClient(port, host)
			.on("connect", () => {
				resolve();
			})
			.on("error", (e: any) => {
				reject(e);
			});
	});
}*/
function redisConnect(host: string, port: number) {
	return new Promise((resolve, reject) => {
		client = redis.createClient(port, host)
			.on("connect", () => {
				resolve();
			})
			.on("error", (e: any) => {
				reject(e);
			});
	});
}

function connect(ctx: connector.CommandHandlerContext) {
	const { host, port } = ctx.query;

	return redisConnect(host, Number(port)).then(() => `connected to ${ host }:${ port }`);
}

/*function set(key: string, value: string): boolean {
	return client!.set(key, value, )
}*/
function set(ctx: connector.CommandHandlerContext) {
	const { key, value } = ctx.request.body;
	console.log(`key: ${key}, value: ${value}`);

	let parsed: string;
	try {
		parsed = JSON.stringify(value);
	} catch (e) {
		parsed = typeof value === "string" ? value : value.toString();
	}

	return new Promise((resolve, reject) => {
		if (!client!.set(key, parsed, (err: Error, obj: string) => {
			ctx.type = "application/json";
			ctx.body = {
				status: 0, // value for fugazi.components.commands.handler.ResultStatus.Failure
				value: `successfully set "${ key }" to ${ JSON.stringify(value) }`
			};

			resolve(`successfully set "${ key }" to ${ value }`);
		})) {
			ctx.type = "application/json";
			ctx.body = {
				status: 1, // value for fugazi.components.commands.handler.ResultStatus.Failure
				error: `failed to set ${ key }`
			};

			reject(`failed to set ${ key }`);
		}
	});
}

function get(ctx: connector.CommandHandlerContext) {
	const key = ctx.params.key;

	return new Promise((resolve , reject) => {
		if (!client!.get(key, (err: Error, value: string) => {
			if (err) {
				ctx.type = "application/json";
				ctx.body = {
					status: 1, // value for fugazi.components.commands.handler.ResultStatus.Failure
					error: err.message
				};

				reject(err);
			} else {
				ctx.type = "application/json";

				try {
					value = JSON.parse(value);
				} catch (e) {}

				if (value == null) {
					ctx.body = {
						status: 1, // value for fugazi.components.commands.handler.ResultStatus.Failure
						error: "key not found"
					};
				} else {
					ctx.body = {
						status: 0, // value for fugazi.components.commands.handler.ResultStatus.Success
						value: value
					};
				}

				resolve(value);
			}
		})) {
			ctx.type = "application/json";
			ctx.body = {
				status: 1, // value for fugazi.components.commands.handler.ResultStatus.Failure
				value: `failed to get ${ key }`
			};

			reject(`failed to get ${ key }`);
		}
	});


}
