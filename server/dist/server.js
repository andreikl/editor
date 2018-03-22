"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// hapi modules
const config = require("config");
const inert = require("inert");
const hapi = require("hapi");
const options = {
    host: config.get('server').host,
    port: config.get('server').port
};
let server = hapi.Server(options);
const setup = () => __awaiter(this, void 0, void 0, function* () {
    yield server.register(inert);
    //setup static routes
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return h.file('./dist/web/index.html');
        },
    });
    server.route({
        method: 'GET',
        path: '/index.html',
        handler: (request, h) => {
            return h.file('./dist/web/index.html');
        },
    });
    server.route({
        method: 'GET',
        path: '/donate.html',
        handler: (request, h) => {
            return h.file('./dist/web/donate.html');
        },
    });
    server.route({
        method: 'GET',
        path: '/scripts/{param*}',
        handler: {
            directory: {
                path: './dist/web/scripts',
                listing: true
            }
        },
    });
    server.route({
        method: 'GET',
        path: '/styles/{param*}',
        handler: {
            directory: {
                path: './dist/web/styles',
                listing: true
            }
        },
    });
    server.route({
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
                path: './dist/web/assets',
                listing: true
            }
        },
    });
    yield server.start(function (err) {
        if (err) {
            console.log('\x1b[31m', err, '\x1b[0m');
            return;
        }
    });
    console.log('\x1b[32m', 'Server running at: ', server.info.uri, '\x1b[0m');
});
setup();
process.on('unhandledRejection', (err) => {
    console.log('\x1b[31m', err, '\x1b[0m');
    process.exit(1);
});
