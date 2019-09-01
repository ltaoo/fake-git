const path = require('path');

function resolve(filepath) {
    return path.join(process.cwd(), filepath);
}

module.exports.resolve = resolve;
