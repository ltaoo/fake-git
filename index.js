const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const parser = require('yargs-parser');

const init = require('./src/init');
const { resolveFile } = require('./src/common');
const { isExist, createObjectDir, createObjectFile } = require('./src/utils/file');
const { readObjectFile } = require('./src/utils/object');

const argv = parser(process.argv.slice(2));
const command = argv._[0];
const params = argv._.slice(1);

if (command === 'init') {
    init();
}
if (command === 'add') {
}

// git hash-object -w <file>
if (command === 'hash-object') {
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

// git cat-file -p <hash>
if (command === 'cat-file') {
    const { p: hash } = argv;
    const content = readObjectFile(hash);

    console.log(content);
}
