/**
 * Created by nitzan on 28/02/2017.
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var redis = require("redis");
var client = null;
function init(module, host, port) {
    return __awaiter(this, void 0, void 0, function () {
        var promise;
        return __generator(this, function (_a) {
            promise = (host != null && port != null ? redisConnect(host, port) : Promise.resolve());
            return [2 /*return*/, promise.then(function () {
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
                })];
        });
    });
}
exports.init = init;
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
function redisConnect(host, port) {
    return new Promise(function (resolve, reject) {
        client = redis.createClient(port, host)
            .on("connect", function () {
            resolve();
        })
            .on("error", function (e) {
            reject(e);
        });
    });
}
function connect(ctx) {
    var _a = ctx.query, host = _a.host, port = _a.port;
    return redisConnect(host, Number(port)).then(function () { return "connected to " + host + ":" + port; });
}
/*function set(key: string, value: string): boolean {
    return client!.set(key, value, )
}*/
function set(ctx) {
    var _a = ctx.request.body, key = _a.key, value = _a.value;
    var parsed;
    try {
        parsed = JSON.stringify(value);
    }
    catch (e) {
        parsed = typeof value === "string" ? value : value.toString();
    }
    return new Promise(function (resolve, reject) {
        if (!client.set(key, parsed, function (err, obj) {
            resolve("successfully set \"" + key + "\" to " + value);
        })) {
            reject("failed to set " + key);
        }
    });
}
function get(ctx) {
    var key = ctx.params.key;
    return new Promise(function (resolve, reject) {
        if (!client.get(key, function (err, value) {
            if (err) {
                ctx.type = "application/json";
                ctx.body = {
                    status: 1,
                    error: err.message
                };
                reject(err);
            }
            else {
                ctx.type = "application/json";
                try {
                    value = JSON.parse(value);
                }
                catch (e) { }
                if (value == null) {
                    ctx.body = {
                        status: 1,
                        error: "key not found"
                    };
                }
                else {
                    ctx.body = {
                        status: 0,
                        value: value
                    };
                }
                resolve(value);
            }
        })) {
            ctx.type = "application/json";
            ctx.body = {
                status: 1,
                value: "failed to get " + key
            };
            reject("failed to get " + key);
        }
    });
}
