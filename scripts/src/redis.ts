/**
 * Created by nitzan on 28/02/2017.
 */

import * as redis from "redis";
import * as connector from "@fugazi/connector";

let client: redis.RedisClient | null = null;
const COMMANDS = [] as Array<(module: connector.components.ModuleBuilder) => void>;

export async function init(module: connector.components.ModuleBuilder, host: string, port: number): Promise<void> {
	return redisConnect(host, port).then(() => {
		COMMANDS.forEach(fn => fn(module));
	});
}

function errorResponse(message: string): connector.server.Response {
	return {
		status: connector.server.ResponseStatus.Failure,
		data: message
	};
}

function successResponse(data: any): connector.server.Response {
	return {
		data, //: normalize(data)
		status: connector.server.ResponseStatus.Success
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

function append(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}

	const key = request.data("key");
	const value = request.data("value");

	return new Promise(resolve => {
		if (!client!.append(key, value, (err: Error, obj: string) => {
				if (err) {
					resolve(errorResponse(err.message));
				} else {
					resolve(successResponse(obj));
				}
			})) {
			resolve(errorResponse(`failed to append to ${ key }`));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("append", {
			title: "APPEND command",
			returns: "ui.message",
			syntax: [
				"append (key string) (value string)",
				"append (value string) to (key string)",
				"APPEND (key string) (value string)",
				"APPEND (value string) to (key string)"
			]
		})
		.method("post")
		.handler(append);
});

function dbsize(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}

	return new Promise(resolve => {
		if (!client!.dbsize((err: Error, size: number) => {
				if (err) {
					resolve(errorResponse(err.message));
				} else {
					resolve(successResponse(size));
				}
			})) {
			resolve(errorResponse("failed to get dbsize"));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("dbsize", {
			title: "DBSIZE command",
			returns: "number[numbers.integer]",
			syntax: [
				"dbsize",
				"DBSIZE"
			]
		})
		.handler(dbsize);
});

function decrement(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}

	const key = request.data("key");

	return new Promise(resolve => {
		if (!client!.decr(key, (err: Error, obj: string) => {
				if (err) {
					resolve(errorResponse(err.message));
				} else {
					resolve(successResponse(obj));
				}
			})) {
			resolve(errorResponse(`failed to decrement ${ key }`));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("decrement", {
			title: "DECR command",
			returns: "ui.message",
			syntax: [
				"decr (key string)",
				"DECR (key string)"
			]
		})
		.method("post")
		.handler(decrement);
});

function decrementBy(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}
	if (!request.data.has("key")) {
		return Promise.resolve(errorResponse("expected 'key' path parameter"));
	}
	if (!request.data.has("by")) {
		return Promise.resolve(errorResponse("expected 'by' path parameter"));
	}

	const key = request.data("key");
	const by = Number(request.data("by"));

	return new Promise(resolve => {
		if (!client!.decrby(key, by, (err: Error, obj: string) => {
				if (err) {
					resolve(errorResponse(err.message));
				} else {
					resolve(successResponse(obj));
				}
			})) {
			resolve(errorResponse(`failed to decrement ${ key } by ${ by }`));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("decrementBy", {
			title: "DECRBY command",
			returns: "ui.message",
			syntax: [
				"decrby (key string) (by number)",
				"DECRBY (key string) (by number)",
				"decr (key string) by (by number)",
				"DECR (key string) by (by number)",
			]
		})
		.method("post")
		.handler(decrementBy);
});

function del(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}

	let keys: string[];
	if (request.data.has("key")) {
		keys = [request.data("key")];
	} else if (request.data.has("keys")) {
		keys = request.data("keys").split(",");
	} else {
		return Promise.resolve(errorResponse("expecting 'key' or 'keys' in body"));
	}

	return new Promise(resolve => {
		if (!client!.del(keys, (err: Error, value: number) => {
				if (err) {
					resolve(errorResponse(err.message));
				} else {
					resolve(successResponse(value));
				}
			})) {
			resolve(errorResponse("failed to remove keys"));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("del", {
			title: "DEL command",
			returns: "ui.message",
			syntax: [
				"del (key string)",
				"DEL (key string)",
				"del (keys list<string>)",
				"DEL (keys list<string>)",
			]
		})
		.method("delete")
		.handler(del);
});

function dump(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}
	if (!request.data.has("key")) {
		return Promise.resolve(errorResponse("expected 'key' path parameter"));
	}

	const key = request.data("key");

	return new Promise(resolve => {
		if (!client!.dump(key, (err: Error, value: string) => {
				if (err) {
					resolve(errorResponse(err.message));
				} else {
					resolve(successResponse(value));
				}
			})) {
			resolve(errorResponse("failed to get dump for key ${ key }"));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("dump", {
			title: "DUMP command",
			returns: "string",
			syntax: [
				"dump (key string)",
				"DUMP (key string)"
			]
		})
		.endpoint("dump/{key}")
		.handler(dump);
});

function exists(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}

	let keys: string[];
	if (request.data.has("key")) {
		keys = [request.data("key")];
	} else if (request.data.has("keys")) {
		keys = request.data("keys").split(",");
	} else {
		return Promise.resolve(errorResponse("expecting 'key' or 'keys' in query"));
	}

	return new Promise(resolve => {
		if (!client!.exists(keys, (err: Error, value: number) => {
				if (err) {
					resolve(errorResponse(err.message));
				} else {
					resolve(successResponse(value));
				}
			})) {
			resolve(errorResponse("failed to check if ${ keys } exist"));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("exists", {
			title: "EXISTS command",
			returns: "number[numbers.integer]",
			syntax: [
				"exists (key string)",
				"EXISTS (key string)",
				"exists (keys list<string>)",
				"EXISTS (keys list<string>)"
			]
		})
		.handler(exists);
});

function get(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}
	if (!request.data.has("key")) {
		return Promise.resolve(errorResponse("expected 'key' path parameter"));
	}

	const key = request.data("key");

	return new Promise(resolve => {
		if (!client!.get(key, (err: Error, value: string) => {
				if (err) {
					resolve(errorResponse(err.message));
				} else {
					try {
						value = JSON.parse(value);
					} catch (e) {}

					if (value == null) {
						resolve(errorResponse("key not found"));
					} else {
						resolve(successResponse(value));
					}
				}
			})) {
			resolve(errorResponse(`failed to get ${ key }`));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("get", {
			title: "GET command",
			returns: "any",
			syntax: [
				"get (key string)",
				"GET (key string)"
			]
		})
		.endpoint("get/{key}")
		.handler(get);
});

function set(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}
	if (!request.data.has("key")) {
		return Promise.resolve(errorResponse("expected 'key' in body"));
	}
	if (!request.data.has("value")) {
		return Promise.resolve(errorResponse("expected 'value' in body"));
	}

	const key = request.data("key");
	const value = request.data("value");

	return new Promise(resolve => {
		if (!client!.set(key, value, (err: Error, obj: string) => {
			if (err) {
				resolve(errorResponse(err.message));
			} else {
				resolve(successResponse(obj));
			}
		})) {
			resolve(errorResponse(`failed to set ${ key }`));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("set", {
			title: "SET command",
			returns: "ui.message",
			syntax: [
				"set (key string) to (value any)",
				"SET (key string) to (value any)"
			]
		})
		.method("post")
		.handler(set);
});

function type(request: connector.server.Request): Promise<connector.server.Response> {
	if (!client) {
		throw new Error("not connected");
	}
	if (!request.data.has("key")) {
		return Promise.resolve(errorResponse("expected 'key' in query"));
	}

	const key = request.data("key");

	return new Promise(resolve => {
		if (!client!.type(key, (err: Error, value: string) => {
				if (err) {
					resolve(errorResponse(err.message));
				} else {
					try {
						value = JSON.parse(value);
					} catch (e) {}

					if (value == null) {
						resolve(errorResponse("key not found"));
					} else {
						resolve(successResponse(value));
					}
					resolve(value);
				}
			})) {
			resolve(errorResponse(`failed to type ${ key }`));
		}
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("type", {
			title: "type command",
			returns: "any",
			syntax: [
				"type (key string)",
				"TYPE (key string)"
			]
		})
		.endpoint("type/{ key }")
		.handler(type);
});
