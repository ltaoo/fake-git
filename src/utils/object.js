const fs = require('fs');

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

function getObjectFilePathFromHash(hash) {
    const { dir, filename } = splitHash(hash);
    const filepath = resolveObjectFile(dir, filename);
    return filepath;
}

module.exports.readObjectFile = function readObjectFile(hash) {
    const filepath = getObjectFilePathFromHash(hash);
    if (!isExist(filepath)) {
        console.log(`[error]: ${hash} object file is not found`);
        process.exit(1);
    }
    return fs.readFileSync(filepath, 'utf-8');
}

function getObjectFileType(hash) {
    const filepath = getObjectFilePathFromHash(hash);
    if (!isExist(filepath)) {
        console.log(`[error]: ${hash} object file is not found`);
        process.exit(1);
    }
}
