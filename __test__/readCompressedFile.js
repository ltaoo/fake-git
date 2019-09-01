const path = require('path');

const { readCompressedFile } = require('../src/utils/object');
const { resolve } = require('./_utils');

// readCompressedFile(resolve('./examples/83baae61804e65cc73a7201a7252750c76066a30'))
readCompressedFile(resolve('./examples/d8329fc1cc938780ffdd9f94e0d364e0ea74f579'))
    .then((content) => {
        console.log(content);
    }, (err) => {
        console.log('err', err);
    });