const fs = require('fs');
const zlib = require('zlib');

const { ROOT_DIR, createHash, resolveFile } = require('../common');
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
    const parts = fileContent.split(String.fromCharCode(0));
    console.log(parts);
    const [type, size] = parts[0].split(' ');
    const content = parts[1];
    return {
        header: {
            type,
            size,
        },
        content,
    };
}
/**
 * 
 * @param {string} content - 被加密的内容
 */
function parseCompressedContent(content) {
    console.log('content', content);
    const originalContent = zlib.inflateSync(content);
    console.log('originalContent', originalContent, originalContent.length);
    const hash = createHash(originalContent);
    console.log('hash', hash);
    return splitHeaderAndContent(originalContent.toString());
}

function getObjectFilePathFromHash(hash) {
    const { dir, filename } = splitHash(hash);
    return resolveObjectFile(dir, filename);
}

module.exports.readObjectFile = function readObjectFile(hash) {
    const filepath = getObjectFilePathFromHash(hash);
    if (!isExist(filepath)) {
        console.log(`fatal: Not a valid object name ${hash}`);
        process.exit(1);
    }
    return readCompressedFile(filepath);
    // return parseObjectFileContent(fs.readFileSync(filepath));
}

function getObjectFileType(hash) {
    const filepath = getObjectFilePathFromHash(hash);
    if (!isExist(filepath)) {
        console.log(`fatal: Not a valid object name ${hash}`);
        process.exit(1);
    }
}

/**
 * deprecated
 * @param {string} content 
 */
function createObjectFileContent(content) {
    return Buffer.from(`blob ${content.length}${String.fromCharCode(0)}${content}`, 'utf-8');
}
module.exports.createObjectFileContent = createObjectFileContent;

function createBlobFileContent({
    content,
}) {
    const lineBreak = String.fromCharCode(10);
    const lastLineBreakLength = 1;
    const length = content.length + lastLineBreakLength;
    return Buffer.from(`blob ${length}${String.fromCharCode(0)}${content}${lineBreak}`, 'utf-8');
}

module.exports.createBlobFileContent = createBlobFileContent;

function createTreeFileContent({
    filepath,
    hash,
    mode,
}) {
    const hashLength = 20;
    const nulCharacter = String.fromCharCode(0);
    const spaceCharacterLength = 1;
    const nulCharacterLength = 1;
    const length = filepath.length + mode.length + spaceCharacterLength + nulCharacterLength + hashLength;
    return Buffer.concat([
        Buffer.from(`tree ${length}${nulCharacter}${mode} ${filepath}${nulCharacter}`, 'utf-8'),
        Buffer.from(hash, 'hex'),
    ]);
}
module.exports.createTreeFileContent = createTreeFileContent;

function inflate(content, params) {
    return new Promise((resolve, reject) => {
        zlib.inflate(content, params, (err, origin) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(origin.toString());
        });
    });
}

module.exports.inflate = inflate;

function readCompressedFile(filepath) {
    const content = fs.readFileSync(filepath);
    return parseCompressedContent(content);
}

module.exports.readCompressedFile = readCompressedFile;
