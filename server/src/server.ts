// hapi modules
import * as config from 'config';
import * as express from 'express';


const options = {
    //host: config.get('server').host, 
    port: process.env.PORT || config.get('server').port
};

const app = express();

const setup = async () => {
    app.use(express.static('./dist/web'));

    const server = app.listen(options.port, () => {
        console.log('\x1b[32m', 'Server running at: ', server.address(), '\x1b[0m');
    });
};
setup();

process.on('unhandledRejection', (err) => {
    console.log('\x1b[31m', err, '\x1b[0m');
    process.exit(1);
});
