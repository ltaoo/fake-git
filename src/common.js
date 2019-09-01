const crypto = require('crypto');
const path = require('path');
const zlib = require('zlib');

const ROOT_DIR = path.join(process.cwd(), '.fake-git');

module.exports.ROOT_DIR = ROOT_DIR;
module.exports.resolveFile = function resolveFile(...params) {
    return path.join.apply(path, [ROOT_DIR, ...params]);
}
module.exports.createHash = function createHash(content) {
    const hash = crypto.createHash('sha1').update(content).digest('hex');
    return hash;
}

/**
 * 解密
 * @param {*} content 
 */
function inflate(content) {
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
module.exports.inflate = inflate;

function deflate(content) {
    return new Promise((resolve, reject) => {
        zlib.deflate(content, (err, compressed) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(compressed);
        });
    });
}
module.exports.deflate = deflate;
