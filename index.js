const fs = require('fs');
const path = require('path');

const parse = require('yargs-parser');

const init = require('./src/init');
const { resolveFile, createHash } = require('./src/common');
const {
    isExist, createObjectDir,
} = require('./src/utils/file');
const {
    createObjectFile,
    readObjectFile,

    createBlobFileContent,
    createTreeFileContent,
} = require('./src/utils/object');
const {
    createIndexFileContent,
} = require('../src/utils/cacheIndex');

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
    const objectContent = createBlobFileContent(content);
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
    readObjectFile(hash)
        .then(({ header: { type }, content }) => {
            if (t) {
                console.log(type);
            }
            if (p) {
                console.log(content);
            }
        });
}

// git update-index --add --cacheinfo 100644 83baae61804e65cc73a7201a7252750c76066a30 test.txt
if (command === 'update-index') {
    const { add, cacheinfo } = argv;
    const [_, mode, hash, filename] = params;
}

if (command === 'write-tree') {

}



// git ls-files --stage
if (command === 'ls-files') {
    const { stage } = argv;
}
