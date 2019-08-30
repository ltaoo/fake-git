const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const parser = require('yargs-parser');

const init = require('./src/init');
const { resolveFile } = require('./src/common');
const { isExist, createObjectDir, createObjectFile } = require('./src/utils/file');

const argv = parser(process.argv.slice(2));

console.log(argv);
if (argv._[0] === 'init') {
    init();
}
if (argv._[0] === 'add') {
    const params = argv._.slice(1);
    console.log(params);
}

if (argv._[0] === 'hash-object') {
    const { w: file } = argv;
    const content = fs.readFileSync(path.resolve(file));
    const hash = crypto.createHash('sha1').update(content).digest('hex');

    const dir = hash.slice(0, 2);
    const filename = hash.slice(2);

    if (!isExist(resolveFile('objects', dir))) {
        createObjectDir(dir);
    }
    createObjectFile(dir, filename, content);
    console.log(hash);
}

