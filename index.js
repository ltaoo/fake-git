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
    readCompressedFile,
} = require('./src/utils/object');
const {
    parseIndexFileContent,
} = require('./src/utils/cacheIndex');

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
    const { t, p, s } = argv;
    const hash = params[0];
    if (t) {
        readObjectFile(hash)
            .then(({ header: { type } }) => {
                console.log(type);
            });
        return;
    }
    if (p) {
        readObjectFile(hash)
            .then(({ content }) => {
                console.log(content);
            });
        return;
    }
}

// git update-index --add --cacheinfo 100644 83baae61804e65cc73a7201a7252750c76066a30 test.txt
if (command === 'update-index') {
    const { add, cacheinfo } = argv;
    const [_, hash, filename] = params;
}

// git ls-files --stage
if (command === 'ls-files') {
    const { stage } = argv;
}

const content = fs.readFileSync('index3');
// console.log(content.toString());
parseIndexFileContent(content);

// console.log(content.slice(74, 75));
// readCompressedFile('index')
//     .then((content) => {
//         console.log(content);
//     }, (err) => {
//         console.log('err', err);
//     });
