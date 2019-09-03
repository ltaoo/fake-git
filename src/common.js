const crypto = require('crypto');
const path = require('path');
const zlib = require('zlib');
const execSync = require('child_process').execSync;

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

/**
 * 用 ruby 获取文件 ctime 和 mtime 的纳秒数
 * type ctimeNanosecond = number;
 * type mtimeNanosecond = number;
 * type FileCtimeAndMTimeNanoseconds = [ctimeNanosecond, mtimeNanosecond];
 * @param {string} filepath 
 * @return {FileCtimeAndMTimeNanoseconds}
 */
function getNanosecondsOfFile(filepath) {
    const ctimeNanosecond = execSync(`ruby lib/nanoSeconds.rb ${filepath}`, {
        cwd: process.cwd(),
    });
    const [ctime, mtime] = ctimeNanosecond.toString().split('\n');
    return [
        Number(ctime),
        Number(mtime),
    ];
}
module.exports.getNanosecondsOfFile = getNanosecondsOfFile;
