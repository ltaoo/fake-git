const fs = require('fs');
const zlib = require('zlib');

const { ROOT_DIR, resolveFile } = require('../common');
const { isExist } = require('./file');

function resolveObjectFile(...params) {
    return resolveFile.apply(null, ['objects', ...params]);
}
module.exports.resolveObjectFile = resolveObjectFile;

function splitHash(hash) {
    const str = String(hash);
    return {
        dir: str.slice(0, 2),
        filename: str.slice(2),
    };
}
module.exports.splitHash = splitHash;

/**
 * @param {Buffer} content - 添加好 header 的 buffer
 */
module.exports.createObjectFile = function createObjectFile(dir, filename, content) {
    return new Promise((resolve, reject) => {
        zlib.deflate(content, (err, value) => {
            if (err) {
                reject(err);
                return;
            }
            fs.writeFileSync(resolveFile('objects', dir, filename), value);
            resolve(value);
        });
    });
}

function splitHeaderAndContent(fileContent) {
    const type = fileContent.split(' ')[0];
    const content = fileContent.split(String.fromCharCode(0))[1];
    return {
        header: {
            type,
        },
        content,
    };
}
/**
 * 
 * @param {string} content - 被加密的内容
 */
function parseObjectFileContent(content) {
    return readObjectFileContent(content)
        .then((originalContent) => {
            return splitHeaderAndContent(originalContent);
        }, (err) => {
            console.log(err);
        });
}

function getObjectFilePathFromHash(hash) {
    const { dir, filename } = splitHash(hash);
    const filepath = resolveObjectFile(dir, filename);
    return filepath;
}

module.exports.readObjectFile = function readObjectFile(hash) {
    const filepath = getObjectFilePathFromHash(hash);
    if (!isExist(filepath)) {
        console.log(`fatal: Not a valid object name ${hash}`);
        process.exit(1);
    }
    return parseObjectFileContent(fs.readFileSync(filepath));
}

function getObjectFileType(hash) {
    const filepath = getObjectFilePathFromHash(hash);
    if (!isExist(filepath)) {
        console.log(`fatal: Not a valid object name ${hash}`);
        process.exit(1);
    }
}

function createObjectFileContent(content) {
    const input = Buffer.from(`blob ${content.length}${String.fromCharCode(0)}${content}`, 'utf-8');
    return input;
}
module.exports.createObjectFileContent = createObjectFileContent;

function readObjectFileContent(content) {
    return new Promise((resolve, reject) => {
        zlib.inflate(content, (err, origin) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(origin.toString());
        });
    });
}

module.exports.readObjectFileContent = readObjectFileContent;
