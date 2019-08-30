const fs = require('fs');

const { resolveFile } = require('../common');
const BinaryFile = require('./binaryFile');
/**
 * 检查是否已经存在 .fake-git 目录
 * @return {boolean}
 */
module.exports.isExist = function checkIsExist(filepath) {
    try {
        fs.statSync(filepath);
        return true;
    } catch {
        return false;
    }
}

module.exports.createObjectDir = function createObjectDir(dir) {
    fs.mkdirSync(resolveFile('objects', dir));
}

module.exports.createObjectFile = function createObjectFile(dir, filename, content) {
    fs.writeFileSync(resolveFile('objects', dir, filename), content);
}

module.exports.createBlobFile = function createBlobFile(filepath, content) {
    fs.writeFileSync(resolveFile(filepath), content, 'binary');
}
