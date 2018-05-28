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
const express = require("express");
const options = {
    //host: config.get('server').host, 
    port: process.env.PORT || config.get('server').port
};
const app = express();
const setup = () => __awaiter(this, void 0, void 0, function* () {
    app.use(express.static('./dist/web'));
    const server = app.listen(options.port, () => {
        console.log('\x1b[32m', 'Server running at: ', server.address(), '\x1b[0m');
    });
});
setup();
process.on('unhandledRejection', (err) => {
    console.log('\x1b[31m', err, '\x1b[0m');
    process.exit(1);
});
