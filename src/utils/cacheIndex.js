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
        const ctime = getTimestamp(buffer.slice(start, start + 4));
        console.log('ctime', ctime);
        const mtime = getTimestamp(buffer.slice(start + 8, start + 12));
        console.log('mtime', mtime);
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
/**
 * @param {Buffer}
 */
module.exports.parseIndexFileContent = function parseIndexFileContent(content) {
    const meta = content.slice(0, 12);
    const fileNum = getSize(meta.slice(8, 12));
    const lastContent = content.slice(12, content.length);
    // console.log(lastContent.slice(72, 100));
    const files = splitMultipleObjectFiles(lastContent, fileNum);
}