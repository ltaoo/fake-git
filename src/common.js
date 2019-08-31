const crypto = require('crypto');
const path = require('path');

const ROOT_DIR = path.join(process.cwd(), '.fake-git');

module.exports.ROOT_DIR = ROOT_DIR;
module.exports.resolveFile = function resolveFile(...params) {
    return path.join.apply(path, [ROOT_DIR, ...params]);
}
module.exports.createHash = function createHash(content) {
    const hash = crypto.createHash('sha1').update(content).digest('hex');
    return hash;
}
