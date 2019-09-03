const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const parse = require('yargs-parser');

function checkHasInstalledRuby() {
    try {
        execSync('ruby -v');
        return true;
    } catch (err) {
        return false;
    }
}
if (!checkHasInstalledRuby()) {
    console.log('Please install ruby');
    process.exit(1);
}

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
    createIndexFile,
    readIndexFile,
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

//                                           83baae61804e65cc73a7201a725275 c76 66a30
// git update-index --add --cacheinfo 100644 83baae61804e65cc73a7201a7252750c76066a30 test.txt
if (command === 'update-index') {
    const { add, cacheinfo } = argv;
    const [_, mode, hash, filename] = params;
    const content = createIndexFileContent([{
        mode: '100644',
        filepath: 'test.txt',
        hash: '83baae61804e65cc73a7201a7252750c76066a30',
    }]);
    createIndexFile(content);
}

if (command === 'write-tree') {
    const result = readIndexFile();
    const content = createTreeFileContent(result.files);
    console.log(content);
    const hash = createHash(content);
    console.log(hash);
}



// git ls-files --stage
if (command === 'ls-files') {
    const { stage } = argv;
}
