const fs = require('fs');
const child_process = require('child_process');

const expression = /.*(styles\.[\da-z]+\.bundle\.css).*(inline\.[\da-z]+\.bundle\.js).*(polyfills\.[\da-z]+\.bundle\.js).*(main\.[\da-z]+\.bundle\.js).*/;
const deploy = async () => {
    const cp = (source, target) => {
        const stat = fs.statSync(source);
        if (stat.isDirectory()) {
            fs.readdirSync(source).forEach((file) => cp(source + "/" + file, target + "/" + file));
        } else {
            fs.createReadStream(source).pipe(fs.createWriteStream(target));
        }
    };

    const rm = (path) => {
        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
            fs.readdirSync(path).forEach((file) => rm(path + "/" + file));
            fs.rmdirSync(path);
        } else {
            fs.unlinkSync(path);
        }
    };

    fs.readFile('./../client/dist/index.html', 'utf8', function (err, data) {
        const regex = expression.exec(data);
        data = data.replace(/styles\.[\da-z]+\.bundle\.css/, 'styles/' + regex[1]);
        data = data.replace(/inline\.[\da-z]+\.bundle\.js/, 'scripts/' + regex[2]);
        data = data.replace(/polyfills\.[\da-z]+\.bundle\.js/, 'scripts/' + regex[3]);
        data = data.replace(/main\.[\da-z]+\.bundle\.js/, 'scripts/' + regex[4]);

        try {
            rm('./dist/web/scripts');
            rm('./dist/web/styles');
            rm('./dist/web/assets');
            rm('./dist/web/3rdpartylicenses.txt');
            rm('./dist/web/favicon.png');
            rm('./dist/web/index.html');
        }
        catch(ex) {
            console.log('\x1b[33m', 'exception when app deletes previous build', '\x1b[0m', ex);
        }

        fs.mkdirSync('./dist/web/scripts');
        fs.mkdirSync('./dist/web/styles');
        fs.mkdirSync('./dist/web/assets');
        cp('./../client/dist/' + regex[1], './dist/web/styles/' + regex[1]);
        cp('./../client/dist/' + regex[2], './dist/web/scripts/' + regex[2]);
        cp('./../client/dist/' + regex[3], './dist/web/scripts/' + regex[3]);
        cp('./../client/dist/' + regex[4], './dist/web/scripts/' + regex[4]);
        cp('./../client/dist/assets', './dist/web/assets');
        cp('./../client/dist/3rdpartylicenses.txt', './dist/web/3rdpartylicenses.txt');
        cp('./../client/dist/favicon.png', './dist/web/favicon.png');
        fs.writeFileSync('./dist/web/index.html', data, 'utf8');
    });
}
deploy();
