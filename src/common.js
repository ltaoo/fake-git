const path = require('path');

const ROOT_DIR = path.join(process.cwd(), '.fake-git');

module.exports.ROOT_DIR = ROOT_DIR;
module.exports.resolveFile = function resolveFile(...params) {
    return path.join.apply(path, [ROOT_DIR, ...params]);
}
