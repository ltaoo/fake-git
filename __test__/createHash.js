const { createHash, deflate } = require('../src/common');

// const hash = createHash(`blob 10${String.fromCharCode(0)}version 1
// `);
// console.log('hash', hash); // 83baae61804e65cc73a7201a7252750c76066a30


// deflate(`tree 36${String.fromCharCode(0)}100644 test.txt${String.fromCharCode(0)}83baae61804e65cc73a7201a7252750c76066a30`)
//     .then((compressed) => {
//         const hash = createHash(compressed);
//         console.log(hash); // d8329fc1cc938780ffdd9f94e0d364e0ea74f579
//     })
const hash = createHash(`tree 36${String.fromCharCode(0)}100644 test.txt${String.fromCharCode(0)}83baae61804e65cc73a7201a7252750c76066a30`);
console.log(hash); // d8329fc1cc938780ffdd9f94e0d364e0ea74f579
// const hash = createHash(`tree 32${String.fromCharCode(0)}100644 rose${String.fromCharCode(0)}aa823728ea7d592acc69b36875a482cdf3fd5c8d`);
// console.log(hash); // 05b217bb859794d08bb9e4f7f04cbda4b207fbe9
