// hapi modules
import * as config from 'config';
import * as inert from 'inert';
import * as hapi from 'hapi';


const options = {
    host: config.get('server').host, 
    port: config.get('server').port
};
let server = hapi.Server(options);

const setup = async () => {
    await server.register(inert);

    //setup static routes
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return h.file('./dist/web/index.html')
        },
    });

    server.route({
        method: 'GET',
        path: '/index.html',
        handler: (request, h) => {
            return h.file('./dist/web/index.html')
        },
    });

    server.route({
        method: 'GET',
        path: '/donate.html',
        handler: (request, h) => {
            return h.file('./dist/web/donate.html')
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
        path: '/assests/{param*}',
        handler: {
            directory: {
                path: './dist/web/assests',
                listing: true
            }
        },
    });

    await server.start(function (err) {
        if (err) {
            console.log('\x1b[31m', err, '\x1b[0m');
            return;
        }
    });

    console.log('\x1b[32m', 'Server running at: ', server.info.uri, '\x1b[0m');
};
setup();

process.on('unhandledRejection', (err) => {
    console.log('\x1b[31m', err, '\x1b[0m');
    process.exit(1);
});
