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
			append: {
				title: "APPEND command",
				returns: "ui.message",
				syntax: [
					"append (key string) (value string)",
					"append (value string) to (key string)",
					"APPEND (key string) (value string)",
					"APPEND (value string) to (key string)"
				],
				handler: {
					endpoint: "append",
					method: "post"
				}
			},
			dbsize: {
				title: "DBSIZE command",
				returns: "number[numbers.integer]",
				syntax: [
					"dbsize",
					"DBSIZE"
				],
				handler: {
					endpoint: "dbsize"
				}
			},
			decrement: {
				title: "DECR command",
				returns: "ui.message",
				syntax: [
					"decr (key string)",
					"DECR (key string)"
				],
				handler: {
					endpoint: "decrement",
					method: "post"
				}
			},
			decrementby: {
				title: "DECRBY command",
				returns: "ui.message",
				syntax: [
					"decrby (key string) (by number)",
					"DECRBY (key string) (by number)",
					"decr (key string) by (by number)",
					"DECR (key string) by (by number)",
				],
				handler: {
					endpoint: "decrementby",
					method: "post"
				}
			},
			del: {
				title: "DEL command",
				returns: "ui.message",
				syntax: [
					"del (key string)",
					"DEL (key string)",
					"del (keys list<string>)",
					"DEL (keys list<string>)",
				],
				handler: {
					endpoint: "delete",
					method: "delete"
				}
			},
			dump: {
				title: "DUMP command",
				returns: "string",
				syntax: [
					"dump (key string)",
					"DUMP (key string)"
				],
				handler: {
					endpoint: "dump/{key}"
				}
			},
			exists: {
				title: "EXISTS command",
				returns: "number[numbers.integer]",
				syntax: [
					"exists (key string)",
					"EXISTS (key string)",
					"exists (keys list<string>)",
					"EXISTS (keys list<string>)"
				],
				handler: {
					endpoint: "exists"
				}
			},
			get: {
				title: "GET command",
				returns: "any",
				syntax: [
					"get (key string)",
					"GET (key string)"
				],
				handler: {
					endpoint: "get/{key}",
					method: "get"
				}
			},
			set: {
				title: "SET command",
				returns: "ui.message",
				syntax: [
					"set (key string) to (value any)",
					"SET (key string) to (value any)"
				],
				handler: {
					endpoint: "set",
					method: "post"
				}
			}
		});

		return [{
			path: "/connect",
			method: "get",
			handler: connect
		}, {
			path: "/append",
			method: "post",
			handler: append
		}, {
			path: "/decrement",
			method: "post",
			handler: decrement
		}, {
			path: "/dbsize",
			method: "get",
			handler: dbsize
		}, {
			path: "/decrementby",
			method: "post",
			handler: decrementBy
		}, {
			path: "/delete",
			method: "delete",
			handler: del
		}, {
			path: "/dump/:key",
			method: "get",
			handler: dump
		}, {
			path: "/exists",
			method: "get",
			handler: exists
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

function normalize(data: any): string | number | boolean {
	const type = typeof data;

	if (type === "string" || type === "number" || type === "boolean") {
		return data;
	}

	try {
		return JSON.stringify(data);
	} catch (e) {
		return data.toString();
	}
}

function errorResponse(ctx: connector.CommandHandlerContext, message: string, status: number = 200) {
	ctx.status = status;
	ctx.type = "application/json";
	ctx.body = {
		status: 1, // value for fugazi.components.commands.handler.ResultStatus.Failure
		value: message
	};
}

function successResponse(ctx: connector.CommandHandlerContext, data: any) {
	ctx.type = "application/json";
	ctx.body = {
		status: 0, // value for fugazi.components.commands.handler.ResultStatus.Success
		value: normalize(data)
	};
}

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
	if (client) {
		errorResponse(ctx, "already connected", 400);
	}

	const { host, port } = ctx.query;

	return redisConnect(host, Number(port))
		.then(() => {
			const msg = `connected to ${ host }:${ port }`;
			successResponse(ctx, msg);
			return msg;
		}).catch(e => {
			const msg = typeof e === "string" ? e : (e instanceof Error ? e.message : e.toString());
			errorResponse(ctx, msg);
			return msg;
		});
}

function append(ctx: connector.CommandHandlerContext) {
	if (!client) {
		errorResponse(ctx, "not connected", 400);
	}

	const { key, value } = ctx.request.body;

	return new Promise((resolve, reject) => {
		if (!client!.append(key, normalize(value), (err: Error, obj: string) => {
				successResponse(ctx, `successfully appended "${ JSON.stringify(value) }" to ${ key }`);
				resolve(`successfully appended "${ value }" to ${ key }`);
			})) {
			const msg = `failed to append to ${ key }`;
			errorResponse(ctx, msg);
			reject(msg);
		}
	});
}

function dbsize(ctx: connector.CommandHandlerContext) {
	if (!client) {
		errorResponse(ctx, "not connected", 400);
	}

	return new Promise((resolve, reject) => {
		if (!client!.dbsize((err: Error, size: number) => {
				successResponse(ctx, size);
				resolve(size);
			})) {
			const msg = "failed to get dbsize";
			errorResponse(ctx, msg);
			reject(msg);
		}
	});
}

function decrement(ctx: connector.CommandHandlerContext) {
	if (!client) {
		errorResponse(ctx, "not connected", 400);
	}

	const key = ctx.request.body.key;

	return new Promise((resolve, reject) => {
		if (!client!.decr(key, (err: Error, obj: string) => {
				const msg = `successfully decremented "${ key }"`;
				successResponse(ctx, msg);
				resolve(msg);
			})) {
			const msg = `failed to decrement ${ key }`;
			errorResponse(ctx, msg);
			reject(msg);
		}
	});
}

function decrementBy(ctx: connector.CommandHandlerContext) {
	if (!client) {
		errorResponse(ctx, "not connected", 400);
	}

	const key = ctx.request.body.key;
	let by: string | number = ctx.request.body.by;
	if (by == null) {
		errorResponse(ctx, "expected 'by' path parameter");
		return;
	}

	by = Number(by);

	return new Promise((resolve, reject) => {
		if (!client!.decrby(key, by, (err: Error, obj: string) => {
				const msg = `successfully decremented "${ key }" by ${ by }`;
				successResponse(ctx, msg);
				resolve(msg);
			})) {
			const msg = `failed to decrement ${ key } by ${ by }`;
			errorResponse(ctx, msg);
			reject(msg);
		}
	});
}

function del(ctx: connector.CommandHandlerContext) {
	if (!client) {
		errorResponse(ctx, "not connected", 400);
	}

	let keys: string[];

	if (ctx.request.body.key) {
		keys = [ctx.request.body.key];
	} else if (ctx.request.body.keys) {
		keys = ctx.request.body.keys.split(",");
	} else {
		errorResponse(ctx, "expecting 'key' or 'keys' in body", 400);
		return;
	}

	return new Promise((resolve, reject) => {
		if (!client!.del(keys, (err: Error, value: number) => {
				if (err) {
					errorResponse(ctx, err.message);
					reject(err);
				} else {
					const msg = `removed ${ value } keys`;
					successResponse(ctx, msg);
					resolve(msg);
				}
			})) {
			const msg = "failed to remove keys";
			errorResponse(ctx, msg);
			reject(msg);
		}
	});
}

function dump(ctx: connector.CommandHandlerContext) {
	console.log("sup?");
	if (!client) {
		errorResponse(ctx, "not connected", 400);
	}

	const key = ctx.params.key;

	return new Promise((resolve , reject) => {
		if (!client!.dump(key, (err: Error, value: string) => {
				if (err) {
					errorResponse(ctx, err.message);
					reject(err);
				} else {
					successResponse(ctx, value);
					resolve(value);
				}
			})) {
			const msg = `failed to get dump for key ${ key }`;
			errorResponse(ctx, msg);
			reject(msg);
		}
	});
}

function exists(ctx: connector.CommandHandlerContext) {
	if (!client) {
		errorResponse(ctx, "not connected", 400);
	}

	let keys: string[];

	if (ctx.query.key) {
		keys = [ctx.query.key];
	} else if (ctx.query.keys) {
		keys = ctx.query.keys.split(",");
	} else {
		errorResponse(ctx, "expecting 'key' or 'keys' in query", 400);
		return;
	}

	return new Promise((resolve, reject) => {
		if (!client!.exists(keys, (err: Error, value: number) => {
				if (err) {
					errorResponse(ctx, err.message);
					reject(err);
				} else {
					successResponse(ctx, value);
					resolve(value);
				}
			})) {
			const msg = `failed to check if ${ keys } exist`;
			errorResponse(ctx, msg);
			reject(msg);
		}
	});
}

function set(ctx: connector.CommandHandlerContext) {
	if (!client) {
		errorResponse(ctx, "not connected", 400);
	}

	const { key, value } = ctx.request.body;

	return new Promise((resolve, reject) => {
		if (!client!.set(key, normalize(value), (err: Error, obj: string) => {
			successResponse(ctx, `successfully set "${ key }" to ${ JSON.stringify(value) }`);
			resolve(`successfully set "${ key }" to ${ value }`);
		})) {
			const msg = `failed to set ${ key }`;
			errorResponse(ctx, msg);
			reject(msg);
		}
	});
}

function get(ctx: connector.CommandHandlerContext) {
	if (!client) {
		errorResponse(ctx, "not connected", 400);
	}

	const key = ctx.params.key;

	return new Promise((resolve , reject) => {
		if (!client!.get(key, (err: Error, value: string) => {
			if (err) {
				errorResponse(ctx, err.message);
				reject(err);
			} else {
				try {
					value = JSON.parse(value);
				} catch (e) {}

				if (value == null) {
					errorResponse(ctx, "key not found");
				} else {
					successResponse(ctx, value);
				}
				resolve(value);
			}
		})) {
			const msg = `failed to get ${ key }`;
			errorResponse(ctx, msg);
			reject(msg);
		}
	});
}
