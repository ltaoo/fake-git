/**
 * 
 * @param {*} num 
 * @param {boolean} transform 
 */
function hexadecimal2Char(num, transform = true) {
    const latestNum = transform ? parseInt(num, 16) : num;
    return String.fromCharCode(latestNum);
}
/**
 * 其实就完全等同于 buffer.toString();
 * @param {Buffer} buffer 
 */
function bufferToChar(buffer) {
    return bufferAryToChar(buffer.toJSON().data, false);
}
function bufferStringToChar(str) {
    return bufferAryToChar(str.split(' '));
}
function bufferAryToChar(ary, transform) {
    return ary
        .map((num) => {
            return hexadecimal2Char(num, transform);
        })
        .join('');
}
