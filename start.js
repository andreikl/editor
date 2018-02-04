const hapi = require('hapi');
const inert = require('inert');
const config = require('./conf/config');

const run = () => {
    const server = new hapi.Server();

    server.connection({
        host: config.HOST, 
        port: config.PORT,
    });
    
    server.register([
        {
            register: inert,
            options: {}
        }
    ], function () {
        console.log('\x1b[32m', '"HAPI Plugins have been registered', '\x1b[0m');

        // Start the server
        server.start(function (err) {
            if (err) {
                console.log('\x1b[31m', err, '\x1b[0m');
                return;
            } else {
                console.log('\x1b[32m', 'Server details: ' + server.info.uri, , '\x1b[0m');
            }
        });
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: {
            file: './dist/web/index.html',
        },
    });

    server.route({
        method: 'GET',
        path: '/scripts/{param*}',
        handler: {
            directory: {
                path: './dist/scripts',
                listing: true
            }
        },
    });

    server.route({
        method: 'GET',
        path: '/images/{param*}',
        handler: {
            directory: {
                path: './dist/images',
                listing: true
            }
        },
    });
}

run();
