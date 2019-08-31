const fs = require('fs');
const path = require('path');

const parse = require('yargs-parser');
const zlib = require('zlib');

const init = require('./src/init');
const { resolveFile, createHash } = require('./src/common');
const {
    isExist, createObjectDir,
} = require('./src/utils/file');
const {
    createObjectFile,
    readObjectFile,
    getObjectFileType,
    createObjectFileContent,
    readObjectFileContent,
} = require('./src/utils/object');

const argv = parse(process.argv.slice(2), {
    alias: {
        type: ['t'],
    },
    boolean: [
        'add',
        'type',
        'p'
    ],
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
    const content = fs.readFileSync(path.resolve(file), 'utf-8');
    const objectContent = createObjectFileContent(content);
    const hash = createHash(objectContent);

    const dir = hash.slice(0, 2);
    const filename = hash.slice(2);

    if (!isExist(resolveFile('objects', dir))) {
        createObjectDir(dir);
    }
    createObjectFile(dir, filename, objectContent);
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

// git update-index --add --cacheinfo 100644 83baae61804e65cc73a7201a7252750c76066a30 test.txt
if (command === 'update-index') {
    const { add, cacheinfo } = argv;
    const [_, hash, filename] = params;
}

function writeFile(content) {
    console.log('content', content);
    createObjectFileContent(content)
        .then((compressed) => {
            console.log('compressed', compressed);
            const hash = createHash(compressed);
            console.log('hash', hash);
            return readObjectFileContent(content);
        })
        .then((origin) => {
            console.log('origin', origin);
        });
}

// 83baae61804e65cc73a7201a7252750c76066a30
// writeFile('hello\n');
