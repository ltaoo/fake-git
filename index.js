const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const parse = require('yargs-parser');

const init = require('./src/init');
const { resolveFile } = require('./src/common');
const { isExist, createObjectDir, createObjectFile } = require('./src/utils/file');
const {
    readObjectFile,
    getObjectFileType,
} = require('./src/utils/object');

const argv = parse(process.argv.slice(2), {
    alias: {
        type: ['t'],
    },
    boolean: ['type', 'p'],
});
const command = argv._[0];
const params = argv._.slice(1);
console.log(argv);

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
    const { t, p } = argv;
    const hash = params[0];
    if (t) {
        const fileType = getObjectFileType(hash);
        console.log(fileType);
        return;
    }
    if (p) {
        const content = readObjectFile(hash);
        console.log(content);
        return;
    }
}
