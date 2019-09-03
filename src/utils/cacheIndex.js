const path = require('path');
const fs = require('fs');

const { resolveFile, createHash, getNanosecondsOfFile } = require('../common');

function parseFileMode(buffer) {
    return buffer.toJSON().data.map(num => num.toString(8));
}
function buffer2hex(buffer) {
    return buffer.toJSON().data.map(num => num.toString(16)).join('');
}
function getSize(buffer) {
    return parseInt(buffer2hex(buffer), 16);
}
function getHashFromBuffer(buffer) {
    return buffer2hex(buffer);
}
function getChar(buffer) {
    return buffer.toJSON().data.map(num => {
        return String.fromCharCode(num);
    }).join('');
}

function parseSingleObjectFile(buffer) {
    const ctime = parseInt(getHashFromBuffer(content.slice(0, 4)), 16);
    // const ctimeSeconds = parseInt(getHashFromBuffer(content.slice(16, 20)), 16);
    const mtime = parseInt(getHashFromBuffer(content.slice(8, 12)), 16);
    // 设备编号？
    const dev = content.slice(12, 16);
    console.log('dev', dev);
    // 节点？
    const ino = content.slice(16, 20);
    console.log('ino', ino);
    // file mode，需要先将十六进制转换成十进制，再从十进制转换成八进制，最终结果是 100644
    const mode = parseFileMode(content.slice(20, 24));
    // uid parseInt('0x01F5', 16) === 501，id -u 的结果也是 501
    const uid = content.slice(24, 28);
    // gid parseInt('0x0014', 16) === 20，id -g 的结果也是 20
    const gid = content.slice(28, 32);
    // file size parseInt('0x000A', 16) === 10 文件大小，单位是字节
    const size = getSize(content.slice(32, 36));
    // 文件 hash 83baae61804e65cc73a7201a7252750c76066a30
    const hash = getHashFromBuffer(content.slice(36, 46));
    // flags 文件路径长度，这里是 8，即 test.txt 的长度
    const objectFileLength = getSize(content.slice(46, 48));
    const position = 48 + objectFileLength;
    const objectFilePath = getChar(content.slice(48, position));
    const extension = content.slice(position, position + 1)
    console.log('extension', extension);
    const checksumHash = content.slice(position + 1, position + 1 + 20);
    console.log(checksumHash);
    return {
        ctime,
        mtime,
        hash,
        size,
        path: objectFilePath,
    };
}
function getTimestamp(buffer) {
    return parseInt(getHashFromBuffer(buffer), 16);
}
function getSizeLabel(buffer) {
    return parseInt(buffer2hex(buffer), 16);
}
function getModeLabel(buffer) {
    const hex = buffer2hex(buffer);
    return parseInt(hex, 16).toString(8);
}
function fillMilliseconds(timestamp) {
    return Number(String(timestamp) + '000');
}

function splitMultipleObjectFiles(buffer, fileNum) {
    const result = [];
    const files = [];
    let start = 0;
    for (let i = 0; i < fileNum; i += 1) {
        const ctime = getTimestamp(buffer.slice(start, start + 4));
        // console.log('ctime', ctime);
        // console.log('ctime seconds', buffer.slice(start + 4, start + 8));
        const mtime = getTimestamp(buffer.slice(start + 8, start + 12));
        // console.log('mtime', mtime);
        // console.log('mtime seconds', buffer.slice(start + 12, start + 16));
        const dev = buffer.slice(start + 16, start + 20);
        // console.log(dev);
        const ino = buffer.slice(start + 20, start + 24);
        // console.log(ino);
        const mode = buffer.slice(start + 24, start + 28);
        // console.log(mode);
        const uid = buffer.slice(start + 28, start + 32);
        // console.log(uid);
        const gid = buffer.slice(start + 32, start + 36);
        // console.log(gid);
        const size = buffer.slice(start + 36, start + 40);
        // console.log('size', size);
        const hash = getHashFromBuffer((buffer.slice(start + 40, start + 60)));
        console.log('hash', hash);
        const fileLen = getSize(buffer.slice(start + 60, start + 62));
        // console.log(fileLen);
        const file = buffer.slice(start + 62, start + 62 + fileLen);
        // console.log(getChar(file));
        const nulCharacterLength = 1;
        const end = start + 62 + fileLen + nulCharacterLength;
        // console.log('index', i, 'range is', start, end);
        result.push(buffer.slice(start, end));
        files.push({
            filepath: file.toString(),
            hash,
            size: getSizeLabel(size),
            mode: getModeLabel(mode),
            ctime: fillMilliseconds(ctime),
            mtime: fillMilliseconds(mtime),
        });
        start = end;
    }
    return files;
}
// d8 32 9f c1 cc 93 87 80 ff dd 9f 94 e0 d3 64 e0 ea 74 f5 79
/**
 * @param {Buffer}
 */
function parseIndexFileContent(content) {
    const meta = content.slice(0, 12);
    const fileNum = getSize(meta.slice(8, 12));
    const lastContent = content.slice(12, content.length);
    // console.log(lastContent.slice(40, 71));
    const files = splitMultipleObjectFiles(lastContent, fileNum);

    return {
        files
    };
}
module.exports.parseIndexFileContent = parseIndexFileContent;

function removeMilliseconds(timestamp) {
    return Number(String(timestamp).slice(0, -3));
}
function timestampToBuffer(timestamp) {
    return Buffer.from(fillZero(timestamp.toString(16), 8), 'hex');
}
function getTimeBuffer(time) {
    const timestamp = removeMilliseconds(new Date(time).valueOf());
    return timestampToBuffer(timestamp);
}

/**
 * 往字符串前面填充 0
 * @param {string} str - 要填充的字符串
 * @param {number} num - 预期最终的位数
 */
function fillZero(str, num) {
    const diff = num - str.length;
    if (diff === 0) {
        return str;
    }
    return '0'.repeat(diff) + str;
}
function octalToHex(str) {
    return parseInt(str, 8).toString(16);
}
function hexToOctal(str) {
}
function numToBuffer(num, len = 8) {
    return Buffer.from(fillZero(Number(num).toString(16), len), 'hex');
}

function createIndexEntryContent({
    mode,
    filepath,
    hash,
}) {
    const mockPath = path.resolve(process.cwd(), '..', '..', 'git-test');
    const realFilepath = path.join(mockPath, filepath);
    const stat = fs.statSync(realFilepath);
    const  {
        dev, size, uid, gid, ino,
        // ctime 会在文件修改后改变
        ctime, mtime,
    } = stat;
    const ctimeBuffer = getTimeBuffer(ctime);
    const mtimeBuffer = getTimeBuffer(mtime);
    const [ctimeNanosecond, mtimeNanosecond] = getNanosecondsOfFile(realFilepath);
    const ctimeNanosecondBuffer = timestampToBuffer(ctimeNanosecond);
    const mtimeNanosecondBuffer = timestampToBuffer(mtimeNanosecond);

    const deviceBuffer = numToBuffer(dev, 8);
    const inoBuffer = Buffer.from('02b35f02', 'hex');
    // 八进制
    const modeBuffer = Buffer.from(fillZero(octalToHex(mode), 8), 'hex');
    const uidBuffer = numToBuffer(uid, 8);
    const gidBuffer = numToBuffer(gid, 8);
    const sizeBuffer = numToBuffer(size, 8);
    const hashBuffer = Buffer.from(hash, 'hex');
    console.log(hash, hashBuffer);
    const filepathLength = filepath.length;
    const filepathLengthBuffer = numToBuffer(filepathLength, 4);
    const flagsBuffer = Buffer.from(filepath);
    const nulBuffer = Buffer.from('0000', 'hex');

    const content = Buffer.concat([
        ctimeBuffer,
        ctimeNanosecondBuffer,
        mtimeBuffer,
        mtimeNanosecondBuffer,
        deviceBuffer,
        inoBuffer,
        modeBuffer,
        uidBuffer,
        gidBuffer,
        sizeBuffer,
        hashBuffer,
        filepathLengthBuffer,
        flagsBuffer,
        nulBuffer,
    ]);

    return content;
}

function createIndexFileContent(entries) {
    const entryNum = entries.length;
    const entryNumBuffer = numToBuffer(entryNum, 8);
    const header = Buffer.concat([Buffer.from('4449524300000002', 'hex'), entryNumBuffer]);
    // console.log('header', header);
    const content = Buffer.concat(entries.map(entry => {
        return createIndexEntryContent(entry);
    }));
    const checksumHash = createHash(Buffer.concat([header, content]));
    // console.log(checksumHash);
    return Buffer.concat([
        header,
        content,
        Buffer.from(checksumHash, 'hex'),
    ]);
}

module.exports.createIndexFileContent = createIndexFileContent;

function createIndexFile(buffer) {
    fs.writeFileSync(resolveFile('index'), buffer);
}
module.exports.createIndexFile = createIndexFile;

function readIndexFile() {
    const content = fs.readFileSync(resolveFile('index'));
    return parseIndexFileContent(content);
}
module.exports.readIndexFile = readIndexFile;
