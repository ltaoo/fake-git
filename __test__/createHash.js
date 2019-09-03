const { createHash, deflate } = require('../src/common');
const { createTreeFileContent, createBlobFileContent } = require('../src/utils/object');

(() => {
    const hash = createHash(createBlobFileContent({ content: 'version 1' }));
    // 83baae61804e65cc73a7201a7252750c76066a30
    console.log('blob hash', hash);
})();


(() => {
    const buffer = createTreeFileContent([{ 
        filepath: 'test.txt',
        mode: '100644',
        hash: '83baae61804e65cc73a7201a7252750c76066a30',
    }]);
    console.log(buffer);
    const hash = createHash(buffer);
    // d8329fc1cc938780ffdd9f94e0d364e0ea74f579
    console.log('tree hash', hash);
})();

