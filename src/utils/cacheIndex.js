const path = require('path');
const fs = require('fs');

const { getNanosecondsOfFile } = require('../common');

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
function splitMultipleObjectFiles(buffer, fileNum) {
    const result = [];
    let start = 0;
    for (let i = 0; i < fileNum; i += 1) {
        console.log(buffer.slice(start, start + 16));
        const ctime = getTimestamp(buffer.slice(start, start + 4));
        console.log('ctime', ctime);
        console.log('ctime seconds', buffer.slice(start + 4, start + 8));
        const mtime = getTimestamp(buffer.slice(start + 8, start + 12));
        console.log('mtime', mtime);
        console.log('mtime seconds', buffer.slice(start + 12, start + 16));
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
        const file = buffer.slice(start + 62, start + 62 + fileLen + 1);
        console.log(getChar(file));
        const end = start + 62 + fileLen + 1;
        console.log('index', i, 'range is', start, end);
        result.push(buffer.slice(start, end));
        start = end;
    }
    return result;
}
// d8 32 9f c1 cc 93 87 80 ff dd 9f 94 e0 d3 64 e0 ea 74 f5 79
/**
 * @param {Buffer}
 */
module.exports.parseIndexFileContent = function parseIndexFileContent(content) {
    const meta = content.slice(0, 12);
    const fileNum = getSize(meta.slice(8, 12));
    const lastContent = content.slice(12, content.length);
    const files = splitMultipleObjectFiles(lastContent, fileNum);
}

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

function createIndexFileContent({
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
    const header = Buffer.from('444952430000000200000001', 'hex');
    const ctimeBuffer = getTimeBuffer(ctime);
    const mtimeBuffer = getTimeBuffer(mtime);
    const [ctimeNanosecond, mtimeNanosecond] = getNanosecondsOfFile(realFilepath);
    /**
     * ctime seconds <Buffer 2e 44 94 ef>
     * mtime seconds <Buffer 03 5d 42 97>
     */
    console.log(ctimeNanosecond, mtimeNanosecond);
    const ctimeNanosecondBuffer = timestampToBuffer(ctimeNanosecond);
    const mtimeNanosecondBuffer = timestampToBuffer(mtimeNanosecond);
    console.log(ctimeNanosecondBuffer, mtimeNanosecondBuffer);
}

module.exports.createIndexFileContent = createIndexFileContent;
